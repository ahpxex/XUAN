import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FunctionalAstrolabe } from "iztro/lib/astro/FunctionalAstrolabe";
import type { PalaceReport } from "../lib/api";

export interface UserFormData {
	name: string;
	gender: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	birthShichen: string;
}

// Store user form data with localStorage persistence
export const userFormAtom = atomWithStorage<UserFormData | null>(
	"xuan-user-form",
	null,
);

// Store computed astrolabe from iztro (not persisted - regenerated from form data)
export const astrolabeAtom = atom<FunctionalAstrolabe | null>(null);

// Store AI report from backend (simple overview)
export const aiReportAtom = atom<string | null>(null);

// Store palace reports from backend (detailed 12 palace analysis)
export const palaceReportsAtom = atomWithStorage<PalaceReport[]>(
	"xuan-palace-reports",
	[],
);

// Loading state for API calls
export const isLoadingReportAtom = atom(false);
