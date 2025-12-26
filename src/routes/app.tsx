import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IconImage } from "../components/icon-image";
import { SealStamp } from "../components/seal-stamp";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const [currentIndex, setCurrentIndex] = useState(2);

	const handleIndexChange = (newIndex: number) => {
		setCurrentIndex(newIndex);
	};

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart currentIndex={currentIndex} />
			<IconImage index={currentIndex} onIndexChange={handleIndexChange} />
			<SealStamp text="夫妻宫" />
		</div>
	);
}
