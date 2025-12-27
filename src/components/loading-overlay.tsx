import { range } from "d3-array";
import * as d3 from "d3-scale";
import { AnimatePresence, motion } from "framer-motion"; // 1. 引入 AnimatePresence
import React, { useMemo } from "react";

interface StarTrail {
	id: number;
	r: number;
	width: number;
	opacity: number;
	dashArray: string;
	duration: number;
	delay: number;
	direction: number;
}

interface LoadingOverlayProps {
	isLoading?: boolean;
	text?: string;
}

const LoadingOverlay = ({ isLoading = true, text = "LOADING" }) => {
	const trails: StarTrail[] = useMemo(() => {
		const count = 80;
		const radiusScale = d3.scaleLinear().domain([0, count]).range([50, 800]);
		const opacityScale = d3.scaleLinear().domain([0, count]).range([0.3, 0.9]);

		return range(count).map((i) => {
			const r = radiusScale(i);
			const circumference = 2 * Math.PI * r;
			const starCount = Math.floor(Math.random() * 2) + 1;
			const trailLength = Math.random() * (circumference / 4);
			const gapLength = circumference / starCount - trailLength;

			return {
				id: i,
				r,
				width: Math.random() * 1.5 + 0.5,
				opacity: opacityScale(i) * Math.random(),
				dashArray: `${trailLength} ${gapLength}`,
				duration: Math.random() * 60 + 40,
				delay: Math.random() * -100,
				direction: Math.random() > 0.8 ? -1 : 1,
			};
		});
	}, []);

	// 2. 移除之前的 if (!isLoading) return null;
	// 改为在 JSX 中使用 AnimatePresence 包裹

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					key="loading-overlay" // 3. 必须添加唯一的 key
					className="fixed inset-0 z-99 flex items-center justify-center bg-black overflow-hidden"
					// 4. 添加进出场动画，解决 DOM 移除冲突
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, transition: { duration: 0.5 } }}
				>
					<svg
						className="w-full h-full absolute inset-0 pointer-events-none"
						viewBox="-500 -500 1000 1000"
						preserveAspectRatio="xMidYMid slice"
					>
						<defs>
							<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
								<feGaussianBlur stdDeviation="2" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						<g filter="url(#glow)">
							{trails.map((trail) => (
								<motion.circle
									key={trail.id}
									cx="0"
									cy="0"
									r={trail.r}
									fill="none"
									stroke="white"
									strokeWidth={trail.width}
									strokeOpacity={trail.opacity}
									strokeDasharray={trail.dashArray}
									strokeLinecap="round"
									initial={{ rotate: 0 }}
									animate={{ rotate: 360 * trail.direction }}
									transition={{
										duration: trail.duration,
										ease: "linear",
										repeat: Infinity,
										delay: trail.delay,
									}}
								/>
							))}
						</g>
					</svg>

					<motion.div
						className="relative z-10 text-white font-light tracking-[0.5em] text-sm md:text-xl uppercase mix-blend-difference"
						initial={{ opacity: 0 }}
						animate={{ opacity: [0.4, 1, 0.4] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
					>
						{text}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default LoadingOverlay;
