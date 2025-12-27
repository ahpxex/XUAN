import { atom } from "jotai";

export interface Star {
	name: string;
	properties: string;
}

export interface Palace {
	name: string;
	stars: Star[];
}

// 12 宫位数据
export const PALACES: Palace[] = [
	{
		name: "命宮",
		stars: [
			{
				name: "紫微",
				properties:
					'五行屬土，北斗主星。化氣為"尊"。主尊貴、權威、領導。為帝星，諸星之首，掌管官祿宮。',
			},
			{
				name: "天府",
				properties:
					'五行屬土，南斗主星。化氣為"令"。主財帛、倉庫、衣食。為財庫之星，掌管田宅財富。',
			},
		],
	},
	{
		name: "兄弟宮",
		stars: [
			{
				name: "天機",
				properties:
					'五行屬木，南斗主星。化氣為"善"。主智慧、謀略、變動。為智慧之星，善於分析思考。',
			},
		],
	},
	{
		name: "夫妻宮",
		stars: [
			{
				name: "太陽",
				properties:
					'五行屬火，中天主星。化氣為"貴"。主光明、博愛、權貴。為日之精，照耀萬物，主官祿名聲。',
			},
			{
				name: "太陰",
				properties:
					'五行屬水，中天主星。化氣為"富"。主財帛、田宅、清秀。為月之精，主陰柔之美，掌管財富。',
			},
		],
	},
	{
		name: "子女宮",
		stars: [
			{
				name: "武曲",
				properties:
					'五行屬金，北斗主星。化氣為"財"。主財帛、剛毅、決斷。為財星，主正財，性剛果斷。',
			},
		],
	},
	{
		name: "財帛宮",
		stars: [
			{
				name: "天同",
				properties:
					'五行屬水，南斗主星。化氣為"福"。主福德、安逸、享受。為福星，性溫和，主安樂。',
			},
			{
				name: "天梁",
				properties:
					'五行屬土，南斗主星。化氣為"蔭"。主蔭庇、清高、壽考。為蔭星，主貴人扶助。',
			},
		],
	},
	{
		name: "疾厄宮",
		stars: [
			{
				name: "廉貞",
				properties:
					'五行屬火，北斗主星。化氣為"囚"。主感情、是非、桃花。為次桃花星，性複雜多變。',
			},
		],
	},
	{
		name: "遷移宮",
		stars: [
			{
				name: "貪狼",
				properties:
					'五行屬木，北斗主星。化氣為"桃花"。主慾望、才藝、桃花。為正桃花星，多才多藝。',
			},
			{
				name: "破軍",
				properties:
					'五行屬水，北斗主星。化氣為"耗"。主破壞、開創、變動。為先鋒星，主變革創新。',
			},
		],
	},
	{
		name: "僕役宮",
		stars: [
			{
				name: "巨門",
				properties:
					'五行屬水，北斗主星。化氣為"暗"。主口才、是非、研究。為暗星，主口舌，善辯論。',
			},
		],
	},
	{
		name: "官祿宮",
		stars: [
			{
				name: "天相",
				properties:
					'五行屬水，南斗主星。化氣為"印"。主輔佐、衣食、印信。為印星，主官印，善協調。',
			},
			{
				name: "七殺",
				properties:
					'五行屬金，南斗主星。化氣為"將"。主威權、殺伐、孤獨。為將星，主權威，性剛強。',
			},
		],
	},
	{
		name: "田宅宮",
		stars: [
			{
				name: "左輔",
				properties:
					"五行屬土，中天助星。主輔助、貴人、人緣。為左輔星，主善緣，助力強。",
			},
			{
				name: "右弼",
				properties:
					"五行屬水，中天助星。主輔助、貴人、人緣。為右弼星，主善緣，助力強。",
			},
		],
	},
	{
		name: "福德宮",
		stars: [
			{
				name: "文昌",
				properties:
					"五行屬金，南斗助星。主文才、科甲、聰明。為科甲星，主文章，利考試。",
			},
			{
				name: "文曲",
				properties:
					"五行屬水，北斗助星。主文藝、才華、異路。為才藝星，主藝術，善表達。",
			},
		],
	},
	{
		name: "父母宮",
		stars: [
			{
				name: "天魁",
				properties:
					"五行屬火，南斗助星。主貴人、機遇、陽貴。為陽貴星，主男性貴人扶助。",
			},
			{
				name: "天鉞",
				properties:
					"五行屬火，南斗助星。主貴人、機遇、陰貴。為陰貴星，主女性貴人扶助。",
			},
		],
	},
];

// 当前宫位索引
export const currentPalaceIndexAtom = atom(0);

// 切换方向
export const palaceSwitchDirectionAtom = atom<"up" | "down">("down");

// 动画进行中状态
export const isPalaceAnimatingAtom = atom(false);

// 派生 atom：当前宫位
export const currentPalaceAtom = atom((get) => {
	const index = get(currentPalaceIndexAtom);
	return PALACES[index];
});

// 派生 atom：当前宫位名称
export const currentPalaceNameAtom = atom((get) => {
	return get(currentPalaceAtom).name;
});

// 派生 atom：当前宫位星曜
export const currentPalaceStarsAtom = atom((get) => {
	return get(currentPalaceAtom).stars;
});
