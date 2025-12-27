import { range } from "d3-array";
import * as d3 from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

interface StarTrail {
	id: number;
	r: number;
	width: number;
	opacity: number;
	dashArray: string;
	duration: number;
	delay: number;
	direction: number;
	breathDuration: number;
}

interface LoadingOverlayProps {
	isLoading?: boolean;
	text?: string;
}

const LoadingOverlay = ({ isLoading = true, text = "LOADING" }) => {
	const trails: StarTrail[] = useMemo(() => {
		const count = 150; // 增加密集度
		const radiusScale = d3.scaleLinear().domain([0, count]).range([50, 800]);
		const opacityScale = d3.scaleLinear().domain([0, count]).range([0.2, 0.95]);

		return range(count).map((i) => {
			const r = radiusScale(i);
			const circumference = 2 * Math.PI * r;
			const starCount = Math.floor(Math.random() * 3) + 2; // 增加星星数量
			const trailLength = Math.random() * (circumference / 3);
			const gapLength = circumference / starCount - trailLength;

			return {
				id: i,
				r,
				width: Math.random() * 2 + 0.3,
				opacity: opacityScale(i) * Math.random(),
				dashArray: `${trailLength} ${gapLength}`,
				duration: Math.random() * 60 + 40,
				delay: Math.random() * -100,
				direction: Math.random() > 0.8 ? -1 : 1,
				breathDuration: Math.random() * 4 + 3, // 呼吸周期 3-7 秒
			};
		});
	}, []);

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					key="loading-overlay"
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
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
									strokeDasharray={trail.dashArray}
									strokeLinecap="round"
									initial={{ rotate: 0, strokeOpacity: trail.opacity }}
									animate={{
										rotate: 360 * trail.direction,
										strokeOpacity: [
											trail.opacity * 0.3,
											trail.opacity * 1,
											trail.opacity * 0.3,
										],
									}}
									transition={{
										rotate: {
											duration: trail.duration,
											ease: "linear",
											repeat: Infinity,
											delay: trail.delay,
										},
										strokeOpacity: {
											duration: trail.breathDuration,
											ease: "easeInOut",
											repeat: Infinity,
											delay: Math.random() * 2,
										},
									}}
								/>
							))}
						</g>
					</svg>

					{/* 中心旋转图标 */}
					<motion.div
						className="absolute z-10 flex items-center justify-center"
						animate={{ rotate: 360 }}
						transition={{
							duration: 120,
							ease: "linear",
							repeat: Infinity,
						}}
					>
						<img
							src="/icon.png"
							alt="Loading Icon"
							className="h-72 w-72 opacity-70"
							draggable={false}
						/>
					</motion.div>

					{/* Loading 文字 */}
					<motion.div
						className="absolute bottom-32 z-10 text-white font-light tracking-[0.5em] text-sm md:text-xl uppercase mix-blend-difference"
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
