import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { rolePermissions } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth/use-auth";

type RoutePath = "/" | "/gerar" | "/bastidores" | "/projeto";

interface NavItem {
  to: RoutePath;
  label: string;
}

const SECONDARY: NavItem[] = [{ to: "/projeto", label: "Sobre o projeto" }];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const { enabled, user, role, signOut } = useAuth();

  const NAV: NavItem[] = [
    { to: "/", label: "Painel" },
    { to: "/gerar", label: "Editor" },
    ...(rolePermissions(role).canSeeBastidores
      ? [{ to: "/bastidores" as const, label: "Bastidores" }]
      : []),
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (to: RoutePath) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-primary text-[0.68rem] font-medium text-primary-foreground"
              aria-hidden
            >
              VD
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="text-base font-medium tracking-[-0.01em]">Visio Divina</span>
              <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
                Slides para pregações
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  isActive(item.to)
                    ? "text-foreground underline underline-offset-8"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            {enabled && (
              <div className="hidden items-center gap-3 md:flex">
                {user ? (
                  <>
                    <span className="max-w-[160px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <LogOut className="size-4" /> Sair
                    </button>
                  </>
                ) : (
                  <Link
                    to="/entrar"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            )}
            <Link
              to="/gerar"
              className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
            >
              Novo deck
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
            <ul className="flex flex-col gap-1">
              {[...NAV, ...SECONDARY].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive(item.to)
                        ? "bg-[color:var(--color-surface-alt)] font-medium text-foreground"
                        : "text-muted-foreground hover:bg-[color:var(--color-surface-alt)] hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link to="/gerar" className={cn(buttonVariants(), "w-full")}>
                  Novo deck
                </Link>
              </li>
              {enabled && (
                <li className="mt-1 border-t border-border pt-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-[color:var(--color-surface-alt)] hover:text-foreground"
                    >
                      <LogOut className="size-4" /> Sair ({user.email})
                    </button>
                  ) : (
                    <Link
                      to="/entrar"
                      className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-[color:var(--color-surface-alt)] hover:text-foreground"
                    >
                      Entrar
                    </Link>
                  )}
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <span className="u-eyebrow !text-[0.62rem]">
            Visio Divina · Projeto de extensão UniCEUB
          </span>
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            {SECONDARY.map((item) => (
              <Link key={item.to} to={item.to} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
            {rolePermissions(role).canSeeBastidores && (
              <Link to="/bastidores" className="transition-colors hover:text-foreground">
                Como funciona
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
