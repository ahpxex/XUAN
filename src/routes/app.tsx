import { createFileRoute } from "@tanstack/react-router";

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
				<div className="max-w-md w-full space-y-12 text-center">
					<div className="space-y-4">
						<h2 className="text-3xl font-light">欢迎</h2>
						<p className="text-muted-foreground text-sm leading-relaxed">
							您的自我探索之旅从这里开始。探索古老的智慧，更深入地了解自己。
						</p>
					</div>

					<div className="grid gap-4">
						<button
							type="button"
							className="w-full p-6 border-2 border-border hover:border-foreground text-left transition-colors group"
						>
							<span className="text-xs tracking-[0.2em] text-muted-foreground block mb-2">
								八字
							</span>
							<span className="text-lg font-light group-hover:text-foreground transition-colors">
								四柱命理
							</span>
						</button>

						<button
							type="button"
							className="w-full p-6 border-2 border-border hover:border-foreground text-left transition-colors group"
						>
							<span className="text-xs tracking-[0.2em] text-muted-foreground block mb-2">
								紫微
							</span>
							<span className="text-lg font-light group-hover:text-foreground transition-colors">
								紫微斗数
							</span>
						</button>

						<button
							type="button"
							className="w-full p-6 border-2 border-border hover:border-foreground text-left transition-colors group"
						>
							<span className="text-xs tracking-[0.2em] text-muted-foreground block mb-2">
								奇门
							</span>
							<span className="text-lg font-light group-hover:text-foreground transition-colors">
								奇门遁甲
							</span>
						</button>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border p-6">
				<p className="text-center text-xs text-muted-foreground">
					更深入地了解自己
				</p>
			</footer>
		</div>
	);
}
