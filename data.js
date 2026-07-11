/**
 * 2025 高雄必比登推介餐廳資料
 * 座標已根據地址對應至 Google Maps 實際位置
 *
 * 可擴充欄位說明：
 * - type: 大類，例如「必比登美食」、「景點」
 * - category: 清單分組，例如「小吃」、「室內景點」
 * - facets: 額外可隱藏標籤，例如 ["景點", "室內景點", "親子"]
 *
 * 篩選規則：
 * - 上方 pills 是快速聚焦某個 category
 * - 側邊「隱藏類別」會依 facets / type / category 把資料整批隱藏
 */
const RESTAURANTS = [
  // ===== 台菜合菜 =====
  {
    id: 1,
    type: "必比登美食",
    name: "老新台菜",
    category: "台菜合菜",
    address: "高雄市三民區九如二路227號",
    district: "三民區",
    lat: 22.6394,
    lng: 120.3048,
    description: "經典台式辦桌菜，傳承古早味手路菜，烏魚子、紅蟳米糕等經典菜色出色。",
    price: "$$",
    isNew: false,
    tags: ["辦桌菜", "手路菜", "宴客"]
  },
  {
    id: 2,
    name: "賣塩順",
    category: "台菜合菜",
    address: "高雄市鼓山區青海路173號",
    district: "鼓山區",
    lat: 22.6652,
    lng: 120.2915,
    description: "以鹽為主題的創意台菜，善用各式鹽品提味，菜色精緻且富創意。",
    price: "$$",
    isNew: false,
    tags: ["創意台菜", "鹽料理"]
  },
  {
    id: 3,
    name: "白玉樓",
    category: "台菜合菜",
    address: "高雄市前鎮區中華五路789號6樓",
    district: "前鎮區",
    lat: 22.5972,
    lng: 120.3075,
    description: "位於夢時代百貨的經典台菜餐廳，環境雅致，功夫菜水準穩定。",
    price: "$$",
    isNew: true,
    tags: ["百貨美食", "經典台菜", "宴客"]
  },
  {
    id: 4,
    name: "小燉食室",
    category: "台菜合菜",
    address: "高雄市前鎮區廣西路226號",
    district: "前鎮區",
    lat: 22.6140,
    lng: 120.3190,
    description: "主打慢燉料理，湯品醇厚入味，食材講究，家庭式溫馨氛圍。",
    price: "$$",
    isNew: false,
    tags: ["燉湯", "家常菜"]
  },
  {
    id: 5,
    name: "永筵小館",
    category: "台菜合菜",
    address: "高雄市前金區成功一路528號",
    district: "前金區",
    lat: 22.6253,
    lng: 120.2955,
    description: "小館子大手藝，菜色家常卻不馬虎，價格實在味道好。",
    price: "$$",
    isNew: true,
    tags: ["家常菜", "小館"]
  },
  {
    id: 6,
    name: "昭明海產家庭料理",
    category: "台菜合菜",
    address: "高雄市前金區自強一路53號",
    district: "前金區",
    lat: 22.6290,
    lng: 120.2970,
    description: "新鮮海產搭配家庭式料理手法，清蒸魚、炒海鮮等樣樣到位。",
    price: "$$",
    isNew: false,
    tags: ["海鮮", "家庭料理"]
  },
  {
    id: 7,
    name: "貳哥食堂",
    category: "台菜合菜",
    address: "高雄市鼓山區青海路145號",
    district: "鼓山區",
    lat: 22.6648,
    lng: 120.2910,
    description: "隱藏在巷弄的好味道，台式熱炒風格，用料大方、分量十足。",
    price: "$$",
    isNew: false,
    tags: ["熱炒", "台菜"]
  },
  {
    id: 8,
    name: "阿香的廚房",
    category: "台菜合菜",
    address: "高雄市美濃區中山路二段629號",
    district: "美濃區",
    lat: 22.8975,
    lng: 120.5413,
    description: "美濃客家料理名店，板條、封肉等客家經典菜色道地美味。",
    price: "$",
    isNew: false,
    tags: ["客家菜", "美濃", "板條"]
  },
  {
    id: 9,
    name: "舊市羊肉",
    category: "台菜合菜",
    address: "高雄市岡山區河華路111號",
    district: "岡山區",
    lat: 22.7947,
    lng: 120.2985,
    description: "岡山在地老字號羊肉爐，湯頭醇厚不羶，冬日暖胃首選。",
    price: "$$",
    isNew: false,
    tags: ["羊肉爐", "岡山"]
  },
  {
    id: 10,
    name: "牛老大涮牛肉",
    category: "台菜合菜",
    address: "高雄市前金區自強二路18號",
    district: "前金區",
    lat: 22.6270,
    lng: 120.2945,
    description: "溫體牛肉火鍋名店，肉質鮮甜、涮燙恰到好處，湯頭清甜。",
    price: "$$",
    isNew: false,
    tags: ["牛肉火鍋", "溫體牛"]
  },
  {
    id: 11,
    name: "湖東牛肉館",
    category: "台菜合菜",
    address: "高雄市湖內區中山路一段107號",
    district: "湖內區",
    lat: 22.7580,
    lng: 120.2150,
    description: "在地人才知道的牛肉館，各式牛肉料理新鮮實在。",
    price: "$$",
    isNew: false,
    tags: ["牛肉", "在地美食"]
  },

  // ===== 小吃 =====
  {
    id: 12,
    name: "正宗鴨肉飯",
    category: "小吃",
    address: "高雄市左營區裕誠路245號",
    district: "左營區",
    lat: 22.6650,
    lng: 120.3100,
    description: "鴨肉飯香氣四溢，鴨腿飯限量供應，搭配自製醬料更是一絕。",
    price: "$",
    isNew: false,
    tags: ["鴨肉飯", "限量"]
  },
  {
    id: 13,
    name: "秀明豬心冬粉",
    category: "小吃",
    address: "高雄市旗山區永平街41號",
    district: "旗山區",
    lat: 22.8870,
    lng: 120.4830,
    description: "旗山名物，豬心處理得軟嫩無腥味，冬粉湯頭清甜。",
    price: "$",
    isNew: false,
    tags: ["豬心", "冬粉", "旗山"]
  },
  {
    id: 14,
    name: "良佳豬腳",
    category: "小吃",
    address: "高雄市三民區陽明路229號",
    district: "三民區",
    lat: 22.6500,
    lng: 120.3260,
    description: "滷豬腳色澤油亮、膠質豐富、入口即化，是高雄豬腳代表名店。",
    price: "$",
    isNew: false,
    tags: ["豬腳", "滷味"]
  },
  {
    id: 15,
    name: "春蘭割包",
    category: "小吃",
    address: "高雄市新興區復興一路5號",
    district: "新興區",
    lat: 22.6290,
    lng: 120.3110,
    description: "傳統割包外皮鬆軟，內餡扎實，酸菜花生粉搭配恰到好處。",
    price: "$",
    isNew: false,
    tags: ["割包", "傳統小吃"]
  },
  {
    id: 16,
    name: "前金肉燥飯",
    category: "小吃",
    address: "高雄市前金區大同二路26號",
    district: "前金區",
    lat: 22.6260,
    lng: 120.2925,
    description: "在地人從小吃到大的肉燥飯，醬香濃郁、肥瘦比例完美。",
    price: "$",
    isNew: false,
    tags: ["肉燥飯", "古早味"]
  },
  {
    id: 17,
    name: "廖記米糕",
    category: "小吃",
    address: "高雄市橋頭區橋南路119號",
    district: "橋頭區",
    lat: 22.7560,
    lng: 120.3055,
    description: "橋頭在地米糕名店，糯米Q彈入味，配上特製醬汁令人回味。",
    price: "$",
    isNew: false,
    tags: ["米糕", "橋頭"]
  },
  {
    id: 18,
    name: "米院子油飯",
    category: "小吃",
    address: "高雄市新興區南海街30號",
    district: "新興區",
    lat: 22.6260,
    lng: 120.3090,
    description: "油飯粒粒分明、香氣十足，搭配的雞湯也廣受好評。",
    price: "$",
    isNew: false,
    tags: ["油飯", "雞湯"]
  },
  {
    id: 19,
    name: "侯記鴨肉飯",
    category: "小吃",
    address: "高雄市三民區自強一路201號",
    district: "三民區",
    lat: 22.6330,
    lng: 120.3060,
    description: "鴨肉飯肉質軟嫩、淋上鴨油醬汁香氣逼人，配菜也很用心。",
    price: "$",
    isNew: false,
    tags: ["鴨肉飯"]
  },
  {
    id: 20,
    name: "弘記肉燥飯舖",
    category: "小吃",
    address: "高雄市左營區立文路96號",
    district: "左營區",
    lat: 22.6720,
    lng: 120.3010,
    description: "肉燥飯肥肉比例恰到好處，搭配半熟蛋更是絕配。",
    price: "$",
    isNew: false,
    tags: ["肉燥飯"]
  },
  {
    id: 21,
    name: "橋仔頭黃家肉燥飯",
    category: "小吃",
    address: "高雄市橋頭區橋南路106號",
    district: "橋頭區",
    lat: 22.7555,
    lng: 120.3050,
    description: "橋頭區老字號，肉燥飯醬汁鹹香入味，在地居民的日常美食。",
    price: "$",
    isNew: false,
    tags: ["肉燥飯", "橋頭"]
  },
  {
    id: 22,
    name: "菜粽李",
    category: "小吃",
    address: "高雄市苓雅區成功一路159號",
    district: "苓雅區",
    lat: 22.6260,
    lng: 120.3130,
    description: "南部菜粽代表，花生粽搭配特製醬油膏，是高雄傳統早餐之選。",
    price: "$",
    isNew: false,
    tags: ["菜粽", "早餐"]
  },
  {
    id: 23,
    name: "北港蔡三代筒仔米糕",
    category: "小吃",
    address: "高雄市鹽埕區河西路167號",
    district: "鹽埕區",
    lat: 22.6230,
    lng: 120.2820,
    description: "筒仔米糕扎實入味，傳承三代的好手藝，鹽埕區在地名店。",
    price: "$",
    isNew: false,
    tags: ["米糕", "筒仔米糕", "鹽埕"]
  },

  // ===== 其他料理 =====
  {
    id: 24,
    name: "泰元 THAIYUAN",
    category: "其他料理",
    address: "高雄市苓雅區苓雅二路53號",
    district: "苓雅區",
    lat: 22.6215,
    lng: 120.3170,
    description: "前身為帕泰 PADTHAI，泰式料理道地、香料運用精準，打拋豬、綠咖哩深受喜愛。",
    price: "$$",
    isNew: false,
    tags: ["泰式料理", "咖哩"]
  },
  {
    id: 25,
    name: "楊寶寶蒸餃",
    category: "其他料理",
    address: "高雄市楠梓區朝明路106號",
    district: "楠梓區",
    lat: 22.7330,
    lng: 120.3260,
    description: "北平蒸餃皮薄餡多汁，現包現蒸，酸辣湯也是招牌搭配。",
    price: "$",
    isNew: false,
    tags: ["蒸餃", "北方麵食"]
  },

  // ===== 景點 =====
  {
    id: 101,
    type: "景點",
    name: "國立科學工藝博物館",
    category: "室內景點",
    facets: ["景點", "室內景點", "親子", "雨天備案"],
    address: "高雄市三民區九如一路720號",
    district: "三民區",
    lat: 22.6397,
    lng: 120.3226,
    description: "高雄最穩定的室內親子備案之一，展覽量體完整，適合抵達高雄後直接安排半天到一天。",
    price: "$$",
    isNew: false,
    tags: ["博物館", "雨備", "親子"]
  },
  {
    id: 102,
    type: "景點",
    name: "航空教育展示館",
    category: "室內景點",
    facets: ["景點", "室內景點", "親子", "交通主題"],
    address: "高雄市岡山區致遠路55號",
    district: "岡山區",
    lat: 22.7964,
    lng: 120.2950,
    description: "以飛機與航空主題為核心的展示館，適合喜歡飛機、軍事或大型載具的小孩與大人。",
    price: "$$",
    isNew: false,
    tags: ["飛機", "航空", "雨備"]
  },
  {
    id: 103,
    type: "景點",
    name: "哈瑪星台灣鐵道館",
    category: "室內景點",
    facets: ["景點", "室內景點", "親子", "交通主題"],
    address: "高雄市鼓山區蓬萊路99號B7、B8倉庫",
    district: "鼓山區",
    lat: 22.6167,
    lng: 120.2777,
    description: "位於駁二蓬萊倉庫，以大型鐵道模型與聲光展演呈現台灣鐵道歷史，適合接鹽埕與駁二行程。",
    price: "$$",
    isNew: false,
    tags: ["鐵道", "模型", "駁二"]
  },
  {
    id: 104,
    type: "景點",
    name: "蓮池潭兒童公園",
    category: "親子景點",
    facets: ["景點", "親子景點", "戶外景點", "親子"],
    address: "高雄市左營區蓮潭路",
    district: "左營區",
    lat: 22.6841,
    lng: 120.2905,
    description: "左營親子放電代表點，可和蓮池潭、龍虎塔一帶一起安排，適合 6 歲到 9 歲小孩活動。",
    price: "$",
    isNew: false,
    tags: ["公園", "放電", "左營"]
  },
  {
    id: 105,
    type: "景點",
    name: "安坡童玩部落",
    category: "山林部落",
    facets: ["景點", "山林部落", "部落", "親子", "屏東外掛"],
    address: "屏東縣三地門鄉高山巷1-3號",
    district: "三地門鄉",
    lat: 22.7815,
    lng: 120.6598,
    description: "排灣族童玩文化體驗部落，適合安排預約導覽、童玩 DIY、部落餐食與親子體驗。",
    price: "$$",
    isNew: false,
    tags: ["排灣族", "童玩", "部落導覽"]
  },
  {
    id: 106,
    type: "景點",
    name: "青葉部落",
    category: "山林部落",
    facets: ["景點", "山林部落", "部落", "藝術"],
    address: "屏東縣三地門鄉沿山公路185線青葉部落",
    district: "三地門鄉",
    lat: 22.7342,
    lng: 120.6547,
    description: "以魯凱神話藝術村著稱，適合散步、看壁畫與搭配沿山線部落行程。",
    price: "$",
    isNew: false,
    tags: ["魯凱族", "藝術村", "沿山線"]
  },
  {
    id: 107,
    type: "景點",
    name: "禮納里部落",
    category: "山林部落",
    facets: ["景點", "山林部落", "部落", "散步", "親子"],
    address: "屏東縣瑪家鄉和平路一段63號周邊",
    district: "瑪家鄉",
    lat: 22.6734,
    lng: 120.6340,
    description: "莫拉克風災後的重要新部落，適合慢走、拍照、族服體驗與部落工坊安排。",
    price: "$",
    isNew: false,
    tags: ["部落散步", "族服", "工坊"]
  },
  {
    id: 108,
    type: "景點",
    name: "多納部落",
    category: "山林部落",
    facets: ["景點", "山林部落", "部落", "魯凱文化"],
    address: "高雄市茂林區多納里",
    district: "茂林區",
    lat: 22.9055,
    lng: 120.7010,
    description: "茂林區深處的魯凱部落，黑米、石板屋與吊橋是代表特色，適合獨立排半天到一天。",
    price: "$",
    isNew: false,
    tags: ["魯凱族", "黑米", "石板屋"]
  },
  {
    id: 109,
    type: "景點",
    name: "萬山部落",
    category: "山林部落",
    facets: ["景點", "山林部落", "部落", "魯凱文化"],
    address: "高雄市茂林區萬山里",
    district: "茂林區",
    lat: 22.9100,
    lng: 120.7310,
    description: "以岩雕、石板屋與魯凱文化著稱，適合文化導覽與深度走讀型行程。",
    price: "$",
    isNew: false,
    tags: ["岩雕", "魯凱族", "文化導覽"]
  }
];

// Category color mapping
const CATEGORY_COLORS = {
  "台菜合菜": "#E74C3C",
  "小吃": "#F39C12",
  "其他料理": "#2ECC71",
  "室內景點": "#5B8DEF",
  "親子景點": "#9B59B6",
  "山林部落": "#16A085"
};

// Category icon emoji
const CATEGORY_ICONS = {
  "台菜合菜": "🍲",
  "小吃": "🥢",
  "其他料理": "🍜",
  "室內景點": "🏛️",
  "親子景點": "🛝",
  "山林部落": "⛰️"
};

// Top-level type configuration (for nested grouping)
const TYPE_CONFIG = {
  "必比登美食": { emoji: "🍽️", color: "#f0c040", label: "必比登美食" },
  "景點": { emoji: "🗺️", color: "#5b8def", label: "景點" },
};

const TYPE_ORDER = ["必比登美食", "景點"]; // controls render order

// Sub-category order within each type
const CATEGORY_ORDER = {
  "必比登美食": ["台菜合菜", "小吃", "其他料理"],
  "景點": ["室內景點", "親子景點", "山林部落"],
};
