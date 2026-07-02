"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/src/components/PageHeader";
import Link from "next/link";
import { getSales, ApiSale, SaleStatus } from "@/src/lib/api";
import SearchFilterBar from "@/src/components/SearchFilterBar";
import LoadingState from "@/src/components/LoadingState";

export default function SalesPage() {
  const [sales, setSales] = useState<ApiSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSales();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  const getStatusStyle = (status: SaleStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-tertiary-container/10 text-on-tertiary-container border-on-tertiary-container/20";
      case "PENDING":
        return "bg-surface-container-high text-on-surface border-outline-variant";
      case "RETURNED":
      case "LOSS":
        return "bg-error-container text-on-error-container border-error-container";
      default:
        return "bg-surface-container-high text-on-surface border-outline-variant";
    }
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      {/* Page Header */}
      <PageHeader
        title="Vendas"
        description="Monitore e gerencie as transações do seu Marketplace."
        breadcrumbs={[
          { label: "vendas", icon: "payments" },
          { label: "histórico de transações" },
        ]}
        onRefresh={loadSales}
        actionButton={{
          label: "Registrar Venda",
          icon: "add",
          href: "/sales/register",
        }}
      ></PageHeader>

      {/* Metrics Summary */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Total de Vendas
            </span>
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-display-lg font-bold">
              R$ 14,290.50
            </span>
            <span className="text-on-tertiary-container text-xs flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>{" "}
              +12.5% from last month
            </span>
          </div>
        </div>
        Units Sold
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Total de Produtos Vendidos
            </span>
            <div className="p-2 bg-secondary-container/10 rounded-lg text-secondary-container">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-display-lg font-bold">
              342
            </span>
            <span className="text-on-tertiary-container text-xs flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>{" "}
              +8% mais vendas
            </span>
          </div>
        </div>
        Avg Order Value
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Preço médio por venda
            </span>
            <div className="p-2 bg-tertiary-container/10 rounded-lg text-on-tertiary-container">
              <span className="material-symbols-outlined">calculate</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-display-lg font-bold">
              R$ 41.78
            </span>
            <span className="text-on-error-container text-xs flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-sm">
                trending_down
              </span>{" "}
              -2.1% de queda
            </span>
          </div>
        </div>
        Pending Payouts
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Saldo Pendente
            </span>
            <div className="p-2 bg-surface-container-high rounded-lg text-on-surface">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-display-lg font-bold">
              R$ 1,840.00
            </span>
            <span className="text-on-surface-variant text-xs mt-1">
              Disponível em até 48 horas
            </span>
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <SearchFilterBar
        placeholder="Buscar cliente, produto ..."
        value={""}
        onChange={(e) => {}}
      >
        {/* <div className="flex items-center gap-2">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            Data:
          </span>
          <div className="flex items-center border border-outline-variant rounded-lg bg-surface px-3 py-2 cursor-pointer hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-sm mr-2">
              calendar_today
            </span>
            <span className="text-body-md">Oct 01 - Oct 31, 2023</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            Status:
          </span>
          <select className="border border-outline-variant rounded-lg bg-surface px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary cursor-pointer">
            <option>Todos</option>
            <option value="COMPLETED">Completo</option>
            <option value="PENDING">Pendente</option>
            <option value="RETURNED">Devolvido</option>
            <option value="LOSS">Prejuízo</option>
          </select>
        </div>

        <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all">
          Filtrar
        </button>

        <button className="text-secondary font-semibold px-4 py-2 hover:bg-surface-container-low rounded-lg transition-all">
          Limpar
        </button> */}
      </SearchFilterBar>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <LoadingState message="Carregando vendas..." />
        ) : sales.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-outline-variant text-[48px]">
              payments
            </span>
            <p className="font-headline-md text-on-surface font-semibold">
              Nenhuma venda encontrada
            </p>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              Nenhuma venda cadastrada ainda. Comece registrando sua primeira
              venda.
            </p>
            <Link
              href="/sales/register"
              className="mt-2 px-4 py-2.5 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Registrar Venda
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead className="bg-surface text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider">
                    Forma de pagamento
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-right">
                    Receita
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-right">
                    Lucro Líquido
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {sales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className={`${index % 2 !== 0 ? "bg-surface" : "bg-transparent"} hover:bg-surface-container-low hover:border-l-4 hover:border-l-secondary transition-all`}
                  >
                    <td className="px-6 py-4 font-data-tabular text-data-tabular whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-outline-variant overflow-hidden flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            src={sale.product?.imageUrl || "/next.svg"}
                            alt={sale.product?.name || "Produto"}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">
                            {sale.product?.name}
                          </p>
                          <p className="text-xs text-on-surface-variant font-data-tabular">
                            {sale.product?.category?.name || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                      {sale.customerName || "Cliente Walk-in"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">
                          {sale.paymentMethod?.icon || "payments"}
                        </span>
                        <span className="text-body-md">
                          {sale.paymentMethod?.name || "Standard"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-data-tabular font-bold whitespace-nowrap">
                      {formatCurrency(sale.finalPrice)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-data-tabular whitespace-nowrap ${sale.calculatedProfit >= 0 ? "text-on-tertiary-container" : "text-on-error-container"}`}
                    >
                      {sale.calculatedProfit >= 0 ? "+" : "-"}{" "}
                      {formatCurrency(Math.abs(sale.calculatedProfit))}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusStyle(sale.status)}`}
                      >
                        {sale.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-on-surface-variant hover:text-secondary active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sales.length > 0 && (
        <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 shadow-sm">
          <div className="text-on-surface-variant text-body-md">
            Mostrando{" "}
            <span className="font-bold text-on-surface">
              1 - {sales.length}
            </span>{" "}
            de <span className="font-bold text-on-surface">{sales.length}</span>{" "}
            transações
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-30 transition-all active:scale-95"
              disabled
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-lg bg-secondary text-on-secondary font-bold active:scale-95 transition-all">
              1
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface font-medium transition-all active:scale-95">
              2
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface font-medium transition-all active:scale-95">
              3
            </button>
            <span className="text-on-surface-variant px-2">...</span>
            <button className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface font-medium transition-all active:scale-95">
              312
            </button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all active:scale-95">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
