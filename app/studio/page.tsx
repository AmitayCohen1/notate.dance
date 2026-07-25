import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";

export const metadata: Metadata = {
  title: "Studio — Movement Languages",
  description:
    "A working reconstruction of LifeForms / DanceForms: pose a wireframe figure, keyframe it, and read the result back in Labanotation, Benesh and Eshkol-Wachman.",
};

export default function Page() {
  return <StudioApp />;
}
