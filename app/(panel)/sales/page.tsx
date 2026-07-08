"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/src/components/PageHeader";
import Link from "next/link";
import {
  getSales,
  ApiSale,
  SaleStatus,
  deleteSale,
  updateSale,
} from "@/src/lib/api";
import SearchFilterBar from "@/src/components/SearchFilterBar";
import LoadingState from "@/src/components/LoadingState";
import EmptyState from "@/src/components/EmptyState";
import Badge, { BadgeVariant } from "@/src/components/Badge";
import Modal from "@/src/components/Modal";

export default function SalesPage() {
  const [sales, setSales] = useState<ApiSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // search state
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editTarget, setEditTarget] = useState<ApiSale | null>(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    finalPrice: 0,
    status: "COMPLETED" as SaleStatus,
    customerName: "",
    paymentMethodId: "cash",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<ApiSale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openEditModal = (sale: ApiSale) => {
    setEditTarget(sale);
    setEditForm({
      quantity: sale.quantity,
      finalPrice: sale.finalPrice,
      status: sale.status,
      customerName: sale.customerName || "",
      paymentMethodId: sale.paymentMethod?.id || "cash",
    });
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateSale(editTarget.id, {
        quantity: editForm.quantity,
        finalPrice: editForm.finalPrice,
        status: editForm.status,
        customerName: editForm.customerName || null,
        paymentMethodId: editForm.paymentMethodId,
      });
      await loadSales();
      setEditTarget(null);
    } catch (error) {
      console.error("Failed to update sale", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a venda.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSale(deleteTarget.id);
      await loadSales();
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete sale", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a venda.",
      );
    } finally {
      setIsDeleting(false);
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

  const getStatusVariant = (status: SaleStatus): BadgeVariant => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "RETURNED":
      case "LOSS":
        return "danger";
      default:
        return "default";
    }
  };

  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const productName = sale.product?.name?.toLowerCase() || "";
    const customerName = sale.customerName?.toLowerCase() || "";
    const categoryName = sale.product?.category?.name?.toLowerCase() || "";
    const paymentName = sale.paymentMethod?.name?.toLowerCase() || "";

    return (
      productName.includes(term) ||
      customerName.includes(term) ||
      categoryName.includes(term) ||
      paymentName.includes(term)
    );
  });

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
        value={searchTerm}
        onChange={setSearchTerm}
        totalCountText={`Mostrando ${filteredSales.length} de ${sales.length} transações.`}
        isLoading={isLoading}
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

      {/* Sales Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <LoadingState message="Carregando vendas..." />
        ) : filteredSales.length === 0 ? (
          <EmptyState
            icon="payments"
            title="Nenhuma venda encontrada"
            description={
              "Nenhuma venda cadastrada ainda. Comece registrando sua primeira venda."
            }
            actionButton={{
              label: "Registrar Venda",
              icon: "add",
              href: "/sales/register",
            }}
          />
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
                  <th className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredSales.map((sale, index) => (
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
                      <Badge
                        label={sale.status.toLowerCase()}
                        variant={getStatusVariant(sale.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(sale);
                          }}
                          className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-secondary-fixed-variant transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(sale);
                          }}
                          className="p-1.5 rounded hover:bg-error-container text-outline hover:text-error transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {/* {filteredSales.length > 0 && (
        <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 shadow-sm">
          <div className="text-on-surface-variant text-body-md">
            Mostrando{" "}
            <span className="font-bold text-on-surface">
              1 - {filteredSales.length}
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
      )} */}

      {/* Edit Modal */}
      <Modal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title="Editar Venda"
        titleIcon="edit"
        titleIconColor="text-secondary"
        size="md"
      >
        {editTarget && (
          <form onSubmit={handleSaveUpdate} className="flex flex-col gap-4">
            {/* Read-only Product info */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                Produto
              </label>
              <div className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md text-on-surface-variant font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
                {editTarget.product?.name || "Produto não identificado"}
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={editForm.customerName}
                onChange={(e) =>
                  setEditForm({ ...editForm, customerName: e.target.value })
                }
                placeholder="Nome do cliente (Opcional)"
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>

            {/* Quantity and finalPrice Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-right font-semibold font-data-tabular"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Preço Unitário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editForm.finalPrice}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      finalPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-right font-semibold font-data-tabular"
                />
              </div>
            </div>

            {/* Sale Status */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                Status da Venda
              </label>
              <div className="relative">
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as SaleStatus,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none font-semibold"
                >
                  <option value="COMPLETED">Concluída (COMPLETED)</option>
                  <option value="PENDING">Pendente (PENDING)</option>
                  <option value="LOSS">Perda (LOSS)</option>
                  <option value="RETURNED">Devolvida (RETURNED)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium">
                Método de pagamento
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: "cash", name: "Dinheiro", icon: "payments" },
                  { id: "pix", name: "Pix", icon: "send_money" },
                  {
                    id: "credit_card",
                    name: "Cartão",
                    icon: "account_balance_wallet",
                  },
                  { id: "other", name: "Outros", icon: "more_horiz" },
                ].map((method) => (
                  <label key={method.id} className="cursor-pointer relative">
                    <input
                      className="peer sr-only"
                      name="edit-payment"
                      type="radio"
                      value={method.id}
                      checked={editForm.paymentMethodId === method.id}
                      onChange={() =>
                        setEditForm({ ...editForm, paymentMethodId: method.id })
                      }
                    />
                    <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-2 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                      <span className="material-symbols-outlined text-[20px]">
                        {method.icon}
                      </span>
                      <span className="text-[11px] font-semibold">
                        {method.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions in Form Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2"
              >
                {isSaving && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar Exclusão"
        titleIcon="warning"
        titleIconColor="text-error"
        size="md"
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Tem certeza que deseja excluir a venda do produto{" "}
              <span className="font-semibold text-on-surface">
                {deleteTarget.product?.name}
              </span>{" "}
              realizada em{" "}
              <span className="font-semibold text-on-surface">
                {formatDate(deleteTarget.createdAt)}
              </span>
              ?
            </p>
            <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm bg-surface-container border border-outline-variant p-3 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">
                warning
              </span>
              <span>
                <strong>Atenção:</strong> A exclusão desta venda reverterá as
                alterações correspondentes no estoque do produto (+
                {deleteTarget.quantity} unidades). Esta ação não pode ser
                desfeita.
              </span>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm font-semibold hover:opacity-95 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                Excluir Venda
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
