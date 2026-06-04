import {
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  Eye,
  Heart,
  Languages,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Locale = "zh" | "en" | "ms";
type View = "user" | "submit" | "agreement" | "developer";
type CategoryKey =
  | "all"
  | "chinese"
  | "malay"
  | "southeast"
  | "coffee"
  | "halal";

type Comment = {
  id: string;
  restaurantId: string;
  author: string;
  text: string;
  status: "pending" | "approved";
  createdAt: string;
};

type Restaurant = {
  id: string;
  name: string;
  city: string;
  country: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  category: Exclude<CategoryKey, "all">;
  image: string;
  price: string;
  rating: number;
  weeklyLikes: number;
  totalLikes: number;
  recommendedDishes: string[];
  tags: Record<Locale, string[]>;
  note: Record<Locale, string>;
  mapUrl: string;
  source: "baseline" | "community";
  submittedAt: string;
};

type SubmissionDraft = {
  id: string;
  name: string;
  image: string;
  city: string;
  area: string;
  address: string;
  category: Exclude<CategoryKey, "all">;
  price: string;
  dishes: string[];
  userReview: string;
  submitterName: string;
  submitterEmail: string;
  cashbackAmount: 2 | 4;
  status: "pending" | "enriched" | "duplicate";
  submittedAt: string;
  aiReview?: DraftAiReview;
};

type DraftAiReview = {
  verdict: "approve" | "needs_review" | "duplicate" | "reject";
  score: number;
  duplicateOf: string;
  normalizedName: string;
  suggestedCategory: Exclude<CategoryKey, "all">;
  suggestedPrice: string;
  suggestedDishes: string[];
  summary: string;
  reasons: string[];
};

type LocationOption = {
  id: string;
  label: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  defaultRadiusKm: number;
};

type ActiveLocation = LocationOption & {
  accuracyMeters?: number;
  isLive?: boolean;
};

type LocationStatus = "idle" | "requesting" | "allowed" | "blocked" | "unsupported";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: "google" | "demo";
  firstSeen: string;
  lastSeen: string;
  signIns: number;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GooglePromptNotification = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
  renderButton?: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      width?: number;
    },
  ) => void;
  disableAutoSelect?: () => void;
};

type WindowWithGoogle = Window & {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
};

type Analytics = {
  visits: number;
  likes: number;
  submissions: number;
  comments: number;
  approvals: number;
  lastVisit: string;
};

type ToastState = {
  title: string;
  detail: string;
};

const ownerCode = "Ilovewangzixuan0221";
const googleClientId = (import.meta as ImportMeta & {
  env?: { VITE_GOOGLE_CLIENT_ID?: string };
}).env?.VITE_GOOGLE_CLIENT_ID;

const locales: Array<{ value: Locale; label: string }> = [
  { value: "zh", label: "中文" },
  { value: "en", label: "EN" },
  { value: "ms", label: "BM" },
];

