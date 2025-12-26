import { atom } from "jotai";

export const GOLDEN_RATIO = 0.618033988749895;

export const viewportWidthAtom = atom(0);

// 12 地支
export const EARTHLY_BRANCHES = [
	"子",
	"丑",
	"寅",
	"卯",
	"辰",
	"巳",
	"午",
	"未",
	"申",
	"酉",
	"戌",
	"亥",
];

// 当前选中的地支索引
export const currentBranchIndexAtom = atom(4);

// 切换方向
export const switchDirectionAtom = atom<"up" | "down">("down");

// 动画进行中状态
export const isAnimatingAtom = atom(false);

// 派生 atom：当前地支文字
export const currentBranchAtom = atom((get) => {
	const index = get(currentBranchIndexAtom);
	return EARTHLY_BRANCHES[index];
});
