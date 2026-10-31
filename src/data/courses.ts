/**
 * 示例课程数据：两门以「因果链」为骨架的历史课程。
 *
 * 取材口径：通行史学结论，不做翻案式断言；课程摘要里注明「据通行史学口径」，
 * 免得把学界争议当定论钉死。每一条因果边都写明「因为什么、所以什么」——
 * 这是本产品的核心表达，边上的 note 是不可省略的内容，不是注释。
 */

import type { ChainCourse } from "../core/chain.ts";

/** 工业革命：动力、工厂与铁路的连锁 */
const industrialRevolution: ChainCourse = {
  id: "industrial-revolution",
  title: "工业革命：一条因果链",
  subtitle: "飞梭 → 珍妮机 → 蒸汽机 → 铁路",
  summary:
    "不是「蒸汽机突然出现」，而是一连串互相逼出来的必然：织布快了，纱就不够；手纺不出那么多纱，动力就得外给；动力来自蒸汽，而蒸汽要烧煤，煤得从更深的井里挖出来，挖煤又需要蒸汽泵——于是同一个机器既推动纺织，也铺出了铁路。",
  era: "18 世纪中叶 – 19 世纪中叶 · 英国",
  actors: [
    { id: "kay", name: "约翰·凯伊", birth: 1704, death: 1773, role: "发明飞梭", note: "1733 年" },
    { id: "hargreaves", name: "詹姆斯·哈格里夫斯", birth: 1720, death: 1778, role: "发明珍妮纺纱机", note: "约 1764 年" },
    { id: "watt", name: "詹姆斯·瓦特", birth: 1736, death: 1819, role: "改良蒸汽机", note: "1769 年取得分离冷凝器专利" },
    { id: "arkwright", name: "理查德·阿克赖特", birth: 1732, death: 1792, role: "水力纺纱与工厂制度", note: "1769 年设厂" },
    { id: "stephenson", name: "乔治·斯蒂芬孙", birth: 1781, death: 1848, role: "蒸汽机车", note: "1825 年机车试验" },
  ],
  places: [
    { id: "britain", name: "英国", lat: 54.0, lon: -2.0 },
    { id: "manchester", name: "曼彻斯特", lat: 53.48, lon: -2.24 },
    { id: "coalbrookdale", name: "煤矿区（斯塔福德郡一带）", lat: 52.68, lon: -2.52 },
    { id: "liverpool", name: "利物浦", lat: 53.41, lon: -2.98 },
  ],
  events: [
    {
      id: "flyshuttle",
      year: 1733,
      title: "飞梭问世",
      summary: "凯伊的飞梭让一块布的织造时间大约减半，织工一人能顶两人。",
      role: "cause",
      placeId: "britain",
      actorIds: ["kay"],
    },
    {
      id: "yarnshortage",
      year: 1750,
      title: "纱线成了瓶颈",
      summary: "织得太快，纺出来的纱供不上，织工开始抱怨「织机饿着」。",
      role: "cause",
      placeId: "britain",
      actorIds: [],
    },
    {
      id: "spinningjenny",
      year: 1764,
      title: "珍妮纺纱机",
      summary: "哈格里夫斯的多轴纺纱机一次纺多根纱，把纺纱效率提了一个量级。",
      role: "cause",
      placeId: "britain",
      actorIds: ["hargreaves"],
    },
    {
      id: "wattsteam",
      year: 1769,
      title: "瓦特改良蒸汽机",
      summary: "分离冷凝器把效率提上去，蒸汽机从矿井排水泵变成能驱动任何机器的动力源。",
      role: "core",
      placeId: "britain",
      actorIds: ["watt"],
    },
    {
      id: "factory",
      year: 1785,
      title: "工厂制度成形",
      summary: "动力机与传动轴把工序集中到一间厂房，工人按钟点上下班，生产第一次被时钟而不是天光支配。",
      role: "cause",
      placeId: "britain",
      actorIds: ["arkwright"],
    },
    {
      id: "manchester",
      year: 1830,
      title: "曼彻斯特成为棉纺中心",
      summary: "棉纺、机器制造与人口一起堆积，曼彻斯特被称为「棉都」。",
      role: "effect",
      placeId: "manchester",
      actorIds: [],
    },
    {
      id: "railway",
      year: 1825,
      title: "蒸汽机车与铁路",
      summary: "斯蒂芬孙的机车把煤与原料从产地一路拉到港口与市场。",
      role: "effect",
      placeId: "coalbrookdale",
      actorIds: ["stephenson"],
    },
    {
      id: "liverpoolmcr",
      year: 1830,
      title: "利物浦—曼彻斯特铁路通车",
      summary: "第一条城际客运铁路启用，货物与旅客的流动时间第一次以小时计。",
      role: "effect",
      placeId: "liverpool",
      actorIds: [],
    },
    {
      id: "publichealth",
      year: 1848,
      title: "《公共卫生法案》",
      summary: "工业城市的人口密度与死亡率触发了政治议题，洁净水与排污成为公共政策。",
      role: "effect",
      placeId: "manchester",
      actorIds: [],
    },
  ],
  edges: [
    {
      from: "flyshuttle",
      to: "yarnshortage",
      kind: "caused",
      note: "织布效率翻倍，纺纱没跟上，于是「织机饿着」——瓶颈从织造转移到了纺纱。",
    },
    {
      from: "yarnshortage",
      to: "spinningjenny",
      kind: "enabled",
      note: "供给缺口摆在那里，多轴纺纱机才有人要、也才有人造得出来。",
    },
    {
      from: "spinningjenny",
      to: "wattsteam",
      kind: "enabled",
      note: "手摇纺车产不出与飞梭匹配的纱量，动力必须外给，蒸汽机于是从抽水的工具变成工业动力。",
    },
    {
      from: "wattsteam",
      to: "factory",
      kind: "enabled",
      note: "有了稳定动力，机器才能集中到一间厂房按钟点生产，工厂制度才成立。",
    },
    {
      from: "factory",
      to: "manchester",
      kind: "caused",
      note: "工厂制度加上蒸汽动力，棉纺产能与就业同时向曼彻斯特聚集。",
    },
    {
      from: "wattsteam",
      to: "railway",
      kind: "enabled",
      note: "改良后的蒸汽机让深井煤矿得以抽水排水，煤产量上台阶，才可能有蒸汽机车。",
    },
    {
      from: "railway",
      to: "liverpoolmcr",
      kind: "caused",
      note: "机车与铁轨的成熟，把城际客运从驿马时代拉进小时时代。",
    },
    {
      from: "railway",
      to: "manchester",
      kind: "enabled",
      note: "铁路把棉花产地、煤矿与港口连成一条线，原料与成品的流动成本骤降，棉纺继续向曼彻斯特集中。",
    },
    {
      from: "liverpoolmcr",
      to: "publichealth",
      kind: "revealed",
      note: "城市与工厂同步膨胀，贫民窟、饮用水污染与高死亡率随之变成必须由立法回应的问题。",
    },
  ],
};

