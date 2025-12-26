import { useAtomValue } from "jotai";
import { GOLDEN_RATIO, viewportWidthAtom } from "../atoms/viewport";

interface IconImageProps {
	text: string;
}

export function IconImage({ text }: IconImageProps) {
	const viewportWidth = useAtomValue(viewportWidthAtom);

	// 计算图片位置，让图片圆和 StarChart 圆相交
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	return (
		<div
			className="absolute top-8 h-64 w-64 bg-black rounded-full z-[60] flex items-center justify-center"
			style={{ right: `${imageRight}px` }}
		>
			<img
				className="opacity-70 h-64 w-64 border-0 absolute inset-0"
				src="./icon.png"
			/>
			<span
				className="opacity-70 relative z-10 text-white text-5xl font-bold"
				style={{ fontFamily: "hanyi" }}
			>
				{text}
			</span>
		</div>
	);
}
