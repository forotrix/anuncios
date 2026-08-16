"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  type AdminUserDTO,
  type AdminRole,
  type AdminStatus,
} from "@/services/admin.service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AdminNav } from "@/components/AdminNav/AdminNav";

const ROLE_OPTIONS: AdminRole[] = ["customer", "provider", "agency", "admin"];

export const AdminUsers = () => {
  const { accessToken, user } = useAuth();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<AdminRole | "">("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "">("");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    if (!accessToken || !isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchAdminUsers(accessToken, {
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setUsers(data.items);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, roleFilter, statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (targetId: string, role: AdminRole) => {
    if (!accessToken) return;
    setPendingId(targetId);
    try {
      const updated = await updateAdminUser(accessToken, targetId, { role });
      setUsers((prev) => prev.map((u) => (u.id === targetId ? updated : u)));
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el rol");
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleStatus = async (target: AdminUserDTO) => {
    if (!accessToken) return;
    const nextStatus: AdminStatus = target.status === "active" ? "suspended" : "active";
    setPendingId(target.id);
    try {
      const updated = await updateAdminUser(accessToken, target.id, { status: nextStatus });
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el estado");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (target: AdminUserDTO) => {
    if (!accessToken) return;
    if (!window.confirm(`¿Eliminar la cuenta ${target.email}? Esta acción no se puede deshacer.`)) return;
    setPendingId(target.id);
    try {
      await deleteAdminUser(accessToken, target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el usuario");
    } finally {
      setPendingId(null);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-rojo-cereza400">Acceso Restringido</h1>
            <p className="text-white/60">
              Esta página es solo para administradores. Si eres el dueño del sitio, asegúrate de estar logueado con una cuenta de admin.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-[168px] pb-24">
        <AdminNav />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de Usuarios</h1>
            <p className="mt-1 text-white/50">Gestiona roles, suspensiones y bajas de cuentas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Buscar por email"
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/20"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as AdminRole | "")}
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Todos los roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdminStatus | "")}
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
            </select>
            <button
              onClick={load}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rojo-cereza500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl bg-rojo-cereza900/20 p-6 text-center text-rojo-cereza200 border border-rojo-cereza900/50">
            {error}
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Registrado</th>
                  <th className="px-6 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-white/40">
                      No hay usuarios que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  users.map((target) => {
                    const isSelf = target.id === user?.id;
                    const isPending = pendingId === target.id;
                    return (
                      <tr key={target.id} className="transition hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="text-white/80">{target.email}</div>
                          {target.name && <div className="text-xs text-white/40">{target.name}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={target.role}
                            disabled={isSelf || isPending}
                            onChange={(e) => handleRoleChange(target.id, e.target.value as AdminRole)}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white/80 outline-none disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                              target.status === "active"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {target.status === "active" ? "Activo" : "Suspendido"}
                          </span>
                          {target.lockedUntil && new Date(target.lockedUntil).getTime() > Date.now() && (
                            <div className="mt-1 text-[11px] text-white/30">Bloqueado temporalmente</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-white/60">
                          {new Date(target.createdAt).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(target)}
                              disabled={isSelf || isPending}
                              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {target.status === "active" ? "Suspender" : "Reactivar"}
                            </button>
                            <button
                              onClick={() => handleDelete(target)}
                              disabled={isSelf || isPending}
                              className="rounded-full bg-rojo-cereza900/30 px-3 py-1 text-xs font-medium text-rojo-cereza200 transition hover:bg-rojo-cereza900/50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};
