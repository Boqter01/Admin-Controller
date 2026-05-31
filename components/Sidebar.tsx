"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Activity, BarChart2, UserCircle,
  Clock, Package, Users, Database,
} from "lucide-react";

const navItems = [
  { label: "Overview",     href: "/",             icon: LayoutDashboard },
  { label: "Activity Log", href: "/activity-log", icon: Activity },
  { label: "API Metrics",  href: "/api-metrics",  icon: BarChart2 },
  { label: "Profiles",     href: "/profiles",     icon: UserCircle },
  { label: "Sessions",     href: "/sessions",     icon: Clock },
  { label: "Products",     href: "/products",     icon: Package },
  { label: "Users",        href: "/users",        icon: Users },
];

// CSS variables defined once, co-located with the component that uses them
const CSS_VARS = {
  "--sidebar-border":      "rgba(255,255,255,0.1)",
  "--sidebar-active-bg":   "rgba(99,102,241,0.25)",
  "--sidebar-hover-bg":    "rgba(255,255,255,0.08)",
  "--sidebar-text":        "rgba(255,255,255,0.55)",
  "--sidebar-text-active": "#fff",
} as React.CSSProperties;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // min-h-screen so sidebar always fills the viewport height
    <aside
      className="w-64 bg-gray-900 text-white p-6 flex flex-col min-h-screen"
      style={CSS_VARS}
    >
      {/* Logo */}
      <div style={{
        paddingBottom: 20,
        borderBottom: "1px solid var(--sidebar-border)",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Database size={17} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Admin</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 6, fontSize: 14,
                textDecoration: "none", transition: "background 0.15s, color 0.15s",
                background: active ? "var(--sidebar-active-bg)" : "transparent",
                color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "var(--sidebar-hover-bg)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--sidebar-text)";
                }
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — mt-auto pushes it to the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">
          <p>Admin_Dashboard</p>
          <p className="text-gray-500 mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}