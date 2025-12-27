import { createFileRoute } from "@tanstack/react-router";
import { IconImage } from "../components/icon-image";
import { PalaceStamp } from "../components/palace-stamp";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-hidden">
			<StarChart />
			<IconImage />
			<PalaceStamp />
		</div>
	);
}