const copy = {
  zh: {
    tagline: "今天别纠结",
    hero: "附近就吃这一家",
    heroBody: "Bubble Fish 用位置、真实点赞和审核评论帮你少选一点，吃好一点。",
    useLocation: "真实定位",
    locating: "定位中",
    nearby: "当前位置",
    liveLocation: "我的位置",
    locationAllowed: "已使用你的当前位置",
    locationBlocked: "定位被拒绝，仍可手动选择区域。",
    locationUnsupported: "这个浏览器不支持定位。",
    locationRequesting: "正在请求定位授权",
    radius: "范围",
    search: "搜索餐厅、区域、推荐菜",
    all: "全部",
    strongPick: "强推荐",
    pickAgain: "再换一家",
    nearbyChoices: "附近可选",
    questionnairePublished: "已收推荐",
    pendingReview: "审核队列",
    weekly: "本周好吃榜",
    noRank: "还没有真实点赞，点过赞后才会上榜。",
    dishes: "推荐菜",
    comments: "评论",
    noComments: "还没有审核通过的评论。",
    addComment: "写评论",
    commentPlaceholder: "吃过什么？哪里好吃？适合什么场景？",
    nickname: "昵称",
    submitComment: "提交评论审核",
    commentQueued: "评论已提交",
    commentQueuedDetail: "审核通过后会显示在餐厅评论区。",
    like: "吃过好吃",
    liked: "已点赞",
    totalLikes: "总赞",
    map: "地图",
    price: "人均",
    submitPlace: "推荐一家店",
    agreement: "用户协议",
    developer: "开发者",
    submitTitle: "推荐餐厅",
    submitBody: "实名 + Google 邮箱提交，审核通过返现 RM 4；只写内容不实名，审核通过返现 RM 2。",
    restaurantName: "店名",
    city: "城市",
    area: "区域",
    address: "地址",
    photo: "照片链接",
    uploadPhoto: "上传照片",
    userReview: "你的真实评价",
    realName: "真实姓名",
    cashbackRule: "返现规则",
    fullCashback: "实名 + Google 邮箱推荐：RM 4",
    lightCashback: "只写内容推荐：RM 2",
    googleEmail: "Google 邮箱",
    submitReview: "提交审核",
    submitted: "已提交审核",
    submittedDetail: "你提交的餐厅已进入开发者审核台。",
    back: "返回",
    ownerLogin: "开发者验证",
    ownerHint: "输入开发者口令进入审核和访问数据面板。",
    password: "口令",
    unlock: "进入",
    wrongCode: "口令不正确",
    dashboard: "开发者面板",
    analytics: "访问数据",
    signInGoogle: "使用 Google 登录",
    demoSignIn: "演示登录",
    loginTitle: "先登录，再找附近好吃的",
    loginBody: "登录后可以点赞、推荐餐厅、提交评论，也方便后台统计真实注册人数。",
    signedInAs: "已登录",
    signOut: "退出",
    registeredUsers: "注册用户",
    registeredCount: "注册人数",
    userDirectory: "用户列表",
    lastSeen: "最近访问",
    provider: "来源",
    googleSetupNeeded: "配置 Google Client ID 后可连接真实 Google 登录。",
    googleSignedIn: "登录成功",
    googleSignInFailed: "Google 登录失败",
    reviewPlaces: "待审核餐厅",
    reviewComments: "待审核评论",
    visits: "访问量",
    likes: "点赞",
    submissions: "餐厅提交",
    commentCount: "评论提交",
    approvals: "审核通过",
    enrich: "补全",
    aiReview: "AI 初审",
    runAiReview: "AI 初审",
    duplicate: "疑似重复",
    reviewScore: "质量分",
    duplicateOf: "重复对象",
    aiFallback: "未配置大模型密钥，已用本地规则初审。",
    approve: "通过",
    reject: "拒绝",
    reset: "重置演示数据",
    pending: "待审核",
    enriched: "已补全",
    legalTitle: "Bubble Fish 用户协议",
    legalBody:
      "Bubble Fish 提供餐厅发现、点赞、评论和推荐提交服务。用户提交内容需基于真实消费体验，不得包含广告、辱骂、虚假信息、隐私信息或违法内容。位置权限只用于计算附近餐厅距离；原型版本不会上传定位数据。平台会对餐厅和评论进行审核后展示，并可移除不适合公开展示的内容。餐厅信息、价格、营业状态和推荐菜可能变化，实际消费前请以地图、商家页面或现场信息为准。",
    agree: "我知道了",
  },
  en: {
    tagline: "Stop overthinking dinner",
    hero: "Eat this nearby",
    heroBody:
      "Bubble Fish uses location, real likes, and reviewed comments to make nearby food easier to choose.",
    useLocation: "Real location",
    locating: "Locating",
    nearby: "Current location",
    liveLocation: "My location",
    locationAllowed: "Using your current location",
    locationBlocked: "Location was denied. You can still choose an area manually.",
    locationUnsupported: "This browser does not support location.",
    locationRequesting: "Requesting location permission",
    radius: "Radius",
    search: "Search place, area, or dish",
    all: "All",
    strongPick: "Strong pick",
    pickAgain: "Pick again",
    nearbyChoices: "nearby choices",
    questionnairePublished: "picks received",
    pendingReview: "review queue",
    weekly: "Weekly top",
    noRank: "No real likes yet. Places rank only after users vote.",
    dishes: "Recommended",
    comments: "Comments",
    noComments: "No approved comments yet.",
    addComment: "Comment",
    commentPlaceholder: "What did you eat? Why was it good?",
    nickname: "Nickname",
    submitComment: "Submit for review",
    commentQueued: "Comment submitted",
    commentQueuedDetail: "It will appear after review.",
    like: "Tasted good",
    liked: "Liked",
    totalLikes: "total likes",
    map: "Map",
    price: "Avg.",
    submitPlace: "Recommend place",
    agreement: "User terms",
    developer: "Developer",
    submitTitle: "Recommend a Restaurant",
    submitBody: "Use a real name + Google email for RM 4 cashback after approval; content-only recommendations get RM 2.",
    restaurantName: "Name",
    city: "City",
    area: "Area",
    address: "Address",
    photo: "Photo URL",
    uploadPhoto: "Upload photo",
    userReview: "Your real review",
    realName: "Real name",
    cashbackRule: "Cashback",
    fullCashback: "Real name + Google email: RM 4",
    lightCashback: "Content-only recommendation: RM 2",
    googleEmail: "Google email",
    submitReview: "Submit for review",
    submitted: "Submitted for review",
    submittedDetail: "Your restaurant is now in the developer review queue.",
    back: "Back",
    ownerLogin: "Developer access",
    ownerHint: "Enter the owner code to open review and analytics.",
    password: "Code",
    unlock: "Open",
    wrongCode: "Wrong code",
    dashboard: "Developer Panel",
    analytics: "Analytics",
    signInGoogle: "Sign in with Google",
    demoSignIn: "Demo sign in",
    loginTitle: "Sign in to find nearby food",
    loginBody: "After signing in, you can like places, recommend restaurants, and submit comments.",
    signedInAs: "Signed in",
    signOut: "Sign out",
    registeredUsers: "Registered users",
    registeredCount: "Registrations",
    userDirectory: "User directory",
    lastSeen: "Last seen",
    provider: "Source",
    googleSetupNeeded: "Add a Google Client ID to connect real Google sign-in.",
    googleSignedIn: "Signed in",
    googleSignInFailed: "Google sign-in failed",
    reviewPlaces: "Restaurant reviews",
    reviewComments: "Comment reviews",
    visits: "Visits",
    likes: "Likes",
    submissions: "Submissions",
    commentCount: "Comments",
    approvals: "Approvals",
    enrich: "Enrich",
    aiReview: "AI review",
    runAiReview: "AI review",
    duplicate: "Possible duplicate",
    reviewScore: "Quality score",
    duplicateOf: "Duplicate of",
    aiFallback: "No model key configured, so local rules were used.",
    approve: "Approve",
    reject: "Reject",
    reset: "Reset demo",
    pending: "Pending",
    enriched: "Enriched",
    legalTitle: "Bubble Fish User Terms",
    legalBody:
      "Bubble Fish provides restaurant discovery, likes, comments, and recommendation submissions. User content should reflect real dining experiences and must not include ads, abuse, false information, private data, or illegal content. Location permission is used only to calculate nearby distances; this prototype does not upload location data. Restaurants and comments may be reviewed before display. Restaurant information, price, opening status, and dishes may change, so please verify before visiting.",
    agree: "Got it",
  },
  ms: {
    tagline: "Tak perlu pening makan apa",
    hero: "Makan kedai dekat ini",
    heroBody:
      "Bubble Fish guna lokasi, like sebenar dan komen disemak supaya pilihan makanan dekat jadi mudah.",
    useLocation: "Lokasi sebenar",
    locating: "Mencari",
    nearby: "Lokasi semasa",
    liveLocation: "Lokasi saya",
    locationAllowed: "Menggunakan lokasi semasa anda",
    locationBlocked: "Lokasi ditolak. Anda masih boleh pilih kawasan manual.",
    locationUnsupported: "Pelayar ini tidak menyokong lokasi.",
    locationRequesting: "Meminta kebenaran lokasi",
    radius: "Jarak",
    search: "Cari kedai, kawasan atau hidangan",
    all: "Semua",
    strongPick: "Pilihan kuat",
    pickAgain: "Pilih lagi",
    nearbyChoices: "pilihan dekat",
    questionnairePublished: "cadangan diterima",
    pendingReview: "barisan semakan",
    weekly: "Carta mingguan",
    noRank: "Belum ada like sebenar. Kedai naik selepas pengguna mengundi.",
    dishes: "Menu",
    comments: "Komen",
    noComments: "Belum ada komen diluluskan.",
    addComment: "Komen",
    commentPlaceholder: "Makan apa? Kenapa sedap?",
    nickname: "Nama",
    submitComment: "Hantar semakan",
    commentQueued: "Komen dihantar",
    commentQueuedDetail: "Komen muncul selepas semakan.",
    like: "Sedap",
    liked: "Sudah like",
    totalLikes: "jumlah like",
    map: "Peta",
    price: "Purata",
    submitPlace: "Cadang kedai",
    agreement: "Terma pengguna",
    developer: "Pembangun",
    submitTitle: "Cadang Restoran",
    submitBody: "Nama sebenar + emel Google dapat RM 4 selepas lulus; cadangan tanpa nama sebenar dapat RM 2.",
    restaurantName: "Nama",
    city: "Bandar",
    area: "Kawasan",
    address: "Alamat",
    photo: "Pautan gambar",
    uploadPhoto: "Muat naik gambar",
    userReview: "Ulasan sebenar",
    realName: "Nama sebenar",
    cashbackRule: "Cashback",
    fullCashback: "Nama sebenar + emel Google: RM 4",
    lightCashback: "Cadangan isi sahaja: RM 2",
    googleEmail: "Emel Google",
    submitReview: "Hantar semakan",
    submitted: "Dihantar untuk semakan",
    submittedDetail: "Restoran masuk barisan semakan pembangun.",
    back: "Kembali",
    ownerLogin: "Akses pembangun",
    ownerHint: "Masukkan kod pemilik untuk buka semakan dan data.",
    password: "Kod",
    unlock: "Buka",
    wrongCode: "Kod salah",
    dashboard: "Panel Pembangun",
    analytics: "Data",
    signInGoogle: "Log masuk Google",
    demoSignIn: "Log masuk demo",
    loginTitle: "Log masuk untuk cari makanan dekat",
    loginBody: "Selepas log masuk, anda boleh like, cadang restoran dan hantar komen.",
    signedInAs: "Sudah log masuk",
    signOut: "Keluar",
    registeredUsers: "Pengguna berdaftar",
    registeredCount: "Pendaftaran",
    userDirectory: "Senarai pengguna",
    lastSeen: "Terakhir dilihat",
    provider: "Sumber",
    googleSetupNeeded: "Tambah Google Client ID untuk log masuk Google sebenar.",
    googleSignedIn: "Berjaya log masuk",
    googleSignInFailed: "Log masuk Google gagal",
    reviewPlaces: "Semakan restoran",
    reviewComments: "Semakan komen",
    visits: "Lawatan",
    likes: "Like",
    submissions: "Cadangan",
    commentCount: "Komen",
    approvals: "Diluluskan",
    enrich: "Lengkap",
    aiReview: "Semakan AI",
    runAiReview: "Semakan AI",
    duplicate: "Mungkin berulang",
    reviewScore: "Skor kualiti",
    duplicateOf: "Berulang dengan",
    aiFallback: "Kunci model belum diset, jadi aturan tempatan digunakan.",
    approve: "Lulus",
    reject: "Tolak",
    reset: "Reset demo",
    pending: "Menunggu",
    enriched: "Siap",
    legalTitle: "Terma Pengguna Bubble Fish",
    legalBody:
      "Bubble Fish menyediakan carian restoran, like, komen dan cadangan. Kandungan pengguna mestilah berdasarkan pengalaman makan sebenar dan tidak boleh mengandungi iklan, makian, maklumat palsu, data peribadi atau kandungan salah di sisi undang-undang. Kebenaran lokasi hanya digunakan untuk kira jarak; prototaip ini tidak memuat naik lokasi. Restoran dan komen disemak sebelum dipaparkan. Maklumat restoran boleh berubah, sila semak sebelum pergi.",
    agree: "Faham",
  },
} satisfies Record<Locale, Record<string, string>>;

const categoryLabels: Record<Locale, Record<CategoryKey, string>> = {
  zh: {
    all: "全部",
    chinese: "中餐",
    malay: "马来菜",
    southeast: "东南亚菜",
    coffee: "咖啡甜品",
    halal: "清真友好",
  },
  en: {
    all: "All",
    chinese: "Chinese",
    malay: "Malay",
    southeast: "SEA",
    coffee: "Coffee",
    halal: "Halal",
  },
  ms: {
    all: "Semua",
    chinese: "Cina",
    malay: "Melayu",
    southeast: "Asia Tenggara",
    coffee: "Kopi",
    halal: "Halal",
  },
};

const categories: CategoryKey[] = [
  "all",
  "chinese",
  "malay",
  "southeast",
  "coffee",
  "halal",
];

const supportedCities = [
  "Kuala Lumpur",
  "Petaling Jaya",
  "Subang Jaya",
  "Shah Alam",
  "Puchong",
  "Cheras",
  "Kajang",
  "Klang",
  "Penang",
  "Ipoh",
  "Melaka",
  "Johor Bahru",
  "Kota Kinabalu",
  "Kuching",
  "Singapore",
];

