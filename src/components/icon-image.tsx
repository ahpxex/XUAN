import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	currentPalaceIndexAtom,
	isPalaceAnimatingAtom,
	palaceSwitchDirectionAtom,
} from "../atoms/palace";
import {
	EARTHLY_BRANCHES,
	GOLDEN_RATIO,
	viewportWidthAtom,
} from "../atoms/viewport";

export function IconImage() {
	const viewportWidth = useAtomValue(viewportWidthAtom);
	const [currentIndex, setCurrentIndex] = useAtom(currentPalaceIndexAtom);
	const [direction, setDirection] = useAtom(palaceSwitchDirectionAtom);
	const setIsAnimating = useSetAtom(isPalaceAnimatingAtom);
	const isAnimating = useAtomValue(isPalaceAnimatingAtom);

	// 计算图片位置，让图片圆和 StarChart 圆相交
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	// 根据 index 获取地支名称，用于图片路径
	const branchName = EARTHLY_BRANCHES[currentIndex];
	const branchImagePath = `/branches/${branchName}.png`;

	// 键盘事件监听
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setDirection("up");
				setIsAnimating(true);
				const newIndex = (currentIndex - 1 + 12) % 12;
				setCurrentIndex(newIndex);
				// 动画持续时间后重置状态
				setTimeout(() => setIsAnimating(false), 600);
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setDirection("down");
				setIsAnimating(true);
				const newIndex = (currentIndex + 1) % 12;
				setCurrentIndex(newIndex);
				// 动画持续时间后重置状态
				setTimeout(() => setIsAnimating(false), 600);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex, setCurrentIndex, setDirection, setIsAnimating]);

	// 动画变体 - 抛物线轨迹
	const variants = {
		enter: (direction: string) => ({
			x: direction === "up" ? 80 : -80,
			y: direction === "up" ? 100 : -100,
			opacity: 0,
		}),
		center: {
			x: 0,
			y: 0,
			opacity: 0.8,
		},
		exit: (direction: string) => ({
			x: direction === "up" ? -80 : 80,
			y: direction === "up" ? -100 : 100,
			opacity: 0,
		}),
	};

	return (
		<div
			className="absolute top-8 h-64 w-64 rounded-full z-[60] flex items-center justify-center overflow-hidden"
			style={{
				right: `${imageRight}px`,
				backgroundColor: isAnimating ? "transparent" : "black",
			}}
		>
			{/* 固定的容器背景图片 - 也参与动画 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.img
					key={`container-${currentIndex}`}
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
						x: { type: "spring", stiffness: 200, damping: 25 },
						y: { type: "spring", stiffness: 250, damping: 30 },
						opacity: { duration: 0.2 },
					}}
				/>
			</AnimatePresence>
			{/* 可切换的地支图片 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.img
					key={`branch-${currentIndex}`}
					src={branchImagePath}
					className="h-20 w-20 border-0 relative z-10 invert"
					draggable={false}
					alt={branchName}
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						x: { type: "spring", stiffness: 200, damping: 25 },
						y: { type: "spring", stiffness: 250, damping: 30 },
						opacity: { duration: 0.2 },
					}}
				/>
			</AnimatePresence>
		</div>
	);
}
