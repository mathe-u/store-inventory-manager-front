"use client";

import { useState, useEffect, useRef } from "react";
import {
  getDashboardStats,
  getProductPriceEvolution,
  ApiDashboardStatsData,
  ApiProductPriceEvolution,
} from "@/src/lib/api";
import Chart from "chart.js/auto";
import Link from "next/link";

Chart.defaults.font.family = "JetBrains Mono, monospace";
Chart.defaults.color = "#76777d";
Chart.defaults.scale.grid.color = "rgba(198, 198, 205, 0.2)"; // outline-variant very light
Chart.defaults.plugins.tooltip.backgroundColor = "#131b2e"; // primary-container
Chart.defaults.plugins.tooltip.titleFont = {
  family: "Inter",
  size: 13,
  weight: "bolder",
};
Chart.defaults.plugins.tooltip.bodyFont = {
  family: "JetBrains Mono",
  size: 12,
};
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 4;

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] =
    useState<ApiDashboardStatsData | null>(null);
  const [priceEvolution, setPriceEvolution] = useState<
    ApiProductPriceEvolution[] | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);

  const revenueCostChartRef = useRef<HTMLCanvasElement | null>(null);
  const marginChartRef = useRef<HTMLCanvasElement | null>(null);
  const priceEvolutionChartRef = useRef<HTMLCanvasElement | null>(null);

  const revenueChartInstance = useRef<Chart | null>(null);
  const marginChartInstance = useRef<Chart | null>(null);
  const priceEvolutionChartInstance = useRef<Chart | null>(null);

  async function loadDashboardStats(daysSelected: number) {
    try {
      setIsLoading(true);
      setError(null);

      const stats = await getDashboardStats(daysSelected);

      // IMPORTANTE: setDashboardStats e setIsLoading(false) são chamados juntos
      // ANTES do próximo await (getProductPriceEvolution).
      // Isso garante que o React faça um único render com isLoading=false e
      // os dados do dashboard, montando os canvas no DOM antes de o
      // useEffect([dashboardStats]) disparar. Sem isso, o useEffect dispara
      // enquanto o spinner ainda está visível (isLoading=true), os refs dos
      // canvas são null e os gráficos nunca são criados.
      setDashboardStats(stats);
      setIsLoading(false);

      if (stats.topSelling && stats.topSelling.length > 0) {
        const topProductId = stats.topSelling[0].productId;

        try {
          const evolution = await getProductPriceEvolution(
            topProductId,
            daysSelected,
          );

          if (Array.isArray(evolution)) {
            setPriceEvolution(evolution);
          } else {
            console.warn(
              "API de evolução de preço retornou um formato inválido:",
              evolution,
            );
            setPriceEvolution(null);
          }
        } catch (evoError) {
          console.error("Erro ao carregar a evolução de preço:", evoError);
          setPriceEvolution(null);
        }
      } else {
        setPriceEvolution(null);
      }
    } catch (error) {
      console.error("Erro ao carregar as estatísticas do dashboard:", error);
      setError(
        "Falha ao carregar as estatísticas do dashboard. Por favor, tente novamente.",
      );
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats(period);
  }, [period]);

  useEffect(() => {
    if (!dashboardStats) return;

    if (revenueCostChartRef.current) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }

      const generateLast12Months = () => {
        const months = [];
        const date = new Date();

        for (let i = 11; i >= 0; i--) {
          const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
          const apiLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

          const formatter = new Intl.DateTimeFormat("pt-BR", {
            month: "short",
          });
          const shortMonth = formatter.format(d).replace(".", "");
          const visualLabel =
            shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1);

          months.push({ apiLabel, visualLabel });
        }
        return months;
      };

      // Normaliza o campo `date` da API para o formato "YYYY-MM",
      // independente de a API retornar "YYYY-MM", "YYYY-MM-DD" ou um timestamp ISO.
      const normalizeToYearMonth = (dateStr: string): string => {
        if (!dateStr) return "";
        // Se já está no formato YYYY-MM (sem dia), retorna diretamente
        if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;
        // Qualquer outro formato (YYYY-MM-DD, ISO timestamp): pega só os 7 primeiros chars
        return dateStr.substring(0, 7);
      };

      console.log(
        "[Dashboard] monthlyStats recebido da API:",
        dashboardStats.monthlyStats,
      );

      const monthsConfig = generateLast12Months();
      const labels = monthsConfig.map((month) => month.visualLabel);

      const revenueData = monthsConfig.map((m) => {
        const matchedStat = dashboardStats.monthlyStats?.find(
          (s) => normalizeToYearMonth(s.date) === m.apiLabel,
        );
        return matchedStat ? matchedStat.grossRevenue : 0;
      });
      const costsData = monthsConfig.map((m) => {
        const matchedStat = dashboardStats.monthlyStats?.find(
          (s) => normalizeToYearMonth(s.date) === m.apiLabel,
        );
        return matchedStat ? matchedStat.costs : 0;
      });

      revenueChartInstance.current = new Chart(revenueCostChartRef.current!, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Receita Bruta",
              data: revenueData,
              backgroundColor: "#0051d5", // color-secondary
              borderRadius: 10,
              categoryPercentage: 0.7,
              barPercentage: 0.6,
              // barThickness: 15,
            },
            {
              label: "Custos",
              data: costsData,
              backgroundColor: "#dbe1ff", // color-secondary-fixed
              borderRadius: 10,
              categoryPercentage: 0.7,
              barPercentage: 0.6,
              // barThickness: 15,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                font: { family: "Inter", size: 12 },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              border: { display: false },
              ticks: {
                callback: function (value: string | number) {
                  return (value as number) > 1000
                    ? "R$" + (value as number) / 1000 + "k"
                    : "R$" + value;
                },
              },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    if (marginChartRef.current) {
      if (marginChartInstance.current) {
        marginChartInstance.current.destroy();
      }

      marginChartInstance.current = new Chart(marginChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Lucro Bruto", "Custos", "Entrega e Impostos"],
          datasets: [
            {
              data: [30.7, 54.3, 15.0],
              backgroundColor: [
                "#0051d5", // secondary
                "#ba1a1a", // error
                "#e5eeff", // surface-container
              ],
              borderWidth: 2,
              borderColor: "#ffffff", // surface-container-lowest
              hoverOffset: 4,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${context.raw}%`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (marginChartInstance.current) marginChartInstance.current.destroy();
    };
  }, [dashboardStats]);

  // Price Evolution Chart
  useEffect(() => {
    if (!priceEvolution) return;

    if (priceEvolutionChartRef.current) {
      if (priceEvolutionChartInstance.current) {
        priceEvolutionChartInstance.current.destroy();
      }

      const ctxPrice = priceEvolutionChartRef.current.getContext("2d");
      if (!ctxPrice) return;

      const gradientBlue = ctxPrice.createLinearGradient(0, 0, 0, 400);
      gradientBlue.addColorStop(0, "rgba(0, 81, 213, 0.2)");
      gradientBlue.addColorStop(1, "rgba(0, 81, 213, 0)");

      const priceLabels = priceEvolution.map((item) => {
        const [year, month, day] = item.date.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }).format(dateObj);
      });

      const priceData = priceEvolution.map((item) => item.price);

      priceEvolutionChartInstance.current = new Chart(ctxPrice, {
        type: "line",
        data: {
          labels: priceLabels,
          datasets: [
            {
              label: "Preço Médio",
              data: priceData,
              borderColor: "#0051d5", // secondary
              borderWidth: 2,
              backgroundColor: gradientBlue,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#ffffff",
              pointHoverBorderColor: "#0051d5",
              pointHoverBorderWidth: 2,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return " R$ " + context.parsed.y;
                },
              },
            },
          },
          scales: {
            y: {
              border: { display: false },
              grid: {
                // borderDash: [4, 4],
              },
              ticks: {
                callback: function (value) {
                  return "R$" + value;
                },
              },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }
    return () => {
      if (priceEvolutionChartInstance.current) {
        priceEvolutionChartInstance.current.destroy();
      }
    };
  }, [priceEvolution]);

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
              30 Dias
            </button>

            <button
              onClick={() => setPeriod(90)}
              className={`px-4 py-1.5 rounded transition-colors ${
                period === 90
                  ? "bg-surface-container-low text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              90 Dias
            </button>

            <button
              onClick={() => setPeriod(365)}
              className={`px-4 py-1.5 rounded transition-colors ${
                period === 365
                  ? "bg-surface-container-low text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              12 Meses
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
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
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
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
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
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
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

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Billing vs Revenue Bar Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-2 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Receita Bruta vs Custos
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                Receita Bruta comparada aos custos operacionais e de estoque
                totais.
              </p>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex-1 relative w-full h-full">
            <canvas ref={revenueCostChartRef}></canvas>
          </div>
        </div>

        {/* Real Profit Margin Donut */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Lucro Líquido Real
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                Lucro líquido após todas as taxas.
              </p>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <canvas ref={marginChartRef}></canvas>
              {/* O texto interno do Donut sobreposto usando position absolute */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display-lg text-display-lg text-on-surface font-data-tabular">
                  30.7%
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Margem Média
                </span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-3">
              <div className="flex justify-between items-center font-body-md text-body-md text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-on-surface">Lucro Líquido</span>
                </div>
                <span className="font-data-tabular text-on-surface font-medium">
                  30.7%
                </span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-on-surface">Custos</span>
                </div>
                <span className="font-data-tabular text-on-surface font-medium">
                  54.3%
                </span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <span className="text-on-surface">
                    Custos de Envio e Impostos
                  </span>
                </div>
                <span className="font-data-tabular text-on-surface font-medium">
                  15.0%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Price Evolution & Bestsellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Evolution Line Graph */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-2 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Evolução de Preço
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                Tendências históricas de preços de itens de estoque.
              </p>
            </div>
            {/* <select className="bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2">
              <option>Sony WH-1000XM5</option>
              <option>Apple AirPods Pro 2</option>
              <option>Nintendo Switch OLED</option>
            </select> */}
          </div>
          <div className="flex-1 relative w-full h-full">
            <canvas
              ref={priceEvolutionChartRef}
              id="priceEvolutionChart"
            ></canvas>
          </div>
        </div>

        {/* Bestselling Products Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col h-[450px] overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest z-10">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Produtos Mais Vendidos
            </h3>
            <Link
              href={"/inventory"}
              className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors"
            >
              Ver Todos
            </Link>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-10">
                <tr>
                  <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-5 font-semibold">
                    Produto
                  </th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-5 font-semibold text-right">
                    Unidades
                  </th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-5 font-semibold text-right">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-sm">
                {dashboardStats.topSelling &&
                dashboardStats.topSelling.length > 0 ? (
                  dashboardStats.topSelling.map((product) => (
                    <tr
                      key={product.productId}
                      className="zebra-stripe border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-5 flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            alt={product.name}
                            className="w-10 h-10 rounded-md border border-outline-variant object-cover"
                            src={product.imageUrl}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md border border-outline-variant bg-surface-container-high flex items-center justify-center text-on-surface-variant flex-shrink-0">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "20px" }}
                            >
                              inventory_2
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-on-surface font-medium truncate w-32 md:w-auto">
                            {product.name}
                          </p>
                          <p className="text-on-surface-variant text-xs">
                            {product.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right font-data-tabular text-on-surface">
                        {new Intl.NumberFormat("en-US").format(
                          product.quantity,
                        )}
                      </td>
                      <td className="py-3 px-5 text-right font-data-tabular text-on-surface font-medium">
                        {product.revenue != null
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.revenue)
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-on-surface-variant text-sm"
                    >
                      <span className="material-symbols-outlined block text-3xl mb-2 text-outline">
                        inventory_2
                      </span>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Resto do conteúdo do Dashboard que exibirá os dados passados da API */}
      <div className="mt-4 bg-surface-container-lowest p-6 border border-outline-variant rounded-xl">
        <p>Receita Bruta: {dashboardStats.grossRevenue.toFixed(2)}</p>
        <p>Lucro Líquido: {dashboardStats.netProfit.toFixed(2)}</p>
        <p>Total de Pedidos: {dashboardStats.totalOrders}</p>
        <p className="mt-4">Evolução de Receita vs Custos:</p>
        {dashboardStats.monthlyStats?.map((stat) => (
          <div key={stat.date}>
            <p>Data: {stat.date}</p>
            <p>Receita Bruta: {stat.grossRevenue.toFixed(2)}</p>
            <p>Custos: {stat.costs.toFixed(2)}</p>
          </div>
        ))}
        <p className="mt-2">
          <span className="font-semibold">Produtos Mais Vendidos:</span>{" "}
          {dashboardStats.topSelling
            ?.map(
              (product) =>
                `${product.name} - ${product.category} (${product.quantity})`,
            )
            .join(", ")}
        </p>

        <div className="mt-6 border-t border-outline-variant pt-4">
          <p className="font-semibold mb-2">
            Evolução de Preço (Produto Destaque):
          </p>
          {priceEvolution && priceEvolution.length > 0 ? (
            priceEvolution.map((evo, index) => (
              <p key={index} className="text-sm text-on-surface-variant">
                Data: {evo.date} | Preço:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(evo.price)}
              </p>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">
              Nenhum dado de evolução de preço disponível no momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
