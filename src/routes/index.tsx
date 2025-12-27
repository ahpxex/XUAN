import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	astrolabeAtom,
	isLoadingReportAtom,
	palaceReportsAtom,
	type UserFormData,
	userFormAtom,
} from "../atoms/ziwei";
import { generateAstrolabe } from "../lib/astrolabe";
import { generateRandomUserData, isDevelopment } from "../lib/dev-utils";
import LoadingOverlay from "@/components/loading-overlay";

export const Route = createFileRoute("/")({ component: App });

const SHICHEN = [
	{ label: "子时", value: "zi", time: "23:00-01:00" },
	{ label: "丑时", value: "chou", time: "01:00-03:00" },
	{ label: "寅时", value: "yin", time: "03:00-05:00" },
	{ label: "卯时", value: "mao", time: "05:00-07:00" },
	{ label: "辰时", value: "chen", time: "07:00-09:00" },
	{ label: "巳时", value: "si", time: "09:00-11:00" },
	{ label: "午时", value: "wu", time: "11:00-13:00" },
	{ label: "未时", value: "wei", time: "13:00-15:00" },
	{ label: "申时", value: "shen", time: "15:00-17:00" },
	{ label: "酉时", value: "you", time: "17:00-19:00" },
	{ label: "戌时", value: "xu", time: "19:00-21:00" },
	{ label: "亥时", value: "hai", time: "21:00-23:00" },
];
const YEARS = Array.from({ length: 100 }, (_, i) =>
	(new Date().getFullYear() - i).toString(),
);

