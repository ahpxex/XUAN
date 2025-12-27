import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IconImage } from "../components/icon-image";
import { PalaceStamp } from "../components/palace-stamp";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	const [currentIndex, setCurrentIndex] = useState(2);

	const handleIndexChange = (newIndex: number) => {
		setCurrentIndex(newIndex);
	};

	// 示例星数据 - 每个星占一列
	const exampleStars = [
		{
			name: "紫微",
			properties: '五⾏屬⼟，南⽃主星。化⽓為"賢"或"庫"。',
		},
		{
			name: "天府",
			properties: '五⾏屬⼟，南⽃主星。化⽓為"令"。',
		},
		{
			name: "天機",
			properties: '五⾏屬⽊，南⽃主星。化⽓為"善"。',
		},
	];

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart currentIndex={currentIndex} />
			<IconImage index={currentIndex} onIndexChange={handleIndexChange} />
			<PalaceStamp text="夫妻宮" stars={exampleStars} />
		</div>
	);
}
