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
			properties:
				'五⾏屬⼟，南⽃主星。化⽓為"賢"或"庫"。主尊貴、權威、領導。為帝星，諸星之首，掌管官祿宮。',
		},
		{
			name: "天府",
			properties:
				'五⾏屬⼟，南⽃主星。化⽓為"令"。主財帛、倉庫、衣食。為財庫之星，掌管田宅財富。',
		},
		{
			name: "天機",
			properties:
				'五⾏屬⽊，南⽃主星。化⽓為"善"。主智慧、謀略、變動。為智慧之星，善於分析思考。',
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