function App() {
	const navigate = useNavigate();
	const setUserForm = useSetAtom(userFormAtom);
	const setAstrolabe = useSetAtom(astrolabeAtom);
	const setPalaceReports = useSetAtom(palaceReportsAtom);
	const setIsLoading = useSetAtom(isLoadingReportAtom);
	const [step, setStep] = useState(1);
	const [flowType, setFlowType] = useState<"divination" | "question" | null>(
		null,
	);
	const [isNavigating, setIsNavigating] = useState(false);
	const [formData, setFormData] = useState<UserFormData>({
		name: "",
		gender: "",
		birthYear: "",
		birthMonth: "",
		birthDay: "",
		birthShichen: "",
	});

	const updateField = (field: keyof UserFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const autoFillForm = () => {
		const randomData = generateRandomUserData();
		setFormData(randomData);
	};

	// Auto-fill form in development when entering step 2
	useEffect(() => {
		if (isDevelopment() && step === 2 && formData.name === "") {
			autoFillForm();
		}
	}, [step]);

	const canProceed = () => {
		if (step === 1) {
			return flowType !== null;
		}
		if (step === 2) {
			return (
				formData.name.trim() !== "" &&
				formData.gender !== "" &&
				formData.birthYear !== "" &&
				formData.birthMonth.trim() !== "" &&
				formData.birthDay.trim() !== "" &&
				formData.birthShichen !== ""
			);
		}
		return true;
	};

	const totalSteps = 2;

	const handleContinue = () => {
		if (step === 1) {
			setStep(2);
		} else if (step === 2) {
			// Trigger loading and navigate
			setIsNavigating(true);
			console.log("[Form] Submitting form data:", formData);
			setIsLoading(false);
			setPalaceReports([]);
			setUserForm(formData);
			const astrolabe = generateAstrolabe(formData);
			console.log("[Form] Generated astrolabe:", astrolabe);
			setAstrolabe(astrolabe);
			console.log("[Form] Navigating to /app");
			navigate({ to: "/app" });
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{/* Loading Overlay */}
			<LoadingOverlay isLoading={isNavigating} text="正在解析命盘" />

			{/* Header */}
			<header className="border-b border-border p-6">
				<h1 className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
					xuan
				</h1>
			</header>

			{/* Progress */}
			<div className="border-b border-border">
				<div className="flex">
					{Array.from({ length: totalSteps }, (_, i) => (
						<div
							key={i}
							className={`flex-1 h-1 ${i + 1 <= step ? "bg-foreground" : "bg-border"}`}
						/>
					))}
				</div>
			</div>

			{/* Main Content */}
			<main className="flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
				{step === 1 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<span className="text-xs tracking-[0.2em] text-muted-foreground">
								步骤 01
							</span>
							<h2 className="text-2xl font-light">选择服务</h2>
						</div>

						<div className="flex gap-4">
							<button
								type="button"
								onClick={() => setFlowType("divination")}
								className={`flex-1 py-12 border-2 text-lg tracking-wide transition-colors ${
									flowType === "divination"
										? "border-foreground bg-foreground text-background"
										: "border-border hover:border-muted-foreground"
								}`}
							>
								如是观
							</button>
							<button
								type="button"
								onClick={() => setFlowType("question")}
								className={`flex-1 py-12 border-2 text-lg tracking-wide transition-colors ${
									flowType === "question"
										? "border-foreground bg-foreground text-background"
										: "border-border hover:border-muted-foreground"
								}`}
							>
								每问事
							</button>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<span className="text-xs tracking-[0.2em] text-muted-foreground">
										步骤 02
									</span>
									<h2 className="text-2xl font-light">基本信息</h2>
								</div>
								{isDevelopment() && (
									<button
										type="button"
										onClick={autoFillForm}
										className="px-4 py-2 text-xs tracking-[0.15em] border border-border hover:bg-accent transition-colors"
									>
										自动填充
									</button>
								)}
							</div>
						</div>

						<div className="space-y-6">
							<div className="space-y-2">
								<label className="text-xs tracking-[0.15em] text-muted-foreground block">
									姓名
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => updateField("name", e.target.value)}
									placeholder="请输入您的姓名"
									className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 text-lg transition-colors placeholder:text-muted-foreground/50"
								/>
							</div>

							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] text-muted-foreground block">
									性别
								</label>
								<div className="flex gap-4">
									{[
										{ label: "男", value: "male" },
										{ label: "女", value: "female" },
										{ label: "其他", value: "other" },
									].map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => updateField("gender", option.value)}
											className={`flex-1 py-3 border-2 text-sm tracking-wide transition-colors ${
												formData.gender === option.value
													? "border-foreground bg-foreground text-background"
													: "border-border hover:border-muted-foreground"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] text-muted-foreground block">
									出生日期
								</label>
								<div className="flex gap-4">
									<div className="flex-1 flex gap-4">
										<div className="flex-1 space-y-1">
											<span className="text-[10px] tracking-wide text-muted-foreground/70">
												月
											</span>
											<input
												type="text"
												value={formData.birthMonth}
												onChange={(e) =>
													updateField("birthMonth", e.target.value)
												}
												placeholder="03"
												maxLength={2}
												className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm transition-colors placeholder:text-muted-foreground/50"
											/>
										</div>
										<div className="flex-1 space-y-1">
											<span className="text-[10px] tracking-wide text-muted-foreground/70">
												日
											</span>
											<input
												type="text"
												value={formData.birthDay}
												onChange={(e) =>
													updateField("birthDay", e.target.value)
												}
												placeholder="15"
												maxLength={2}
												className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm transition-colors placeholder:text-muted-foreground/50"
											/>
										</div>
									</div>
									<div className="flex-1 space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70">
											年
										</span>
										<select
											value={formData.birthYear}
											onChange={(e) => updateField("birthYear", e.target.value)}
											className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
										>
											<option value="" className="bg-background">
												--
											</option>
											{YEARS.map((year) => (
												<option
													key={year}
													value={year}
													className="bg-background"
												>
													{year}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] text-muted-foreground block">
									出生时辰
								</label>
								<select
									value={formData.birthShichen}
									onChange={(e) => updateField("birthShichen", e.target.value)}
									className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
								>
									<option value="" className="bg-background">
										--
									</option>
									{SHICHEN.map((shichen) => (
										<option
											key={shichen.value}
											value={shichen.value}
											className="bg-background"
										>
											{shichen.label} ({shichen.time})
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
			</main>

			{/* Navigation */}
			<footer className="border-t border-border p-6">
				<div className="max-w-lg mx-auto w-full flex justify-between items-center">
					<button
						type="button"
						onClick={() => setStep((s) => Math.max(1, s - 1))}
						disabled={step === 1}
						className="text-sm tracking-wide text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						返回
					</button>

					<span className="text-xs text-muted-foreground">
						{step} / {totalSteps}
					</span>

					<button
						type="button"
						onClick={handleContinue}
						disabled={!canProceed()}
						className="px-8 py-3 bg-foreground text-background text-sm tracking-wide hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						继续
					</button>
				</div>
			</footer>
		</div>
	);
}
