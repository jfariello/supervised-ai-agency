import { statusClass } from "@/lib/status";

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone ?? statusClass(String(children))}`}>{children}</span>;
}
