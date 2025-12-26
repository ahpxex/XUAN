import { useAtomValue } from "jotai";
import { EARTHLY_BRANCHES, GOLDEN_RATIO, viewportWidthAtom } from "../atoms/viewport";

interface IconImageProps {
	index: number;
}

export function IconImage({ index }: IconImageProps) {
	const viewportWidth = useAtomValue(viewportWidthAtom);

	// 计算图片位置，让图片圆和 StarChart 圆相交
	const imageRight = viewportWidth * (1 - GOLDEN_RATIO) - 48;

	// 根据 index 获取地支名称，用于图片路径
	const branchName = EARTHLY_BRANCHES[index];
	const imagePath = `/branches/${branchName}.png`;

	return (
		<div
			className="absolute top-8 h-64 w-64 bg-black rounded-full z-[60] flex items-center justify-center"
			style={{ right: `${imageRight}px` }}
		>
			<img
				className="opacity-70 h-64 w-64 border-0 absolute inset-0"
				src="./icon.png"
				draggable={false}
				alt="background"
			/>
			<img
				src={imagePath}
				className="opacity-80 h-20 w-20 border-0 left-2 top-2 relative z-10 invert"
				draggable={false}
				alt={branchName}
			/>
		</div>
	);
}
