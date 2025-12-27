import { atom } from "jotai";
import { STAR_DESCRIPTIONS } from "../lib/star-descriptions";
import { astrolabeAtom, palaceReportsAtom } from "./ziwei";

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

// 派生 atom：当前宫位名称（从 palaceReports 获取）
export const currentPalaceNameAtom = atom((get) => {
	const currentIndex = get(currentPalaceIndexAtom);
	const palaceReports = get(palaceReportsAtom);

	// 从 palaceReports 中找到对应的报告
	const report = palaceReports.find((r) => r.index === currentIndex);
	return report?.name || "未知";
});

// 派生 atom：当前宫位星曜（从 astrolabe 获取）
export const currentPalaceStarsAtom = atom((get) => {
	const currentIndex = get(currentPalaceIndexAtom);
	const astrolabe = get(astrolabeAtom);

	if (!astrolabe || !astrolabe.palaces) {
		return [];
	}

	const palace = astrolabe.palaces[currentIndex];
	if (!palace) {
		return [];
	}

	const stars: Star[] = [];

	// 只提取主星，并添加说明
	if (palace.majorStars && Array.isArray(palace.majorStars)) {
		for (const star of palace.majorStars) {
			if (star.name) {
				// 获取星的说明
				const description = STAR_DESCRIPTIONS[star.name] || "";

				// 组合亮度和说明
				const brightnessAndMutagen = [star.brightness, star.mutagen]
					.filter(Boolean)
					.join("");

				const properties = brightnessAndMutagen
					? `${brightnessAndMutagen} ${description}`
					: description;

				stars.push({
					name: star.name,
					properties: properties.trim(),
				});
			}
		}
	}

	return stars;
});
