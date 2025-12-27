import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import LoadingOverlay from "../components/loading-overlay";

export const Route = createFileRoute("/test")({
	component: TestPage,
});

function TestPage() {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
			<LoadingOverlay isLoading={isLoading} />

			{/* 控制面板 */}
			<div className="fixed top-8 left-8 z-[200] bg-black/80 backdrop-blur border border-white/20 p-6 rounded-lg">
				<h2 className="text-white text-xl mb-4 tracking-wider">
					Loading Overlay Test
				</h2>

				<div className="space-y-4">
					<button
						type="button"
						onClick={() => setIsLoading(!isLoading)}
						className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors tracking-wide"
					>
						{isLoading ? "Hide Loading" : "Show Loading"}
					</button>

					<div className="text-white/60 text-sm space-y-2">
						<p>• 150 star trails with rough texture</p>
						<p>• Breathing opacity effect</p>
						<p>• Center icon rotating (120s)</p>
						<p>• Auto-switching mystical texts</p>
					</div>
				</div>
			</div>

			{/* 背景内容（当不加载时显示） */}
			{!isLoading && (
				<div className="text-center text-white space-y-6">
					<h1 className="text-4xl font-light tracking-[0.3em]">TEST PAGE</h1>
					<p className="text-white/60 tracking-wide">
						Click the button above to toggle loading overlay
					</p>
				</div>
			)}
		</div>
	);
}
