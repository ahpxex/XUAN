import { astro } from "iztro";
import type { BirthInfo } from "../atoms/ziwei";

const SHICHEN_TO_INDEX: Record<BirthInfo["birthShichen"], number> = {
	zi: 0,
	chou: 1,
	yin: 2,
	mao: 3,
	chen: 4,
	si: 5,
	wu: 6,
	wei: 7,
	shen: 8,
	you: 9,
	xu: 10,
	hai: 11,
};

const GENDER_LABEL: Record<BirthInfo["gender"], "男" | "女"> = {
	male: "男",
	female: "女",
};

export function buildAstrolabe(birthInfo: BirthInfo) {
	const dateStr = `${birthInfo.birthYear}-${String(birthInfo.birthMonth).padStart(2, "0")}-${String(
		birthInfo.birthDay,
	).padStart(2, "0")}`;
	const timeIndex = SHICHEN_TO_INDEX[birthInfo.birthShichen];
	const genderLabel = GENDER_LABEL[birthInfo.gender];
	const fixLeap = true;

	if (birthInfo.calendarType === "lunar") {
		return astro.byLunar(
			dateStr,
			timeIndex,
			genderLabel,
			Boolean(birthInfo.isLeapMonth),
			fixLeap,
			"zh-CN",
		);
	}

	return astro.bySolar(dateStr, timeIndex, genderLabel, fixLeap, "zh-CN");
}
