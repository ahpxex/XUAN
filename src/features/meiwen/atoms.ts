import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { MeiwenCastResponse } from "@/lib/meiwen-api";

export type MeiwenView = "input" | "result";

export const meiwenQuestionAtom = atomWithStorage<string>(
	"xuan-meiwen-question",
	"",
);

export const meiwenResultAtom = atomWithStorage<MeiwenCastResponse | null>(
	"xuan-meiwen-result",
	null,
);

export const meiwenViewAtom = atomWithStorage<MeiwenView>(
	"xuan-meiwen-view",
	"input",
);

export const meiwenLoadingAtom = atom(false);
