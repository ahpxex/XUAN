import { createFileRoute } from "@tanstack/react-router";
import MeiwenPage from "@/features/meiwen/meiwen-page";

export const Route = createFileRoute("/meiwen")({
	component: MeiwenPage,
});
