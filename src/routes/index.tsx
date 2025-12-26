import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

interface FormData {
	name: string;
	gender: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	birthHour: string;
	birthMinute: string;
	birthPeriod: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const YEARS = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));

function App() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		gender: "",
		birthYear: "",
		birthMonth: "",
		birthDay: "",
		birthHour: "",
		birthMinute: "",
		birthPeriod: "AM",
	});

	const updateField = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const canProceed = () => {
		if (step === 1) {
			return formData.name.trim() !== "" && formData.gender !== "";
		}
		if (step === 2) {
			return formData.birthYear !== "" && formData.birthMonth !== "" && formData.birthDay !== "";
		}
		if (step === 3) {
			return formData.birthHour !== "" && formData.birthMinute !== "";
		}
		return true;
	};

	const totalSteps = 3;

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{/* Header */}
			<header className="border-b border-border p-6">
				<h1 className="text-sm tracking-[0.3em] uppercase text-muted-foreground">Xuanxue</h1>
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
							<span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
								Step 01
							</span>
							<h2 className="text-2xl font-light">Who are you?</h2>
						</div>

						<div className="space-y-6">
							<div className="space-y-2">
								<label className="text-xs tracking-[0.15em] uppercase text-muted-foreground block">
									Your Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => updateField("name", e.target.value)}
									placeholder="Enter your name"
									className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 text-lg transition-colors placeholder:text-muted-foreground/50"
								/>
							</div>

							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] uppercase text-muted-foreground block">
									Gender
								</label>
								<div className="flex gap-4">
									{["Male", "Female", "Other"].map((option) => (
										<button
											key={option}
											type="button"
											onClick={() => updateField("gender", option.toLowerCase())}
											className={`px-6 py-3 border-2 text-sm tracking-wide transition-colors ${
												formData.gender === option.toLowerCase()
													? "border-foreground bg-foreground text-background"
													: "border-border hover:border-muted-foreground"
											}`}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
								Step 02
							</span>
							<h2 className="text-2xl font-light">When were you born?</h2>
						</div>

						<div className="space-y-6">
							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] uppercase text-muted-foreground block">
									Birth Date
								</label>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Year
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
												<option key={year} value={year} className="bg-background">
													{year}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Month
										</span>
										<select
											value={formData.birthMonth}
											onChange={(e) => updateField("birthMonth", e.target.value)}
											className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
										>
											<option value="" className="bg-background">
												--
											</option>
											{MONTHS.map((month) => (
												<option key={month} value={month} className="bg-background">
													{month}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Day
										</span>
										<select
											value={formData.birthDay}
											onChange={(e) => updateField("birthDay", e.target.value)}
											className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
										>
											<option value="" className="bg-background">
												--
											</option>
											{DAYS.map((day) => (
												<option key={day} value={day} className="bg-background">
													{day}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-8">
						<div className="space-y-2">
							<span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
								Step 03
							</span>
							<h2 className="text-2xl font-light">What time were you born?</h2>
							<p className="text-sm text-muted-foreground">
								The exact birth time is important for accurate readings
							</p>
						</div>

						<div className="space-y-6">
							<div className="space-y-3">
								<label className="text-xs tracking-[0.15em] uppercase text-muted-foreground block">
									Birth Time
								</label>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Hour
										</span>
										<select
											value={formData.birthHour}
											onChange={(e) => updateField("birthHour", e.target.value)}
											className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
										>
											<option value="" className="bg-background">
												--
											</option>
											{HOURS.map((hour) => (
												<option key={hour} value={hour} className="bg-background">
													{hour}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Minute
										</span>
										<select
											value={formData.birthMinute}
											onChange={(e) => updateField("birthMinute", e.target.value)}
											className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm appearance-none cursor-pointer hover:border-muted-foreground transition-colors"
										>
											<option value="" className="bg-background">
												--
											</option>
											{MINUTES.map((minute) => (
												<option key={minute} value={minute} className="bg-background">
													{minute}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
											Period
										</span>
										<div className="flex border-2 border-border">
											{["AM", "PM"].map((period) => (
												<button
													key={period}
													type="button"
													onClick={() => updateField("birthPeriod", period)}
													className={`flex-1 p-3 text-sm transition-colors ${
														formData.birthPeriod === period
															? "bg-foreground text-background"
															: "hover:bg-border"
													}`}
												>
													{period}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="pt-4">
								<button
									type="button"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
								>
									I don't know my exact birth time
								</button>
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
						Back
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
						{step === totalSteps ? "Complete" : "Continue"}
					</button>
				</div>
			</footer>
		</div>
	);
}
