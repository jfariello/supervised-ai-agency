import Link from "next/link";
import {
  Activity,
  Bot,
  CheckSquare,
  FileText,
  Gauge,
  Inbox,
  Settings,
  Upload
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { requireSimpleAuth } from "@/lib/simple-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/approvals", label: "Aprobaciones", icon: CheckSquare },
  { href: "/proposals", label: "Propuestas", icon: FileText },
  { href: "/agent-runs", label: "Agentes", icon: Bot },
  { href: "/settings/integrations", label: "Integraciones", icon: Settings }
];

export async function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  await requireSimpleAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <div className="brand-title">Agencia IA</div>
            <div className="brand-subtitle">supervised growth ops</div>
          </div>
        </div>
        <nav className="nav" aria-label="Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className={active === item.href ? "active" : ""} href={item.href} key={item.href}>
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <p>
            <Activity size={14} /> Sistema en modo supervisado.
          </p>
          <div style={{ marginTop: 10 }}>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
