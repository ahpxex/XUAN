import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	astrolabeAtom,
	isLoadingReportAtom,
	palaceReportsAtom,
	userFormAtom,
} from "../atoms/ziwei";
import { IconImage } from "../components/icon-image";
import { PalaceStamp } from "../components/palace-stamp";
import { currentPalaceIndexAtom } from "../atoms/palace";
import { analyzePalaces, formDataToBirthInfo } from "../lib/api";
import { astrolabeToJSON, generateAstrolabe } from "../lib/astrolabe";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const userForm = useAtomValue(userFormAtom);
	const [astrolabe, setAstrolabe] = useAtom(astrolabeAtom);
	const [palaceReports, setPalaceReports] = useAtom(palaceReportsAtom);
	const [isLoading, setIsLoading] = useAtom(isLoadingReportAtom);
	const currentPalaceIndex = useAtomValue(currentPalaceIndexAtom);
	const [showReport, setShowReport] = useState(false);

	// Regenerate astrolabe from userForm if it's not set (e.g., after page refresh)
	useEffect(() => {
		if (userForm && !astrolabe) {
			console.log("[App] Regenerating astrolabe from userForm");
			const newAstrolabe = generateAstrolabe(userForm);
			setAstrolabe(newAstrolabe);
		}
	}, [userForm, astrolabe, setAstrolabe]);

	console.log("[App] Component rendered", {
		hasUserForm: !!userForm,
		hasAstrolabe: !!astrolabe,
		palaceReportsCount: palaceReports.length,
		isLoading,
	});

	useEffect(() => {
		console.log("[App] useEffect triggered", {
			hasUserForm: !!userForm,
			hasAstrolabe: !!astrolabe,
			palaceReportsCount: palaceReports.length,
			isLoading,
		});

		// Skip if no data, already loading, or already have reports
		if (!userForm || !astrolabe || isLoading || palaceReports.length > 0) {
			console.log("[App] Skipping API call - conditions not met", {
				noUserForm: !userForm,
				noAstrolabe: !astrolabe,
				isLoading,
				hasReports: palaceReports.length > 0,
			});
			return;
		}

		const fetchReports = async () => {
			console.log("[App] Starting fetchReports...");
			setIsLoading(true);
			try {
				const birthInfo = formDataToBirthInfo(userForm);
				console.log("[App] Birth info:", birthInfo);
				const astrolabeData = astrolabeToJSON(astrolabe);
				console.log("[App] Astrolabe data (keys):", Object.keys(astrolabeData));
				console.log("[App] Calling analyzePalaces API...");
				const response = await analyzePalaces(birthInfo, astrolabeData);
				console.log("[App] API response:", response);
				if (response.palaces) {
					console.log("[App] Setting palace reports:", response.palaces.length);
					setPalaceReports(response.palaces);
				}
			} catch (error) {
				console.error("[App] Failed to fetch palace reports:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchReports();
	}, [userForm, astrolabe, palaceReports, isLoading, setPalaceReports, setIsLoading]);

	// Get the current palace report based on index
	const currentReport = palaceReports.find(
		(report) => report.index === currentPalaceIndex,
	);

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart />
			<IconImage />
			<PalaceStamp />

			{/* Loading indicator */}
			{isLoading && (
				<div className="fixed bottom-6 left-6 text-xs text-muted-foreground tracking-wide">
					AI analyzing palaces...
				</div>
			)}

			{/* Toggle button for report panel */}
			{currentReport && !showReport && (
				<button
					type="button"
					onClick={() => setShowReport(true)}
					className="fixed bottom-6 left-6 px-4 py-2 text-xs tracking-[0.15em] border border-border bg-background/80 backdrop-blur hover:bg-accent transition-colors"
				>
					VIEW REPORT
				</button>
			)}

			{/* Palace Report Panel */}
			{showReport && currentReport && (
				<div className="fixed inset-y-0 left-0 w-full max-w-md bg-background/95 backdrop-blur border-r border-border overflow-y-auto z-50">
					<div className="sticky top-0 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b border-border">
						<h3 className="text-xs tracking-[0.15em] text-muted-foreground">
							{currentReport.name}
						</h3>
						<button
							type="button"
							onClick={() => setShowReport(false)}
							className="text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
						>
							CLOSE
						</button>
					</div>
					<div className="p-4">
						<div className="prose prose-sm prose-invert max-w-none">
							<div
								className="text-sm leading-relaxed whitespace-pre-wrap"
								// biome-ignore lint: markdown content
								dangerouslySetInnerHTML={{
									__html: currentReport.analysis
										.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
										.replace(/\n/g, "<br />"),
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
