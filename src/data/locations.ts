import type { LocationMeta } from "../types.js";

/**
 * All 58 JMA sakura observation stations.
 * Key: Japanese name as it appears in JMA HTML tables.
 * Value: English metadata with coordinates.
 */
export const LOCATION_MAP: Record<string, LocationMeta> = {
  // ── Hokkaido ──
  "稚内": { id: "wakkanai", name_en: "Wakkanai", name_ja: "稚内", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 45.4158, lon: 141.6731, tree_species: "ezo_yama_zakura" },
  "旭川": { id: "asahikawa", name_en: "Asahikawa", name_ja: "旭川", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 43.7707, lon: 142.3650, tree_species: "ezo_yama_zakura" },
  "網走": { id: "abashiri", name_en: "Abashiri", name_ja: "網走", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 44.0206, lon: 144.2694, tree_species: "ezo_yama_zakura" },
  "札幌": { id: "sapporo", name_en: "Sapporo", name_ja: "札幌", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 43.0618, lon: 141.3545, tree_species: "somei_yoshino" },
  "帯広": { id: "obihiro", name_en: "Obihiro", name_ja: "帯広", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 42.9170, lon: 143.2044, tree_species: "ezo_yama_zakura" },
  "釧路": { id: "kushiro", name_en: "Kushiro", name_ja: "釧路", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 42.9849, lon: 144.3820, tree_species: "ezo_yama_zakura" },
  "室蘭": { id: "muroran", name_en: "Muroran", name_ja: "室蘭", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 42.3150, lon: 140.9740, tree_species: "somei_yoshino" },
  "函館": { id: "hakodate", name_en: "Hakodate", name_ja: "函館", prefecture_en: "Hokkaido", prefecture_ja: "北海道", region: "hokkaido", lat: 41.7688, lon: 140.7290, tree_species: "somei_yoshino" },

  // ── Tohoku ──
  "青森": { id: "aomori", name_en: "Aomori", name_ja: "青森", prefecture_en: "Aomori", prefecture_ja: "青森県", region: "tohoku", lat: 40.8246, lon: 140.7400, tree_species: "somei_yoshino" },
  "秋田": { id: "akita", name_en: "Akita", name_ja: "秋田", prefecture_en: "Akita", prefecture_ja: "秋田県", region: "tohoku", lat: 39.7186, lon: 140.1024, tree_species: "somei_yoshino" },
  "盛岡": { id: "morioka", name_en: "Morioka", name_ja: "盛岡", prefecture_en: "Iwate", prefecture_ja: "岩手県", region: "tohoku", lat: 39.7036, lon: 141.1527, tree_species: "somei_yoshino" },
  "仙台": { id: "sendai", name_en: "Sendai", name_ja: "仙台", prefecture_en: "Miyagi", prefecture_ja: "宮城県", region: "tohoku", lat: 38.2682, lon: 140.8694, tree_species: "somei_yoshino" },
  "山形": { id: "yamagata", name_en: "Yamagata", name_ja: "山形", prefecture_en: "Yamagata", prefecture_ja: "山形県", region: "tohoku", lat: 38.2554, lon: 140.3396, tree_species: "somei_yoshino" },
  "福島": { id: "fukushima", name_en: "Fukushima", name_ja: "福島", prefecture_en: "Fukushima", prefecture_ja: "福島県", region: "tohoku", lat: 37.7503, lon: 140.4676, tree_species: "somei_yoshino" },

  // ── Kanto ──
  "水戸": { id: "mito", name_en: "Mito", name_ja: "水戸", prefecture_en: "Ibaraki", prefecture_ja: "茨城県", region: "kanto", lat: 36.3418, lon: 140.4468, tree_species: "somei_yoshino" },
  "宇都宮": { id: "utsunomiya", name_en: "Utsunomiya", name_ja: "宇都宮", prefecture_en: "Tochigi", prefecture_ja: "栃木県", region: "kanto", lat: 36.5657, lon: 139.8836, tree_species: "somei_yoshino" },
  "前橋": { id: "maebashi", name_en: "Maebashi", name_ja: "前橋", prefecture_en: "Gunma", prefecture_ja: "群馬県", region: "kanto", lat: 36.3911, lon: 139.0608, tree_species: "somei_yoshino" },
  "熊谷": { id: "kumagaya", name_en: "Kumagaya", name_ja: "熊谷", prefecture_en: "Saitama", prefecture_ja: "埼玉県", region: "kanto", lat: 36.1472, lon: 139.3886, tree_species: "somei_yoshino" },
  "東京": { id: "tokyo", name_en: "Tokyo", name_ja: "東京", prefecture_en: "Tokyo", prefecture_ja: "東京都", region: "kanto", lat: 35.6894, lon: 139.6917, tree_species: "somei_yoshino" },
  "銚子": { id: "choshi", name_en: "Choshi", name_ja: "銚子", prefecture_en: "Chiba", prefecture_ja: "千葉県", region: "kanto", lat: 35.7346, lon: 140.8268, tree_species: "somei_yoshino" },
  "横浜": { id: "yokohama", name_en: "Yokohama", name_ja: "横浜", prefecture_en: "Kanagawa", prefecture_ja: "神奈川県", region: "kanto", lat: 35.4437, lon: 139.6380, tree_species: "somei_yoshino" },

  // ── Hokuriku ──
  "新潟": { id: "niigata", name_en: "Niigata", name_ja: "新潟", prefecture_en: "Niigata", prefecture_ja: "新潟県", region: "hokuriku", lat: 37.9161, lon: 139.0364, tree_species: "somei_yoshino" },
  "富山": { id: "toyama", name_en: "Toyama", name_ja: "富山", prefecture_en: "Toyama", prefecture_ja: "富山県", region: "hokuriku", lat: 36.6953, lon: 137.2113, tree_species: "somei_yoshino" },
  "金沢": { id: "kanazawa", name_en: "Kanazawa", name_ja: "金沢", prefecture_en: "Ishikawa", prefecture_ja: "石川県", region: "hokuriku", lat: 36.5946, lon: 136.6256, tree_species: "somei_yoshino" },
  "福井": { id: "fukui", name_en: "Fukui", name_ja: "福井", prefecture_en: "Fukui", prefecture_ja: "福井県", region: "hokuriku", lat: 36.0652, lon: 136.2219, tree_species: "somei_yoshino" },

  // ── Tokai ──
  "長野": { id: "nagano", name_en: "Nagano", name_ja: "長野", prefecture_en: "Nagano", prefecture_ja: "長野県", region: "tokai", lat: 36.6513, lon: 138.1810, tree_species: "somei_yoshino" },
  "甲府": { id: "kofu", name_en: "Kofu", name_ja: "甲府", prefecture_en: "Yamanashi", prefecture_ja: "山梨県", region: "tokai", lat: 35.6642, lon: 138.5684, tree_species: "somei_yoshino" },
  "静岡": { id: "shizuoka", name_en: "Shizuoka", name_ja: "静岡", prefecture_en: "Shizuoka", prefecture_ja: "静岡県", region: "tokai", lat: 34.9769, lon: 138.3831, tree_species: "somei_yoshino" },
  "名古屋": { id: "nagoya", name_en: "Nagoya", name_ja: "名古屋", prefecture_en: "Aichi", prefecture_ja: "愛知県", region: "tokai", lat: 35.1815, lon: 136.9066, tree_species: "somei_yoshino" },
  "岐阜": { id: "gifu", name_en: "Gifu", name_ja: "岐阜", prefecture_en: "Gifu", prefecture_ja: "岐阜県", region: "tokai", lat: 35.3912, lon: 136.7223, tree_species: "somei_yoshino" },
  "津": { id: "tsu", name_en: "Tsu", name_ja: "津", prefecture_en: "Mie", prefecture_ja: "三重県", region: "tokai", lat: 34.7303, lon: 136.5086, tree_species: "somei_yoshino" },

  // ── Kansai ──
  "彦根": { id: "hikone", name_en: "Hikone", name_ja: "彦根", prefecture_en: "Shiga", prefecture_ja: "滋賀県", region: "kansai", lat: 35.2764, lon: 136.2460, tree_species: "somei_yoshino" },
  "京都": { id: "kyoto", name_en: "Kyoto", name_ja: "京都", prefecture_en: "Kyoto", prefecture_ja: "京都府", region: "kansai", lat: 35.0116, lon: 135.7681, tree_species: "somei_yoshino" },
  "大阪": { id: "osaka", name_en: "Osaka", name_ja: "大阪", prefecture_en: "Osaka", prefecture_ja: "大阪府", region: "kansai", lat: 34.6937, lon: 135.5023, tree_species: "somei_yoshino" },
  "神戸": { id: "kobe", name_en: "Kobe", name_ja: "神戸", prefecture_en: "Hyogo", prefecture_ja: "兵庫県", region: "kansai", lat: 34.6901, lon: 135.1956, tree_species: "somei_yoshino" },
  "奈良": { id: "nara", name_en: "Nara", name_ja: "奈良", prefecture_en: "Nara", prefecture_ja: "奈良県", region: "kansai", lat: 34.6851, lon: 135.8329, tree_species: "somei_yoshino" },
  "和歌山": { id: "wakayama", name_en: "Wakayama", name_ja: "和歌山", prefecture_en: "Wakayama", prefecture_ja: "和歌山県", region: "kansai", lat: 34.2260, lon: 135.1675, tree_species: "somei_yoshino" },

  // ── Chugoku ──
  "鳥取": { id: "tottori", name_en: "Tottori", name_ja: "鳥取", prefecture_en: "Tottori", prefecture_ja: "鳥取県", region: "chugoku", lat: 35.5011, lon: 134.2351, tree_species: "somei_yoshino" },
  "松江": { id: "matsue", name_en: "Matsue", name_ja: "松江", prefecture_en: "Shimane", prefecture_ja: "島根県", region: "chugoku", lat: 35.4723, lon: 133.0505, tree_species: "somei_yoshino" },
  "岡山": { id: "okayama", name_en: "Okayama", name_ja: "岡山", prefecture_en: "Okayama", prefecture_ja: "岡山県", region: "chugoku", lat: 34.6617, lon: 133.9350, tree_species: "somei_yoshino" },
  "広島": { id: "hiroshima", name_en: "Hiroshima", name_ja: "広島", prefecture_en: "Hiroshima", prefecture_ja: "広島県", region: "chugoku", lat: 34.3966, lon: 132.4596, tree_species: "somei_yoshino" },
  "下関": { id: "shimonoseki", name_en: "Shimonoseki", name_ja: "下関", prefecture_en: "Yamaguchi", prefecture_ja: "山口県", region: "chugoku", lat: 33.9503, lon: 130.9246, tree_species: "somei_yoshino" },

  // ── Shikoku ──
  "徳島": { id: "tokushima", name_en: "Tokushima", name_ja: "徳島", prefecture_en: "Tokushima", prefecture_ja: "徳島県", region: "shikoku", lat: 34.0658, lon: 134.5593, tree_species: "somei_yoshino" },
  "高松": { id: "takamatsu", name_en: "Takamatsu", name_ja: "高松", prefecture_en: "Kagawa", prefecture_ja: "香川県", region: "shikoku", lat: 34.3401, lon: 134.0434, tree_species: "somei_yoshino" },
  "松山": { id: "matsuyama", name_en: "Matsuyama", name_ja: "松山", prefecture_en: "Ehime", prefecture_ja: "愛媛県", region: "shikoku", lat: 33.8416, lon: 132.7657, tree_species: "somei_yoshino" },
  "高知": { id: "kochi", name_en: "Kochi", name_ja: "高知", prefecture_en: "Kochi", prefecture_ja: "高知県", region: "shikoku", lat: 33.5597, lon: 133.5311, tree_species: "somei_yoshino" },

  // ── Kyushu ──
  "福岡": { id: "fukuoka", name_en: "Fukuoka", name_ja: "福岡", prefecture_en: "Fukuoka", prefecture_ja: "福岡県", region: "kyushu", lat: 33.5902, lon: 130.4017, tree_species: "somei_yoshino" },
  "佐賀": { id: "saga", name_en: "Saga", name_ja: "佐賀", prefecture_en: "Saga", prefecture_ja: "佐賀県", region: "kyushu", lat: 33.2494, lon: 130.2988, tree_species: "somei_yoshino" },
  "長崎": { id: "nagasaki", name_en: "Nagasaki", name_ja: "長崎", prefecture_en: "Nagasaki", prefecture_ja: "長崎県", region: "kyushu", lat: 32.7503, lon: 129.8777, tree_species: "somei_yoshino" },
  "熊本": { id: "kumamoto", name_en: "Kumamoto", name_ja: "熊本", prefecture_en: "Kumamoto", prefecture_ja: "熊本県", region: "kyushu", lat: 32.8032, lon: 130.7079, tree_species: "somei_yoshino" },
  "大分": { id: "oita", name_en: "Oita", name_ja: "大分", prefecture_en: "Oita", prefecture_ja: "大分県", region: "kyushu", lat: 33.2382, lon: 131.6126, tree_species: "somei_yoshino" },
  "宮崎": { id: "miyazaki", name_en: "Miyazaki", name_ja: "宮崎", prefecture_en: "Miyazaki", prefecture_ja: "宮崎県", region: "kyushu", lat: 31.9111, lon: 131.4239, tree_species: "somei_yoshino" },
  "鹿児島": { id: "kagoshima", name_en: "Kagoshima", name_ja: "鹿児島", prefecture_en: "Kagoshima", prefecture_ja: "鹿児島県", region: "kyushu", lat: 31.5966, lon: 130.5571, tree_species: "somei_yoshino" },

  // ── Okinawa ──
  "名瀬": { id: "naze", name_en: "Naze", name_ja: "名瀬", prefecture_en: "Kagoshima", prefecture_ja: "鹿児島県", region: "okinawa", lat: 28.3764, lon: 129.4946, tree_species: "hikan_zakura" },
  "那覇": { id: "naha", name_en: "Naha", name_ja: "那覇", prefecture_en: "Okinawa", prefecture_ja: "沖縄県", region: "okinawa", lat: 26.2124, lon: 127.6809, tree_species: "hikan_zakura" },
  "南大東": { id: "minamidaito", name_en: "Minamidaito", name_ja: "南大東", prefecture_en: "Okinawa", prefecture_ja: "沖縄県", region: "okinawa", lat: 25.8294, lon: 131.2328, tree_species: "hikan_zakura" },
  "宮古島": { id: "miyakojima", name_en: "Miyakojima", name_ja: "宮古島", prefecture_en: "Okinawa", prefecture_ja: "沖縄県", region: "okinawa", lat: 24.7938, lon: 125.2786, tree_species: "hikan_zakura" },
  "石垣島": { id: "ishigakijima", name_en: "Ishigakijima", name_ja: "石垣島", prefecture_en: "Okinawa", prefecture_ja: "沖縄県", region: "okinawa", lat: 24.3336, lon: 124.1557, tree_species: "hikan_zakura" },
};

/** Reverse lookup: English ID → LocationMeta */
export const LOCATION_BY_ID: Record<string, LocationMeta> = Object.fromEntries(
  Object.values(LOCATION_MAP).map((loc) => [loc.id, loc])
);

/** Get all location IDs */
export const ALL_LOCATION_IDS: string[] = Object.values(LOCATION_MAP).map(
  (loc) => loc.id
);

/** Resolve Japanese station name to LocationMeta */
export function resolveLocation(ja: string): LocationMeta | undefined {
  return LOCATION_MAP[ja.trim()];
}

/** Get LocationRef (subset for API responses) */
export function toLocationRef(meta: LocationMeta) {
  return {
    id: meta.id,
    name: meta.name_en,
    prefecture: meta.prefecture_en,
    region: meta.region,
    coordinates: { lat: meta.lat, lon: meta.lon },
  };
}
