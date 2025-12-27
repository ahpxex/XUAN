import { atom } from "jotai";
import { astrolabeAtom } from "./ziwei";

export interface Star {
	name: string;
	properties: string;
}

export interface Palace {
	name: string;
	stars: Star[];
}

// 当前宫位索引
export const currentPalaceIndexAtom = atom(0);

// 切换方向
export const palaceSwitchDirectionAtom = atom<"up" | "down">("down");

// 动画进行中状态
export const isPalaceAnimatingAtom = atom(false);

// 派生 atom：从 astrolabe 获取当前宫位
export const currentPalaceAtom = atom((get) => {
	const index = get(currentPalaceIndexAtom);
	const astrolabe = get(astrolabeAtom);

	if (!astrolabe || !astrolabe.palaces || !astrolabe.palaces[index]) {
		// Fallback to default
		return {
			name: "未知",
			stars: [],
		};
	}

	const palace = astrolabe.palaces[index];
	return {
		name: palace.name || "未知",
		stars: [],
	};
});

// 派生 atom：当前宫位名称
export const currentPalaceNameAtom = atom((get) => {
	return get(currentPalaceAtom).name;
});

// 派生 atom：当前宫位星曜（从 astrolabe 获取）
export const currentPalaceStarsAtom = atom((get) => {
	const index = get(currentPalaceIndexAtom);
	const astrolabe = get(astrolabeAtom);

	if (!astrolabe || !astrolabe.palaces || !astrolabe.palaces[index]) {
		return [];
	}

	const palace = astrolabe.palaces[index];
	const stars: Star[] = [];

	// 从 astrolabe 中提取主星
	if (palace.majorStars && Array.isArray(palace.majorStars)) {
		for (const star of palace.majorStars) {
			if (star.name) {
				stars.push({
					name: star.name,
					properties: star.brightness || "",
				});
			}
		}
	}

	// 可以根据需要添加辅星等其他星曜

	return stars;
});
