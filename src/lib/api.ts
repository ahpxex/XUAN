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
