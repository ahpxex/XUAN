import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

// 辅助函数：计算圆周上的点
const getPointOnCircle = (radius: number, index: number, total: number) => {
	const angle = (index * 360) / total;
	const rad = (angle - 90) * (Math.PI / 180);
	return {
		x: 50 + radius * Math.cos(rad),
		y: 50 + radius * Math.sin(rad),
	};
};

export function LoadingOverlay() {
	const [constellationPath, setConstellationPath] = useState("");

	// 核心逻辑：极速推演
	useEffect(() => {
		const generateNewConstellation = () => {
			// 1. 在圆周上定义点 (12宫位)
			const points = Array.from({ length: 12 }, (_, i) =>
				getPointOnCircle(30, i, 12),
			);

			// 2. 随机选取点 (增加选取数量，让图形更复杂)
			const count = Math.floor(Math.random() * 4) + 4; // 选取 4-8 个点
			const shuffled = points.sort(() => 0.5 - Math.random()).slice(0, count);

			// 3. 生成路径
			if (shuffled.length > 0) {
				const path = shuffled
					.map(
						(p, i) =>
							`${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
					)
					.join(" ");
				setConstellationPath(`${path} Z`);
			}
		};

		generateNewConstellation();
		// 频率提高：600ms 变换一次，产生“高频运算”的感觉
		const interval = setInterval(generateNewConstellation, 600);
		return () => clearInterval(interval);
	}, []);

	// 定义星轨（蝌蚪圆环）的参数
	// r: 半径, dash: 虚线样式(实线长 间隙长), duration: 旋转一圈的时间, reverse: 是否逆时针
	const orbits = [
		{ r: 38, dash: "10 230", duration: 4, reverse: false }, // 快速内圈
		{ r: 42, dash: "60 200", duration: 8, reverse: true }, // 中圈
		{ r: 46, dash: "20 270", duration: 12, reverse: false }, // 慢速外圈
		{ r: 46, dash: "5 285", duration: 12, reverse: false, delay: 6 }, // 追随外圈的小点
	];

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
			{/* 核心 SVG 画布 */}
			<div className="relative w-96 h-96">
				<svg className="w-full h-full" viewBox="0 0 100 100">
					{/* 定义滤镜：让白色线条产生辉光 (Glow) */}
					<defs>
						<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
							<feGaussianBlur stdDeviation="1.5" result="blur" />
							<feComposite in="SourceGraphic" in2="blur" operator="over" />
						</filter>
					</defs>

					{/* 1. 蝌蚪星轨 (游动的圆环) */}
					{orbits.map((orbit, i) => (
						<motion.circle
							key={i}
							cx="50"
							cy="50"
							r={orbit.r}
							fill="none"
							stroke="white"
							strokeWidth="1.5"
							strokeLinecap="round" // 圆头，看起来像蝌蚪
							strokeDasharray={orbit.dash}
							initial={{ rotate: 0 }}
							animate={{ rotate: orbit.reverse ? -360 : 360 }}
							transition={{
								duration: orbit.duration,
								repeat: Infinity,
								ease: "linear",
								delay: orbit.delay || 0,
							}}
							style={{ originX: "50px", originY: "50px" }} // 确保围绕中心旋转
						/>
					))}

					{/* 2. 十二宫位点 (作为连线的锚点) */}
					{Array.from({ length: 12 }).map((_, i) => {
						const { x, y } = getPointOnCircle(30, i, 12);
						return (
							<circle
								key={i}
								cx={x}
								cy={y}
								r="0.8"
								fill="white"
								opacity="0.5"
							/>
						);
					})}

					{/* 3. 动态连线 (高频闪烁) */}
					<AnimatePresence mode="wait">
						<motion.path
							key={constellationPath}
							d={constellationPath}
							stroke="white"
							strokeWidth="1.2" // 加粗线条
							fill="transparent"
							filter="url(#glow)" // 加上发光滤镜
							initial={{ pathLength: 0, opacity: 0.2 }}
							animate={{ pathLength: 1, opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4, ease: "circOut" }} // 动画速度加快
						/>
					</AnimatePresence>

					{/* 4. 中心极点 */}
					<circle cx="50" cy="50" r="2" fill="white" filter="url(#glow)" />
				</svg>
			</div>
		</div>
	);
}
