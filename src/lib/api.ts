import type { BirthInfo } from "../atoms/ziwei";

const API_BASE =
	import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function submitAstrolabe(payload: {
	birthInfo: BirthInfo;
	astrolabe: Record<string, unknown>;
}): Promise<void> {
	const response = await fetch(`${API_BASE}/ziwei/astrolabe`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Astrolabe request failed: ${response.status}`);
	}
}
