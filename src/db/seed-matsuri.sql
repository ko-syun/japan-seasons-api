-- =============================================
-- Matsuri (Japanese Festivals) Seed Data
-- 50 festivals across all regions and seasons
-- =============================================

-- 1. Gion Matsuri - Kyoto (July)
INSERT INTO matsuri VALUES (
  'gion-matsuri', 'Gion Matsuri', '祇園祭', 'Kyoto', 'Kyoto', 'kansai', 7,
  '07-01', '07-31', '["07-17","07-24"]',
  '["float","traditional"]',
  'One of Japan''s three greatest festivals, featuring massive yamaboko floats paraded through Kyoto''s streets. The Yamaboko Junko procession on July 17 is the main highlight.',
  '日本三大祭りの一つ。山鉾巡行は7月17日と24日に行われる。',
  800000, 'JR Kyoto Station, then bus or subway to Shijo', 35.0036, 135.7691,
  'Book accommodations months in advance. Yoiyama (eve festivals) on July 14-16 are great for street food.',
  'https://www.gionmatsuri.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 2. Tenjin Matsuri - Osaka (July)
INSERT INTO matsuri VALUES (
  'tenjin-matsuri', 'Tenjin Matsuri', '天神祭', 'Osaka', 'Osaka', 'kansai', 7,
  '07-24', '07-25', '["07-25"]',
  '["float","traditional","fire"]',
  'One of Japan''s three greatest festivals, celebrated at Osaka Tenmangu Shrine. The boat procession on the Okawa River and fireworks on July 25 are spectacular.',
  '日本三大祭りの一つ。大川での船渡御と奉納花火が見どころ。',
  1300000, 'Osaka Metro Minami-Morimachi Station', 34.6937, 135.5130,
  'The riverbank near Tenmabashi offers the best views of the boat procession and fireworks.',
  'https://tenjinmatsuri.com/', 1, '2026-03-29T00:00:00Z'
);

-- 3. Kanda Matsuri - Tokyo (May)
INSERT INTO matsuri VALUES (
  'kanda-matsuri', 'Kanda Matsuri', '神田祭', 'Tokyo', 'Tokyo', 'kanto', 5,
  '05-09', '05-15', '["05-11","05-13"]',
  '["float","traditional"]',
  'One of Tokyo''s three great festivals, held at Kanda Myojin Shrine. The grand procession features mikoshi (portable shrines) parading through Akihabara and surrounding areas.',
  '東京三大祭りの一つ。神田明神の祭礼で、神輿が秋葉原周辺を巡行する。',
  300000, 'JR Ochanomizu Station or Tokyo Metro Suehirocho Station', 35.7020, 139.7681,
  'Held in odd-numbered years only (full scale). Even years have a smaller ceremony.',
  'https://www.kandamyoujin.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 4. Aomori Nebuta Matsuri (August)
INSERT INTO matsuri VALUES (
  'aomori-nebuta', 'Aomori Nebuta Festival', '青森ねぶた祭', 'Aomori', 'Aomori', 'tohoku', 8,
  '08-02', '08-07', '["08-02","08-03","08-04","08-05","08-06","08-07"]',
  '["float","lantern","dance"]',
  'Massive illuminated paper floats (nebuta) depicting warriors and mythical figures are paraded through the streets. Dancers called haneto join the procession.',
  '巨大な武者絵の灯篭（ねぶた）が街を練り歩く。跳人（はねと）の踊りも見どころ。',
  2800000, 'JR Aomori Station', 40.8244, 140.7400,
  'Anyone can join as a haneto dancer by renting the traditional costume. Last night features a sea parade.',
  'https://www.nebuta.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 5. Awa Odori - Tokushima (August)
INSERT INTO matsuri VALUES (
  'awa-odori', 'Awa Odori', '阿波踊り', 'Tokushima', 'Tokushima', 'shikoku', 8,
  '08-12', '08-15', '["08-12","08-13","08-14","08-15"]',
  '["dance","traditional","music"]',
  'Japan''s largest dance festival, with over 100,000 dancers performing in groups called ren. The famous chant goes: "The dancing fool and the watching fool are both fools, so you might as well dance!"',
  '日本最大の盆踊り。「踊る阿呆に見る阿呆、同じ阿呆なら踊らにゃ損損」の掛け声で有名。',
  1300000, 'JR Tokushima Station', 34.0657, 134.5593,
  'Free viewing areas are available, but paid seating at the main stages offers the best experience.',
  'https://www.awaodori-kaikan.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 6. Sapporo Snow Festival (February)
INSERT INTO matsuri VALUES (
  'sapporo-snow-festival', 'Sapporo Snow Festival', 'さっぽろ雪まつり', 'Sapporo', 'Hokkaido', 'hokkaido', 2,
  '02-04', '02-11', '["02-04","02-05","02-06","02-07","02-08","02-09","02-10","02-11"]',
  '["snow","modern"]',
  'One of Japan''s most popular winter events featuring hundreds of snow and ice sculptures along Odori Park. The Susukino ice sculpture area and Tsudome community dome offer additional attractions.',
  '大通公園を中心に大小の雪像・氷像が並ぶ、日本最大級の冬祭り。',
  2000000, 'Sapporo Subway Odori Station', 43.0589, 141.3544,
  'Visit at night for the illuminated sculptures. Dress very warmly — temperatures can drop to -10°C.',
  'https://www.snowfes.com/', 1, '2026-03-29T00:00:00Z'
);

-- 7. Takayama Spring Festival (April)
INSERT INTO matsuri VALUES (
  'takayama-spring', 'Takayama Spring Festival', '高山祭（春）', 'Takayama', 'Gifu', 'chubu', 4,
  '04-14', '04-15', '["04-14","04-15"]',
  '["float","traditional"]',
  'One of Japan''s three most beautiful float festivals. Ornate yatai floats with mechanical karakuri puppet performances are displayed at Hie Shrine.',
  '日本三大美祭の一つ。日枝神社の例祭で、精巧なからくり人形を備えた屋台が曳き回される。',
  200000, 'JR Takayama Station', 36.1408, 137.2520,
  'The evening festival with illuminated floats is magical. Try Hida beef and local sake from stalls.',
  'https://www.hidatakayama.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 8. Chichibu Night Festival (December)
INSERT INTO matsuri VALUES (
  'chichibu-night-festival', 'Chichibu Night Festival', '秩父夜祭', 'Chichibu', 'Saitama', 'kanto', 12,
  '12-02', '12-03', '["12-03"]',
  '["float","fire","traditional"]',
  'One of Japan''s three great float festivals. Massive illuminated floats are hauled up a steep slope accompanied by fireworks on the night of December 3.',
  '日本三大曳山祭の一つ。12月3日の夜、花火とともに急坂を曳き上げる屋台の迫力は圧巻。',
  200000, 'Seibu Railway Seibu-Chichibu Station', 35.9917, 139.0858,
  'Arrive early to secure a viewing spot. The fireworks display is one of the few winter fireworks in Japan.',
  'https://www.chichibu-matsuri.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 9. Hakata Gion Yamakasa (July)
INSERT INTO matsuri VALUES (
  'hakata-gion-yamakasa', 'Hakata Gion Yamakasa', '博多祇園山笠', 'Fukuoka', 'Fukuoka', 'kyushu', 7,
  '07-01', '07-15', '["07-12","07-15"]',
  '["float","traditional"]',
  'A 770-year-old festival where teams of men race through the streets carrying massive decorated floats (yamakasa) weighing over a ton. The Oiyama finale on July 15 starts at 4:59 AM.',
  '約770年の歴史を持つ博多の夏祭り。7月15日早朝の追い山が最大の見どころ。',
  3000000, 'Hakata Station or Subway Nakasu-Kawabata Station', 33.5950, 130.4017,
  'The Oiyama race starts before dawn on July 15 — arrive by 4 AM for a good spot near Kushida Shrine.',
  'https://www.hakatayamakasa.com/', 1, '2026-03-29T00:00:00Z'
);

-- 10. Nagasaki Kunchi (October)
INSERT INTO matsuri VALUES (
  'nagasaki-kunchi', 'Nagasaki Kunchi', '長崎くんち', 'Nagasaki', 'Nagasaki', 'kyushu', 10,
  '10-07', '10-09', '["10-07","10-08","10-09"]',
  '["dance","traditional","float"]',
  'A 380-year-old autumn festival at Suwa Shrine featuring dragon dances and Dutch-ship floats that reflect Nagasaki''s international trading history.',
  '諏訪神社の秋季大祭。龍踊りやオランダ船など、長崎の国際交流の歴史を反映した奉納踊りが見どころ。',
  300000, 'JR Nagasaki Station, then tram to Suwa Shrine', 32.7503, 129.8779,
  'Paid seating at Suwa Shrine offers the best view. Each neighborhood''s performance rotates on a 7-year cycle.',
  'https://nagasaki-kunchi.com/', 1, '2026-03-29T00:00:00Z'
);

-- 11. Tanabata Festival - Sendai (August)
INSERT INTO matsuri VALUES (
  'sendai-tanabata', 'Sendai Tanabata Festival', '仙台七夕まつり', 'Sendai', 'Miyagi', 'tohoku', 8,
  '08-06', '08-08', '["08-06","08-07","08-08"]',
  '["traditional","lantern"]',
  'Japan''s most famous Tanabata festival with elaborate bamboo decorations (sasatake) hanging throughout the city''s shopping arcades.',
  '日本一の七夕まつり。商店街に豪華な笹飾りが並ぶ。',
  2000000, 'JR Sendai Station', 38.2601, 140.8820,
  'The fireworks display on August 5 (eve festival) is a bonus. Walk along the Jozenji-dori for best decorations.',
  'https://www.sendaitanabata.com/', 1, '2026-03-29T00:00:00Z'
);

-- 12. Takeda no Hi Matsuri - Nozawa Onsen (January)
INSERT INTO matsuri VALUES (
  'nozawa-fire-festival', 'Nozawa Onsen Fire Festival', '野沢温泉の道祖神祭り', 'Nozawa Onsen', 'Nagano', 'chubu', 1,
  '01-15', '01-15', '["01-15"]',
  '["fire","traditional"]',
  'One of Japan''s three great fire festivals. Villagers attack a large wooden shrine structure with torches while the 25-year-olds and 42-year-olds inside defend it.',
  '日本三大火祭りの一つ。松明を持った村人が社殿を攻撃し、厄年の男たちが防衛する。',
  30000, 'JR Iiyama Station, then bus to Nozawa Onsen', 36.9225, 138.6350,
  'Combine with skiing at Nozawa Onsen ski resort. The fire starts around 8:30 PM.',
  'https://nozawakanko.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 13. Kanamara Matsuri - Kawasaki (April)
INSERT INTO matsuri VALUES (
  'kanamara-matsuri', 'Kanamara Matsuri', 'かなまら祭り', 'Kawasaki', 'Kanagawa', 'kanto', 4,
  '04-06', '04-06', '["04-06"]',
  '["traditional","modern"]',
  'The ''Festival of the Steel Phallus'' at Kanayama Shrine, originally a festival for sex workers praying for protection from disease. Now famous internationally and raises funds for HIV research.',
  '金山神社の祭礼。性病除けと子孫繁栄を祈願する祭りで、現在はHIV研究の募金活動も行う。',
  50000, 'Keikyu Kawasaki-Daishi Station', 35.5324, 139.7290,
  'Arrive early as the area gets very crowded. Held on the first Sunday of April.',
  'https://kanayamajinja.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 14. Kishiwada Danjiri Matsuri (September)
INSERT INTO matsuri VALUES (
  'kishiwada-danjiri', 'Kishiwada Danjiri Festival', '岸和田だんじり祭', 'Kishiwada', 'Osaka', 'kansai', 9,
  '09-14', '09-15', '["09-14","09-15"]',
  '["float","traditional"]',
  'Known for its thrilling yarimawashi — teams sprint massive danjiri floats around sharp corners at high speed. One of the most exciting and dangerous festivals in Japan.',
  '山車（だんじり）を全速力で曳き回す「やりまわし」が迫力満点の祭り。',
  500000, 'Nankai Kishiwada Station', 34.4607, 135.3718,
  'The corner-turning (yarimawashi) at the Kankan-ba intersection is the most thrilling spot.',
  'https://www.city.kishiwada.osaka.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 15. Akita Kanto Matsuri (August)
INSERT INTO matsuri VALUES (
  'akita-kanto', 'Akita Kanto Festival', '秋田竿燈まつり', 'Akita', 'Akita', 'tohoku', 8,
  '08-03', '08-06', '["08-03","08-04","08-05","08-06"]',
  '["lantern","traditional"]',
  'Performers balance bamboo poles hung with up to 46 paper lanterns on their palms, foreheads, shoulders, and hips. The poles can reach 12 meters and weigh 50 kg.',
  '竿燈を額、腰、肩で操る妙技を競う東北三大祭りの一つ。',
  1300000, 'JR Akita Station', 39.7200, 140.1025,
  'Daytime kanto competitions at Akita Civic Athletic Field let you see the skills up close.',
  'https://www.kantou.gr.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 16. Yamagata Hanagasa Matsuri (August)
INSERT INTO matsuri VALUES (
  'yamagata-hanagasa', 'Yamagata Hanagasa Festival', '山形花笠まつり', 'Yamagata', 'Yamagata', 'tohoku', 8,
  '08-05', '08-07', '["08-05","08-06","08-07"]',
  '["dance","traditional"]',
  'Dancers wearing flower-decorated sedge hats (hanagasa) parade along the main street to the call of "Yassho Makasho!" One of Tohoku''s four great summer festivals.',
  '花笠を手に「ヤッショ、マカショ」の掛け声で踊る東北四大祭りの一つ。',
  1000000, 'JR Yamagata Station', 38.2527, 140.3396,
  'Open participation groups let tourists join. The flower hats can be purchased as souvenirs.',
  'https://www.hanagasa.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 17. Yuki Matsuri (Yokote Kamakura) - February
INSERT INTO matsuri VALUES (
  'yokote-kamakura', 'Yokote Kamakura Snow Festival', '横手かまくら祭り', 'Yokote', 'Akita', 'tohoku', 2,
  '02-15', '02-16', '["02-15","02-16"]',
  '["snow","traditional"]',
  'Hundreds of kamakura (snow huts) line the streets, each housing a small altar to the water deity. Locals invite passersby inside for mochi and amazake.',
  '雪室（かまくら）の中に水神様を祀り、甘酒や餅でもてなす450年以上の伝統行事。',
  350000, 'JR Yokote Station', 39.3115, 140.5532,
  'Visit at night when the kamakura are illuminated by candles. The mini-kamakura along the riverbank are magical.',
  'https://www.yokotekamakura.com/', 1, '2026-03-29T00:00:00Z'
);

-- 18. Toka Ebisu - Osaka (January)
INSERT INTO matsuri VALUES (
  'toka-ebisu', 'Toka Ebisu Festival', '十日戎', 'Osaka', 'Osaka', 'kansai', 1,
  '01-09', '01-11', '["01-10"]',
  '["traditional"]',
  'The "Lucky God Festival" at Imamiya Ebisu Shrine where a million visitors come to pray for business prosperity. Lucky bamboo branches (fuku-zasa) are sold as talismans.',
  '今宮戎神社の商売繁盛を祈願する祭り。福笹（ふくざさ）が名物。',
  1000000, 'Nankai Imamiya-Ebisu Station', 34.6527, 135.5061,
  'January 10 (honebisu) is the busiest day. Try the traditional tai-yaki near the shrine.',
  'https://www.imamiya-ebisu.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 19. Omizutori - Nara (March)
INSERT INTO matsuri VALUES (
  'omizutori', 'Omizutori (Water-Drawing Festival)', 'お水取り', 'Nara', 'Nara', 'kansai', 3,
  '03-01', '03-14', '["03-12","03-13"]',
  '["fire","traditional"]',
  'An ancient Buddhist ceremony at Todai-ji temple. Huge torches are waved from the balcony of Nigatsu-do Hall, showering sparks on the crowd below as a purification ritual.',
  '東大寺二月堂の修二会。巨大な松明が欄干から振られ、火の粉が降り注ぐ壮大な行事。',
  50000, 'JR Nara Station, then bus to Todai-ji', 34.6895, 135.8405,
  'The biggest torches appear on March 12. Arrive by 5 PM to secure a viewing spot.',
  'https://www.todaiji.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 20. Sanja Matsuri - Tokyo (May)
INSERT INTO matsuri VALUES (
  'sanja-matsuri', 'Sanja Matsuri', '三社祭', 'Tokyo', 'Tokyo', 'kanto', 5,
  '05-16', '05-18', '["05-17","05-18"]',
  '["traditional","float"]',
  'Tokyo''s wildest festival held at Asakusa Shrine. Nearly 100 mikoshi are carried through the streets of Asakusa in a boisterous, energetic atmosphere.',
  '浅草神社の例大祭。約100基の神輿が浅草の街を練り歩く、東京で最も熱い祭り。',
  1500000, 'Tokyo Metro Asakusa Station', 35.7148, 139.7967,
  'The final Sunday with the three main mikoshi is the climax. Watch from Kaminarimon area.',
  'https://www.sanjasama.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 21. Obon / Gozan no Okuribi - Kyoto (August)
INSERT INTO matsuri VALUES (
  'gozan-okuribi', 'Gozan no Okuribi (Daimonji)', '五山送り火', 'Kyoto', 'Kyoto', 'kansai', 8,
  '08-16', '08-16', '["08-16"]',
  '["fire","traditional"]',
  'Five giant bonfires in the shape of kanji characters and symbols are lit on the mountains surrounding Kyoto to guide ancestral spirits back to the afterlife during Obon.',
  'お盆の送り火。京都の五山に「大」「妙法」「船形」「左大文字」「鳥居形」の火が灯される。',
  100000, 'Various viewpoints around Kyoto city', 35.0394, 135.7981,
  'The fires are lit at 8 PM. Kamogawa riverbanks offer panoramic views of multiple fires.',
  'https://www.gozan-okuribi.com/', 1, '2026-03-29T00:00:00Z'
);

-- 22. Sumida River Fireworks - Tokyo (July)
INSERT INTO matsuri VALUES (
  'sumida-fireworks', 'Sumida River Fireworks Festival', '隅田川花火大会', 'Tokyo', 'Tokyo', 'kanto', 7,
  '07-26', '07-26', '["07-26"]',
  '["modern","traditional","fire"]',
  'One of Tokyo''s oldest and largest fireworks festivals with about 20,000 fireworks launched from two areas along the Sumida River.',
  '約2万発の花火が打ち上げられる東京最大級の花火大会。',
  950000, 'Various stations near Sumida River (Asakusa, Kuramae)', 35.7150, 139.8010,
  'Arrive hours early or book a restaurant with river views. Asakusa is extremely crowded.',
  'https://www.sumidagawa-hanabi.com/', 1, '2026-03-29T00:00:00Z'
);

-- 23. Yosakoi Festival - Kochi (August)
INSERT INTO matsuri VALUES (
  'yosakoi', 'Yosakoi Festival', 'よさこい祭り', 'Kochi', 'Kochi', 'shikoku', 8,
  '08-09', '08-12', '["08-10","08-11"]',
  '["dance","modern","music"]',
  'A high-energy dance festival where teams of up to 150 dancers perform choreographed routines with naruko clappers. Combines tradition with modern music and costumes.',
  '鳴子を持って踊る高知発祥の祭り。伝統と現代を融合した華やかな踊りが魅力。',
  1000000, 'JR Kochi Station', 33.5597, 133.5311,
  'The main stage at Otesuji offers the best viewing. Teams compete for the grand prize.',
  'https://www.cciweb.or.jp/yosakoi/', 1, '2026-03-29T00:00:00Z'
);

-- 24. Tokushima Awa Odori is already #5, adding Gujo Odori
INSERT INTO matsuri VALUES (
  'gujo-odori', 'Gujo Odori', '郡上おどり', 'Gujo', 'Gifu', 'chubu', 7,
  '07-13', '09-07', '["08-13","08-14","08-15","08-16"]',
  '["dance","traditional"]',
  'A 400-year-old Bon dance festival spanning over 30 nights in summer. During the Tetsuya Odori (all-night dancing) in mid-August, dancing continues from 8 PM to 5 AM.',
  '400年の歴史を持つ盆踊り。8月のお盆期間には徹夜おどりが行われる。',
  300000, 'Nagaragawa Railway Gujo-Hachiman Station', 35.7486, 136.9644,
  'Join the dance circle — anyone is welcome. Wooden geta (sandals) are essential for the authentic experience.',
  'https://www.gujohachiman.com/', 1, '2026-03-29T00:00:00Z'
);

-- 25. Nachi Fire Festival (July)
INSERT INTO matsuri VALUES (
  'nachi-fire-festival', 'Nachi Fire Festival', '那智の火祭り', 'Nachikatsuura', 'Wakayama', 'kansai', 7,
  '07-14', '07-14', '["07-14"]',
  '["fire","traditional"]',
  'Twelve large torches weighing 50 kg each are carried up the stone steps of Kumano Nachi Taisha to meet twelve portable shrines descending. One of Japan''s three great fire festivals.',
  '日本三大火祭りの一つ。大松明と神輿が那智の滝の前で出会う壮大な祭り。',
  15000, 'JR Nachi Station, then bus to Nachi Taisha', 33.6700, 135.8900,
  'The combination of the waterfall, torches, and shrine creates an unforgettable scene.',
  'https://kumanonachitaisha.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 26. Takayama Autumn Festival (October)
INSERT INTO matsuri VALUES (
  'takayama-autumn', 'Takayama Autumn Festival', '高山祭（秋）', 'Takayama', 'Gifu', 'chubu', 10,
  '10-09', '10-10', '["10-09","10-10"]',
  '["float","traditional","autumn"]',
  'The autumn counterpart of the Spring Takayama Festival, held at Sakurayama Hachimangu Shrine. Eleven ornate yatai floats are displayed against autumn foliage.',
  '櫻山八幡宮の例祭。紅葉を背景に11台の豪華な屋台が並ぶ秋の高山祭。',
  200000, 'JR Takayama Station', 36.1430, 137.2540,
  'Autumn foliage adds extra beauty. The evening procession with lanterns is enchanting.',
  'https://www.hidatakayama.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 27. Kurama Fire Festival (October)
INSERT INTO matsuri VALUES (
  'kurama-fire-festival', 'Kurama Fire Festival', '鞍馬の火祭', 'Kyoto', 'Kyoto', 'kansai', 10,
  '10-22', '10-22', '["10-22"]',
  '["fire","traditional"]',
  'One of Kyoto''s three great festivals. Villagers carry large pine torches through the narrow streets of Kurama, creating a dramatic river of fire.',
  '京都三大奇祭の一つ。鞍馬の狭い街道を大松明が練り歩く勇壮な火祭り。',
  50000, 'Eizan Railway Kurama Station', 35.1175, 135.7706,
  'Access is very limited — arrive by early afternoon. One-way pedestrian flow is enforced.',
  'https://www.kuramadera.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 28. Hadaka Matsuri - Okayama (February)
INSERT INTO matsuri VALUES (
  'hadaka-matsuri', 'Hadaka Matsuri (Naked Festival)', 'はだか祭り', 'Okayama', 'Okayama', 'chugoku', 2,
  '02-15', '02-15', '["02-15"]',
  '["traditional"]',
  'Around 10,000 men wearing only loincloths compete to catch sacred sticks (shingi) thrown by a priest at Saidai-ji temple in freezing February weather.',
  '西大寺の会陽。約1万人のふんどし姿の男たちが宝木（しんぎ）を奪い合う。',
  100000, 'JR Saidaiji Station', 34.6668, 134.0053,
  'The main event starts late at night. Non-participants can watch from designated viewing areas.',
  'https://www.saidaiji.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 29. Mito Plum Festival (February-March)
INSERT INTO matsuri VALUES (
  'mito-plum-festival', 'Mito Plum Blossom Festival', '水戸の梅まつり', 'Mito', 'Ibaraki', 'kanto', 2,
  '02-11', '03-31', '["02-22","03-01","03-08"]',
  '["cherry_blossom","traditional"]',
  'One of the top three gardens in Japan, Kairakuen features about 3,000 plum trees of 100 varieties blooming from late February through March.',
  '日本三名園の一つ、偕楽園で約3,000本の梅が咲き誇る。',
  500000, 'JR Mito Station, then bus to Kairakuen', 36.3758, 140.4539,
  'Early March is the peak. Night illuminations on weekends add a special atmosphere.',
  'https://www.ibarakiguide.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 30. Niihama Taiko Festival (October)
INSERT INTO matsuri VALUES (
  'niihama-taiko', 'Niihama Taiko Festival', '新居浜太鼓祭り', 'Niihama', 'Ehime', 'shikoku', 10,
  '10-16', '10-18', '["10-16","10-17","10-18"]',
  '["traditional","float"]',
  'Known as "the Man''s Festival," teams carry massive taiko-dai floats weighing up to 3 tons. Rival teams clash their floats together in a dramatic display called kaki-kurabe.',
  '「男祭り」の異名を持つ。重さ約3トンの太鼓台を担ぎ、かきくらべで競い合う。',
  200000, 'JR Niihama Station', 33.9603, 133.2833,
  'The clash events (kaki-kurabe) are the most dramatic. River crossing events are particularly photogenic.',
  'https://niihama-taikofestival.com/', 1, '2026-03-29T00:00:00Z'
);

-- 31. Nagaoka Fireworks Festival (August)
INSERT INTO matsuri VALUES (
  'nagaoka-fireworks', 'Nagaoka Fireworks Festival', '長岡まつり大花火大会', 'Nagaoka', 'Niigata', 'chubu', 8,
  '08-02', '08-03', '["08-02","08-03"]',
  '["modern","fire"]',
  'One of Japan''s three great fireworks festivals featuring the spectacular Sanshaku-dama (three-foot shells) and the Phoenix fireworks display as a memorial for peace.',
  '日本三大花火大会の一つ。三尺玉やフェニックス花火が有名。',
  1000000, 'JR Nagaoka Station', 37.4467, 138.8558,
  'Book accommodations far in advance. Paid seating along the river is worth it for the Phoenix display.',
  'https://nagaokamatsuri.com/', 1, '2026-03-29T00:00:00Z'
);

-- 32. Tenjin Matsuri Funatogyo already covered, adding Okunchi (Karatsu)
INSERT INTO matsuri VALUES (
  'karatsu-kunchi', 'Karatsu Kunchi', '唐津くんち', 'Karatsu', 'Saga', 'kyushu', 11,
  '11-02', '11-04', '["11-02","11-03","11-04"]',
  '["float","traditional"]',
  'Fourteen massive hikiyama floats shaped like samurai helmets, sea creatures, and lions are paraded through the streets and dragged across the sandy beach.',
  '14台の巨大な曳山が市内を巡行する唐津の秋祭り。砂浜での曳き込みが圧巻。',
  500000, 'JR Karatsu Station', 33.4500, 129.9694,
  'The beach-pulling scene at Nishi-no-Hama on November 3 morning is the most photogenic moment.',
  'https://www.karatsu-kankou.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 33. Otaru Snow Light Path (February)
INSERT INTO matsuri VALUES (
  'otaru-snow-light', 'Otaru Snow Light Path Festival', '小樽雪あかりの路', 'Otaru', 'Hokkaido', 'hokkaido', 2,
  '02-08', '02-16', '["02-08","02-14"]',
  '["snow","lantern"]',
  'Candles placed in snow sculptures and floating on the Otaru Canal create a romantic winter atmosphere. A more intimate alternative to Sapporo Snow Festival.',
  '小樽運河沿いに雪のキャンドルが灯る幻想的な冬イベント。',
  500000, 'JR Otaru Station', 43.1907, 140.9947,
  'Visit at dusk for the most magical lighting. Combine with a day trip from Sapporo.',
  'https://yukiakarinomichi.org/', 1, '2026-03-29T00:00:00Z'
);

-- 34. Soma Nomaoi (July)
INSERT INTO matsuri VALUES (
  'soma-nomaoi', 'Soma Nomaoi', '相馬野馬追', 'Minamisoma', 'Fukushima', 'tohoku', 7,
  '07-25', '07-27', '["07-26"]',
  '["traditional"]',
  'A thousand-year-old samurai festival where mounted warriors in full armor compete in horse races and capture sacred flags shot into the sky by fireworks.',
  '千年以上の歴史を持つ武士の祭典。甲冑姿の騎馬武者が競馬や神旗争奪戦を行う。',
  200000, 'JR Haranomachi Station', 37.6422, 140.9587,
  'The flag-catching event (Shinki Sodatsusen) on the second day is the most exciting.',
  'https://soma-nomaoi.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 35. Tokamachi Snow Festival (February)
INSERT INTO matsuri VALUES (
  'tokamachi-snow', 'Tokamachi Snow Festival', '十日町雪まつり', 'Tokamachi', 'Niigata', 'chubu', 2,
  '02-21', '02-23', '["02-21","02-22","02-23"]',
  '["snow","modern"]',
  'Japan''s oldest snow festival since 1950, featuring snow sculptures, a snow stage for concerts, and the Snowland costume parade.',
  '1950年から続く日本発祥の雪まつり。雪像コンテストやステージイベントが行われる。',
  300000, 'JR Tokamachi Station', 36.9622, 138.7264,
  'The snow stage concert on Saturday night is a unique experience.',
  'https://snowfes.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 36. Hirosaki Cherry Blossom Festival (April-May)
INSERT INTO matsuri VALUES (
  'hirosaki-sakura', 'Hirosaki Cherry Blossom Festival', '弘前さくらまつり', 'Hirosaki', 'Aomori', 'tohoku', 4,
  '04-23', '05-05', '["04-28","04-29","04-30","05-01"]',
  '["cherry_blossom","traditional"]',
  'One of Japan''s top cherry blossom spots with 2,600 trees around Hirosaki Castle. The "petal carpet" on the moat is an iconic image.',
  '弘前城の約2,600本の桜が咲き誇る。堀に浮かぶ花筏は絶景。',
  2000000, 'JR Hirosaki Station, then bus to Hirosaki Park', 40.6073, 140.4640,
  'Late April to early May is peak. Night illumination of the cherry blossoms reflected in the moat is stunning.',
  'https://www.hirosaki-kanko.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 37. Naha Tug of War - Okinawa (October)
INSERT INTO matsuri VALUES (
  'naha-tug-of-war', 'Naha Great Tug of War', '那覇大綱挽まつり', 'Naha', 'Okinawa', 'okinawa', 10,
  '10-12', '10-14', '["10-13"]',
  '["traditional"]',
  'Listed in the Guinness Book as the world''s largest tug of war. A 200-meter rope weighing 40 tons is pulled by 15,000 participants in the middle of Naha''s main street.',
  'ギネス認定の世界最大の綱引き。全長200m、重さ約40トンの綱を1万5千人が引き合う。',
  270000, 'Yui Rail Kencho-mae Station', 26.2124, 127.6792,
  'Anyone can participate! Arrive early to get a spot on the rope. Pieces of the rope are taken home as lucky charms.',
  'https://www.naha-otsunahiki.org/', 1, '2026-03-29T00:00:00Z'
);

-- 38. Eisa Festival - Okinawa (August)
INSERT INTO matsuri VALUES (
  'eisa-festival', 'Okinawa Zento Eisa Festival', '沖縄全島エイサーまつり', 'Okinawa City', 'Okinawa', 'okinawa', 8,
  '08-22', '08-24', '["08-23","08-24"]',
  '["dance","traditional","music"]',
  'The largest Eisa dance festival in Okinawa, featuring teams performing the traditional Bon dance with taiko drums and sanshin music.',
  '沖縄最大のエイサー祭り。太鼓と三線の音に合わせた勇壮な踊りが見どころ。',
  300000, 'Naha Airport, then car to Okinawa City', 26.3344, 127.8056,
  'The finale on the last night features all teams performing together. Food stalls serve Okinawan specialties.',
  'https://www.zentoeisa.com/', 1, '2026-03-29T00:00:00Z'
);

-- 39. Miyajima Water Fireworks (August)
INSERT INTO matsuri VALUES (
  'miyajima-fireworks', 'Miyajima Water Fireworks Festival', '宮島水中花火大会', 'Hatsukaichi', 'Hiroshima', 'chugoku', 8,
  '08-24', '08-24', '["08-24"]',
  '["modern","fire"]',
  'Underwater fireworks launched near the iconic floating torii gate of Itsukushima Shrine create stunning reflections on the water.',
  '厳島神社の大鳥居をシルエットに水中花火が打ち上げられる。',
  300000, 'JR Miyajimaguchi Station, then ferry', 34.2964, 132.3197,
  'Take the ferry to Miyajima island. The beach near the shrine offers the best views.',
  'https://www.miyajima.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 40. Owara Kaze no Bon - Toyama (September)
INSERT INTO matsuri VALUES (
  'owara-kaze-no-bon', 'Owara Kaze no Bon', 'おわら風の盆', 'Toyama', 'Toyama', 'chubu', 9,
  '09-01', '09-03', '["09-01","09-02","09-03"]',
  '["dance","traditional","music"]',
  'An ethereal, melancholic dance festival in the mountain town of Yatsuo. Dancers in deep-brimmed straw hats perform graceful moves to the haunting kokyu (fiddle) and shamisen music.',
  '哀愁漂う胡弓の音色に合わせて優美な踊りが繰り広げられる、八尾の秋祭り。',
  250000, 'JR Etchu-Yatsuo Station', 36.5711, 137.1283,
  'The late-night impromptu street performances (after 11 PM) are the most atmospheric.',
  'https://www.yatsuo.net/', 1, '2026-03-29T00:00:00Z'
);

-- 41. Sanno Matsuri - Tokyo (June)
INSERT INTO matsuri VALUES (
  'sanno-matsuri', 'Sanno Matsuri', '山王祭', 'Tokyo', 'Tokyo', 'kanto', 6,
  '06-07', '06-17', '["06-15"]',
  '["traditional","float"]',
  'One of Tokyo''s three great festivals, held at Hie Shrine in Akasaka. In even-numbered years, a grand procession of 300 people in Heian-period costumes parades through central Tokyo.',
  '東京三大祭りの一つ。日枝神社の祭礼で、隔年で壮大な神幸祭の行列が都心を巡行する。',
  250000, 'Tokyo Metro Akasaka Station', 35.6729, 139.7399,
  'Held in full scale in even-numbered years. The procession passes near the Imperial Palace.',
  'https://www.hiejinja.net/', 1, '2026-03-29T00:00:00Z'
);

-- 42. Oeshiki Festival - Tokyo (October)
INSERT INTO matsuri VALUES (
  'oeshiki', 'Oeshiki Festival', 'お会式', 'Tokyo', 'Tokyo', 'kanto', 10,
  '10-16', '10-18', '["10-17","10-18"]',
  '["lantern","traditional"]',
  'A Buddhist memorial festival at Ikegami Honmon-ji temple commemorating the death of Nichiren. Hundreds of manto (lantern floats) decorated with paper cherry blossoms parade through the streets.',
  '池上本門寺の日蓮聖人御会式。万灯練供養では紙の桜で飾られた万灯が練り歩く。',
  300000, 'Tokyu Ikegami Station', 35.5758, 139.7058,
  'The manto procession on the night of October 18 is the main event, starting around 6 PM.',
  'https://honmonji.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 43. Onbashira - Nagano (April/May, every 6 years)
INSERT INTO matsuri VALUES (
  'onbashira', 'Onbashira Festival', '御柱祭', 'Suwa', 'Nagano', 'chubu', 4,
  '04-02', '05-15', '["04-08","04-09","04-10"]',
  '["traditional"]',
  'Held once every six years at Suwa Taisha. Massive tree trunks are ridden down steep hillsides by daring men in the kiotoshi (tree-falling) event — one of Japan''s most dangerous festivals.',
  '6年に一度の諏訪大社の祭り。巨木の丸太に乗って急斜面を滑り降りる「木落し」は圧巻。',
  200000, 'JR Chino Station', 36.0397, 138.1617,
  'Next held in 2028. The kiotoshi slope is in Chino city. Extremely crowded — arrive very early.',
  'https://onbashira.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 44. Shirakami Mountains Autumn Festival (October)
INSERT INTO matsuri VALUES (
  'jidai-matsuri', 'Jidai Matsuri (Festival of the Ages)', '時代祭', 'Kyoto', 'Kyoto', 'kansai', 10,
  '10-22', '10-22', '["10-22"]',
  '["traditional"]',
  'A grand historical parade from the Imperial Palace to Heian Shrine featuring 2,000 participants dressed in authentic costumes spanning 1,000 years of Kyoto''s history.',
  '京都三大祭りの一つ。平安から明治まで千年の時代装束をまとった約2千人の行列が都大路を巡行。',
  100000, 'Kyoto Subway Marutamachi Station to Imperial Palace', 35.0211, 135.7590,
  'The procession starts at noon from the Imperial Palace. Secure a spot near Heian Shrine for the arrival.',
  'https://www.heianjingu.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 45. Tokushima Puppet Festival → Yamaga Lantern Festival (August)
INSERT INTO matsuri VALUES (
  'yamaga-lantern', 'Yamaga Lantern Festival', '山鹿灯籠まつり', 'Yamaga', 'Kumamoto', 'kyushu', 8,
  '08-15', '08-16', '["08-15","08-16"]',
  '["lantern","dance","traditional"]',
  'A thousand women wearing golden paper lanterns (kinkama) on their heads perform a graceful bon dance in the grounds of Omiya Shrine.',
  '頭に金灯籠を乗せた千人の女性が優雅に踊る「千人灯籠踊り」が見どころ。',
  150000, 'JR Tamana Station, then bus to Yamaga', 33.0158, 130.6856,
  'The Sennintouro (1,000-person lantern dance) at Omiya Shrine on August 16 is the highlight.',
  'https://yamaga-tanbou.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 46. Kamakura Matsuri (April)
INSERT INTO matsuri VALUES (
  'kamakura-matsuri', 'Kamakura Festival', '鎌倉まつり', 'Kamakura', 'Kanagawa', 'kanto', 4,
  '04-13', '04-20', '["04-16"]',
  '["traditional","cherry_blossom"]',
  'A week-long festival at Tsurugaoka Hachimangu Shrine featuring yabusame (horseback archery) performed along a cherry blossom-lined path.',
  '鶴岡八幡宮の例大祭。桜並木の中での流鏑馬（やぶさめ）が名物。',
  100000, 'JR Kamakura Station', 35.3261, 139.5500,
  'The yabusame event draws large crowds — arrive at least 2 hours early.',
  'https://www.hachimangu.or.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 47. Hakodate Port Festival (August)
INSERT INTO matsuri VALUES (
  'hakodate-port', 'Hakodate Port Festival', '函館港まつり', 'Hakodate', 'Hokkaido', 'hokkaido', 8,
  '08-01', '08-05', '["08-01","08-02"]',
  '["dance","modern","fire"]',
  'Hakodate''s biggest summer festival featuring the Wasshoi Hakodate dance parade with 20,000 participants and a fireworks display over the port.',
  '約2万人が参加する「ワッショイはこだて」のパレードと花火が見どころ。',
  500000, 'JR Hakodate Station', 41.7737, 140.7268,
  'The fireworks on August 1 are launched from the port with Mt. Hakodate as a backdrop.',
  'https://www.hakodate-minatomatsuri.org/', 1, '2026-03-29T00:00:00Z'
);

-- 48. Ofuna Kannon Festival → Saijo Matsuri (October)
INSERT INTO matsuri VALUES (
  'saijo-matsuri', 'Saijo Festival', '西条祭り', 'Saijo', 'Ehime', 'shikoku', 10,
  '10-14', '10-17', '["10-15","10-16"]',
  '["float","traditional"]',
  'Over 130 elaborately decorated danjiri floats are paraded through the city. The riverside gathering of all floats at dawn is called "river crossing" and is breathtaking.',
  '130台以上の屋台・だんじりが練り歩く四国最大級の祭り。川入りの光景は圧巻。',
  600000, 'JR Iyo-Saijo Station', 33.9197, 133.1800,
  'The river-entry scene at Kamo River at dawn on the last day is the most famous scene.',
  'https://saijo-imadoki.jp/', 1, '2026-03-29T00:00:00Z'
);

-- 49. Inuyama Festival (April)
INSERT INTO matsuri VALUES (
  'inuyama-matsuri', 'Inuyama Festival', '犬山祭', 'Inuyama', 'Aichi', 'chubu', 4,
  '04-05', '04-06', '["04-05","04-06"]',
  '["float","traditional"]',
  'Thirteen three-tiered yama floats with karakuri puppet performances are paraded near Inuyama Castle. The nighttime procession with 365 lanterns on each float is stunning.',
  '犬山城下町を13両の車山が巡行。からくり人形の実演と、夜の提灯山車が見どころ。',
  350000, 'Meitetsu Inuyama Station', 35.3786, 136.9456,
  'The evening floats lit by paper lanterns against Inuyama Castle is an iconic photo opportunity.',
  'https://www.inuyama-festival.com/', 1, '2026-03-29T00:00:00Z'
);

-- 50. Shimane - Izumo Kamiari Festival (November)
INSERT INTO matsuri VALUES (
  'izumo-kamiari', 'Izumo Kamiari Festival', '出雲神在祭', 'Izumo', 'Shimane', 'chugoku', 11,
  '11-10', '11-17', '["11-10","11-17"]',
  '["traditional"]',
  'While the rest of Japan calls November "the month without gods" (Kannazuki), in Izumo it''s "the month with gods" (Kamiarizuki) — all eight million gods gather at Izumo Taisha for their annual meeting.',
  '全国の八百万の神々が出雲大社に集まるとされる神在月の祭事。神迎祭から神等去出祭まで。',
  300000, 'Ichibata Electric Railway Izumo-Taisha-mae Station', 35.4019, 132.6856,
  'The Kamimukaesai (god-welcoming ceremony) on Inasa Beach at sunset is mystical. Dress warmly.',
  'https://izumooyashiro.or.jp/', 1, '2026-03-29T00:00:00Z'
);
