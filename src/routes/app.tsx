import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
	astrolabeAtom,
	isLoadingReportAtom,
	palaceReportsAtom,
	userFormAtom,
} from "../atoms/ziwei";
import { IconImage } from "../components/icon-image";
import { PalaceStamp } from "../components/palace-stamp";
import LoadingOverlay from "../components/loading-overlay";
import {
	currentPalaceIndexAtom,
	isPalaceAnimatingAtom,
	palaceSwitchDirectionAtom,
} from "../atoms/palace";
import { analyzePalaces, formDataToBirthInfo } from "../lib/api";
import { astrolabeToJSON, generateAstrolabe } from "../lib/astrolabe";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

// Helper function to find the index of Life Palace (命宫)
function findLifePalaceIndex(palaceReports: Array<{ name: string; index: number }>): number {
	const lifePalace = palaceReports.find(
		(report) => report.name === "命宫" || report.name === "命宮"
	);
	return lifePalace?.index ?? 0;
}

function AppMain() {
	const userForm = useAtomValue(userFormAtom);
	const [astrolabe, setAstrolabe] = useAtom(astrolabeAtom);
	const [palaceReports, setPalaceReports] = useAtom(palaceReportsAtom);
	const [isLoading, setIsLoading] = useAtom(isLoadingReportAtom);
	const [currentPalaceIndex, setCurrentPalaceIndex] = useAtom(currentPalaceIndexAtom);
	const setPalaceDirection = useSetAtom(palaceSwitchDirectionAtom);
	const isAnimating = useAtomValue(isPalaceAnimatingAtom);
	const setIsAnimating = useSetAtom(isPalaceAnimatingAtom);
	const [showReport, setShowReport] = useState(false);
	const inFlightRef = useRef(false);
	const abortRef = useRef<AbortController | null>(null);
	const isActiveRef = useRef(true);
	const animatingRef = useRef(false);
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const reportPanelRef = useRef<HTMLDivElement | null>(null);
	const swipeThreshold = 32;

	console.log("[App] Component rendered", {
		hasUserForm: !!userForm,
		hasAstrolabe: !!astrolabe,
		palaceReportsCount: palaceReports.length,
		isLoading,
	});

	useEffect(() => {
		return () => {
			isActiveRef.current = false;
			// Don't abort here - let in-flight request complete
			// The isActiveRef check will prevent stale state updates
		};
	}, []);

	useEffect(() => {
		if (!astrolabe && userForm) {
			setAstrolabe(generateAstrolabe(userForm));
		}
	}, [astrolabe, setAstrolabe, userForm]);

	// Set current palace to Life Palace when reports are loaded
	useEffect(() => {
		if (palaceReports.length > 0) {
			const lifePalaceIndex = findLifePalaceIndex(palaceReports);
			console.log("[App] Setting current palace to Life Palace, index:", lifePalaceIndex);
			setCurrentPalaceIndex(lifePalaceIndex);
		}
	}, [palaceReports, setCurrentPalaceIndex]);

	useEffect(() => {
		// Reset active flag on each effect run (needed for StrictMode remount)
		isActiveRef.current = true;

		const hasReports = palaceReports.length > 0;
		console.log("[App] useEffect triggered", {
			hasUserForm: !!userForm,
			hasAstrolabe: !!astrolabe,
			hasReports,
			isLoading,
			inFlight: inFlightRef.current,
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

		inFlightRef.current = true; // Set synchronously to prevent race condition

		const fetchReports = async () => {
			console.log("[App] Starting fetchReports...");
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
				if (response.palaces && isActiveRef.current) {
					console.log("[App] Setting palace reports:", response.palaces.length);
					setPalaceReports(response.palaces);
				}
				// Only reset inFlightRef on successful completion
				inFlightRef.current = false;
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					console.log("[App] Request aborted (keeping inFlightRef true)");
					// Don't reset inFlightRef on abort - prevents duplicate request on StrictMode remount
				} else {
					console.error("[App] Failed to fetch palace reports:", error);
					inFlightRef.current = false; // Reset on real errors
				}
			} finally {
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

	const switchPalace = useCallback(
		(nextDirection: "up" | "down") => {
			if (animatingRef.current || isAnimating) return;
			animatingRef.current = true;
			setPalaceDirection(nextDirection);
			setIsAnimating(true);
			setCurrentPalaceIndex((prev) => {
				const delta = nextDirection === "up" ? -1 : 1;
				return (prev + delta + 12) % 12;
			});
			window.setTimeout(() => {
				setIsAnimating(false);
				animatingRef.current = false;
			}, 600);
		},
		[isAnimating, setCurrentPalaceIndex, setIsAnimating, setPalaceDirection],
	);

	const isTouchInsideReport = (target: EventTarget | null) => {
		if (!showReport || !target || !reportPanelRef.current) return false;
		return reportPanelRef.current.contains(target as Node);
	};

	// 键盘事件监听
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				switchPalace("up");
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				switchPalace("down");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [switchPalace]);

	const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
		if (event.touches.length !== 1) return;
		if (isTouchInsideReport(event.target)) return;
		const touch = event.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
	};

	const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
		if (isTouchInsideReport(event.target)) return;
		const start = touchStartRef.current;
		if (!start || event.changedTouches.length === 0) return;
		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - start.x;
		const deltaY = touch.clientY - start.y;
		touchStartRef.current = null;

		if (Math.abs(deltaY) < swipeThreshold || Math.abs(deltaY) < Math.abs(deltaX)) {
			return;
		}

		if (deltaY < 0) {
			switchPalace("up");
		} else {
			switchPalace("down");
		}
	};

	const handleTouchCancel = () => {
		touchStartRef.current = null;
	};

	// Get the current palace report based on index
	const currentReport = palaceReports.find(
		(report) => report.index === currentPalaceIndex,
	);

	// 如果正在加载，只显示 LoadingOverlay
	if (isLoading) {
		return <LoadingOverlay isLoading={true} />;
	}

	return (
		<div
			className="relative min-h-screen bg-background text-foreground overflow-hidden"
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchCancel}
		>
			<StarChart />
			<IconImage />
			<PalaceStamp />

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
				<div
					ref={reportPanelRef}
					className="fixed inset-y-0 left-0 w-full max-w-md bg-background/95 backdrop-blur border-r border-border overflow-y-auto z-50"
				>
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
