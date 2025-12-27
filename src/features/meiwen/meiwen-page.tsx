import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MeiwenHexagramLine } from "@/lib/meiwen-api";
import { castMeiwen } from "@/lib/meiwen-api";
import { meiwenQuestionAtom, meiwenResultAtom, meiwenViewAtom } from "./atoms";

const LOADING_MESSAGES = [
	"请在心中默想问题...",
	"正在将硬币抛向空中...",
	"正在排卦...",
	"正在翻阅古籍...",
	"正在解读卦象...",
];

const MIN_LOADING_TIME = 4500;
const LOADING_INTERVAL = 2000;

function cleanAiText(text: string) {
	return text
		.replace(/\*\*(.*?)\*\*/g, "$1")
		.replace(/__(.*?)__/g, "$1")
		.replace(/^\s*#+\s+/gm, "")
		.replace(/`{3,}[\s\S]*?`{3,}/g, "[Code Block]")
		.replace(/`(.*?)`/g, "$1")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function LoadingOverlay({ message }: { message: string }) {
	return (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
			<div className="h-[320px] w-[320px] overflow-hidden rounded-full shadow-[0_0_40px_rgba(255,215,0,0.4)] flex items-center justify-center">
				<img
					src="/icon.png"
					alt="Loading"
					className="h-full w-full object-contain animate-[spin_12s_linear_infinite]"
					draggable={false}
				/>
			</div>
			<div className="mt-12 text-center text-xl tracking-[0.35em] text-foreground/80">
				{message}
			</div>
		</div>
	);
}

function LineRow({
	line,
	isVariant,
}: {
	line: MeiwenHexagramLine;
	isVariant: boolean;
}) {
	const yingYang = line.ying_yang ?? "Yang";
	const isYin = yingYang === "Yin";
	const dot = line.changing ? (isYin ? "✕" : "○") : "";

	return (
		<div className="flex h-8 items-center">
			<div
				className={`grid items-center gap-2 text-center text-xs text-muted-foreground md:text-sm ${
					isVariant
						? "grid-cols-[90px]"
						: "grid-cols-[35px_85px_85px] md:grid-cols-[35px_85px_85px]"
				}`}
			>
				{!isVariant && (
					<span className="font-semibold text-muted-foreground/70">
						{line.six_god || ""}
					</span>
				)}
				{!isVariant && (
					<span className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/60">
						{line.hidden
							? `${line.hidden.relation} ${line.hidden.branch}${line.hidden.element}`
							: ""}
					</span>
				)}
				<span className="flex items-center justify-center gap-1 font-semibold text-foreground">
					{line.relation} {line.branch}
					{line.element}
				</span>
			</div>

			<div className="relative ml-4 flex h-full w-full max-w-[120px] items-center md:w-[120px]">
				{isYin ? (
					<div className="flex h-1 w-full gap-2">
						<div className="h-1 flex-1 bg-foreground" />
						<div className="h-1 flex-1 bg-foreground" />
					</div>
				) : (
					<div className="h-1 w-full bg-foreground" />
				)}

				<div className="absolute -right-8 flex w-12 items-center gap-2 text-sm text-muted-foreground md:-right-14 md:w-14">
					<span className="w-4 text-center">{dot}</span>
					{line.role ? (
						<span className="border border-red-400 px-1 text-xs leading-none text-red-400">
							{line.role}
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default function MeiwenPage() {
	const [question, setQuestion] = useAtom(meiwenQuestionAtom);
	const [result, setResult] = useAtom(meiwenResultAtom);
	const [view, setView] = useAtom(meiwenViewAtom);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingIndex, setLoadingIndex] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<number | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				window.clearInterval(intervalRef.current);
			}
			abortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		if (view === "result" && !result) {
			setView("input");
		}
	}, [view, result, setView]);

	const cleanAnalysis = useMemo(() => {
		if (!result?.ai_analysis?.response) return "";
		return cleanAiText(result.ai_analysis.response);
	}, [result]);

	const meta = result?.time_construct;
	const dateShort = meta
		? `${meta.month.gan_zhi}月${meta.day.gan_zhi}日`
		: "";
	const gzFull = meta
		? `${meta.year.gan_zhi}年 ${meta.month.gan_zhi}月 ${meta.day.gan_zhi}日`
		: "";
	const kongDay = meta?.kong_wang?.day;
	const kongDisplay = Array.isArray(kongDay) ? kongDay.join("") : kongDay ?? "";

	const startLoading = () => {
		setLoadingIndex(0);
		setIsLoading(true);
		if (intervalRef.current) {
			window.clearInterval(intervalRef.current);
		}
		intervalRef.current = window.setInterval(() => {
			setLoadingIndex((prev) =>
				prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
			);
		}, LOADING_INTERVAL);
	};

	const stopLoading = () => {
		if (intervalRef.current) {
			window.clearInterval(intervalRef.current);
		}
		setIsLoading(false);
	};

	const handleCast = async () => {
		const trimmed = question.trim();
		if (!trimmed) {
			setError("请输入事项");
			return;
		}
		setError(null);
		setQuestion(trimmed);

		startLoading();

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		try {
			const minWait = new Promise((resolve) =>
				setTimeout(resolve, MIN_LOADING_TIME),
			);
			const apiCall = castMeiwen(trimmed, controller.signal);
			const [, data] = await Promise.all([minWait, apiCall]);

			setResult(data);
			setView("result");
		} catch (err) {
			setError("系统异常，请稍后再试。");
			console.error(err);
		} finally {
			stopLoading();
		}
	};

	const handleReset = () => {
		setQuestion("");
		setResult(null);
		setView("input");
		setError(null);
	};

	const base = result?.hexagram.base;
	const changed = result?.hexagram.changed;
	const hasChanged = Boolean(changed?.name);

	return (
		<div className="min-h-screen bg-background text-foreground flex justify-center">
			<div className="w-full max-w-[760px] px-5 py-12">
				{view === "input" && (
						<section className="mt-14 w-full animate-[fadeIn_0.8s_ease]">
							<div className="mb-12 border-l border-border pl-5">
								<h1 className="text-4xl tracking-[0.2em] text-foreground md:text-5xl">
									每问事
								</h1>
								<div className="mt-4 text-base italic text-muted-foreground">
									“子入太廟，每事問。”
								</div>
							</div>

							<div className="mb-10">
								<label className="mb-3 block text-sm tracking-[0.3em] text-muted-foreground/70">
									事项描述 QUERY
								</label>
								<textarea
									value={question}
									onChange={(event) => setQuestion(event.target.value)}
									placeholder="请输入您欲问之事..."
									className="h-44 w-full resize-none border border-border bg-transparent p-6 text-xl italic text-foreground/80 outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-muted-foreground"
								/>
							</div>

							{error && (
								<div className="mb-6 text-center text-sm tracking-[0.2em] text-red-400">
									{error}
								</div>
							)}

						<button
							type="button"
							onClick={handleCast}
							disabled={isLoading}
							className="mx-auto block border border-foreground bg-foreground px-14 py-4 text-base tracking-[0.5em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							问 卜
						</button>
					</section>
				)}

				{view === "result" && result && (
					<section className="animate-[slideUp_0.6s_ease]">
						<div className="mb-8 border-l border-border pl-4">
							<div className="text-sm tracking-[0.3em] text-muted-foreground">
								所问何事
							</div>
							<div className="mt-2 text-xl">{question || "..."}</div>
						</div>

						<div className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:justify-between">
							<div className="font-mono">
								<span>{dateShort}</span> / <span>{gzFull}</span>
							</div>
							<div className="font-mono">空亡: {kongDisplay}</div>
						</div>

						<div className="border-y border-border py-8">
							<div className="flex flex-col gap-12 md:flex-row md:gap-10">
								<div className="flex-1">
									<div className="mb-6 text-center">
										<span className="block text-3xl">{base?.name ?? "--"}</span>
										<span className="text-sm text-muted-foreground">
											{base?.palace_name ? `${base.palace_name}宫` : "--"}
										</span>
									</div>
									<div className="flex flex-col-reverse gap-4">
										{base?.lines.map((line) => (
											<LineRow key={line.position} line={line} isVariant={false} />
										))}
									</div>
								</div>

								<div
									className={`flex-1 transition-opacity ${
										hasChanged ? "opacity-100" : "opacity-0"
									}`}
								>
									<div className="mb-6 text-center">
										<span className="block text-3xl">
											{changed?.name ?? "--"}
										</span>
										<span className="text-sm text-muted-foreground">
											{changed?.palace_name
												? `${changed.palace_name}宫`
												: "--"}
										</span>
									</div>
									<div className="flex flex-col-reverse gap-4">
										{changed?.lines?.map((line) => (
											<LineRow key={line.position} line={line} isVariant={true} />
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="mt-10">
							<h3 className="mb-6 border-l-2 border-foreground pl-4 text-xl tracking-[0.35em]">
								解 卦 ANALYSIS
							</h3>
							<div className="whitespace-pre-line text-base leading-relaxed text-foreground/90 md:text-lg">
								{cleanAnalysis || "Thinking..."}
							</div>
						</div>

						<button
							type="button"
							onClick={handleReset}
							className="mx-auto mt-12 block border border-border px-8 py-3 text-sm tracking-[0.4em] text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
						>
							再 问
						</button>
					</section>
				)}
			</div>

			{isLoading && (
				<LoadingOverlay message={LOADING_MESSAGES[loadingIndex]} />
			)}
		</div>
	);
}
