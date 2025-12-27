import { astro } from "iztro";
import type { Astrolabe } from "./iztro-types";
import type { UserFormData } from "../atoms/ziwei";

// Map shichen value to index (0-11)
const SHICHEN_INDEX: Record<string, number> = {
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

/**
 * Generate Astrolabe from user form data using iztro
 */
export function generateAstrolabe(
	formData: UserFormData,
): Astrolabe {
	const dateStr = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
	const timeIndex = SHICHEN_INDEX[formData.birthShichen] ?? 0;
	const gender = formData.gender === "male" ? "男" : "女";

	return astro.bySolar(dateStr, timeIndex, gender, true, "zh-CN");
}

/**
 * Convert Astrolabe to a plain object for API submission
 */
export function astrolabeToJSON(astrolabe: Astrolabe): object {
	return JSON.parse(JSON.stringify(astrolabe));
}
