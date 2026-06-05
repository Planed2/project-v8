/**
 * Layout principal do sistema de Infrequência Escolar — JF
 * Design: Governo Digital Brasileiro — header horizontal + tabs de navegação
 * Paleta: Azul institucional #1D4ED8, fundo #F3F4F6, cards brancos
 */

import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, FilePlus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/ocorrencias", label: "Ocorrências", icon: FileText },
  { href: "/novo-registro", label: "Novo Registro", icon: FilePlus },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.965 0.003 264)" }}>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
              style={{ background: "oklch(0.45 0.18 264)" }}
            >
              IF
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm text-foreground">Infrequência Escolar</span>
              <span className="text-xs text-muted-foreground">Rede Municipal de Juiz de Fora</span>
            </div>
          </div>

          {/* Logout */}
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-[1280px] mx-auto px-6">
          <nav className="flex gap-0">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/"
                  ? location === "/" || location === ""
                  : location.startsWith(href);

              return (
                <Link key={href} href={href}>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
