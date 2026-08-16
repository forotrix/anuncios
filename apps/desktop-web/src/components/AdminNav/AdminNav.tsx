"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin-panel-usuarios", label: "Usuarios" },
  { href: "/admin-panel-anuncios", label: "Anuncios" },
  { href: "/admin-panel-seguimiento-logs", label: "Logs" },
];

export const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Navegacion de administracion">
      {ADMIN_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active ? "bg-rojo-cereza500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
