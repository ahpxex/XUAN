import type { UserFormData } from "../atoms/ziwei";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface BirthInfo {
	name?: string;
	gender: "male" | "female";
	birthYear: number;
	birthMonth: number;
	birthDay: number;
	birthShichen: string;
	calendarType?: "solar" | "lunar";
	isLeapMonth?: boolean;
}

export interface AstrolabeSubmitRequest {
	birthInfo: BirthInfo;
	astrolabe: object;
}

export interface AstrolabeResponse {
	astrolabe: object;
	report?: string;
}

export interface PalaceReport {
	name: string;
	index: number;
	analysis: string;
}

export interface PalaceAnalysisResponse {
	palaces: PalaceReport[];
}

/**
 * Convert UserFormData to BirthInfo for API
 */
export function formDataToBirthInfo(formData: UserFormData): BirthInfo {
	return {
		name: formData.name || undefined,
		gender: formData.gender === "male" ? "male" : "female",
		birthYear: parseInt(formData.birthYear, 10),
		birthMonth: parseInt(formData.birthMonth, 10),
		birthDay: parseInt(formData.birthDay, 10),
		birthShichen: formData.birthShichen,
		calendarType: "solar",
	};
}

/**
 * Submit astrolabe to backend for AI analysis
 */
export async function submitAstrolabe(
	birthInfo: BirthInfo,
	astrolabe: object,
): Promise<AstrolabeResponse> {
	const response = await fetch(`${API_BASE}/ziwei/astrolabe`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			birthInfo,
			astrolabe,
		}),
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	return response.json();
}

/**
 * Analyze all 12 palaces and get detailed reports
 */
export async function analyzePalaces(
	birthInfo: BirthInfo,
	astrolabe: object,
): Promise<PalaceAnalysisResponse> {
	const url = `${API_BASE}/ziwei/analyze-palaces`;
	console.log("[API] analyzePalaces called", { url, birthInfo });

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			birthInfo,
			astrolabe,
		}),
	});

	console.log("[API] Response status:", response.status, response.statusText);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("[API] Error response:", errorText);
		throw new Error(`API error: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	console.log("[API] Response data:", data);
	return data;
}