const locationOptions: LocationOption[] = [
  {
    id: "klcc",
    label: "KLCC",
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 3.1579,
    lng: 101.7123,
    defaultRadiusKm: 12,
  },
  {
    id: "bukit-bintang",
    label: "Bukit Bintang",
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 3.1466,
    lng: 101.7112,
    defaultRadiusKm: 8,
  },
  {
    id: "georgetown",
    label: "George Town",
    city: "Penang",
    country: "Malaysia",
    lat: 5.4141,
    lng: 100.3288,
    defaultRadiusKm: 8,
  },
  {
    id: "singapore-cbd",
    label: "Singapore CBD",
    city: "Singapore",
    country: "Singapore",
    lat: 1.2836,
    lng: 103.8519,
    defaultRadiusKm: 8,
  },
];

const defaultImage =
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80";

const baselineRestaurants: Restaurant[] = [
  {
    id: "madam-kwans-klcc",
    name: "Madam Kwan's Suria KLCC",
    city: "Kuala Lumpur",
    country: "Malaysia",
    area: "KLCC",
    address: "Suria KLCC, Kuala Lumpur City Centre",
    lat: 3.1578,
    lng: 101.7121,
    category: "malay",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    price: "RM 35-80",
    rating: 4.2,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Nasi Lemak", "Nasi Bojari", "Curry Laksa"],
    tags: {
      zh: ["商场方便", "本地菜"],
      en: ["Mall-friendly", "Local staples"],
      ms: ["Dalam mall", "Menu tempatan"],
    },
    note: {
      zh: "在 KLCC 里很方便，适合第一次来吉隆坡时快速吃到经典本地味。",
      en: "Convenient inside KLCC for quick Malaysian classics.",
      ms: "Mudah di KLCC untuk cuba hidangan klasik Malaysia.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Madam%20Kwan%27s%20Suria%20KLCC",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
  {
    id: "wanjo-kl",
    name: "Nasi Lemak Wanjo",
    city: "Kuala Lumpur",
    country: "Malaysia",
    area: "Kampung Baru",
    address: "Jalan Raja Muda Musa, Kampung Baru",
    lat: 3.1612,
    lng: 101.7066,
    category: "halal",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
    price: "RM 8-25",
    rating: 4.1,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Nasi Lemak Ayam Goreng", "Sambal Sotong", "Rendang"],
    tags: {
      zh: ["椰浆饭", "清真友好"],
      en: ["Nasi lemak", "Halal-friendly"],
      ms: ["Nasi lemak", "Mesra halal"],
    },
    note: {
      zh: "Kampung Baru 的椰浆饭基础款，适合想吃传统口味和加料的人。",
      en: "A Kampung Baru nasi lemak staple for classic rice and add-ons.",
      ms: "Pilihan nasi lemak Kampung Baru dengan lauk klasik.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Nasi%20Lemak%20Wanjo%20Kampung%20Baru",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
  {
    id: "bijan-kl",
    name: "Bijan Bar & Restaurant",
    city: "Kuala Lumpur",
    country: "Malaysia",
    area: "Bukit Ceylon",
    address: "No.3, Jalan Ceylon, Bukit Ceylon",
    lat: 3.1486,
    lng: 101.7066,
    category: "malay",
    image:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=80",
    price: "RM 90-180",
    rating: 4.5,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Rendang Daging", "Satay", "Cucur Udang"],
    tags: {
      zh: ["马来菜", "适合请客"],
      en: ["Malay cuisine", "Dinner"],
      ms: ["Masakan Melayu", "Makan malam"],
    },
    note: {
      zh: "市中心精致马来菜，适合把外地朋友带去吃一顿完整本地风味。",
      en: "Refined Malay cooking near the city centre.",
      ms: "Masakan Melayu yang kemas dekat pusat bandar.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Bijan%20Bar%20%26%20Restaurant%20Kuala%20Lumpur",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
  {
    id: "ho-kow-kl",
    name: "Ho Kow Hainam Kopitiam",
    city: "Kuala Lumpur",
    country: "Malaysia",
    area: "Chinatown",
    address: "1, Jalan Balai Polis, City Centre",
    lat: 3.1427,
    lng: 101.6974,
    category: "coffee",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    price: "RM 12-35",
    rating: 4.1,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Hainanese Toast", "Kopi", "Half-boiled Eggs"],
    tags: {
      zh: ["早餐", "海南咖啡店"],
      en: ["Breakfast", "Kopitiam"],
      ms: ["Sarapan", "Kopitiam"],
    },
    note: {
      zh: "老派 kopitiam 氛围，适合早上在茨厂街附近找咖啡和简餐。",
      en: "Old-school kopitiam energy for coffee and breakfast.",
      ms: "Suasana kopitiam lama untuk kopi dan sarapan.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Ho%20Kow%20Hainam%20Kopitiam%20Kuala%20Lumpur",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
  {
    id: "sek-yuen-kl",
    name: "Sek Yuen Restaurant",
    city: "Kuala Lumpur",
    country: "Malaysia",
    area: "Pudu",
    address: "313-315, Jalan Pudu",
    lat: 3.1363,
    lng: 101.7132,
    category: "chinese",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
    price: "RM 45-100",
    rating: 4.2,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Pei Pa Duck", "Steamed Fish", "Char Siew"],
    tags: {
      zh: ["老字号", "粤菜"],
      en: ["Old-school", "Cantonese"],
      ms: ["Kedai lama", "Kantonis"],
    },
    note: {
      zh: "Pudu 老字号中餐，更适合多人一起点菜。",
      en: "A Pudu old-timer best for group ordering.",
      ms: "Restoran lama di Pudu, sesuai makan ramai.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sek%20Yuen%20Restaurant%20Jalan%20Pudu",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
  {
    id: "tek-sen-penang",
    name: "Tek Sen Restaurant",
    city: "Penang",
    country: "Malaysia",
    area: "George Town",
    address: "18, Lebuh Carnarvon",
    lat: 5.4148,
    lng: 100.3354,
    category: "chinese",
    image:
      "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=1200&q=80",
    price: "RM 30-70",
    rating: 4.2,
    weeklyLikes: 0,
    totalLikes: 0,
    recommendedDishes: ["Double Roasted Pork", "Assam Tumis Fish", "Tofu"],
    tags: {
      zh: ["槟城", "排队热门"],
      en: ["Penang", "Popular queue"],
      ms: ["Penang", "Selalu beratur"],
    },
    note: {
      zh: "位置切到槟城时才会出现，不混进吉隆坡推荐。",
      en: "Appears for Penang location searches only.",
      ms: "Muncul untuk lokasi Penang sahaja.",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Tek%20Sen%20Restaurant%20Penang",
    source: "baseline",
    submittedAt: "2026-06-04",
  },
];

const initialComments: Comment[] = [
  {
    id: "comment-wanjo-1",
    restaurantId: "wanjo-kl",
    author: "KL foodie",
    text: "炸鸡热的时候最香，sambal 偏甜辣，午餐不知道吃什么时很稳。",
    status: "approved",
    createdAt: "2026-06-04",
  },
];

const starterDrafts: SubmissionDraft[] = [
  {
    id: "draft-ah-lim",
    name: "Ah Lim Curry Mee",
    image:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=1200&q=80",
    city: "Kuala Lumpur",
    area: "Cheras",
    address: "Cheras, Kuala Lumpur",
    category: "southeast",
    price: "待补全",
    dishes: ["Curry Mee"],
    userReview: "咖喱汤底很香，辣度刚好，适合午餐快速解决。",
    submitterName: "Demo User",
    submitterEmail: "demo@bubblefish.local",
    cashbackAmount: 4,
    status: "pending",
    submittedAt: "2026-06-04",
  },
];

const storageKeys = {
  restaurants: "bubblefish-restaurants-v6",
  drafts: "bubblefish-drafts-v6",
  comments: "bubblefish-comments-v6",
  votes: "bubblefish-votes-v6",
  analytics: "bubblefish-analytics-v6",
  agreement: "bubblefish-agreement-v6",
  users: "bubblefish-users-v1",
  currentUser: "bubblefish-current-user-v1",
};

const defaultAnalytics: Analytics = {
  visits: 0,
  likes: 0,
  submissions: 0,
  comments: 0,
  approvals: 0,
  lastVisit: "",
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getWeekKey(date = new Date()) {
  const current = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${current.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const earthRadius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function inferCategory(input: string): Exclude<CategoryKey, "all"> {
  const lower = input.toLowerCase();
  if (/duck|char|wonton|chinese|hotpot|粤|川|中餐|烧腊|面/.test(lower)) return "chinese";
  if (/nasi|rendang|satay|lemak|malay|马来/.test(lower)) return "malay";
  if (/coffee|kopi|toast|cafe|咖啡|甜/.test(lower)) return "coffee";
  if (/halal|清真/.test(lower)) return "halal";
  return "southeast";
}

function fallbackLatLng(city: string, address: string) {
  const center =
    locationOptions.find((option) => option.city === city) || locationOptions[0];
  const offset = [...address].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    lat: center.lat + ((offset % 17) - 8) * 0.004,
    lng: center.lng + ((offset % 13) - 6) * 0.004,
  };
}

function countryForCity(city: string) {
  return city === "Singapore" ? "Singapore" : "Malaysia";
}

function normalizeRestaurantName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "")
    .replace(/restaurant|restoran|kedai|cafe|kopitiam/g, "");
}

function buildLocalAiReview(
  draft: SubmissionDraft,
  existingRestaurants: Restaurant[],
): DraftAiReview {
  const normalizedName = normalizeRestaurantName(draft.name);
  const duplicate = existingRestaurants.find((restaurant) => {
    const existingName = normalizeRestaurantName(restaurant.name);
    const sameCity = restaurant.city === draft.city;
    return (
      sameCity &&
      normalizedName.length > 0 &&
      existingName.length > 0 &&
      (existingName === normalizedName ||
        existingName.includes(normalizedName) ||
        normalizedName.includes(existingName))
    );
  });
  const hasAddress = Boolean(draft.address.trim() || draft.area.trim());
  const hasDishes = draft.dishes.length > 0;
  const hasReview = draft.userReview.trim().length >= 12;
  const score =
    (hasAddress ? 30 : 0) +
    (hasDishes ? 25 : 0) +
    (hasReview ? 35 : 0) +
    (draft.submitterEmail ? 10 : 0);
  const verdict: DraftAiReview["verdict"] = duplicate
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
    suggestedDishes: draft.dishes.length ? draft.dishes : ["To verify"],
    summary: duplicate
      ? `疑似和 ${duplicate.name} 重复。`
      : score >= 75
        ? "资料较完整，可以优先审核。"
        : "资料还需要人工确认。",
    reasons: [
      hasAddress ? "有地址/区域" : "缺少地址或区域",
      hasDishes ? "有推荐菜" : "缺少推荐菜",
      hasReview ? "评价长度足够" : "评价偏短",
      draft.submitterEmail ? "有登录邮箱" : "缺少登录邮箱",
    ],
  };
}

function decodeJwtPayload<T>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

function App() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [view, setView] = useState<View>("user");
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() =>
    safeRead(storageKeys.restaurants, baselineRestaurants),
  );
  const [drafts, setDrafts] = useState<SubmissionDraft[]>(() =>
    safeRead(storageKeys.drafts, starterDrafts),
  );
  const [comments, setComments] = useState<Comment[]>(() =>
    safeRead(storageKeys.comments, initialComments),
  );
  const [votedIds, setVotedIds] = useState<Record<string, string>>(() =>
    safeRead(storageKeys.votes, {}),
  );
  const [analytics, setAnalytics] = useState<Analytics>(() =>
    safeRead(storageKeys.analytics, defaultAnalytics),
  );
  const [acceptedAgreement, setAcceptedAgreement] = useState<boolean>(() =>
    safeRead(storageKeys.agreement, false),
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState("klcc");
  const [liveLocation, setLiveLocation] = useState<ActiveLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(12);
  const [randomSeed, setRandomSeed] = useState(1);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualCity, setManualCity] = useState("Kuala Lumpur");
  const [manualArea, setManualArea] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualDishes, setManualDishes] = useState("");
  const [manualReview, setManualReview] = useState("");
  const [manualRealName, setManualRealName] = useState("");
  const [aiReviewingId, setAiReviewingId] = useState<string | null>(null);
  const [ownerInput, setOwnerInput] = useState("");
  const [developerUnlocked, setDeveloperUnlocked] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() =>
    safeRead(storageKeys.users, []),
  );
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() =>
    safeRead(storageKeys.currentUser, null),
  );
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [toast, setToast] = useState<ToastState | null>(null);
  const autoLocationRequestedRef = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const c = copy[locale];
  const weekKey = getWeekKey();
  const preset =
    locationOptions.find((option) => option.id === locationId) || locationOptions[0];
  const currentLocation: ActiveLocation = liveLocation || preset;
  const approvedComments = comments.filter((comment) => comment.status === "approved");
  const pendingComments = comments.filter((comment) => comment.status === "pending");
  const normalizedDrafts = drafts.map((draft) => ({
    ...draft,
    submitterName: draft.submitterName || "",
    submitterEmail: draft.submitterEmail || "",
    cashbackAmount: draft.cashbackAmount || 2,
  }));

  useEffect(() => {
    const next = {
      ...safeRead(storageKeys.analytics, defaultAnalytics),
      visits: safeRead(storageKeys.analytics, defaultAnalytics).visits + 1,
      lastVisit: new Date().toISOString(),
    };
    setAnalytics(next);
    safeWrite(storageKeys.analytics, next);
  }, []);

  useEffect(() => {
    if (autoLocationRequestedRef.current) return;
    const timer = window.setTimeout(() => {
      autoLocationRequestedRef.current = true;
      requestUserLocation({ silent: true });
    }, 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentUser) return;
    if (!googleClientId || !googleButtonRef.current) return;

    const scriptId = "google-identity-services";
    const startGoogle = () => {
      const google = (window as WindowWithGoogle).google?.accounts?.id;
      if (!google || !googleButtonRef.current) return;
      google.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleButtonRef.current.innerHTML = "";
      google.renderButton?.(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 220,
      });
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      startGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = startGoogle;
    document.head.appendChild(script);
  }, [currentUser, googleClientId, locale]);

  const nearbyRestaurants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return restaurants
      .map((restaurant) => ({
        ...restaurant,
        distanceKm: distanceKm(currentLocation, restaurant),
      }))
      .filter((restaurant) => restaurant.distanceKm <= radiusKm)
      .filter((restaurant) => {
        const categoryMatch =
          selectedCategory === "all" || restaurant.category === selectedCategory;
        const searchable = [
          restaurant.name,
          restaurant.area,
          restaurant.city,
          restaurant.address,
          restaurant.recommendedDishes.join(" "),
          categoryLabels[locale][restaurant.category],
          approvedComments
            .filter((comment) => comment.restaurantId === restaurant.id)
            .map((comment) => comment.text)
            .join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return categoryMatch && (!normalized || searchable.includes(normalized));
      })
      .sort((a, b) => {
        if (b.weeklyLikes !== a.weeklyLikes) return b.weeklyLikes - a.weeklyLikes;
        return a.distanceKm - b.distanceKm;
      });
  }, [
    approvedComments,
    currentLocation,
    locale,
    query,
    radiusKm,
    restaurants,
    selectedCategory,
  ]);

  const strongPick = useMemo(() => {
    if (!nearbyRestaurants.length) return null;
    return nearbyRestaurants[Math.abs(randomSeed) % nearbyRestaurants.length];
  }, [nearbyRestaurants, randomSeed]);

  const leaderboard = nearbyRestaurants
    .filter((restaurant) => restaurant.weeklyLikes > 0)
    .slice(0, 5);

  function persistAnalytics(next: Analytics) {
    setAnalytics(next);
    safeWrite(storageKeys.analytics, next);
  }

  function showToast(title: string, detail: string) {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 2800);
  }

  function saveSignedInUser(user: RegisteredUser) {
    const now = new Date().toISOString();
    const previous = registeredUsers.find((item) => item.email === user.email);
    const nextUser: RegisteredUser = previous
      ? {
          ...previous,
          name: user.name || previous.name,
          picture: user.picture || previous.picture,
          provider: user.provider,
          lastSeen: now,
          signIns: previous.signIns + 1,
        }
      : {
          ...user,
          firstSeen: now,
          lastSeen: now,
          signIns: 1,
        };
    const nextUsers = [
      nextUser,
      ...registeredUsers.filter((item) => item.email !== user.email),
    ];
    setRegisteredUsers(nextUsers);
    setCurrentUser(nextUser);
    safeWrite(storageKeys.users, nextUsers);
    safeWrite(storageKeys.currentUser, nextUser);
    showToast(c.googleSignedIn, `${c.signedInAs} ${nextUser.name}`);
  }

  function handleGoogleCredential(response: GoogleCredentialResponse) {
    const payload = response.credential
      ? decodeJwtPayload<{
          sub?: string;
          name?: string;
          email?: string;
          picture?: string;
        }>(response.credential)
      : null;

    if (!payload?.email) {
      showToast(c.googleSignInFailed, c.googleSetupNeeded);
      return;
    }

    saveSignedInUser({
      id: payload.sub || payload.email,
      name: payload.name || payload.email,
      email: payload.email,
      picture: payload.picture,
      provider: "google",
      firstSeen: "",
      lastSeen: "",
      signIns: 0,
    });
  }

  function handleDemoSignIn() {
    saveSignedInUser({
      id: "demo-user",
      name: "Bubble Fish Demo",
      email: "demo@bubblefish.local",
      provider: "demo",
      firstSeen: "",
      lastSeen: "",
      signIns: 0,
    });
  }

  function handleSignOut() {
    setCurrentUser(null);
    safeWrite(storageKeys.currentUser, null);
    setView("user");
    (window as WindowWithGoogle).google?.accounts?.id?.disableAutoSelect?.();
  }

  function handleLocationChange(nextLocationId: string) {
    const next = locationOptions.find((option) => option.id === nextLocationId);
    setLiveLocation(null);
    setLocationId(nextLocationId);
    if (next) setRadiusKm(next.defaultRadiusKm);
  }

  function requestUserLocation(options: { silent?: boolean } = {}) {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      if (!options.silent) showToast(c.locationUnsupported, c.locationBlocked);
      return;
    }
    setLocationStatus("requesting");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = [...locationOptions].sort(
          (a, b) =>
            distanceKm({ lat: latitude, lng: longitude }, a) -
            distanceKm({ lat: latitude, lng: longitude }, b),
        )[0];
        setLiveLocation({
          ...nearest,
          id: "live",
          label: c.liveLocation,
          lat: latitude,
          lng: longitude,
          accuracyMeters: Math.round(accuracy),
          isLive: true,
        });
        setIsLocating(false);
        setLocationStatus("allowed");
        if (!options.silent) {
          showToast(c.locationAllowed, `${formatDistance(accuracy / 1000)} ${c.radius}`);
        }
      },
      () => {
        setIsLocating(false);
        setLocationStatus("blocked");
        if (!options.silent) showToast(c.locationBlocked, c.nearby);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function handleUseRealLocation() {
    requestUserLocation();
  }

  function handleVote(id: string) {
    if (votedIds[id] === weekKey) return;
    const nextRestaurants = restaurants.map((restaurant) =>
      restaurant.id === id
        ? {
            ...restaurant,
            weeklyLikes: restaurant.weeklyLikes + 1,
            totalLikes: restaurant.totalLikes + 1,
          }
        : restaurant,
    );
    setRestaurants(nextRestaurants);
    safeWrite(storageKeys.restaurants, nextRestaurants);
    const nextVotes = { ...votedIds, [id]: weekKey };
    setVotedIds(nextVotes);
    safeWrite(storageKeys.votes, nextVotes);
    persistAnalytics({ ...analytics, likes: analytics.likes + 1 });
  }

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!commentingId || !commentText.trim()) return;
    const nextComment: Comment = {
      id: makeId("comment"),
      restaurantId: commentingId,
      author: commentAuthor.trim() || "Bubble Fish user",
      text: commentText.trim(),
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const nextComments = [nextComment, ...comments];
    setComments(nextComments);
    safeWrite(storageKeys.comments, nextComments);
    persistAnalytics({ ...analytics, comments: analytics.comments + 1 });
    setCommentAuthor("");
    setCommentText("");
    setCommentingId(null);
    showToast(c.commentQueued, c.commentQueuedDetail);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setManualImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleSubmitRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualName.trim() || !manualReview.trim() || !currentUser) return;
    const realName = manualRealName.trim();
    const cashbackAmount: 2 | 4 =
      realName && currentUser.provider === "google" && currentUser.email ? 4 : 2;
    const draft: SubmissionDraft = {
      id: makeId("draft"),
      name: manualName.trim(),
      image: manualImage.trim() || defaultImage,
      city: manualCity,
      area: manualArea.trim(),
      address: manualAddress.trim(),
      category: inferCategory(`${manualName} ${manualDishes}`),
      price: "待补全",
      dishes: manualDishes
        .split(/[;；、,]/)
        .map((dish) => dish.trim())
        .filter(Boolean),
      userReview: manualReview.trim(),
      submitterName: realName,
      submitterEmail: currentUser.email,
      cashbackAmount,
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    const nextDrafts = [draft, ...drafts];
    setDrafts(nextDrafts);
    safeWrite(storageKeys.drafts, nextDrafts);
    persistAnalytics({ ...analytics, submissions: analytics.submissions + 1 });
    setManualName("");
    setManualArea("");
    setManualAddress("");
    setManualImage("");
    setManualDishes("");
    setManualReview("");
    setManualRealName("");
    showToast(c.submitted, c.submittedDetail);
  }

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ownerInput.trim() === ownerCode) {
      setDeveloperUnlocked(true);
      setOwnerInput("");
      return;
    }
    showToast(c.wrongCode, c.ownerHint);
  }

  function handleEnrichDraft(id: string) {
    const nextDrafts = drafts.map((draft) =>
      draft.id === id
        ? {
            ...draft,
            status: "enriched" as const,
            price: draft.city === "Singapore" ? "S$ 8-35" : "RM 15-60",
            dishes: draft.dishes.length ? draft.dishes : ["To verify"],
          }
        : draft,
    );
    setDrafts(nextDrafts);
    safeWrite(storageKeys.drafts, nextDrafts);
  }

  async function handleRunAiReview(id: string) {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    setAiReviewingId(id);
    let review = buildLocalAiReview(draft, restaurants);
    let usedFallback = true;

    try {
      const response = await fetch("/api/review-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, restaurants }),
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          review?: DraftAiReview;
          fallback?: boolean;
        };
        if (payload.review) {
          review = payload.review;
          usedFallback = Boolean(payload.fallback);
        }
      }
    } catch {
      usedFallback = true;
    }

    if (review.verdict === "duplicate") {
      const nextDrafts = drafts.filter((item) => item.id !== id);
      setDrafts(nextDrafts);
      safeWrite(storageKeys.drafts, nextDrafts);
      setAiReviewingId(null);
      showToast(c.duplicate, review.summary || review.duplicateOf);
      return;
    }

    const nextDrafts = drafts.map((item) =>
      item.id === id
        ? {
            ...item,
            aiReview: review,
            status: "enriched" as const,
            category: review.suggestedCategory || item.category,
            price: review.suggestedPrice || item.price,
            dishes: review.suggestedDishes.length
              ? review.suggestedDishes
              : item.dishes,
          }
        : item,
    );
    setDrafts(nextDrafts);
    safeWrite(storageKeys.drafts, nextDrafts);
    setAiReviewingId(null);
    showToast(c.aiReview, usedFallback ? c.aiFallback : review.summary);
  }

  function handleApproveDraft(id: string) {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    const coords = fallbackLatLng(draft.city, draft.address || draft.area || draft.name);
    const restaurant: Restaurant = {
      id: makeId("restaurant"),
      name: draft.name,
      city: draft.city,
      country: countryForCity(draft.city),
      area: draft.area || draft.city,
      address: draft.address || draft.area || draft.city,
      lat: coords.lat,
      lng: coords.lng,
      category: draft.category,
      image: draft.image,
      price: draft.price === "待补全" ? "待确认" : draft.price,
      rating: 0,
      weeklyLikes: 0,
      totalLikes: 0,
      recommendedDishes: draft.dishes.length ? draft.dishes : ["To verify"],
      tags: {
        zh: ["用户推荐", "已审核"],
        en: ["User pick", "Approved"],
        ms: ["Cadangan pengguna", "Diluluskan"],
      },
      note: {
        zh: "来自用户真实推荐，已进入 Bubble Fish 审核库。",
        en: "A real user pick approved into Bubble Fish.",
        ms: "Cadangan pengguna yang telah diluluskan.",
      },
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${draft.name} ${draft.city}`,
      )}`,
      source: "community",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    const nextRestaurants = [restaurant, ...restaurants];
    const nextDrafts = drafts.filter((item) => item.id !== id);
    const reviewComment: Comment = {
      id: makeId("comment"),
      restaurantId: restaurant.id,
      author: draft.submitterName || "Community",
      text: draft.userReview,
      status: "approved",
      createdAt: draft.submittedAt,
    };
    const nextComments = [reviewComment, ...comments];
    setRestaurants(nextRestaurants);
    setDrafts(nextDrafts);
    setComments(nextComments);
    safeWrite(storageKeys.restaurants, nextRestaurants);
    safeWrite(storageKeys.drafts, nextDrafts);
    safeWrite(storageKeys.comments, nextComments);
    persistAnalytics({ ...analytics, approvals: analytics.approvals + 1 });
  }

  function handleApproveComment(id: string) {
    const nextComments = comments.map((comment) =>
      comment.id === id ? { ...comment, status: "approved" as const } : comment,
    );
    setComments(nextComments);
    safeWrite(storageKeys.comments, nextComments);
    persistAnalytics({ ...analytics, approvals: analytics.approvals + 1 });
  }

  function handleRejectComment(id: string) {
    const nextComments = comments.filter((comment) => comment.id !== id);
    setComments(nextComments);
    safeWrite(storageKeys.comments, nextComments);
  }

  function handleRejectDraft(id: string) {
    const nextDrafts = drafts.filter((draft) => draft.id !== id);
    setDrafts(nextDrafts);
    safeWrite(storageKeys.drafts, nextDrafts);
  }

  function handleReset() {
    setRestaurants(baselineRestaurants);
    setDrafts(starterDrafts);
    setComments(initialComments);
    setVotedIds({});
    setAnalytics(defaultAnalytics);
    safeWrite(storageKeys.restaurants, baselineRestaurants);
    safeWrite(storageKeys.drafts, starterDrafts);
    safeWrite(storageKeys.comments, initialComments);
    safeWrite(storageKeys.votes, {});
    safeWrite(storageKeys.analytics, defaultAnalytics);
  }

  const totalRecommendations = restaurants.filter((item) => item.source === "community").length + drafts.length;

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__media" />
        <div className="hero__overlay">
          <nav className="topbar" aria-label="Bubble Fish">
            <button className="brand" type="button" onClick={() => setView("user")}>
              <span className="brand__mark">
                <Utensils size={18} strokeWidth={2.4} />
              </span>
              <span>Bubble Fish</span>
            </button>

            <div className="topbar-right">
              {currentUser && (
                <div className="top-location-card">
                  <div className="top-location">
                    <MapPin size={16} />
                    <select
                      value={liveLocation ? "live" : locationId}
                      onChange={(event) => handleLocationChange(event.target.value)}
                      aria-label={c.nearby}
                    >
                      {liveLocation && <option value="live">{c.liveLocation}</option>}
                      {locationOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleUseRealLocation}>
                      {isLocating ? (
                        <Loader2 className="spin" size={15} />
                      ) : (
                        <LocateFixed size={15} />
                      )}
                      <span>{isLocating ? c.locating : c.useLocation}</span>
                    </button>
                    <select
                      className="radius-select"
                      value={radiusKm}
                      onChange={(event) => setRadiusKm(Number(event.target.value))}
                      aria-label={c.radius}
                    >
                      <option value={5}>5km</option>
                      <option value={8}>8km</option>
                      <option value={12}>12km</option>
                      <option value={20}>20km</option>
                      <option value={40}>40km</option>
                    </select>
                  </div>
                  <p className={`location-status status-${locationStatus}`}>
                    {locationStatus === "requesting" && c.locationRequesting}
                    {locationStatus === "allowed" &&
                      `${c.locationAllowed}${
                        liveLocation?.accuracyMeters
                          ? ` · ±${Math.round(liveLocation.accuracyMeters)}m`
                          : ""
                      }`}
                    {locationStatus === "blocked" && c.locationBlocked}
                    {locationStatus === "unsupported" && c.locationUnsupported}
                    {locationStatus === "idle" && c.locationRequesting}
                  </p>
                </div>
              )}

              <div className="language-switch" aria-label="Language">
                <Languages size={16} />
                {locales.map((item) => (
                  <button
                    key={item.value}
                    className={locale === item.value ? "is-active" : ""}
                    type="button"
                    onClick={() => setLocale(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {currentUser && (
                <div className="account-chip">
                  {currentUser.picture ? (
                    <img src={currentUser.picture} alt={currentUser.name} />
                  ) : (
                    <span className="avatar-fallback">
                      {currentUser.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <strong>{currentUser.name}</strong>
                  <button type="button" onClick={handleSignOut}>
                    {c.signOut}
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="hero__content">
            <div className="hero__copy">
              <p className="eyebrow">{c.tagline}</p>
              <h1>{c.hero}</h1>
              <p>{c.heroBody}</p>
            </div>
            <div className="hero__stats">
              <div>
                <span>{nearbyRestaurants.length}</span>
                <small>{c.nearbyChoices}</small>
              </div>
              <div>
                <span>{totalRecommendations}</span>
                <small>{c.questionnairePublished}</small>
              </div>
              <div>
                <span>{pendingComments.length + drafts.length}</span>
                <small>{c.pendingReview}</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {!currentUser && (
        <LoginGate
          c={c}
          googleClientId={googleClientId}
          googleButtonRef={googleButtonRef}
          onDemoSignIn={handleDemoSignIn}
        />
      )}

      {currentUser && view === "user" && (
        <UserHome
          c={c}
          locale={locale}
          restaurants={nearbyRestaurants}
          strongPick={
            strongPick
              ? {
                  ...strongPick,
                  comments: approvedComments.filter(
                    (comment) => comment.restaurantId === strongPick.id,
                  ),
                }
              : null
          }
          leaderboard={leaderboard}
          comments={approvedComments}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          query={query}
          setQuery={setQuery}
          randomAgain={() => setRandomSeed(Math.floor(Math.random() * 100000))}
          votedIds={votedIds}
          weekKey={weekKey}
          onVote={handleVote}
          commentingId={commentingId}
          setCommentingId={setCommentingId}
          commentAuthor={commentAuthor}
          setCommentAuthor={setCommentAuthor}
          commentText={commentText}
          setCommentText={setCommentText}
          onCommentSubmit={handleCommentSubmit}
        />
      )}

      {currentUser && view === "submit" && (
        <SubmitView
          c={c}
          manualName={manualName}
          setManualName={setManualName}
          manualCity={manualCity}
          setManualCity={setManualCity}
          manualArea={manualArea}
          setManualArea={setManualArea}
          manualAddress={manualAddress}
          setManualAddress={setManualAddress}
          manualImage={manualImage}
          setManualImage={setManualImage}
          manualDishes={manualDishes}
          setManualDishes={setManualDishes}
          manualReview={manualReview}
          setManualReview={setManualReview}
          manualRealName={manualRealName}
          setManualRealName={setManualRealName}
          currentUser={currentUser}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmitRestaurant}
          onBack={() => setView("user")}
        />
      )}

      {view === "agreement" && (
        <AgreementView
          c={c}
          acceptedAgreement={acceptedAgreement}
          onAccept={() => {
            setAcceptedAgreement(true);
            safeWrite(storageKeys.agreement, true);
            setView("user");
          }}
          onBack={() => setView("user")}
        />
      )}

      {view === "developer" && (
        <DeveloperView
          c={c}
          unlocked={developerUnlocked}
          ownerInput={ownerInput}
          setOwnerInput={setOwnerInput}
          onUnlock={handleUnlock}
          analytics={analytics}
          registeredUsers={registeredUsers}
          drafts={normalizedDrafts}
          comments={comments}
          restaurants={restaurants}
          onEnrichDraft={handleEnrichDraft}
          onRunAiReview={handleRunAiReview}
          aiReviewingId={aiReviewingId}
          onApproveDraft={handleApproveDraft}
          onRejectDraft={handleRejectDraft}
          onApproveComment={handleApproveComment}
          onRejectComment={handleRejectComment}
          onReset={handleReset}
          onBack={() => setView("user")}
        />
      )}

      {currentUser && (
        <footer className="site-footer">
          <button className="submit-float-button" type="button" onClick={() => setView("submit")}>
            <Send size={15} />
            {c.submitPlace}
          </button>
        </footer>
      )}

      <nav className="fine-links" aria-label="Site links">
        <button type="button" onClick={() => setView("agreement")}>
          {c.agreement}
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={() => setView("developer")}>
          {c.developer}
        </button>
      </nav>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <strong>{toast.title}</strong>
          <span>{toast.detail}</span>
        </div>
      )}
    </main>
  );
}

function UserHome({
  c,
  locale,
  restaurants,
  strongPick,
  leaderboard,
  comments,
  selectedCategory,
  setSelectedCategory,
  query,
  setQuery,
  randomAgain,
  votedIds,
  weekKey,
  onVote,
  commentingId,
  setCommentingId,
  commentAuthor,
  setCommentAuthor,
  commentText,
  setCommentText,
  onCommentSubmit,
}: {
  c: (typeof copy)[Locale];
  locale: Locale;
  restaurants: Array<Restaurant & { distanceKm: number }>;
  strongPick:
    | ((Restaurant & { distanceKm: number }) & { comments: Comment[] })
    | null;
  leaderboard: Array<Restaurant & { distanceKm: number }>;
  comments: Comment[];
  selectedCategory: CategoryKey;
  setSelectedCategory: (value: CategoryKey) => void;
  query: string;
  setQuery: (value: string) => void;
  randomAgain: () => void;
  votedIds: Record<string, string>;
  weekKey: string;
  onVote: (id: string) => void;
  commentingId: string | null;
  setCommentingId: (id: string | null) => void;
  commentAuthor: string;
  setCommentAuthor: (value: string) => void;
  commentText: string;
  setCommentText: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="workspace">
      <aside className="leaderboard">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Weekly Top</p>
            <h2>{c.weekly}</h2>
          </div>
          <Trophy size={20} />
        </div>
        {leaderboard.length ? (
          <ol className="rank-list">
            {leaderboard.map((restaurant, index) => (
              <li key={restaurant.id}>
                <span className="rank-number">{index + 1}</span>
                <img src={restaurant.image} alt={restaurant.name} />
                <div>
                  <strong>{restaurant.name}</strong>
                  <small>{formatDistance(restaurant.distanceKm)}</small>
                </div>
                <span className="rank-likes">{restaurant.weeklyLikes}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty-rank">
            <Heart size={18} />
            <p>{c.noRank}</p>
          </div>
        )}
      </aside>

      <section className="content-pane">
        {strongPick && (
          <article className="strong-pick">
            <img src={strongPick.image} alt={strongPick.name} />
            <div className="strong-pick__body">
              <p className="eyebrow">{c.strongPick}</p>
              <h2>{strongPick.name}</h2>
              <p>
                {strongPick.area} · {formatDistance(strongPick.distanceKm)} ·{" "}
                {strongPick.recommendedDishes.slice(0, 2).join(" / ")}
              </p>
              {strongPick.comments[0] && (
                <blockquote>{strongPick.comments[0].text}</blockquote>
              )}
              <div className="strong-actions">
                <button className="primary-button" type="button" onClick={randomAgain}>
                  <Shuffle size={16} />
                  {c.pickAgain}
                </button>
                <a
                  className="map-button dark"
                  href={strongPick.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  {c.map}
                </a>
              </div>
            </div>
          </article>
        )}

        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input
              aria-label={c.search}
              placeholder={c.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="category-scroll">
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? "is-active" : ""}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[locale][category]}
              </button>
            ))}
          </div>
        </div>

        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              c={c}
              locale={locale}
              restaurant={restaurant}
              comments={comments.filter((comment) => comment.restaurantId === restaurant.id)}
              voted={votedIds[restaurant.id] === weekKey}
              onVote={onVote}
              commenting={commentingId === restaurant.id}
              setCommentingId={setCommentingId}
              commentAuthor={commentAuthor}
              setCommentAuthor={setCommentAuthor}
              commentText={commentText}
              setCommentText={setCommentText}
              onCommentSubmit={onCommentSubmit}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function LoginGate({
  c,
  googleClientId,
  googleButtonRef,
  onDemoSignIn,
}: {
  c: (typeof copy)[Locale];
  googleClientId?: string;
  googleButtonRef: React.RefObject<HTMLDivElement | null>;
  onDemoSignIn: () => void;
}) {
  return (
    <section className="login-gate">
      <div className="login-gate__panel">
        <div>
          <p className="eyebrow">Bubble Fish</p>
          <h2>{c.loginTitle}</h2>
          <p>{c.loginBody}</p>
        </div>
        <div className="login-actions">
          {googleClientId ? (
            <div ref={googleButtonRef} className="google-button-slot" />
          ) : (
            <>
              <button className="google-login-button" type="button" onClick={onDemoSignIn}>
                <span>G</span>
                {c.signInGoogle}
              </button>
              <button className="demo-login-link" type="button" onClick={onDemoSignIn}>
                {c.demoSignIn}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function RestaurantCard({
  c,
  locale,
  restaurant,
  comments,
  voted,
  onVote,
  commenting,
  setCommentingId,
  commentAuthor,
  setCommentAuthor,
  commentText,
  setCommentText,
  onCommentSubmit,
}: {
  c: (typeof copy)[Locale];
  locale: Locale;
  restaurant: Restaurant & { distanceKm: number };
  comments: Comment[];
  voted: boolean;
  onVote: (id: string) => void;
  commenting: boolean;
  setCommentingId: (id: string | null) => void;
  commentAuthor: string;
  setCommentAuthor: (value: string) => void;
  commentText: string;
  setCommentText: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className="restaurant-card">
      <div className="restaurant-card__image">
        <img src={restaurant.image} alt={restaurant.name} />
        <span>{categoryLabels[locale][restaurant.category]}</span>
      </div>
      <div className="restaurant-card__body">
        <div className="restaurant-card__title">
          <div>
            <h3>{restaurant.name}</h3>
            <p>
              <MapPin size={15} />
              {restaurant.area}, {restaurant.city}
            </p>
          </div>
          <span className="distance-badge">
            <Navigation size={14} />
            {formatDistance(restaurant.distanceKm)}
          </span>
        </div>

        <p className="note">{restaurant.note[locale]}</p>
        <div className="meta-row">
          <span>
            <CircleDollarSign size={15} />
            {c.price} {restaurant.price}
          </span>
          <span>
            <Star size={15} fill="currentColor" />
            {restaurant.rating || "New"}
          </span>
          <span>
            <ThumbsUp size={15} />
            {restaurant.totalLikes} {c.totalLikes}
          </span>
        </div>

        <div className="dish-list">
          {restaurant.recommendedDishes.map((dish) => (
            <span key={dish}>{dish}</span>
          ))}
        </div>

        <div className="comment-block">
          <div className="comment-head">
            <strong>
              <MessageCircle size={15} />
              {c.comments}
            </strong>
            <button type="button" onClick={() => setCommentingId(commenting ? null : restaurant.id)}>
              {commenting ? <X size={15} /> : <MessageCircle size={15} />}
              {c.addComment}
            </button>
          </div>
          {comments.length ? (
            comments.slice(0, 2).map((comment) => (
              <blockquote key={comment.id}>
                <span>{comment.author}</span>
                {comment.text}
              </blockquote>
            ))
          ) : (
            <p>{c.noComments}</p>
          )}
          {commenting && (
            <form className="comment-form" onSubmit={onCommentSubmit}>
              <input
                value={commentAuthor}
                onChange={(event) => setCommentAuthor(event.target.value)}
                placeholder={c.nickname}
              />
              <textarea
                required
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={c.commentPlaceholder}
              />
              <button className="primary-button" type="submit">
                <Send size={15} />
                {c.submitComment}
              </button>
            </form>
          )}
        </div>

        <div className="restaurant-card__footer">
          <button
            className="like-button"
            type="button"
            onClick={() => onVote(restaurant.id)}
            disabled={voted}
          >
            <Heart size={17} fill={voted ? "currentColor" : "none"} />
            {voted ? c.liked : c.like}
            <strong>{restaurant.weeklyLikes}</strong>
          </button>
          <a className="map-button" href={restaurant.mapUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            {c.map}
          </a>
        </div>
      </div>
    </article>
  );
}

function SubmitView({
  c,
  manualName,
  setManualName,
  manualCity,
  setManualCity,
  manualArea,
  setManualArea,
  manualAddress,
  setManualAddress,
  manualImage,
  setManualImage,
  manualDishes,
  setManualDishes,
  manualReview,
  setManualReview,
  manualRealName,
  setManualRealName,
  currentUser,
  onImageUpload,
  onSubmit,
  onBack,
}: {
  c: (typeof copy)[Locale];
  manualName: string;
  setManualName: (value: string) => void;
  manualCity: string;
  setManualCity: (value: string) => void;
  manualArea: string;
  setManualArea: (value: string) => void;
  manualAddress: string;
  setManualAddress: (value: string) => void;
  manualImage: string;
  setManualImage: (value: string) => void;
  manualDishes: string;
  setManualDishes: (value: string) => void;
  manualReview: string;
  setManualReview: (value: string) => void;
  manualRealName: string;
  setManualRealName: (value: string) => void;
  currentUser: RegisteredUser | null;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <section className="workspace single-column">
      <section className="content-pane">
        <div className="pane-heading">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ChevronDown className="rotate-left" size={16} />
            {c.back}
          </button>
          <div>
            <p className="eyebrow">Community</p>
            <h2>{c.submitTitle}</h2>
            <p>{c.submitBody}</p>
          </div>
        </div>

        <div className="cashback-box">
          <strong>{c.cashbackRule}</strong>
          <span>{c.fullCashback}</span>
          <span>{c.lightCashback}</span>
        </div>

        <form className="submission-form" onSubmit={onSubmit}>
          <label>
            {c.realName}
            <input
              value={manualRealName}
              onChange={(event) => setManualRealName(event.target.value)}
              placeholder="Wang Zixuan"
            />
          </label>
          <label>
            {c.googleEmail}
            <input disabled value={currentUser?.email || ""} />
          </label>
          <label>
            {c.restaurantName}
            <input
              required
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Ah Lim Curry Mee"
            />
          </label>
          <label>
            {c.city}
            <span className="select-wrap">
              <select value={manualCity} onChange={(event) => setManualCity(event.target.value)}>
                {supportedCities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
          <label>
            {c.area}
            <input value={manualArea} onChange={(event) => setManualArea(event.target.value)} />
          </label>
          <label>
            {c.address}
            <input
              value={manualAddress}
              onChange={(event) => setManualAddress(event.target.value)}
            />
          </label>
          <label>
            {c.dishes}
            <input
              value={manualDishes}
              onChange={(event) => setManualDishes(event.target.value)}
              placeholder="Laksa; Kopi"
            />
          </label>
          <label>
            {c.photo}
            <input value={manualImage} onChange={(event) => setManualImage(event.target.value)} />
          </label>
          <label className="file-drop">
            <Camera size={18} />
            <span>{c.uploadPhoto}</span>
            <input type="file" accept="image/*" onChange={onImageUpload} />
          </label>
          {manualImage && <img className="upload-preview" src={manualImage} alt="Upload preview" />}
          <label className="full-field">
            {c.userReview}
            <textarea
              required
              value={manualReview}
              onChange={(event) => setManualReview(event.target.value)}
              placeholder={c.commentPlaceholder}
            />
          </label>
          <button className="primary-button submit-review-button" type="submit">
            <Send size={16} />
            {c.submitReview}
          </button>
        </form>
      </section>
    </section>
  );
}

function AgreementView({
  c,
  acceptedAgreement,
  onAccept,
  onBack,
}: {
  c: (typeof copy)[Locale];
  acceptedAgreement: boolean;
  onAccept: () => void;
  onBack: () => void;
}) {
  return (
    <section className="workspace single-column">
      <section className="content-pane legal-pane">
        <button className="ghost-button" type="button" onClick={onBack}>
          <ChevronDown className="rotate-left" size={16} />
          {c.back}
        </button>
        <ShieldCheck size={28} />
        <h2>{c.legalTitle}</h2>
        <p>{c.legalBody}</p>
        <button className="primary-button" type="button" onClick={onAccept}>
          <Check size={16} />
          {acceptedAgreement ? c.back : c.agree}
        </button>
      </section>
    </section>
  );
}

function DeveloperView({
  c,
  unlocked,
  ownerInput,
  setOwnerInput,
  onUnlock,
  analytics,
  registeredUsers,
  drafts,
  comments,
  restaurants,
  onEnrichDraft,
  onRunAiReview,
  aiReviewingId,
  onApproveDraft,
  onRejectDraft,
  onApproveComment,
  onRejectComment,
  onReset,
  onBack,
}: {
  c: (typeof copy)[Locale];
  unlocked: boolean;
  ownerInput: string;
  setOwnerInput: (value: string) => void;
  onUnlock: (event: FormEvent<HTMLFormElement>) => void;
  analytics: Analytics;
  registeredUsers: RegisteredUser[];
  drafts: SubmissionDraft[];
  comments: Comment[];
  restaurants: Restaurant[];
  onEnrichDraft: (id: string) => void;
  onRunAiReview: (id: string) => void;
  aiReviewingId: string | null;
  onApproveDraft: (id: string) => void;
  onRejectDraft: (id: string) => void;
  onApproveComment: (id: string) => void;
  onRejectComment: (id: string) => void;
  onReset: () => void;
  onBack: () => void;
}) {
  const pendingComments = comments.filter((comment) => comment.status === "pending");

  if (!unlocked) {
    return (
      <section className="workspace single-column">
        <section className="content-pane login-pane">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ChevronDown className="rotate-left" size={16} />
            {c.back}
          </button>
          <Lock size={28} />
          <h2>{c.ownerLogin}</h2>
          <p>{c.ownerHint}</p>
          <form onSubmit={onUnlock}>
            <input
              value={ownerInput}
              onChange={(event) => setOwnerInput(event.target.value)}
              placeholder={c.password}
              type="password"
            />
            <button className="primary-button" type="submit">
              {c.unlock}
            </button>
          </form>
        </section>
      </section>
    );
  }

  return (
    <section className="workspace single-column">
      <section className="content-pane developer-pane">
        <div className="pane-heading row-heading">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ChevronDown className="rotate-left" size={16} />
            {c.back}
          </button>
          <div>
            <p className="eyebrow">Owner</p>
            <h2>{c.dashboard}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onReset}>
            <RefreshCw size={16} />
            {c.reset}
          </button>
        </div>

        <div className="metric-grid">
          <Metric icon={<Eye size={18} />} label={c.visits} value={analytics.visits} />
          <Metric icon={<BarChart3 size={18} />} label={c.registeredCount} value={registeredUsers.length} />
          <Metric icon={<Heart size={18} />} label={c.likes} value={analytics.likes} />
          <Metric icon={<Send size={18} />} label={c.submissions} value={analytics.submissions} />
          <Metric icon={<MessageCircle size={18} />} label={c.commentCount} value={analytics.comments} />
          <Metric icon={<Check size={18} />} label={c.approvals} value={analytics.approvals} />
          <Metric icon={<Utensils size={18} />} label="Live" value={restaurants.length} />
        </div>

        <div className="admin-section">
          <h3>{c.userDirectory}</h3>
          <div className="user-list">
            {registeredUsers.length ? (
              registeredUsers.map((user) => (
                <article className="user-row" key={user.email}>
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} />
                  ) : (
                    <span className="avatar-fallback">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <span>{user.provider}</span>
                  <small>
                    {c.lastSeen} {new Date(user.lastSeen).toLocaleString()}
                  </small>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <BarChart3 size={18} />
                <p>{c.registeredUsers}: 0</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h3>{c.reviewPlaces}</h3>
          <div className="queue-list">
            {drafts.map((draft) => (
              <article className="queue-item" key={draft.id}>
                <img src={draft.image} alt={draft.name} />
                <div className="queue-item__content">
                  <div className="queue-item__head">
                    <div>
                      <h4>{draft.name}</h4>
                      <p>{draft.area || draft.city}</p>
                    </div>
                    <span className={`status-badge status-${draft.status}`}>
                      {draft.status === "pending" ? c.pending : c.enriched}
                    </span>
                  </div>
                  <p className="note">{draft.userReview}</p>
                  <div className="submitter-line">
                    <span>{draft.submitterName || c.lightCashback}</span>
                    <span>{draft.submitterEmail || "-"}</span>
                    <strong>RM {draft.cashbackAmount}</strong>
                  </div>
                  <div className="dish-list">
                    {(draft.dishes.length ? draft.dishes : [c.enrich]).map((dish) => (
                      <span key={dish}>{dish}</span>
                    ))}
                  </div>
                  {draft.aiReview && (
                    <div className={`ai-review-card verdict-${draft.aiReview.verdict}`}>
                      <div>
                        <strong>{c.aiReview}</strong>
                        <span>
                          {c.reviewScore}: {draft.aiReview.score}
                        </span>
                      </div>
                      <p>{draft.aiReview.summary}</p>
                      {draft.aiReview.duplicateOf && (
                        <small>
                          {c.duplicateOf}: {draft.aiReview.duplicateOf}
                        </small>
                      )}
                      <ul>
                        {draft.aiReview.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="queue-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => onRunAiReview(draft.id)}
                      disabled={aiReviewingId === draft.id}
                    >
                      {aiReviewingId === draft.id ? (
                        <Loader2 className="spin" size={15} />
                      ) : (
                        <Sparkles size={15} />
                      )}
                      {c.runAiReview}
                    </button>
                    <button className="ghost-button" type="button" onClick={() => onEnrichDraft(draft.id)}>
                      <Sparkles size={15} />
                      {c.enrich}
                    </button>
                    <button className="ghost-button danger-button" type="button" onClick={() => onRejectDraft(draft.id)}>
                      {c.reject}
                    </button>
                    <button className="primary-button" type="button" onClick={() => onApproveDraft(draft.id)}>
                      <ClipboardCheck size={15} />
                      {c.approve}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h3>{c.reviewComments}</h3>
          <div className="comment-review-list">
            {pendingComments.map((comment) => (
              <article key={comment.id} className="comment-review">
                <p>{comment.text}</p>
                <small>{comment.author}</small>
                <div>
                  <button className="ghost-button danger-button" type="button" onClick={() => onRejectComment(comment.id)}>
                    {c.reject}
                  </button>
                  <button className="primary-button" type="button" onClick={() => onApproveComment(comment.id)}>
                    {c.approve}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="metric-card">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default App;
