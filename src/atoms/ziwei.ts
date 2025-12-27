import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FunctionalAstrolabe } from "iztro/lib/astro/FunctionalAstrolabe";

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

// Store AI report from backend
export const aiReportAtom = atom<string | null>(null);

// Loading state for API calls
export const isLoadingReportAtom = atom(false);
