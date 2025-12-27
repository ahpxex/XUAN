import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, type TouchEvent } from "react";
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
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const animatingRef = useRef(false);
	const swipeThreshold = 32;

	// 计算图片位置，让图片圆和 StarChart 圆相交
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	// 根据 index 获取地支名称，用于图片路径
	const branchName = EARTHLY_BRANCHES[currentIndex];
	const branchImagePath = `/branches/${branchName}.png`;

	const switchPalace = useCallback(
		(nextDirection: "up" | "down") => {
			if (animatingRef.current || isAnimating) return;
			animatingRef.current = true;
			setDirection(nextDirection);
			setIsAnimating(true);
			setCurrentIndex((prev) => {
				const delta = nextDirection === "up" ? -1 : 1;
				return (prev + delta + 12) % 12;
			});
			window.setTimeout(() => {
				setIsAnimating(false);
				animatingRef.current = false;
			}, 600);
		},
		[isAnimating, setCurrentIndex, setDirection, setIsAnimating],
	);

	// 键盘事件监听
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				switchPalace("up");
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				switchPalace("down");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [switchPalace]);

	const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
		if (event.touches.length !== 1) return;
		const touch = event.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
	};

	const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
		const start = touchStartRef.current;
		if (!start || event.changedTouches.length === 0) return;
		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - start.x;
		const deltaY = touch.clientY - start.y;
		touchStartRef.current = null;

		if (Math.abs(deltaY) < swipeThreshold || Math.abs(deltaY) < Math.abs(deltaX)) {
			return;
		}

		if (deltaY < 0) {
			switchPalace("up");
		} else {
			switchPalace("down");
		}
	};

	const handleTouchCancel = () => {
		touchStartRef.current = null;
	};

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
				touchAction: "none",
			}}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchCancel}
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
