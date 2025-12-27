import { createFileRoute } from "@tanstack/react-router";
import { Divination } from "../components/divination";

export const Route = createFileRoute("/divination")({
    component: Divination,
});
