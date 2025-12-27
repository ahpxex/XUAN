interface PalaceStampProps {
	text: string;
}

export function PalaceStamp({ text }: PalaceStampProps) {
	return (
		<div className="absolute top-8 right-8 z-[60]">
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
		</div>
	);
}