/** 安史之乱：帝国崩溃的连锁（据通行史学口径） */
const anshiRebellion: ChainCourse = {
  id: "anshi-rebellion",
  title: "安史之乱：崩溃的连锁",
  subtitle: "边镇 → 起兵 → 两京失守 → 藩镇割据",
  summary:
    "一场叛乱之所以能摧毁一个盛世，往往不是因为叛军有多强，而是因为朝廷在它之前的每一步都把自己的应对能力用掉了：把兵权交给边疆，叛乱起于自己授权的地方；中央无兵可用，只好借外族与地方武装平叛；平叛的债又让地方势力坐大。此处按通行史学口径梳理这条链，不作翻案式断言。",
  era: "唐玄宗开元至德宗建中 · 8 世纪",
  actors: [
    { id: "xuanzong", name: "唐玄宗李隆基", birth: 685, death: 762, role: "皇帝（开元–天宝）" },
    { id: "anhui", name: "安禄山", birth: 703, death: 757, role: "范阳节度使" },
    { id: "geshuhan", name: "哥舒翰", birth: 700, death: 757, role: "潼关守将" },
    { id: "suzong", name: "唐肃宗李亨", birth: 711, death: 762, role: "皇帝（至德–乾元）" },
    { id: "shiming", name: "史思明", birth: 703, death: 763, role: "叛军首领" },
  ],
  places: [
    { id: "luoyang", name: "洛阳", lat: 34.62, lon: 112.45 },
    { id: "changan", name: "长安", lat: 34.34, lon: 108.94 },
    { id: "fanyang", name: "范阳（北京一带）", lat: 39.9, lon: 116.4 },
    { id: "tongguan", name: "潼关", lat: 34.55, lon: 110.25 },
    { id: "lingwu", name: "灵武", lat: 38.08, lon: 106.28 },
  ],
  events: [
    {
      id: "frontierpower",
      year: 736,
      title: "边镇权力膨胀",
      summary: "开元年间对吐蕃用兵，边将长期掌兵，节度使辖区兼管军政财，边镇实力远超朝廷的调度能力。",
      role: "cause",
      placeId: "fanyang",
      actorIds: ["xuanzong"],
    },
    {
      id: "anhui-rise",
      year: 742,
      title: "安禄山一身三镇",
      summary: "安禄山兼任范阳、平卢、河东三镇节度使，兵马钱粮皆出其手。",
      role: "cause",
      placeId: "fanyang",
      actorIds: ["anhui"],
    },
    {
      id: "revolt",
      year: 755,
      title: "安史起兵",
      summary: "天宝十四载冬，安禄山以诛杨国忠为名自范阳南下，十五万众。",
      role: "core",
      placeId: "fanyang",
      actorIds: ["anhui", "xuanzong"],
    },
    {
      id: "tongguan",
      year: 756,
      title: "潼关失守",
      summary: "哥舒翰在潼关被逼出关决战，遭伏大败被俘，叛军得以西进。",
      role: "effect",
      placeId: "tongguan",
      actorIds: ["geshuhan"],
    },
    {
      id: "changanfall",
      year: 756,
      title: "长安陷落",
      summary: "玄宗出奔蜀地，叛军入长安，统治中枢实际上停摆。",
      role: "effect",
      placeId: "changan",
      actorIds: ["xuanzong"],
    },
    {
      id: "lingwu",
      year: 757,
      title: "灵武即位",
      summary: "太子李亨在灵武即位为肃宗，中央另立中枢与叛军对峙。",
      role: "effect",
      placeId: "lingwu",
      actorIds: ["suzong"],
    },
    {
      id: "borrowing",
      year: 757,
      title: "借兵平叛",
      summary: "朝廷自身兵源枯竭，平叛大量倚重回纥骑兵与河朔、蜀中武装。",
      role: "cause",
      placeId: "changan",
      actorIds: ["suzong"],
    },
    {
      id: "shiming",
      year: 761,
      title: "史思明复叛",
      summary: "安禄山死后部将史思明再度起兵，叛乱延续八年方平。",
      role: "effect",
      placeId: "luoyang",
      actorIds: ["shiming"],
    },
    {
      id: "fanzhen",
      year: 763,
      title: "藩镇割据成形",
      summary: "乱平之后，中央无力控制河朔等地的成德、卢龙、魏博等藩镇，赋税兵源渐失。",
      role: "effect",
      placeId: "luoyang",
      actorIds: [],
    },
    {
      id: "jingyuan",
      year: 783,
      title: "泾原兵变与削藩失败",
      summary: "朝廷借平乱之机削藩，泾原兵哗变，德宗出奔，削藩以失败告终，藩镇格局固化。",
      role: "effect",
      placeId: "changan",
      actorIds: [],
    },
  ],
  edges: [
    {
      from: "frontierpower",
      to: "anhui-rise",
      kind: "enabled",
      note: "边镇体制让节度使一身军政财权，这个位置本身就在生产下一个节度使——安禄山正是被同一套体制抬上去的。",
    },
    {
      from: "anhui-rise",
      to: "revolt",
      kind: "enabled",
      note: "兵、钱、粮与合法性都在自己手里时，朝廷的一道诏书已经拦不住他起兵。",
    },
    {
      from: "revolt",
      to: "tongguan",
      kind: "caused",
      note: "叛军西进，先取洛阳，再攻潼关这道唯一的门户。",
    },
    {
      from: "tongguan",
      to: "changanfall",
      kind: "caused",
      note: "潼关一破，长安再无屏障，玄宗出奔、京城易主。",
    },
    {
      from: "changanfall",
      to: "lingwu",
      kind: "caused",
      note: "皇帝出逃让中枢失去权威，太子只能在行在另立旗帜，中央分裂为两套政权。",
    },
    {
      from: "changanfall",
      to: "borrowing",
      kind: "caused",
      note: "中央的兵被自己耗在防务上，仓促之间只能借外族与地方武装平叛。",
    },
    {
      from: "borrowing",
      to: "shiming",
      kind: "enabled",
      note: "借来的兵与地方武装撑起了平叛，也让这些武装在战后获得了无人能制的实力，叛乱因此能死灰复燃。",
    },
    {
      from: "borrowing",
      to: "fanzhen",
      kind: "caused",
      note: "平叛的账最后由中央买单：河朔等地以「有功需赏」为名留兵留赋，藩镇割据由此成为常态。",
    },
    {
      from: "fanzhen",
      to: "jingyuan",
      kind: "triggered",
      note: "藩镇坐大到不交赋税，朝廷必须削藩；而削藩一动，拥兵者只能哗变。",
    },
    {
      from: "jingyuan",
      to: "fanzhen",
      kind: "revealed",
      note: "削藩失败反过来证明了藩镇不可削，中晚唐的割据格局由此定型。",
    },
  ],
};

/** 全部示例课程 */
export const COURSES: ChainCourse[] = [industrialRevolution, anshiRebellion];

/** 按 id 取课程 */
export function courseById(id: string): ChainCourse | undefined {
  return COURSES.find((c) => c.id === id);
}
