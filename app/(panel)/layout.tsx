"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { logout, getUserById, parseJwt, ApiUser } from "@/src/lib/api";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    if (user && user.role === "SELLER" && pathname.startsWith("/categories")) {
      router.push("/dashboard");
    }
  }, [user, pathname, router]);

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
        localStorage.removeItem("API_TOKEN");
        localStorage.removeItem("REMEMBER_ME");
        router.push("/");
      })
    } else {
      router.push("/");
    }
  }, [router]);

  


  const handleLogout = async () => {
    try {
      // Chama o endpoint para salvar o token atual na blacklist do backend
      await logout();
    } catch (err) {
      console.error("Erro ao invalidar o token no backend:", err);
    } finally {
      // Remove o token do armazenamento local
      localStorage.removeItem("API_TOKEN");
      localStorage.removeItem("REMEMBER_ME");
      
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

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-background">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-spacing-stack-default z-50">
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

        <ul className="flex flex-col flex-grow gap-1 px-4">
          {/* Item: Dashboard */}
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${
                isDashboardActive
                  ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isDashboardActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                dashboard
              </span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </Link>
          </li>

          {/* Item: Inventory */}
          <li>
            <Link
              href="/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${
                isProductsActive
                  ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isProductsActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                inventory_2
              </span>
              <span className="font-body-md text-body-md">Produtos</span>
            </Link>
          </li>

          {/* Item: Sales */}
          <li>
            <Link
              href="/sales"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${
                isSalesActive
                  ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isSalesActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                receipt_long
              </span>
              <span className="font-body-md text-body-md">Vendas</span>
            </Link>
          </li>

          {/* Item: Categories */}
          <li>
            <Link
              href="/categories"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${
                isCategoriesActive
                  ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isCategoriesActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                category
              </span>
              <span className="font-body-md text-body-md">Categorias</span>
            </Link>
          </li>

          {/* Item: Reports */}
          <li>
            <Link
              href="/reports"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${
                isReportsActive
                  ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isReportsActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                analytics
              </span>
              <span className="font-body-md text-body-md">Relatórios</span>
            </Link>
          </li>
        </ul>

        {/* Área do Perfil */}
        <div className="px-6 mt-auto">
          <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden relative">
              <Image
                alt="User profile photo"
                className="object-cover"
                src="/next.svg"
                fill
                sizes="40px"
              />
            </div>
            <div className="flex-grow">
              <p className="font-body-md text-body-md font-semibold text-on-surface">
                {user ? user.name : "Carregando..."}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {user ? user.role.toLowerCase() : ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors flex items-center justify-center cursor-pointer active:scale-95 duration-100"
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
  );
}
