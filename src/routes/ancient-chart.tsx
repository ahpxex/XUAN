import * as d3 from "d3";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";

// --- 配置区域 ---
const ANCIENT_TEXT_RAW =
	"角亢氐房心尾箕斗牛女虛危室壁奎婁胃昴畢觜參井鬼柳星張翼軫";
const FULL_CHARS = Array(5).fill(ANCIENT_TEXT_RAW).join("").split("");
const GOLDEN_RATIO = 0.618033988749895;

interface Star {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	opacity: number;
}

export const AncientStarChart: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [viewportWidth, setViewportWidth] = useState(0);

	// 监听窗口大小变化并在组件挂载时立即设置
	useEffect(() => {
		// 立即设置初始宽度
		setViewportWidth(window.innerWidth);

		const handleResize = () => {
			setViewportWidth(window.innerWidth);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// --- 尺寸参数 ---
	// 半径 = 页面宽度 * 黄金分割比
	// size = 半径 * 2
	const size = viewportWidth * GOLDEN_RATIO * 2;
	const center = size / 2;
	const bandWidth = 22;
	const outerRadius = center - 40;
	const innerRadius = outerRadius - bandWidth;
	const coreRadius = innerRadius * 0.18;

	// 1. Canvas 动画 (已修改：增强星星可见度)
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const starLimitRadius = innerRadius - 15;

		// 动态计算粒子数量，保持密度恒定
		// 基准：size=1500 时，innerRadius≈710，面积≈1,585,000，粒子数=600
		// 密度 = 600 / 1,585,000 ≈ 0.000378
		const baseInnerRadius = 710;
		const baseStarCount = 600;
		const areaRatio =
			(starLimitRadius * starLimitRadius) /
			(baseInnerRadius * baseInnerRadius);
		const starCount = Math.round(baseStarCount * areaRatio);

		// [修改点 1]：调整星星生成的参数
		const stars: Star[] = Array.from({ length: starCount }).map(() => {
			const r = Math.sqrt(Math.random()) * starLimitRadius;
			const theta = Math.random() * 2 * Math.PI;
			return {
				x: center + r * Math.cos(theta),
				y: center + r * Math.sin(theta),
				vx: (Math.random() - 0.5) * 0.15,
				vy: (Math.random() - 0.5) * 0.15,
				// 增大半径范围：从原来的 0.8~2.6 增加到 1.5~3.5
				r: Math.random() * 2.0 + 1.5,
				// 提高不透明度下限：从 0.4~1.0 调整为 0.6~1.0
				opacity: Math.random() * 0.4 + 0.6,
			};
		});

		let frameId: number;
		const render = () => {
			ctx.clearRect(0, 0, size, size);

			// [修改点 2]：绘制星星时增加发光效果 (Glow)
			stars.forEach((star) => {
				star.x += star.vx;
				star.y += star.vy;
				const dx = star.x - center;
				const dy = star.y - center;
				if (dx * dx + dy * dy >= starLimitRadius * starLimitRadius) {
					star.vx *= -1;
					star.vy *= -1;
				}
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);

				// 添加发光属性
				ctx.shadowBlur = 8; // 光晕模糊半径
				ctx.shadowColor = "rgba(255, 255, 255, 0.8)"; // 光晕颜色

				ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
				ctx.fill();
			});

			// [修改点 3]：绘制连线 (重置阴影，避免连线也发光导致糊成一团，或者你可以保留阴影看效果)
			ctx.shadowBlur = 0; // 连线通常不需要太强的光晕，保持锐利一点
			ctx.lineWidth = 0.8;
			// 提高连线可见度：从 0.25 提升到 0.4
			ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

			for (let i = 0; i < stars.length; i += 2) {
				for (let j = i + 1; j < stars.length; j += 2) {
					const dx = stars[i].x - stars[j].x;
					const dy = stars[i].y - stars[j].y;
					// 稍微增加一点连线距离判定，让连线更丰富（可选）
					if (dx * dx + dy * dy < 3000) {
						ctx.beginPath();
						ctx.moveTo(stars[i].x, stars[i].y);
						ctx.lineTo(stars[j].x, stars[j].y);
						ctx.stroke();
					}
				}
			}
			frameId = requestAnimationFrame(render);
		};
		render();
		return () => cancelAnimationFrame(frameId);
	}, [center, innerRadius]);

	// 2. 静态数据计算 (保持不变)
	const ringSegments = useMemo(() => {
		const totalSlices = FULL_CHARS.length;
		const anglePerSlice = (2 * Math.PI) / totalSlices;
		const arcGenerator = d3.arc();

		return FULL_CHARS.map((char, i) => {
			const startAngle = i * anglePerSlice;
			const endAngle = (i + 1) * anglePerSlice;
			const overlap = 0.005;
			const pathData = arcGenerator({
				innerRadius: innerRadius,
				outerRadius: outerRadius,
				startAngle: startAngle - overlap,
				endAngle: endAngle + overlap,
			});
			const midAngle = startAngle + anglePerSlice / 2;
			const rotationDeg = (midAngle * 180) / Math.PI;
			return {
				char,
				pathData: pathData || "",
				isEven: i % 2 === 0,
				rotation: rotationDeg,
			};
		});
	}, [outerRadius, innerRadius]);

	// 在获取真实窗口宽度之前不渲染，避免闪烁
	if (viewportWidth === 0) {
		return null;
	}

	return (
		<div className="relative w-full h-screen overflow-hidden bg-[#000000]">
			{/* Layer 1: 噪点纹理 - [修改点 4] 稍微降低噪点浓度，让星星更透亮 */}
			<div
				className="absolute inset-0 z-50 pointer-events-none opacity-20 mix-blend-overlay"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Layer 2: 晕影 */}
			<div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_0%_center,transparent_0%,#000000_90%)]" />

			<div
				className="absolute top-1/2 left-0"
				style={{
					width: size,
					height: size,
					transform: 'translate(-50%, -50%)'
				}}
			>
				{/* Layer 3: 星星 (Canvas) */}
				<canvas
					ref={canvasRef}
					width={size}
					height={size}
					className="absolute inset-0 z-10"
				/>

				{/* Layer 4: 旋转星盘 (SVG) - 已移除旋转动画 */}
				<motion.svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					className="absolute inset-0 z-20"
				>
					<defs>
						<filter
							id="line-glitch"
							x="-20%"
							y="-20%"
							width="140%"
							height="140%"
						>
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.8"
								numOctaves="2"
								result="noise"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="noise"
								scale="4"
								xChannelSelector="R"
								yChannelSelector="G"
							/>
						</filter>

						<filter
							id="rough-edge"
							x="-20%"
							y="-20%"
							width="140%"
							height="140%"
						>
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.6"
								numOctaves="3"
								result="noise"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="noise"
								scale="3"
								xChannelSelector="R"
								yChannelSelector="G"
							/>
						</filter>
					</defs>

					<g transform={`translate(${center}, ${center})`}>
						<g filter="url(#rough-edge)">
							{ringSegments.map((segment, i) => (
								<g key={i}>
									<path
										d={segment.pathData}
										fill={segment.isEven ? "#ffffff" : "transparent"}
									/>
									<text
										transform={`rotate(${segment.rotation}) translate(0, -${innerRadius + bandWidth / 2 - 4})`}
										textAnchor="middle"
										fill={segment.isEven ? "#000000" : "#ffffff"}
										className="font-serif font-bold"
										style={{ fontSize: "11px", fontWeight: 900 }}
									>
										{segment.char}
									</text>
								</g>
							))}
						</g>

						<g filter="url(#rough-edge)">
							<circle
								r={innerRadius}
								fill="none"
								stroke="#ffffff"
								strokeWidth="1"
							/>
							<circle
								r={outerRadius}
								fill="none"
								stroke="#ffffff"
								strokeWidth="1"
							/>
						</g>

						<motion.g
							filter="url(#line-glitch)"
							stroke="#ffffff"
							strokeWidth="1.2"
							opacity="0.7"
							animate={{ opacity: [0.6, 0.8, 0.6] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
						>
							<circle r={innerRadius * 0.7} fill="none" strokeDasharray="5 5" />
							<circle
								r={innerRadius * 0.45}
								fill="none"
								strokeDasharray="5 5"
							/>
							<circle r={coreRadius} fill="none" strokeWidth="1.5" />
							{d3.range(12).map((i) => (
								<line
									key={i}
									y1={-coreRadius}
									y2={-innerRadius}
									transform={`rotate(${i * 30})`}
								/>
							))}
							{d3.range(36).map((i) => (
								<line
									key={`tick-${i}`}
									y1={-innerRadius + 8}
									y2={-innerRadius}
									transform={`rotate(${i * 10})`}
									strokeWidth="1.5"
								/>
							))}
						</motion.g>
					</g>
				</motion.svg>
			</div>
		</div>
	);
};

export default AncientStarChart;
