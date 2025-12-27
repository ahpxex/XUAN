import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

interface FormData {
	name: string;
	gender: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	birthShichen: string;
}

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
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		gender: "",
		birthYear: "",
		birthMonth: "",
		birthDay: "",
		birthShichen: "",
	});

	const updateField = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const canProceed = () => {
		if (step === 1) {
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

	const totalSteps = 3;

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
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
							<h2 className="text-2xl font-light">基本信息</h2>
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
												onChange={(e) => updateField("birthMonth", e.target.value)}
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
												onChange={(e) => updateField("birthDay", e.target.value)}
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

				{step === 2 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<span className="text-xs tracking-[0.2em] text-muted-foreground">
								步骤 02
							</span>
							<h2 className="text-2xl font-light">内容待定</h2>
							<p className="text-sm text-muted-foreground">
								此步骤的内容将在后续开发中完善
							</p>
						</div>

						<div className="space-y-6">
							<div className="border-2 border-dashed border-border p-12 text-center">
								<p className="text-sm text-muted-foreground tracking-wide">
									PLACEHOLDER
								</p>
							</div>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<span className="text-xs tracking-[0.2em] text-muted-foreground">
								步骤 03
							</span>
							<h2 className="text-2xl font-light">内容待定</h2>
							<p className="text-sm text-muted-foreground">
								此步骤的内容将在后续开发中完善
							</p>
						</div>

						<div className="space-y-6">
							<div className="border-2 border-dashed border-border p-12 text-center">
								<p className="text-sm text-muted-foreground tracking-wide">
									PLACEHOLDER
								</p>
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
						onClick={() => {
							if (step < totalSteps) {
								setStep((s) => s + 1);
							} else {
								navigate({ to: "/app" });
							}
						}}
						disabled={!canProceed()}
						className="px-8 py-3 bg-foreground text-background text-sm tracking-wide hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						{step === totalSteps ? "完成" : "继续"}
					</button>
				</div>
			</footer>
		</div>
	);
}
