import { createFileRoute } from "@tanstack/react-router";
import StarChart from "./ancient-chart";

export const Route = createFileRoute("/app")({
	component: AppMain,
});

function AppMain() {
	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{/* Header */}
			<header className="border-b border-border p-6 flex justify-between items-center">
				<h1 className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
					xuan
				</h1>
				<button
					type="button"
					className="text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors"
				>
					个人
				</button>
			</header>

			{/* Main Content */}
			<main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
				<StarChart />
			</main>
		</div>
	);
}
