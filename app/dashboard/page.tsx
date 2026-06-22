'use client';

import { useState } from "react";
import { getDashboardStats, ApiDashboardStatsData } from "@/src/lib/api";

export default function DashboardPage() {
    const [dashboardStats, setDashboardStats] = useState<ApiDashboardStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadDashboardStats() {
        try {
            setIsLoading(true);
            setError(null);
            const stats = await getDashboardStats();
            setDashboardStats(stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            setError('Failed to load dashboard statistics. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    // loadDashboardStats();

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
                    onClick={loadDashboardStats}
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
        <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
    );
}