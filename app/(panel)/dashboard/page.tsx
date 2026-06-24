"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, ApiDashboardStatsData } from "@/src/lib/api";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] =
    useState<ApiDashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<number>(30);

  async function loadDashboardStats(daysSelected: number) {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await getDashboardStats(daysSelected);
      setDashboardStats(stats);
    } catch (error) {
      console.error("Erro ao carregar as estatísticas do dashboard:", error);
      setError(
        "Falha ao carregar as estatísticas do dashboard. Por favor, tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats(period);
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-body-md text-on-surface">
          Carregando as estatísticas do dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-error-container p-6 rounded-lg mb-4">
          <span className="material-symbols-outlined text-error text-display-md">
            error
          </span>
        </div>
        <h2 className="text-display-sm text-on-surface-variant mb-2">
          Erro ao carregar os dados
        </h2>
        <p className="text-body-md text-on-surface-variant mb-4 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={() => loadDashboardStats(period)}
          className="px-6 py-3 rounded-full bg-primary text-primary-container font-semibold hover:bg-primary-container hover:text-primary transition-all active:scale-95 duration-150"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-body-md text-on-surface-variant">
          Sem as estatísticas do dashboard disponiveis.
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Page Header (Trecho solicitado) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-[24px] md:text-[32px] font-bold text-on-surface">
            Business Intelligence
          </h2>
          <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
            Visão em tempo real do desempenho do seu negócio e lucros.
          </p>
        </div>
        {/* Period Selection */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-1 flex text-[12px] font-semibold">
            <button
              onClick={() => setPeriod(30)}
              className={`px-4 py-1.5 rounded transition-colors ${
                period === 30
                  ? "bg-surface-container-low text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              30 Days
            </button>

            <button
              onClick={() => setPeriod(90)}
              className={`px-4 py-1.5 rounded transition-colors ${
                period === 90
                  ? "bg-surface-container-low text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              90 Days
            </button>

            <button
              onClick={() => setPeriod(365)}
              className={`px-4 py-1.5 rounded transition-colors ${
                period === 365
                  ? "bg-surface-container-low text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              12 Months
            </button>
          </div>

          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2 hover:bg-inverse-surface transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              download
            </span>
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Top KPIs Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* KPI 1: Gross Revenue */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Receita Bruta
            </p>
            <span className="material-symbols-outlined text-secondary">
              payments
            </span>
          </div>
          <div>
            <h3 className="font-display-lg text-display-lg text-on-surface font-data-tabular">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(dashboardStats.grossRevenue)}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center font-label-sm text-label-sm px-2 py-0.5 rounded-full ${(dashboardStats.grossRevenueDelta ?? 0) >= 0 ? "text-on-tertiary-container bg-tertiary-fixed" : "text-on-error-container bg-error-container"}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  {(dashboardStats.grossRevenueDelta ?? 0) >= 0
                    ? "trending_up"
                    : "trending_down"}
                </span>
                {Math.abs(
                  (dashboardStats.grossRevenueDelta ?? 0) * 100,
                ).toFixed(1)}
                %
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                vs ultimo período
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Profit */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Lucro Líquido
            </p>
            <span className="material-symbols-outlined text-on-tertiary-container">
              account_balance_wallet
            </span>
          </div>
          <div>
            <h3 className="font-display-lg text-display-lg text-on-surface font-data-tabular">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(dashboardStats.netProfit)}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center font-label-sm text-label-sm px-2 py-0.5 rounded-full ${(dashboardStats.netProfitDelta ?? 0) >= 0 ? "text-on-tertiary-container bg-tertiary-fixed" : "text-on-error-container bg-error-container"}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  {(dashboardStats.netProfitDelta ?? 0) >= 0
                    ? "trending_up"
                    : "trending_down"}
                </span>
                {Math.abs((dashboardStats.netProfitDelta ?? 0) * 100).toFixed(
                  1,
                )}
                %
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                vs ultimo período
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Orders */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total de Pedidos
            </p>
            <span className="material-symbols-outlined text-primary">
              local_shipping
            </span>
          </div>
          <div>
            <h3 className="font-display-lg text-display-lg text-on-surface font-data-tabular">
              {new Intl.NumberFormat("en-US").format(
                dashboardStats.totalOrders,
              )}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center font-label-sm text-label-sm px-2 py-0.5 rounded-full ${(dashboardStats.totalOrdersDelta ?? 0) >= 0 ? "text-on-tertiary-container bg-tertiary-fixed" : "text-on-error-container bg-error-container"}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  {(dashboardStats.totalOrdersDelta ?? 0) >= 0
                    ? "trending_up"
                    : "trending_down"}
                </span>
                {Math.abs((dashboardStats.totalOrdersDelta ?? 0) * 100).toFixed(
                  1,
                )}
                %
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                vs ultimo período
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: None */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              None
            </p>
            <span className="material-symbols-outlined text-on-secondary-fixed-variant">
              shopping_cart
            </span>
          </div>
          <div>
            <h3 className="font-display-lg text-display-lg text-on-surface font-data-tabular">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(dashboardStats.grossProfit)}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center font-label-sm text-label-sm px-2 py-0.5 rounded-full ${(dashboardStats.grossProfitDelta ?? 0) >= 0 ? "text-on-tertiary-container bg-tertiary-fixed" : "text-on-error-container bg-error-container"}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  {(dashboardStats.grossProfitDelta ?? 0) >= 0
                    ? "trending_up"
                    : "trending_down"}
                </span>
                {Math.abs((dashboardStats.grossProfitDelta ?? 0) * 100).toFixed(
                  1,
                )}
                %
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                vs ultimo período
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resto do conteúdo do Dashboard que exibirá os dados passados da API */}
      <div className="mt-4 bg-surface-container-lowest p-6 border border-outline-variant rounded-xl">
        <p>Receita Bruta: {dashboardStats.grossRevenue.toFixed(2)}</p>
        <p>Lucro Líquido: {dashboardStats.netProfit.toFixed(2)}</p>
        <p>Total de Pedidos: {dashboardStats.totalOrders}</p>
        <p className="mt-2">
          <span className="font-semibold">Produtos Mais Vendidos:</span>{" "}
          {dashboardStats.topSellingProducts
            ?.map(
              (product) =>
                `${product.name} - ${product.category} (${product.quantity})`,
            )
            .join(", ")}
        </p>
      </div>
    </div>
  );
}
