import type { Metadata } from "next";
import ParametersApp from "@/components/parameters/ParametersApp";

export const metadata: Metadata = {
  title: "Movement Languages — Parameters of Notation",
};

export default function Page() {
  return <ParametersApp />;
}
