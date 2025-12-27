import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type Shichen =
	| "zi"
	| "chou"
	| "yin"
	| "mao"
	| "chen"
	| "si"
	| "wu"
	| "wei"
	| "shen"
	| "you"
	| "xu"
	| "hai";

export interface BirthInfo {
	name?: string;
	gender: "male" | "female";
	birthYear: number;
	birthMonth: number;
	birthDay: number;
	birthShichen: Shichen;
	calendarType: "solar" | "lunar";
	isLeapMonth?: boolean;
}

const fallbackStorage: Storage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
	clear: () => {},
	key: () => null,
	length: 0,
};

const storage = createJSONStorage<unknown>(() =>
	typeof window === "undefined" ? fallbackStorage : localStorage,
);

export const birthInfoAtom = atomWithStorage<BirthInfo | null>(
	"xuan.birthInfo",
	null,
	storage,
);

export const astrolabeAtom = atomWithStorage<Record<string, unknown> | null>(
	"xuan.astrolabe",
	null,
	storage,
);
