type CategoryKey = "chinese" | "malay" | "southeast" | "coffee" | "halal";

declare const process: {
  env: Record<string, string | undefined>;
};

type NodeApiRequest = {
  method?: string;
  body?: unknown;
  on?: (event: "data" | "end" | "error", callback: (chunk?: unknown) => void) => void;
};

type NodeApiResponse = {
  status?: (code: number) => NodeApiResponse;
  setHeader?: (name: string, value: string) => void;
  json?: (body: unknown) => void;
  end?: (body?: string) => void;
};

type Draft = {
  name: string;
  city: string;
  area: string;
  address: string;
  category: CategoryKey;
  price: string;
  dishes: string[];
  userReview: string;
  submitterName?: string;
  submitterEmail?: string;
};

type Restaurant = {
  name: string;
  city: string;
  area: string;
  address: string;
  category: CategoryKey;
  recommendedDishes: string[];
};

type AiReview = {
  verdict: "approve" | "needs_review" | "duplicate" | "reject";
  score: number;
  duplicateOf: string;
  normalizedName: string;
  suggestedCategory: CategoryKey;
  suggestedPrice: string;
  suggestedDishes: string[];
  summary: string;
  reasons: string[];
};

type ReviewPayload = {
  draft?: Draft;
  restaurants?: Restaurant[];
};

type ReviewResult = {
  review: AiReview;
  fallback: boolean;
};

type ErrorResult = {
  error: string;
};

function normalizeRestaurantName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "")
    .replace(/restaurant|restoran|kedai|cafe|kopitiam/g, "");
}

function localReview(draft: Draft, restaurants: Restaurant[]): AiReview {
  const normalizedName = normalizeRestaurantName(draft.name);
  const duplicate = restaurants.find((restaurant) => {
    const existingName = normalizeRestaurantName(restaurant.name);
    return (
      restaurant.city === draft.city &&
      normalizedName.length > 0 &&
      existingName.length > 0 &&
      (existingName === normalizedName ||
        existingName.includes(normalizedName) ||
        normalizedName.includes(existingName))
    );
  });
  const hasAddress = Boolean(draft.address?.trim() || draft.area?.trim());
  const hasDishes = draft.dishes?.length > 0;
  const hasReview = draft.userReview?.trim().length >= 12;
  const score =
    (hasAddress ? 30 : 0) +
    (hasDishes ? 25 : 0) +
    (hasReview ? 35 : 0) +
    (draft.submitterEmail ? 10 : 0);
  const verdict: AiReview["verdict"] = duplicate
    ? "duplicate"
    : score >= 75
      ? "approve"
      : score >= 45
        ? "needs_review"
        : "reject";

  return {
    verdict,
    score,
    duplicateOf: duplicate?.name || "",
    normalizedName: draft.name.trim(),
    suggestedCategory: draft.category,
    suggestedPrice: draft.city === "Singapore" ? "S$ 8-35" : "RM 15-60",
    suggestedDishes: draft.dishes?.length ? draft.dishes : ["To verify"],
    summary: duplicate
      ? `Possible duplicate of ${duplicate.name}.`
      : score >= 75
        ? "Submission is complete enough for quick review."
        : "Submission needs manual confirmation.",
    reasons: [
      hasAddress ? "Has address or area" : "Missing address or area",
      hasDishes ? "Has recommended dishes" : "Missing recommended dishes",
      hasReview ? "Review has enough detail" : "Review is too short",
      draft.submitterEmail ? "Has Google email" : "Missing Google email",
    ],
  };
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<Draft>;
  return (
    typeof draft.name === "string" &&
    typeof draft.city === "string" &&
    typeof draft.category === "string" &&
    typeof draft.userReview === "string"
  );
}

