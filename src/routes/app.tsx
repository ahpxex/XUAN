import { createFileRoute } from "@tanstack/react-router";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<StarChart />
		</div>
	);
}
