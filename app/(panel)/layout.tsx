"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { logout, getUserById, parseJwt, ApiUser, clearTokens } from "@/src/lib/api";
import { UserContext } from "@/src/contexts/UserContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("API_TOKEN");
    if (!token) {
      router.push("/");
      return;
    }

    const decoded = parseJwt(token);
    if (decoded && decoded.sub) {
      getUserById(decoded.sub).then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuário:", err);
        clearTokens();
        router.push("/");
      })
    } else {
      clearTokens();
      router.push("/");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Chama o endpoint para revogar o token de acesso e de refresh no backend
      await logout();
    } catch (err) {
      console.error("Erro ao invalidar o token no backend:", err);
    } finally {
      // Remove os tokens do armazenamento local
      clearTokens();
      
      // Redireciona o usuário de volta para a página de login
      router.push("/");
    }
  };

  // Verificadores de rota ativa (ajustados para cada página)
  const isDashboardActive = pathname === "/dashboard";
  const isProductsActive = pathname.startsWith("/products");
  const isSalesActive = pathname.startsWith("/sales");
  const isCategoriesActive = pathname.startsWith("/categories");
  const isReportsActive = pathname.startsWith("/reports");
  const isProfileActive = pathname.startsWith("/profile");

  const isAdmin = user?.role === "ADMIN";

  return (
    <UserContext.Provider value={{ user }}>
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-surface">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface-container-lowest flex flex-col py-spacing-stack-default z-50">
        <div className="px-6 mb-8 mt-2">
          <Link href="/dashboard" className="hover:opacity-90">
            <h1 className="font-display-lg text-display-lg text-on-surface">
              Market Manager
            </h1>
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
            Pacote de monitoramento de vendas e estoque
          </p>
        </div>

        <nav className="flex flex-col flex-grow space-y-1.5 px-3" data-purpose="nav-links">
          {/* Item: Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
              isDashboardActive
                ? "font-semibold text-slate-900 bg-slate-100"
                : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                isDashboardActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect height="7" rx="1.5" width="7" x="3" y="3"></rect>
              <rect height="7" rx="1.5" width="7" x="14" y="3"></rect>
              <rect height="7" rx="1.5" width="7" x="14" y="14"></rect>
              <rect height="7" rx="1.5" width="7" x="3" y="14"></rect>
            </svg>
            <span>Dashboard</span>
          </Link>

          {/* Item: Inventory / Produtos */}
          <Link
            href="/products"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
              isProductsActive
                ? "font-semibold text-slate-900 bg-slate-100"
                : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                isProductsActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span>Produtos</span>
          </Link>

          {/* Item: Sales / Vendas */}
          <Link
            href="/sales"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
              isSalesActive
                ? "font-semibold text-slate-900 bg-slate-100"
                : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                isSalesActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span>Vendas</span>
          </Link>

          {/* Item: Categories / Categorias */}
          <Link
            href="/categories"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
              isCategoriesActive
                ? "font-semibold text-slate-900 bg-slate-100"
                : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                isCategoriesActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span>Categorias</span>
          </Link>

          {/* Item: Reports — somente ADMIN */}
          {/* {isAdmin && (
            <Link
              href="/reports"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
                isReportsActive
                  ? "font-semibold text-slate-900 bg-slate-100"
                  : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  isReportsActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              <span>Relatórios</span>
            </Link>
          )} */}
        </nav>

        {/* Área do Perfil */}
        <div className="px-3 mt-auto">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
              isProfileActive
                ? "bg-slate-100 border-slate-200"
                : "border-outline-variant/60 hover:bg-slate-50"
            }`}
          >
            <Link
              href="/profile"
              className="flex items-center gap-3 flex-grow min-w-0 group cursor-pointer"
              title="Ver perfil do usuário"
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {user ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-secondary transition-colors">
                  {user ? user.name : "Carregando..."}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate capitalize">
                  {user ? user.role.toLowerCase() : ""}
                </p>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="p-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors flex items-center justify-center cursor-pointer active:scale-95 duration-100 flex-shrink-0"
              title="Sair"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* TopNavBar */}
      {/* <header className="fixed top-0 right-0 z-40 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-8 py-3 w-[calc(100%-16rem)] h-16">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64 focus-within:ring-2 focus-within:ring-secondary rounded-DEFAULT">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-DEFAULT py-1.5 pl-8 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              placeholder="Buscar produto..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-secondary cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {user?.role === "ADMIN" && (
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-secondary cursor-pointer">
              <span className="material-symbols-outlined">settings</span>
            </button>
          )}

        </div>
      </header> */}

      {/* Main Content Canvas */}
      <main className="ml-64 pt-8 p-margin-x pb-24">{children}</main>
    </div>
    </UserContext.Provider>
  );
}
