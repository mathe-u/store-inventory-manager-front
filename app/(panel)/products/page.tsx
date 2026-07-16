"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/src/components/PageHeader";
import {
  getProducts,
  deleteProduct,
  updateProduct,
  getCategories,
  calculatePricing,
  type ApiProduct,
  type ApiCategory,
  type PricingResult,
} from "@/src/lib/api";
import SearchFilterBar from "@/src/components/SearchFilterBar";
import LoadingState from "@/src/components/LoadingState";
import EmptyState from "@/src/components/EmptyState";
import Badge from "@/src/components/Badge";
import ErrorAlert from "@/src/components/ErrorAlert";
import ProductImage from "@/src/components/ProductImage";

// Helper: parse the raw metadata JSON string from the API
function parseMetadata(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Derive a "sellingPrice" from the pricing fields for display
function deriveSellingPrice(product: ApiProduct): number {
  const meta = parseMetadata(product.metadata);
  if (typeof meta.sellingPrice === "number") return meta.sellingPrice;
  return 0;
}

function deriveNetProfit(product: ApiProduct, sellingPrice: number): number {
  // Replicates PricingService logic:
  // ICMS is calculated gross-up on (acquisitionCost + shippingCost), not on sellingPrice
  const taxRate = product.taxRate; // decimal
  const customsValue = product.acquisitionCost + product.shippingCost;
  const baseICMS = taxRate < 1 ? customsValue / (1 - taxRate) : customsValue;
  const icmsTax = taxRate < 1 ? baseICMS * taxRate : 0;
  const totalBaseCost =
    product.acquisitionCost +
    product.shippingCost +
    icmsTax +
    product.directCosts;
  return sellingPrice - totalBaseCost;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Debounce the search term to avoid hitting the API too frequently
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveEditError, setSaveEditError] = useState("");

  // Edit Form Fields State
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("0.00");
  const [editStockQuantity, setEditStockQuantity] = useState("0");
  const [editMinStockAlert, setEditMinStockAlert] = useState("5");
  const [editSellingPrice, setEditSellingPrice] = useState("0.00");
  const [editDesiredMargin, setEditDesiredMargin] = useState("30");
  const [editShippingCost, setEditShippingCost] = useState("0.00");
  const [editIcmsTax, setEditIcmsTax] = useState("0");

  // Dynamic pricing calculation states for editing
  const [editPricingResult, setEditPricingResult] =
    useState<PricingResult | null>(null);
  const [editPricingLoading, setEditPricingLoading] = useState(false);
  const [editPricingError, setEditPricingError] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Debounced pricing calculation for edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const acquisitionCost = parseFloat(editCostPrice) || 0;
    const shippingCostVal = parseFloat(editShippingCost) || 0;
    const taxRateVal = (parseFloat(editIcmsTax) || 0) / 100;
    const desiredMarginVal = (parseFloat(editDesiredMargin) || 0) / 100;
    const sellingPriceVal = parseFloat(editSellingPrice) || 0;

    setEditPricingLoading(true);
    setEditPricingError("");

    const timer = setTimeout(() => {
      calculatePricing({
        acquisitionCost,
        shippingCost: shippingCostVal,
        taxRate: taxRateVal,
        desiredMargin: desiredMarginVal,
        sellingPrice: sellingPriceVal,
      })
        .then((result) => {
          setEditPricingResult(result);
          setEditPricingLoading(false);
        })
        .catch((err) => {
          setEditPricingError(
            err instanceof Error
              ? err.message
              : "Não foi possível calcular a precificação.",
          );
          setEditPricingLoading(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    isEditMode,
    editCostPrice,
    editShippingCost,
    editIcmsTax,
    editDesiredMargin,
    editSellingPrice,
  ]);

  const startEditing = () => {
    if (!selectedProduct) return;
    setEditName(selectedProduct.name);
    setEditCategoryId(selectedProduct.categoryId ?? "");
    setEditCostPrice(selectedProduct.acquisitionCost.toString());
    setEditStockQuantity(selectedProduct.stockQuantity.toString());
    setEditMinStockAlert(selectedProduct.minStockAlert.toString());
    setEditSellingPrice(deriveSellingPrice(selectedProduct).toString());
    setEditDesiredMargin((selectedProduct.desiredMargin * 100).toString());
    setEditShippingCost(selectedProduct.shippingCost.toString());
    setEditIcmsTax((selectedProduct.taxRate * 100).toString());
    setEditPricingResult(null);
    setSaveEditError("");
    setIsEditMode(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!editName) {
      setSaveEditError("Por favor, preencha o nome do produto.");
      return;
    }

    setIsSavingEdit(true);
    setSaveEditError("");

    try {
      const updatedProduct = await updateProduct(selectedProduct.id, {
        name: editName,
        categoryId: editCategoryId || null,
        acquisitionCost: parseFloat(editCostPrice) || 0,
        shippingCost: parseFloat(editShippingCost) || 0,
        taxRate: (parseFloat(editIcmsTax) || 0) / 100,
        desiredMargin: (parseFloat(editDesiredMargin) || 0) / 100,
        stockQuantity: parseInt(editStockQuantity) || 0,
        minStockAlert: parseInt(editMinStockAlert) || 0,
        metadata: {
          sellingPrice: parseFloat(editSellingPrice) || 0,
          suggestedPrice: editPricingResult?.suggestedPrice ?? 0,
        },
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
      setSelectedProduct(updatedProduct);
      setIsEditMode(false);
    } catch (err) {
      setSaveEditError(
        err instanceof Error ? err.message : "Falha ao salvar produto.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const loadProducts = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      setLoadError("");
      try {
        const searchVal =
          typeof search === "string" ? search : debouncedSearchTerm;
        const data = await getProducts(searchVal);
        setProducts(data);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load products.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchTerm],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts, debouncedSearchTerm]);

  const filteredProducts = products;

  const handleDeleteClick = (product: ApiProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      if (selectedProduct?.id === productToDelete.id) {
        setIsDetailsOpen(false);
        setSelectedProduct(null);
      }
      setProductToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (product: ApiProduct) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
    setIsEditMode(false);
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      {/* Page Header */}
      <PageHeader
        title="Produtos Cadastrados"
        description="Visualize e gerencie seus produtos"
        breadcrumbs={[
          { label: "Produtos", icon: "inventory_2" },
          { label: "Catálogo de Produtos" },
        ]}
        onRefresh={loadProducts}
        actionButton={{
          label: "Cadastrar Produto",
          icon: "add",
          href: "/products/register",
        }}
      ></PageHeader>

      {/* Search and Filters */}
      <SearchFilterBar
        placeholder="Filtrar por nome, Id ou categoria..."
        value={searchTerm}
        onChange={setSearchTerm}
        totalCountText={
          searchTerm
            ? `Mostrando ${products.length} resultado(s)`
            : `Total: ${products.length} produtos`
        }
        isLoading={isLoading}
      />

      {/* Error state */}
      {loadError && (
        <ErrorAlert
          title="Falha ao carregar produtos"
          message={loadError}
          onRetry={loadProducts}
        />
      )}

      {/* Products Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        {isLoading ? (
          <LoadingState message="Carregando produtos..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="Nenhum produto encontrado"
            description={
              searchTerm
                ? "Nenhum produto com esse filtro."
                : "Nenhum produto cadastrado ainda. Comece cadastrando seu primeiro produto."
            }
            actionButton={{
              label: "Cadastrar Produto",
              icon: "add",
              href: "/products/register",
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                  <th className="p-4 font-semibold w-14"></th>
                  <th className="p-4 font-semibold">Nome</th>
                  <th className="p-4 font-semibold">Categoria</th>
                  <th className="p-4 font-semibold text-right">Custo</th>
                  <th className="p-4 font-semibold text-right">Margem</th>
                  <th className="p-4 font-semibold text-right">Estoque</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const meta = parseMetadata(p.metadata);
                  // Use real category relation, fallback to metadata
                  const categoryName =
                    p.category?.name ??
                    (typeof meta.category === "string" ? meta.category : "—");
                  const categoryColor = p.category?.color ?? null;
                  const sellingPrice = deriveSellingPrice(p);
                  const netProfit = deriveNetProfit(p, sellingPrice);
                  // desiredMargin stored as decimal (0.30 = 30%)
                  const marginPct =
                    p.desiredMargin < 1
                      ? p.desiredMargin * 100
                      : p.desiredMargin;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p)}
                      className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <ProductImage url={p.imageUrl} name={p.name} />
                      </td>
                      <td className="p-4 font-medium text-on-surface">
                        {p.name}
                      </td>
                      <td className="p-4">
                        <Badge
                          label={categoryName}
                          color={categoryColor ?? undefined}
                        />
                      </td>
                      <td className="p-4 text-right font-data-tabular text-on-surface-variant">
                        R$ {p.acquisitionCost.toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-data-tabular font-bold text-on-surface">
                        {marginPct.toFixed(1)}%
                      </td>
                      <td className="p-4 text-right font-data-tabular text-on-surface">
                        <Badge
                          label={String(p.stockQuantity)}
                          variant={
                            p.stockQuantity <= p.minStockAlert
                              ? "danger"
                              : "success"
                          }
                          tabular
                        />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(p);
                            }}
                            className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-secondary-fixed-variant transition-colors cursor-pointer"
                            title="Ver detalhes"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(p, e)}
                            className="p-1.5 rounded hover:bg-error-container text-outline hover:text-error transition-colors cursor-pointer"
                            title="Deletar Produto"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailsOpen &&
        selectedProduct &&
        (() => {
          const meta = parseMetadata(selectedProduct.metadata);
          // Category
          const categoryName =
            selectedProduct.category?.name ??
            (typeof meta.category === "string" ? meta.category : "—");
          const categoryColor = selectedProduct.category?.color ?? null;

          // Selling price from metadata (saved at register time) or form input
          const sellingPrice = isEditMode
            ? parseFloat(editSellingPrice) || 0
            : deriveSellingPrice(selectedProduct);

          // Financial calculations matching PricingService logic
          const netProfit = isEditMode
            ? (editPricingResult?.atSellingPrice?.netProfit ?? 0)
            : deriveNetProfit(selectedProduct, sellingPrice);

          const suggestedPrice = isEditMode
            ? (editPricingResult?.suggestedPrice ?? null)
            : typeof meta.suggestedPrice === "number"
              ? meta.suggestedPrice
              : null;

          // taxRate stored as decimal (0.20 = 20%)
          const taxRatePct = isEditMode
            ? parseFloat(editIcmsTax) || 0
            : selectedProduct.taxRate * 100;

          const costVal = isEditMode
            ? parseFloat(editCostPrice) || 0
            : selectedProduct.acquisitionCost;

          const shipVal = isEditMode
            ? parseFloat(editShippingCost) || 0
            : selectedProduct.shippingCost;

          const taxRateDecimal = taxRatePct / 100;
          const customsValue = costVal + shipVal;
          const baseICMS =
            taxRateDecimal < 1
              ? customsValue / (1 - taxRateDecimal)
              : customsValue;
          const icmsTaxAmount =
            taxRateDecimal < 1 ? baseICMS * taxRateDecimal : 0;

          // desiredMargin stored as decimal (0.30 = 30%)
          const drawerMarginPct = isEditMode
            ? parseFloat(editDesiredMargin) || 0
            : selectedProduct.desiredMargin * 100;

          const lossIndexPct = selectedProduct.lossIndex * 100;

          // Markup: totalBaseCost multiplier (consistent with PricingService)
          const totalBaseCost =
            costVal + shipVal + icmsTaxAmount + selectedProduct.directCosts;

          const markup = isEditMode
            ? editPricingResult?.atSellingPrice?.markup !== undefined
              ? editPricingResult.atSellingPrice.markup * 100
              : 0
            : totalBaseCost > 0
              ? (sellingPrice / totalBaseCost) * 100
              : 0;

          const contributionMargin = isEditMode
            ? (editPricingResult?.atSellingPrice?.contributionMargin ?? 0)
            : sellingPrice > 0
              ? (netProfit / sellingPrice) * 100
              : 0;

          return (
            <>
              <div
                onClick={() => {
                  if (!isSavingEdit) {
                    setIsDetailsOpen(false);
                  }
                }}
                className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 transition-opacity duration-200"
              />
              <div className="fixed right-0 top-0 h-full w-[460px] max-w-[90%] bg-surface-container-lowest border-l border-outline-variant shadow-2xl z-50 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-outline-variant pb-4 mb-6">
                  {isEditMode ? (
                    <div className="flex-1 mr-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          edit
                        </span>
                        <h3 className="font-headline-md text-headline-sm text-on-surface font-bold">
                          Editar Produto
                        </h3>
                      </div>

                      {/* Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-on-surface-variant font-semibold">
                          Nome do Produto
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary transition-all"
                          placeholder="Nome do produto"
                        />
                      </div>

                      {/* Category Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-on-surface-variant font-semibold">
                          Categoria
                        </label>
                        <div className="relative">
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            disabled={categoriesLoading}
                            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary transition-all appearance-none disabled:opacity-60"
                          >
                            <option value="">
                              {categoriesLoading
                                ? "Carregando categorias..."
                                : "Sem categoria"}
                            </option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                            arrow_drop_down
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Badge
                        label={categoryName}
                        color={categoryColor ?? undefined}
                      />
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-2 leading-snug">
                        {selectedProduct.name}
                      </h3>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (!isSavingEdit) {
                        setIsDetailsOpen(false);
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      close
                    </span>
                  </button>
                </div>

                {/* Error Alerts */}
                {(saveEditError || editPricingError) && (
                  <div className="flex flex-col gap-2 mb-4">
                    {saveEditError && (
                      <div className="p-3 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-[18px]">
                          error
                        </span>
                        <p className="text-xs font-semibold">{saveEditError}</p>
                      </div>
                    )}
                    {editPricingError && (
                      <div className="p-3 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-[18px]">
                          error
                        </span>
                        <p className="text-xs font-semibold">
                          {editPricingError}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-6 flex-grow">
                  {/* Primary metric */}
                  <div className="bg-primary-container rounded-xl p-5 border border-primary-fixed-dim flex flex-col items-center justify-center text-center">
                    <span className="font-label-sm text-label-sm text-on-primary-container mb-1">
                      Lucro Líquido por Unidade
                    </span>
                    {editPricingLoading && isEditMode ? (
                      <div className="flex flex-col items-center gap-2 w-full py-1">
                        <div className="h-8 w-24 rounded bg-on-primary-fixed-variant/20 animate-pulse" />
                        <div className="h-4 w-16 rounded bg-on-primary-fixed-variant/20 animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-data-tabular text-primary-fixed-dim text-lg">
                            R$
                          </span>
                          <span
                            className={`font-data-tabular text-3xl font-bold ${
                              netProfit > 0
                                ? "text-tertiary-fixed"
                                : "text-error"
                            }`}
                          >
                            {netProfit.toFixed(2)}
                          </span>
                        </div>
                        <span
                          className={`mt-2.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                            netProfit > 0
                              ? "bg-tertiary-container text-on-tertiary-container"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {netProfit > 0 ? "LUCRATIVO" : "ATENÇÃO: PREJUÍZO"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Pricing metrics grid */}
                  <div>
                    <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider mb-3">
                      Indicadores de Precificação
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                        <span className="text-xs text-on-surface-variant block mb-1">
                          Markup
                        </span>
                        {editPricingLoading && isEditMode ? (
                          <div className="h-5 w-16 rounded bg-on-surface-variant/20 animate-pulse" />
                        ) : (
                          <span className="font-data-tabular text-lg font-bold text-on-surface">
                            {markup.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                        <span className="text-xs text-on-surface-variant block mb-1">
                          Margem de Contribuição
                        </span>
                        {editPricingLoading && isEditMode ? (
                          <div className="h-5 w-16 rounded bg-on-surface-variant/20 animate-pulse" />
                        ) : (
                          <span className="font-data-tabular text-lg font-bold text-on-surface">
                            {contributionMargin.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {isEditMode ? (
                        <>
                          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/40 flex flex-col gap-1">
                            <label className="text-xs text-on-surface-variant font-medium">
                              Estoque
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editStockQuantity}
                              onChange={(e) =>
                                setEditStockQuantity(e.target.value)
                              }
                              className="w-full px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-on-surface font-semibold text-sm focus:outline-none focus:border-secondary text-right"
                            />
                          </div>
                          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/40 flex flex-col gap-1">
                            <label className="text-xs text-on-surface-variant font-medium">
                              Alerta Mínimo
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editMinStockAlert}
                              onChange={(e) =>
                                setEditMinStockAlert(e.target.value)
                              }
                              className="w-full px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-on-surface font-semibold text-sm focus:outline-none focus:border-secondary text-right"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                            <span className="text-xs text-on-surface-variant block mb-1">
                              Estoque
                            </span>
                            <span
                              className={`font-data-tabular text-lg font-bold ${
                                selectedProduct.stockQuantity <=
                                selectedProduct.minStockAlert
                                  ? "text-error"
                                  : "text-on-surface"
                              }`}
                            >
                              {selectedProduct.stockQuantity}{" "}
                              <span className="text-xs font-normal text-on-surface-variant">
                                un.
                              </span>
                            </span>
                          </div>
                          <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                            <span className="text-xs text-on-surface-variant block mb-1">
                              Índice de Perda
                            </span>
                            <span
                              className={`font-data-tabular text-lg font-bold ${
                                lossIndexPct > 10
                                  ? "text-error"
                                  : "text-on-surface"
                              }`}
                            >
                              {lossIndexPct.toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditMode ? (
                    /* Edit Form pricing inputs */
                    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 flex flex-col gap-4">
                      <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/40 pb-2">
                        Parâmetros de Precificação
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="text-xs font-medium text-on-surface-variant">
                            Preço de Venda Pretendido
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-on-surface-variant text-sm font-semibold">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={editSellingPrice}
                              onChange={(e) =>
                                setEditSellingPrice(e.target.value)
                              }
                              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary text-right font-semibold font-data-tabular"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-on-surface-variant">
                            Margem Desejada (%)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={editDesiredMargin}
                            onChange={(e) =>
                              setEditDesiredMargin(e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary text-right font-semibold font-data-tabular"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-on-surface-variant">
                            Custo Aquisição
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-on-surface-variant text-sm font-semibold">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={editCostPrice}
                              onChange={(e) => setEditCostPrice(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary text-right font-semibold font-data-tabular"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-on-surface-variant">
                            Frete / Envio
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-on-surface-variant text-sm font-semibold">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={editShippingCost}
                              onChange={(e) =>
                                setEditShippingCost(e.target.value)
                              }
                              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary text-right font-semibold font-data-tabular"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-on-surface-variant">
                            ICMS / Taxas (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editIcmsTax}
                            onChange={(e) => setEditIcmsTax(e.target.value)}
                            className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-secondary text-right font-semibold font-data-tabular"
                          />
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/40 pt-3.5 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
                          <span>Preço Mínimo Sugerido:</span>
                          {editPricingLoading ? (
                            <div className="h-4 w-16 bg-on-surface-variant/20 animate-pulse rounded" />
                          ) : (
                            <span className="text-secondary font-bold font-data-tabular">
                              R${" "}
                              {suggestedPrice !== null
                                ? suggestedPrice.toFixed(2)
                                : "0.00"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
                          <span>Custo Total Base:</span>
                          <span className="text-on-surface font-bold font-data-tabular">
                            R$ {totalBaseCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Read Mode Details Panels */
                    <>
                      {/* Prices */}
                      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 flex flex-col gap-3">
                        <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/40 pb-2">
                          Preços
                        </h4>
                        <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                          <span>Preço de Venda (cadastrado)</span>
                          <span className="font-data-tabular font-medium text-on-surface">
                            R$ {sellingPrice.toFixed(2)}
                          </span>
                        </div>
                        {suggestedPrice !== null && (
                          <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                            <span>Preço Sugerido (calculado)</span>
                            <span className="font-data-tabular font-medium text-secondary">
                              R$ {suggestedPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-body-md text-on-surface-variant border-t border-outline-variant/40 pt-2">
                          <span>Margem Desejada</span>
                          <span className="font-data-tabular font-bold text-secondary text-lg">
                            {drawerMarginPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Cost breakdown */}
                      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 flex flex-col gap-3">
                        <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/40 pb-2">
                          Composição de Custos
                        </h4>
                        <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                          <span>Custo de Aquisição</span>
                          <span className="font-data-tabular font-medium text-on-surface">
                            R$ {selectedProduct.acquisitionCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                          <span>Frete / Envio</span>
                          <span className="font-data-tabular font-medium text-on-surface">
                            R$ {selectedProduct.shippingCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                          <span>
                            ICMS / Marketplace ({taxRatePct.toFixed(1)}%)
                          </span>
                          <span className="font-data-tabular font-medium text-on-surface">
                            R$ {icmsTaxAmount.toFixed(2)}
                          </span>
                        </div>
                        {selectedProduct.directCosts > 0 && (
                          <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                            <span>Custos Diretos</span>
                            <span className="font-data-tabular font-medium text-on-surface">
                              R$ {selectedProduct.directCosts.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-body-md border-t border-outline-variant/40 pt-2 font-medium">
                          <span className="text-on-surface">
                            Custo Total Base
                          </span>
                          <span className="font-data-tabular font-bold text-on-surface text-lg">
                            R$ {totalBaseCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer actions */}
                <div className="border-t border-outline-variant pt-4 mt-6 flex gap-3">
                  {isEditMode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        disabled={isSavingEdit}
                        className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="flex-1 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-opacity-95 transition-colors font-label-sm text-label-sm font-semibold cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                      >
                        {isSavingEdit ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">
                              progress_activity
                            </span>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">
                              save
                            </span>
                            Salvar
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(selectedProduct, e)}
                        className="flex-1 py-2.5 rounded-lg border border-error text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label-sm text-label-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                        Remover
                      </button>
                      <button
                        type="button"
                        onClick={startEditing}
                        className="flex-1 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-opacity-90 transition-colors font-label-sm text-label-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDetailsOpen(false)}
                        className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm font-semibold cursor-pointer"
                      >
                        Fechar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          );
        })()}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[32px]">
                warning
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Voce tem certeza que deseja remover{" "}
              <span className="font-semibold text-on-surface">
                {productToDelete.name}
              </span>{" "}
              do seu estoque? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm hover:bg-opacity-95 transition-colors cursor-pointer font-semibold disabled:opacity-75 flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                Remover Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
