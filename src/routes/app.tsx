import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { EARTHLY_BRANCHES } from "../atoms/viewport";
import { birthInfoAtom, astrolabeAtom } from "../atoms/ziwei";
import { IconImage } from "../components/icon-image";
import { SealStamp } from "../components/seal-stamp";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const [currentIndex, setCurrentIndex] = useState(2);
	const birthInfo = useAtomValue(birthInfoAtom);
	const astrolabe = useAtomValue(astrolabeAtom);
	const astrolabeData = astrolabe as any;
	const palaces = Array.isArray(astrolabeData?.palaces)
		? astrolabeData.palaces
		: [];
	const currentBranch = EARTHLY_BRANCHES[currentIndex];

	const handleIndexChange = (newIndex: number) => {
		setCurrentIndex(newIndex);
	};

	if (!astrolabeData) {
		return (
			<div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
				<div className="border-2 border-border p-8 max-w-md text-center space-y-4">
					<p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
						No Chart
					</p>
					<p className="text-lg">请先生成星盘</p>
					<Link
						to="/"
						className="inline-block px-6 py-3 border-2 border-foreground text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
					>
						返回
					</Link>
				</div>
			</div>
		);
	}

	const selectedPalace = palaces.find(
		(palace: any) => palace?.earthlyBranch === currentBranch,
	);
	const majorStars = selectedPalace?.majorStars?.length
		? selectedPalace.majorStars.map((star: any) => star.name).join("、")
		: "无";
	const minorStars = selectedPalace?.minorStars?.length
		? selectedPalace.minorStars.map((star: any) => star.name).join("、")
		: "无";
	const birthDate = birthInfo
		? `${birthInfo.birthYear}-${birthInfo.birthMonth}-${birthInfo.birthDay}`
		: "--";

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart currentIndex={currentIndex} />
			<IconImage index={currentIndex} onIndexChange={handleIndexChange} />
			<SealStamp text={selectedPalace?.name ?? "命宫"} />
			<div className="absolute bottom-8 left-8 z-[60] w-[320px] border-2 border-border bg-black/80 p-6 text-sm">
				<div className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
					chart overview
				</div>
				<div className="mt-4 space-y-3">
					<div className="flex justify-between">
						<span className="text-muted-foreground tracking-[0.2em]">
							姓名
						</span>
						<span>{birthInfo?.name || "未填写"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground tracking-[0.2em]">
							日期
						</span>
						<span>{birthDate}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground tracking-[0.2em]">
							五行局
						</span>
						<span>{astrolabeData?.fiveElementsClass ?? "--"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground tracking-[0.2em]">
							本宫
						</span>
						<span>{selectedPalace?.name ?? "--"}</span>
					</div>
					<div>
						<div className="text-muted-foreground tracking-[0.2em]">
							主星
						</div>
						<div className="mt-1">{majorStars}</div>
					</div>
					<div>
						<div className="text-muted-foreground tracking-[0.2em]">
							辅星
						</div>
						<div className="mt-1">{minorStars}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
