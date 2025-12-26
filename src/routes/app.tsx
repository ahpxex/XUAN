import { createFileRoute } from "@tanstack/react-router";
import { IconImage } from "../components/icon-image";
import { SealStamp } from "../components/seal-stamp";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<StarChart />
			<IconImage index={2} />
			<SealStamp text="夫妻宫" />
		</div>
	);
}
