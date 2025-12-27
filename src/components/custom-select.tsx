import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface SelectOption {
	label: string;
	value: string;
	time?: string;
}

interface CustomSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	label?: string;
}

export function CustomSelect({
	value,
	onChange,
	options,
	placeholder = "请选择",
	label,
}: CustomSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// 点击外部关闭下拉
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<div className="space-y-1" ref={containerRef}>
			{label && (
				<span className="text-[10px] tracking-wide text-muted-foreground/70 block">
					{label}
				</span>
			)}

			<div className="relative">
				{/* 选择按钮 */}
				<motion.button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="w-full bg-transparent border-2 border-border focus:border-foreground outline-none p-3 text-sm text-left transition-colors hover:border-muted-foreground cursor-pointer flex items-center justify-between"
					whileTap={{ scale: 0.98 }}
				>
					<span className={selectedOption ? "text-foreground" : "text-muted-foreground/50"}>
						{selectedOption
							? `${selectedOption.label}${selectedOption.time ? ` (${selectedOption.time})` : ""}`
							: placeholder}
					</span>
					<motion.svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						className="text-muted-foreground"
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<path
							d="M2 4L6 8L10 4"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="square"
						/>
					</motion.svg>
				</motion.button>

				{/* 下拉列表 */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{ duration: 0.15 }}
							className="absolute z-50 w-full bottom-full mb-1 bg-background border-2 border-foreground max-h-64 overflow-y-auto"
						>
							{options.map((option) => (
								<motion.button
									key={option.value}
									type="button"
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
									}}
									className={`w-full px-3 py-3 text-sm text-left transition-colors border-b border-border last:border-b-0 ${
										value === option.value
											? "bg-foreground text-background"
											: "hover:bg-muted"
									}`}
									whileHover={{ x: 4 }}
									whileTap={{ scale: 0.98 }}
								>
									{option.label}
									{option.time && (
										<span className="ml-2 text-xs opacity-70">
											({option.time})
										</span>
									)}
								</motion.button>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
