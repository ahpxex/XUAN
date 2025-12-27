import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
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
	const inFlightRef = useRef(false);
	const abortRef = useRef<AbortController | null>(null);
	const isActiveRef = useRef(true);

	console.log("[App] Component rendered", {
		hasUserForm: !!userForm,
		hasAstrolabe: !!astrolabe,
		palaceReportsCount: palaceReports.length,
		isLoading,
	});

	useEffect(() => {
		return () => {
			isActiveRef.current = false;
			abortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		const hasReports = palaceReports.length > 0;
		console.log("[App] useEffect triggered", {
			hasUserForm: !!userForm,
			hasAstrolabe: !!astrolabe,
			hasReports,
			isLoading,
		});

		// Skip if no data, already loading, or already have reports
		if (!userForm || isLoading || hasReports || inFlightRef.current) {
			console.log("[App] Skipping API call - conditions not met", {
				noUserForm: !userForm,
				isLoading,
				hasReports,
				inFlight: inFlightRef.current,
			});
			return;
		}

		const fetchReports = async () => {
			console.log("[App] Starting fetchReports...");
			inFlightRef.current = true;
			setIsLoading(true);
			const controller = new AbortController();
			abortRef.current?.abort();
			abortRef.current = controller;
			try {
				const resolvedAstrolabe =
					astrolabe ?? generateAstrolabe(userForm);
				if (!astrolabe) {
					setAstrolabe(resolvedAstrolabe);
				}
				const birthInfo = formDataToBirthInfo(userForm);
				console.log("[App] Birth info:", birthInfo);
				const astrolabeData = astrolabeToJSON(resolvedAstrolabe);
				console.log("[App] Astrolabe data (keys):", Object.keys(astrolabeData));
				console.log("[App] Calling analyzePalaces API...");
				const response = await analyzePalaces(
					birthInfo,
					astrolabeData,
					controller.signal,
				);
				console.log("[App] API response:", response);
				if (response.palaces) {
					console.log("[App] Setting palace reports:", response.palaces.length);
					setPalaceReports(response.palaces);
				}
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					console.log("[App] Request aborted");
				} else {
					console.error("[App] Failed to fetch palace reports:", error);
				}
			} finally {
				inFlightRef.current = false;
				if (isActiveRef.current) {
					setIsLoading(false);
				}
			}
		};

		fetchReports();
	}, [
		userForm,
		astrolabe,
		palaceReports.length,
		setAstrolabe,
		setPalaceReports,
		setIsLoading,
	]);

	// Get the current palace report based on index
	const currentReport = palaceReports.find(
		(report) => report.index === currentPalaceIndex,
	);

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart />
			<IconImage />
			<PalaceStamp />

			{/* Loading screen */}
			{isLoading && (
				<div className="fixed inset-0 z-[70] bg-background text-foreground">
					<div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-6">
						<div className="w-full border-2 border-foreground px-8 py-8">
							<div className="text-xs tracking-[0.35em] text-muted-foreground">
								LOADING
							</div>
							<div className="mt-3 text-lg tracking-[0.2em]">
								正在解析命盘
							</div>
							<div className="mt-6 h-2 w-full border-2 border-foreground">
								<div className="h-full w-1/2 animate-pulse bg-foreground" />
							</div>
						</div>
					</div>
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
						<div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed">
							<ReactMarkdown>{currentReport.analysis}</ReactMarkdown>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
