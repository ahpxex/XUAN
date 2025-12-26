import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { EARTHLY_BRANCHES, GOLDEN_RATIO, viewportWidthAtom } from "../atoms/viewport";

interface IconImageProps {
	index: number;
	onIndexChange: (newIndex: number) => void;
}

export function IconImage({ index, onIndexChange }: IconImageProps) {
	const viewportWidth = useAtomValue(viewportWidthAtom);
	const [direction, setDirection] = useState<"up" | "down">("down");

	// 计算图片位置，让图片圆和 StarChart 圆相交
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	// 根据 index 获取地支名称，用于图片路径
	const branchName = EARTHLY_BRANCHES[index];
	const branchImagePath = `/branches/${branchName}.png`;

	// 键盘事件监听
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setDirection("up");
				const newIndex = (index - 1 + 12) % 12;
				onIndexChange(newIndex);
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setDirection("down");
				const newIndex = (index + 1) % 12;
				onIndexChange(newIndex);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [index, onIndexChange]);

	// 动画变体
	const variants = {
		enter: (direction: string) => ({
			y: direction === "up" ? 100 : -100,
			opacity: 0,
		}),
		center: {
			y: 0,
			opacity: 0.8,
		},
		exit: (direction: string) => ({
			y: direction === "up" ? -100 : 100,
			opacity: 0,
		}),
	};

	return (
		<div
			className="absolute top-8 h-64 w-64 bg-black rounded-full z-[60] flex items-center justify-center overflow-hidden"
			style={{ right: `${imageRight}px` }}
		>
			{/* 固定的容器背景图片 - 也参与动画 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.img
					key={`container-${index}`}
					className="opacity-70 h-64 w-64 border-0 absolute inset-0"
					src="./icon.png"
					draggable={false}
					alt="background"
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
					}}
				/>
			</AnimatePresence>
			{/* 可切换的地支图片 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.img
					key={`branch-${index}`}
					src={branchImagePath}
					className="h-20 w-20 border-0 absolute invert"
					style={{ left: "0.5rem", top: "0.5rem" }}
					draggable={false}
					alt={branchName}
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
					}}
				/>
			</AnimatePresence>
		</div>
	);
}
