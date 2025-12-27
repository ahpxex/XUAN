import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import {
	currentPalaceIndexAtom,
	currentPalaceNameAtom,
	currentPalaceStarsAtom,
	palaceSwitchDirectionAtom,
} from "../atoms/palace";

export function PalaceStamp() {
	const currentIndex = useAtomValue(currentPalaceIndexAtom);
	const palaceName = useAtomValue(currentPalaceNameAtom);
	const stars = useAtomValue(currentPalaceStarsAtom);
	const direction = useAtomValue(palaceSwitchDirectionAtom);

	// 动画变体
	const variants = {
		enter: (direction: string) => ({
			y: direction === "up" ? -50 : 50,
			opacity: 0,
		}),
		center: {
			y: 0,
			opacity: 1,
		},
		exit: (direction: string) => ({
			y: direction === "up" ? 50 : -50,
			opacity: 0,
		}),
	};

	return (
		<div className="absolute top-8 right-8 z-[60] flex flex-row-reverse gap-4 items-start">
			{/* 宫位名称 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.div
					key={`palace-name-${currentIndex}`}
					className="border-2 border-white px-6 py-8 flex flex-col items-center"
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
					}}
				>
					{palaceName.split("").map((char, index) => (
						<span
							key={index}
							className="text-white text-6xl font-bold"
							style={{ writingMode: "vertical-rl" }}
						>
							{char}
						</span>
					))}
				</motion.div>
			</AnimatePresence>

			{/* 星列表 - 每个星占一列竖排显示 */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				{stars.length > 0 && (
					<motion.div
						key={`stars-${currentIndex}`}
						className="flex flex-row-reverse flex-nowrap gap-4"
						custom={direction}
						variants={variants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							y: { type: "spring", stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
					>
						{stars.map((star, starIndex) => (
							<div
								key={starIndex}
								className="px-2 py-4 flex flex-row gap-1 flex-shrink-0"
							>
								{/* 属性 */}
								<span
									className="text-white/70 text-xl max-h-[90vh]"
									style={{ writingMode: "vertical-rl" }}
								>
									{star.properties}
								</span>
								{/* 星名 - 显示在属性文字右侧 */}
								<span
									className="text-white text-2xl font-bold"
									style={{ writingMode: "vertical-rl" }}
								>
									{star.name}
								</span>
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
