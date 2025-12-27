interface Star {
	name: string;
	properties: string; // 属性描述，如"五⾏属⼟，南⽃主星。化⽓为"贤"或"库"。"
}

interface PalaceStampProps {
	text: string;
	stars?: Star[]; // 一维数组，每个星占一列
}

export function PalaceStamp({ text, stars = [] }: PalaceStampProps) {
	return (
		<div className="absolute top-8 right-8 z-[60] flex flex-row-reverse gap-4 items-start">
			{/* 宫位名称 */}
			<div className="border-2 border-white px-6 py-8 flex flex-col items-center">
				{text.split("").map((char, index) => (
					<span
						key={index}
						className="text-white text-6xl font-bold"
						style={{ writingMode: "vertical-rl" }}
					>
						{char}
					</span>
				))}
			</div>

			{/* 星列表 - 每个星占一列竖排显示 */}
			{stars.length > 0 && (
				<div className="flex flex-row-reverse flex-nowrap gap-4">
					{stars.map((star, starIndex) => (
						<div
							key={starIndex}
							className="px-2 py-4 flex flex-col items-center flex-shrink-0"
						>
							{/* 星名 */}
							<span
								className="text-white text-xl font-bold mb-2"
								style={{ writingMode: "vertical-rl" }}
							>
								{star.name}
							</span>
							{/* 属性 */}
							<span
								className="text-white/70 text-base"
								style={{ writingMode: "vertical-rl" }}
							>
								{star.properties}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
