import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StarChart from "./ancient-chart";

const GOLDEN_RATIO = 0.618033988749895;

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const [viewportWidth, setViewportWidth] = useState(0);

	useEffect(() => {
		setViewportWidth(window.innerWidth);

		const handleResize = () => {
			setViewportWidth(window.innerWidth);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// 计算图片位置，让图片圆和 StarChart 圆相交
	// StarChart size = viewportWidth * GOLDEN_RATIO * 2
	// 图片半径 = 128px，overlap = 80px 让两圆有较大交集
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<StarChart />
			<div
				className="absolute top-8 h-64 w-64 bg-black rounded-full z-[60]"
				style={{ right: `${imageRight}px` }}
			>
				<img className="h-64 w-64 border-0" src="./icon.png" />
			</div>
		</div>
	);
}