function normalizeReview(value: Partial<AiReview>, fallback: AiReview): AiReview {
  const verdicts: AiReview["verdict"][] = ["approve", "needs_review", "duplicate", "reject"];
  const categories: CategoryKey[] = ["chinese", "malay", "southeast", "coffee", "halal"];
  const score = Number(value.score);

  return {
    verdict: verdicts.includes(value.verdict as AiReview["verdict"])
      ? (value.verdict as AiReview["verdict"])
      : fallback.verdict,
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : fallback.score,
    duplicateOf: typeof value.duplicateOf === "string" ? value.duplicateOf : fallback.duplicateOf,
    normalizedName:
      typeof value.normalizedName === "string" ? value.normalizedName : fallback.normalizedName,
    suggestedCategory: categories.includes(value.suggestedCategory as CategoryKey)
      ? (value.suggestedCategory as CategoryKey)
      : fallback.suggestedCategory,
    suggestedPrice:
      typeof value.suggestedPrice === "string" ? value.suggestedPrice : fallback.suggestedPrice,
    suggestedDishes: Array.isArray(value.suggestedDishes)
      ? value.suggestedDishes.filter((dish): dish is string => typeof dish === "string").slice(0, 6)
      : fallback.suggestedDishes,
    summary: typeof value.summary === "string" ? value.summary : fallback.summary,
    reasons: Array.isArray(value.reasons)
      ? value.reasons.filter((reason): reason is string => typeof reason === "string").slice(0, 6)
      : fallback.reasons,
  };
}

function extractOutputText(data: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}) {
  return (
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .find((content) => typeof content.text === "string")?.text ||
    ""
  );
}

function jsonResponse(body: ReviewResult | ErrorResult, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sendNodeJson(response: NodeApiResponse, body: ReviewResult | ErrorResult, status = 200) {
  const target = response.status?.(status) || response;
  if (target.json) {
    target.json(body);
    return;
  }
  target.setHeader?.("Content-Type", "application/json");
  target.end?.(JSON.stringify(body));
}

function parseBody(body: unknown): ReviewPayload {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body) as ReviewPayload;
  return body as ReviewPayload;
}

async function readNodePayload(request: NodeApiRequest): Promise<ReviewPayload> {
  if (request.body) return parseBody(request.body);
  if (!request.on) return {};

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    request.on?.("data", (chunk) => chunks.push(String(chunk || "")));
    request.on?.("end", () => {
      try {
        resolve(parseBody(chunks.join("")));
      } catch (error) {
        reject(error);
      }
    });
    request.on?.("error", reject);
  });
}

async function createReview(payload: ReviewPayload): Promise<ReviewResult | ErrorResult> {
  if (!isDraft(payload.draft)) {
    return { error: "Invalid draft payload" };
  }

  const draft = payload.draft;
  const restaurants = Array.isArray(payload.restaurants) ? payload.restaurants : [];
  const fallback = localReview(draft, restaurants || []);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { review: fallback, fallback: true };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are a strict restaurant submission reviewer for Bubble Fish. Detect duplicates, judge quality, and suggest structured cleanup. Return only JSON matching the schema.",
          },
          {
            role: "user",
            content: JSON.stringify({ draft, restaurants: restaurants?.slice(0, 80) || [] }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "draft_review",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                verdict: {
                  type: "string",
                  enum: ["approve", "needs_review", "duplicate", "reject"],
                },
                score: { type: "number" },
                duplicateOf: { type: "string" },
                normalizedName: { type: "string" },
                suggestedCategory: {
                  type: "string",
                  enum: ["chinese", "malay", "southeast", "coffee", "halal"],
                },
                suggestedPrice: { type: "string" },
                suggestedDishes: {
                  type: "array",
                  items: { type: "string" },
                },
                summary: { type: "string" },
                reasons: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "verdict",
                "score",
                "duplicateOf",
                "normalizedName",
                "suggestedCategory",
                "suggestedPrice",
                "suggestedDishes",
                "summary",
                "reasons",
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return { review: fallback, fallback: true };
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };
    const text = extractOutputText(data);
    const review = text ? normalizeReview(JSON.parse(text) as Partial<AiReview>, fallback) : fallback;
    return { review, fallback: false };
  } catch {
    return { review: fallback, fallback: true };
  }
}

export default async function handler(
  request: Request | NodeApiRequest,
  response?: NodeApiResponse,
): Promise<Response | void> {
  if (request.method !== "POST") {
    const error = { error: "Method not allowed" };
    if (response) {
      sendNodeJson(response, error, 405);
      return;
    }
    return jsonResponse(error, 405);
  }

  try {
    const payload =
      typeof (request as Request).json === "function"
        ? ((await (request as Request).json()) as ReviewPayload)
        : await readNodePayload(request as NodeApiRequest);
    const result = await createReview(payload);
    const status = "error" in result ? 400 : 200;

    if (response) {
      sendNodeJson(response, result, status);
      return;
    }
    return jsonResponse(result, status);
  } catch {
    const error = { error: "Invalid JSON payload" };
    if (response) {
      sendNodeJson(response, error, 400);
      return;
    }
    return jsonResponse(error, 400);
  }
}
