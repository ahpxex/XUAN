import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import {
	aiReportAtom,
	astrolabeAtom,
	isLoadingReportAtom,
	userFormAtom,
} from "../atoms/ziwei";
import { IconImage } from "../components/icon-image";
import { PalaceStamp } from "../components/palace-stamp";
import { formDataToBirthInfo, submitAstrolabe } from "../lib/api";
import { astrolabeToJSON } from "../lib/astrolabe";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const userForm = useAtomValue(userFormAtom);
	const astrolabe = useAtomValue(astrolabeAtom);
	const [aiReport, setAiReport] = useAtom(aiReportAtom);
	const [isLoading, setIsLoading] = useAtom(isLoadingReportAtom);

	useEffect(() => {
		// Skip if no data or already have a report
		if (!userForm || !astrolabe || aiReport) return;

		const fetchReport = async () => {
			setIsLoading(true);
			try {
				const birthInfo = formDataToBirthInfo(userForm);
				const astrolabeData = astrolabeToJSON(astrolabe);
				const response = await submitAstrolabe(birthInfo, astrolabeData);
				if (response.report) {
					setAiReport(response.report);
				}
			} catch (error) {
				console.error("Failed to fetch AI report:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchReport();
	}, [userForm, astrolabe, aiReport, setAiReport, setIsLoading]);

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart />
			<IconImage />
			<PalaceStamp />

			{/* Loading indicator */}
			{isLoading && (
				<div className="fixed bottom-6 left-6 text-xs text-muted-foreground tracking-wide">
					AI analyzing...
				</div>
			)}

			{/* AI Report display */}
			{aiReport && (
				<div className="fixed bottom-6 left-6 max-w-sm p-4 border border-border bg-background/80 backdrop-blur">
					<h3 className="text-xs tracking-[0.15em] text-muted-foreground mb-2">
						AI INSIGHT
					</h3>
					<p className="text-sm leading-relaxed">{aiReport}</p>
				</div>
			)}
		</div>
	);
}
