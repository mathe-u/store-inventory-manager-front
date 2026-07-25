"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/src/components/PageHeader";
import {
  getSales,
  ApiSale,
  SaleStatus,
  deleteSale,
  updateSale,
  getPaymentMethods,
  ApiPaymentMethod,
} from "@/src/lib/api";
import SearchFilterBar from "@/src/components/SearchFilterBar";
import LoadingState from "@/src/components/LoadingState";
import EmptyState from "@/src/components/EmptyState";
import ErrorAlert from "@/src/components/ErrorAlert";
import ErrorState from "@/src/components/ErrorState";
import Badge, { BadgeVariant } from "@/src/components/Badge";
import Modal from "@/src/components/Modal";
import ProductImage from "@/src/components/ProductImage";

export default function SalesPage() {
  const [sales, setSales] = useState<ApiSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>([]);

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "">("");

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

  // Detail Modal State
  const [detailTarget, setDetailTarget] = useState<ApiSale | null>(null);

  // Debounce the search term to avoid hitting the API on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadSales = async (productName?: string) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const searchVal =
        typeof productName === "string" ? productName : debouncedSearchTerm;
      const data = await getSales(
        searchVal || undefined,
        statusFilter || undefined,
      );
      setSales(data);
    } catch (error) {
      console.error("Failed to fetch sales", error);
      setLoadError(
        error instanceof Error ? error.message : "Falha ao carregar vendas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
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
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  const getStatusLabel = (status: SaleStatus) => {
    switch (status) {
      case "COMPLETED":
        return "Concluída";
      case "PENDING":
        return "Pendente";
      case "LOSS":
        return "Perda";
      case "RETURNED":
        return "Devolvida";
      default:
        return status;
    }
  };

  const filteredSales = sales;

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
        actionButton={
          loadError
            ? undefined
            : {
                label: "Registrar Venda",
                icon: "add",
                href: "/sales/register",
              }
        }
      ></PageHeader>

      {loadError ? (
        <ErrorState
          title="Falha ao carregar vendas"
          message={loadError}
          onRetry={loadSales}
        />
      ) : (
        <>
          {/* Filters */}
          <SearchFilterBar
            placeholder="Buscar por nome do produto..."
            value={searchTerm}
            onChange={setSearchTerm}
            totalCountText={
              searchTerm || statusFilter
                ? `Mostrando ${sales.length} resultado(s)`
                : `Total: ${sales.length} transações`
            }
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
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
            arrow_drop_down
          </span>
        </div>

        <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all">
          Filtrar
          </button>

        <button className="text-secondary font-semibold px-4 py-2 hover:bg-surface-container-low rounded-lg transition-all">
          Limpar
        </button> */}
          </SearchFilterBar>

      {/* Sales Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        {isLoading ? (
          <LoadingState message="Carregando vendas..." />
        ) : filteredSales.length === 0 ? (
          <EmptyState
            icon="payments"
            title={
              searchTerm || statusFilter
                ? "Nenhuma venda encontrada"
                : "Nenhuma venda registrada"
            }
            description={
              searchTerm || statusFilter
                ? "Nenhuma venda corresponde aos filtros aplicados."
                : "Nenhuma venda cadastrada ainda. Comece registrando sua primeira venda."
            }
            actionButton={
              searchTerm || statusFilter
                ? undefined
                : {
                    label: "Registrar Venda",
                    icon: "add",
                    href: "/sales/register",
                  }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Produto</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Pagamento</th>
                  <th className="p-4 font-semibold text-right">Receita</th>
                  <th className="p-4 font-semibold text-right">
                    Lucro Líquido
                  </th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => setDetailTarget(sale)}
                    className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-data-tabular text-on-surface-variant text-sm whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          url={sale.product?.imageUrl}
                          name={sale.product?.name || "Produto"}
                        />
                        <div>
                          <p className="font-medium text-on-surface text-sm">
                            {sale.product?.name}
                          </p>
                          {sale.product?.category && (
                            <div className="mt-0.5">
                              <Badge
                                label={sale.product.category.name}
                                color={sale.product.category.color ?? undefined}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant text-sm whitespace-nowrap">
                      {sale.customerName || (
                        <span className="italic opacity-50">
                          Cliente Balcão
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-[20px]">
                          {sale.paymentMethod?.icon || "payments"}
                        </span>
                        <span>{sale.paymentMethod?.name || "Dinheiro"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-data-tabular text-on-surface whitespace-nowrap">
                      R$ {sale.finalPrice.toFixed(2)}
                    </td>
                    <td
                      className={`p-4 text-right font-data-tabular font-semibold whitespace-nowrap text-sm ${
                        sale.calculatedProfit >= 0
                          ? "text-on-tertiary-container"
                          : "text-on-error-container"
                      }`}
                    >
                      {sale.calculatedProfit >= 0 ? "+" : "-"} R${" "}
                      {Math.abs(sale.calculatedProfit).toFixed(2)}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <Badge
                        label={getStatusLabel(sale.status)}
                        variant={getStatusVariant(sale.status)}
                      />
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
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
        </>
      )}

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
                {paymentMethods.map((method) => (
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
                        {method.icon || "payments"}
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

      {/* Detail Modal */}
      <Modal
      isOpen={detailTarget !== null}
      onClose={() => setDetailTarget(null)}
      title="Detalhes da Venda"
      titleIcon="receipt_long"
      titleIconColor="text-secondary"
      size="md"
      >
        {detailTarget && (
          <div className="flex flex-col gap-4">
            {/* Produto */}
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant">
        <ProductImage
          url={detailTarget.product?.imageUrl}
          name={detailTarget.product?.name || "Produto"}
        />
        <div>
          <p className="font-semibold text-on-surface text-sm">
            {detailTarget.product?.name}
          </p>
          {detailTarget.product?.category && (
            <div className="mt-0.5">
              <Badge
                label={detailTarget.product.category.name}
                color={detailTarget.product.category.color ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
      {/* Informações */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Data</span>
          <span className="text-sm text-on-surface">{formatDate(detailTarget.createdAt)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Cliente</span>
          <span className="text-sm text-on-surface">
            {detailTarget.customerName || <span className="italic opacity-50">Cliente Balcão</span>}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Quantidade</span>
          <span className="text-sm text-on-surface font-data-tabular">{detailTarget.quantity}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Status</span>
          <Badge
            label={getStatusLabel(detailTarget.status)}
            variant={getStatusVariant(detailTarget.status)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Método de Pagamento</span>
          <div className="flex items-center gap-1.5 text-sm text-on-surface">
            <span className="material-symbols-outlined text-[16px]">
              {detailTarget.paymentMethod?.icon || "payments"}
            </span>
            <span>{detailTarget.paymentMethod?.name || "Dinheiro"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-on-surface-variant">Receita</span>
          <span className="text-sm font-semibold text-on-surface font-data-tabular">
            R$ {detailTarget.finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
      {/* Lucro */}
      <div className={`rounded-xl p-4 border flex flex-col items-center text-center ${detailTarget.calculatedProfit >= 0 ? "bg-tertiary-container border-tertiary/30" : "bg-error-container border-error/30"}`}>
        <span className="text-xs font-semibold text-on-surface-variant mb-1">Lucro Líquido</span>
        <span className={`text-2xl font-bold font-data-tabular ${detailTarget.calculatedProfit >= 0 ? "text-on-tertiary-container" : "text-on-error-container"}`}>
          {detailTarget.calculatedProfit >= 0 ? "+" : "-"} R$ {Math.abs(detailTarget.calculatedProfit).toFixed(2)}
        </span>
      </div>
      {/* Ações */}
      <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
        <button
          type="button"
          onClick={() => {
            setDetailTarget(null);
            openEditModal(detailTarget);
          }}
          className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm font-semibold hover:opacity-90 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Editar
        </button>
        <button
          type="button"
          onClick={() => {
            setDetailTarget(null);
            setDeleteTarget(detailTarget);
          }}
          className="px-4 py-2 rounded-lg border border-error/50 text-error font-label-sm font-semibold hover:bg-error-container transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Excluir
        </button>
            </div>
          </div>
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
