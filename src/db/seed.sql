-- Seed: All 58 JMA sakura observation stations

INSERT OR IGNORE INTO locations (id, name_en, name_ja, prefecture_en, prefecture_ja, region, latitude, longitude, tree_species) VALUES
-- Hokkaido
('wakkanai', 'Wakkanai', '稚内', 'Hokkaido', '北海道', 'hokkaido', 45.4158, 141.6731, 'ezo_yama_zakura'),
('asahikawa', 'Asahikawa', '旭川', 'Hokkaido', '北海道', 'hokkaido', 43.7707, 142.3650, 'ezo_yama_zakura'),
('abashiri', 'Abashiri', '網走', 'Hokkaido', '北海道', 'hokkaido', 44.0206, 144.2694, 'ezo_yama_zakura'),
('sapporo', 'Sapporo', '札幌', 'Hokkaido', '北海道', 'hokkaido', 43.0618, 141.3545, 'somei_yoshino'),
('obihiro', 'Obihiro', '帯広', 'Hokkaido', '北海道', 'hokkaido', 42.9170, 143.2044, 'ezo_yama_zakura'),
('kushiro', 'Kushiro', '釧路', 'Hokkaido', '北海道', 'hokkaido', 42.9849, 144.3820, 'ezo_yama_zakura'),
('muroran', 'Muroran', '室蘭', 'Hokkaido', '北海道', 'hokkaido', 42.3150, 140.9740, 'somei_yoshino'),
('hakodate', 'Hakodate', '函館', 'Hokkaido', '北海道', 'hokkaido', 41.7688, 140.7290, 'somei_yoshino'),
-- Tohoku
('aomori', 'Aomori', '青森', 'Aomori', '青森県', 'tohoku', 40.8246, 140.7400, 'somei_yoshino'),
('akita', 'Akita', '秋田', 'Akita', '秋田県', 'tohoku', 39.7186, 140.1024, 'somei_yoshino'),
('morioka', 'Morioka', '盛岡', 'Iwate', '岩手県', 'tohoku', 39.7036, 141.1527, 'somei_yoshino'),
('sendai', 'Sendai', '仙台', 'Miyagi', '宮城県', 'tohoku', 38.2682, 140.8694, 'somei_yoshino'),
('yamagata', 'Yamagata', '山形', 'Yamagata', '山形県', 'tohoku', 38.2554, 140.3396, 'somei_yoshino'),
('fukushima', 'Fukushima', '福島', 'Fukushima', '福島県', 'tohoku', 37.7503, 140.4676, 'somei_yoshino'),
-- Kanto
('mito', 'Mito', '水戸', 'Ibaraki', '茨城県', 'kanto', 36.3418, 140.4468, 'somei_yoshino'),
('utsunomiya', 'Utsunomiya', '宇都宮', 'Tochigi', '栃木県', 'kanto', 36.5657, 139.8836, 'somei_yoshino'),
('maebashi', 'Maebashi', '前橋', 'Gunma', '群馬県', 'kanto', 36.3911, 139.0608, 'somei_yoshino'),
('kumagaya', 'Kumagaya', '熊谷', 'Saitama', '埼玉県', 'kanto', 36.1472, 139.3886, 'somei_yoshino'),
('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino'),
('choshi', 'Choshi', '銚子', 'Chiba', '千葉県', 'kanto', 35.7346, 140.8268, 'somei_yoshino'),
('yokohama', 'Yokohama', '横浜', 'Kanagawa', '神奈川県', 'kanto', 35.4437, 139.6380, 'somei_yoshino'),
-- Hokuriku
('niigata', 'Niigata', '新潟', 'Niigata', '新潟県', 'hokuriku', 37.9161, 139.0364, 'somei_yoshino'),
('toyama', 'Toyama', '富山', 'Toyama', '富山県', 'hokuriku', 36.6953, 137.2113, 'somei_yoshino'),
('kanazawa', 'Kanazawa', '金沢', 'Ishikawa', '石川県', 'hokuriku', 36.5946, 136.6256, 'somei_yoshino'),
('fukui', 'Fukui', '福井', 'Fukui', '福井県', 'hokuriku', 36.0652, 136.2219, 'somei_yoshino'),
-- Tokai
('nagano', 'Nagano', '長野', 'Nagano', '長野県', 'tokai', 36.6513, 138.1810, 'somei_yoshino'),
('kofu', 'Kofu', '甲府', 'Yamanashi', '山梨県', 'tokai', 35.6642, 138.5684, 'somei_yoshino'),
('shizuoka', 'Shizuoka', '静岡', 'Shizuoka', '静岡県', 'tokai', 34.9769, 138.3831, 'somei_yoshino'),
('nagoya', 'Nagoya', '名古屋', 'Aichi', '愛知県', 'tokai', 35.1815, 136.9066, 'somei_yoshino'),
('gifu', 'Gifu', '岐阜', 'Gifu', '岐阜県', 'tokai', 35.3912, 136.7223, 'somei_yoshino'),
('tsu', 'Tsu', '津', 'Mie', '三重県', 'tokai', 34.7303, 136.5086, 'somei_yoshino'),
-- Kansai
('hikone', 'Hikone', '彦根', 'Shiga', '滋賀県', 'kansai', 35.2764, 136.2460, 'somei_yoshino'),
('kyoto', 'Kyoto', '京都', 'Kyoto', '京都府', 'kansai', 35.0116, 135.7681, 'somei_yoshino'),
('osaka', 'Osaka', '大阪', 'Osaka', '大阪府', 'kansai', 34.6937, 135.5023, 'somei_yoshino'),
('kobe', 'Kobe', '神戸', 'Hyogo', '兵庫県', 'kansai', 34.6901, 135.1956, 'somei_yoshino'),
('nara', 'Nara', '奈良', 'Nara', '奈良県', 'kansai', 34.6851, 135.8329, 'somei_yoshino'),
('wakayama', 'Wakayama', '和歌山', 'Wakayama', '和歌山県', 'kansai', 34.2260, 135.1675, 'somei_yoshino'),
-- Chugoku
('tottori', 'Tottori', '鳥取', 'Tottori', '鳥取県', 'chugoku', 35.5011, 134.2351, 'somei_yoshino'),
('matsue', 'Matsue', '松江', 'Shimane', '島根県', 'chugoku', 35.4723, 133.0505, 'somei_yoshino'),
('okayama', 'Okayama', '岡山', 'Okayama', '岡山県', 'chugoku', 34.6617, 133.9350, 'somei_yoshino'),
('hiroshima', 'Hiroshima', '広島', 'Hiroshima', '広島県', 'chugoku', 34.3966, 132.4596, 'somei_yoshino'),
('shimonoseki', 'Shimonoseki', '下関', 'Yamaguchi', '山口県', 'chugoku', 33.9503, 130.9246, 'somei_yoshino'),
-- Shikoku
('tokushima', 'Tokushima', '徳島', 'Tokushima', '徳島県', 'shikoku', 34.0658, 134.5593, 'somei_yoshino'),
('takamatsu', 'Takamatsu', '高松', 'Kagawa', '香川県', 'shikoku', 34.3401, 134.0434, 'somei_yoshino'),
('matsuyama', 'Matsuyama', '松山', 'Ehime', '愛媛県', 'shikoku', 33.8416, 132.7657, 'somei_yoshino'),
('kochi', 'Kochi', '高知', 'Kochi', '高知県', 'shikoku', 33.5597, 133.5311, 'somei_yoshino'),
-- Kyushu
('fukuoka', 'Fukuoka', '福岡', 'Fukuoka', '福岡県', 'kyushu', 33.5902, 130.4017, 'somei_yoshino'),
('saga', 'Saga', '佐賀', 'Saga', '佐賀県', 'kyushu', 33.2494, 130.2988, 'somei_yoshino'),
('nagasaki', 'Nagasaki', '長崎', 'Nagasaki', '長崎県', 'kyushu', 32.7503, 129.8777, 'somei_yoshino'),
('kumamoto', 'Kumamoto', '熊本', 'Kumamoto', '熊本県', 'kyushu', 32.8032, 130.7079, 'somei_yoshino'),
('oita', 'Oita', '大分', 'Oita', '大分県', 'kyushu', 33.2382, 131.6126, 'somei_yoshino'),
('miyazaki', 'Miyazaki', '宮崎', 'Miyazaki', '宮崎県', 'kyushu', 31.9111, 131.4239, 'somei_yoshino'),
('kagoshima', 'Kagoshima', '鹿児島', 'Kagoshima', '鹿児島県', 'kyushu', 31.5966, 130.5571, 'somei_yoshino'),
-- Okinawa
('naze', 'Naze', '名瀬', 'Kagoshima', '鹿児島県', 'okinawa', 28.3764, 129.4946, 'hikan_zakura'),
('naha', 'Naha', '那覇', 'Okinawa', '沖縄県', 'okinawa', 26.2124, 127.6809, 'hikan_zakura'),
('minamidaito', 'Minamidaito', '南大東', 'Okinawa', '沖縄県', 'okinawa', 25.8294, 131.2328, 'hikan_zakura'),
('miyakojima', 'Miyakojima', '宮古島', 'Okinawa', '沖縄県', 'okinawa', 24.7938, 125.2786, 'hikan_zakura'),
('ishigakijima', 'Ishigakijima', '石垣島', 'Okinawa', '沖縄県', 'okinawa', 24.3336, 124.1557, 'hikan_zakura');
