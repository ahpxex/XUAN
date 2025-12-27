const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface MeiwenLineHidden {
	relation: string;
	branch: string;
	element: string;
	note?: string;
}

export interface MeiwenHexagramLine {
	position: number;
	val?: number;
	ying_yang?: "Yin" | "Yang";
	changing?: boolean;
	six_god?: string;
	relation: string;
	branch: string;
	element: string;
	role?: string | null;
	hidden?: MeiwenLineHidden | null;
}

export interface MeiwenHexagram {
	base: {
		name: string;
		palace_name: string;
		palace_element?: string;
		lines: MeiwenHexagramLine[];
	};
	changed?: {
		name: string;
		palace_name: string;
		lines: MeiwenHexagramLine[];
	} | null;
}

export interface MeiwenAIAnalysis {
	question: string;
	response: string;
	is_mock: boolean;
}

export interface MeiwenCastResponse {
	meta: {
		timestamp: string;
		method: string;
	};
	time_construct: {
		year: { gan_zhi: string };
		month: { gan_zhi: string };
		day: { gan_zhi: string };
		hour: { gan_zhi: string };
		kong_wang: { day: string[] | string };
	};
	hexagram: MeiwenHexagram;
	raw_najia: Record<string, unknown>;
	ai_analysis?: MeiwenAIAnalysis;
}

export async function castMeiwen(
	question: string,
	signal?: AbortSignal,
): Promise<MeiwenCastResponse> {
	const response = await fetch(`${API_BASE}/meiwen/cast`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		signal,
		body: JSON.stringify({ question }),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`API error: ${response.status} - ${errorText}`);
	}

	return response.json();
}
