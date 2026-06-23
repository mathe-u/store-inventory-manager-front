'use client';

import { useState, useEffect } from "react";
import { getDashboardStats, ApiDashboardStatsData } from "@/src/lib/api";

export default function DashboardPage() {
    const [dashboardStats, setDashboardStats] = useState<ApiDashboardStatsData | null>(null);
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
            console.error('Erro ao carregar as estatísticas do dashboard:', error);
            setError('Falha ao carregar as estatísticas do dashboard. Por favor, tente novamente.');
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
                <span className="ml-3 text-body-md text-on-surface">Carregando as estatísticas do dashboard...</span>
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
                <h2 className="text-display-sm text-on-surface-variant mb-2">Erro ao carregar os dados</h2>
                <p className="text-body-md text-on-surface-variant mb-4 text-center max-w-md">{error}</p>
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
                <span className="text-body-md text-on-surface-variant">Sem as estatísticas do dashboard disponiveis.</span>
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
                            className={`px-4 py-1.5 rounded transition-colors ${period === 30
                                ? 'bg-surface-container-low text-on-surface shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            30 Days
                        </button>

                        <button
                            onClick={() => setPeriod(90)}
                            className={`px-4 py-1.5 rounded transition-colors ${period === 90
                                ? 'bg-surface-container-low text-on-surface shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            90 Days
                        </button>

                        <button
                            onClick={() => setPeriod(365)}
                            className={`px-4 py-1.5 rounded transition-colors ${period === 365
                                ? 'bg-surface-container-low text-on-surface shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            12 Months
                        </button>
                    </div>

                    <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2 hover:bg-inverse-surface transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                        Exportar Relatório
                    </button>
                </div>
            </div>

            {/* Resto do conteúdo do Dashboard que exibirá os dados passados da API */}
            <div className="mt-4 bg-surface-container-lowest p-6 border border-outline-variant rounded-xl">
                <p>Receita Bruta: {(dashboardStats.grossRevenue).toFixed(2)}</p>
                <p>Lucro Líquido: {(dashboardStats.netProfit).toFixed(2)}</p>
                <p>Total de Pedidos: {dashboardStats.totalOrders}</p>
                <p className="mt-2">
                    <span className="font-semibold">Produtos Mais Vendidos:</span>{' '}
                    {dashboardStats.topSellingProducts?.map((product) =>
                        `${product.name} - ${product.category} (${product.quantity})`
                    ).join(', ')}
                </p>
            </div>
        </div>
    );
}