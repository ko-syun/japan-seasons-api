// Region mapping: Japanese → English slug

export const REGION_MAP: Record<string, string> = {
  "北海道": "hokkaido",
  "東北": "tohoku",
  "関東": "kanto",
  "北陸": "hokuriku",
  "東海": "tokai",
  "近畿": "kansai",
  "中国": "chugoku",
  "四国": "shikoku",
  "九州": "kyushu",
  "沖縄": "okinawa",
};

export const REGION_NAMES_EN: Record<string, string> = {
  hokkaido: "Hokkaido",
  tohoku: "Tohoku",
  kanto: "Kanto",
  hokuriku: "Hokuriku",
  tokai: "Tokai",
  kansai: "Kansai",
  chugoku: "Chugoku",
  shikoku: "Shikoku",
  kyushu: "Kyushu",
  okinawa: "Okinawa",
};

export const ALL_REGIONS = Object.values(REGION_MAP);

export const TREE_SPECIES_MAP: Record<string, string> = {
  "": "somei_yoshino",
  "えぞやまざくら": "ezo_yama_zakura",
  "ひかんざくら": "hikan_zakura",
};

export function resolveRegion(ja: string): string | undefined {
  return REGION_MAP[ja];
}
