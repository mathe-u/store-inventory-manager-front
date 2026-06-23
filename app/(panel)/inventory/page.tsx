"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getProducts, deleteProduct, type ApiProduct } from "@/src/lib/api";

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
    const taxAmount = sellingPrice * (product.taxRate / 100);
    const totalCosts = product.acquisitionCost + product.shippingCost + taxAmount + product.directCosts;
    return sellingPrice - totalCosts;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // Modals & Panels State
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : "Failed to load products.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Filter products based on search term
    const filteredProducts = products.filter((p) => {
        const meta = parseMetadata(p.metadata);
        const sku = typeof meta.sku === "string" ? meta.sku : "";
        const categoryName = p.category?.name ?? (typeof meta.category === "string" ? meta.category : "");
        return (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

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
    };

    return (
        <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
            {/* Page Header */}
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                        <span>Inventário</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-on-surface">Catálogo de Produtos</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Produtos Cadastrados</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadProducts}
                        className="p-2 rounded-DEFAULT border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                        title="Atualizar"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                    <Link
                        href="/inventory/register"
                        className="px-4 py-2.5 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Cadastrar Produto
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex justify-between items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
                <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary rounded-DEFAULT">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                        search
                    </span>
                    <input
                        className="w-full bg-surface-container-low border-none rounded-DEFAULT py-2 pl-9 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                        placeholder="Filtrar por nome, Id ou categoria..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-label-sm text-on-surface-variant font-medium">
                    {isLoading ? "Carregando..." : `Mostrando ${filteredProducts.length} de ${products.length} produtos`}
                </div>
            </div>

            {/* Error state */}
            {loadError && (
                <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-[24px]">error</span>
                    <div>
                        <p className="font-label-sm font-semibold">Falha ao carregar produtos</p>
                        <p className="font-body-md text-sm">{loadError}</p>
                    </div>
                    <button
                        onClick={loadProducts}
                        className="ml-auto px-3 py-1.5 rounded-lg border border-error text-error font-label-sm text-label-sm hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[48px] animate-spin">progress_activity</span>
                        <p className="font-body-md text-on-surface-variant">Loading products from server...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-outline-variant text-[48px]">inventory_2</span>
                        <p className="font-headline-md text-on-surface font-semibold">No products found</p>
                        <p className="font-body-md text-on-surface-variant max-w-sm">
                            {searchTerm
                                ? "We couldn't find any items matching your search."
                                : "No products registered yet. Start by adding your first product."}
                        </p>
                        <Link
                            href="/inventory/register"
                            className="mt-2 px-4 py-2 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-all font-semibold"
                        >
                            Cadastrar Produto
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                                    <th className="p-4 font-semibold">Nome</th>
                                    <th className="p-4 font-semibold">SKU</th>
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
                                    const sku = typeof meta.sku === "string" ? meta.sku : "—";
                                    // Use real category relation, fallback to metadata
                                    const categoryName = p.category?.name ?? (typeof meta.category === "string" ? meta.category : "—");
                                    const categoryColor = p.category?.color ?? null;
                                    const sellingPrice = deriveSellingPrice(p);
                                    const netProfit = deriveNetProfit(p, sellingPrice);
                                    // desiredMargin stored as decimal (0.30 = 30%)
                                    const marginPct = p.desiredMargin < 1 ? p.desiredMargin * 100 : p.desiredMargin;

                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => handleRowClick(p)}
                                            className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors cursor-pointer"
                                        >
                                            <td className="p-4 font-medium text-on-surface">{p.name}</td>
                                            <td className="p-4 font-data-tabular uppercase text-on-surface-variant">{sku}</td>
                                            <td className="p-4">
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                                    style={categoryColor ? {
                                                        backgroundColor: categoryColor + '22',
                                                        color: categoryColor,
                                                        borderColor: categoryColor + '44',
                                                    } : {}}
                                                >
                                                    {categoryName}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-data-tabular text-on-surface-variant">
                                                R$ {p.acquisitionCost.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right font-data-tabular font-bold text-on-surface">
                                                {marginPct.toFixed(1)}%
                                            </td>
                                            <td className="p-4 text-right font-data-tabular text-on-surface">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stockQuantity <= p.minStockAlert
                                                        ? "bg-error-container text-on-error-container"
                                                        : "bg-tertiary-container text-on-tertiary-container"
                                                        }`}
                                                >
                                                    {p.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(p);
                                                        }}
                                                        className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-secondary-fixed-variant transition-colors cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(p, e)}
                                                        className="p-1.5 rounded hover:bg-error-container text-outline hover:text-error transition-colors cursor-pointer"
                                                        title="Delete Product"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
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

            {/* Details Side-Drawer */}
            {isDetailsOpen && selectedProduct && (() => {
                const meta = parseMetadata(selectedProduct.metadata);
                const sku = typeof meta.sku === "string" ? meta.sku : "—";
                // Use real category relation, fallback to metadata
                const categoryName = selectedProduct.category?.name ?? (typeof meta.category === "string" ? meta.category : "—");
                const categoryColor = selectedProduct.category?.color ?? null;
                const sellingPrice = deriveSellingPrice(selectedProduct);
                const netProfit = deriveNetProfit(selectedProduct, sellingPrice);
                // taxRate stored as decimal (0.18 = 18%)
                const taxRatePct = selectedProduct.taxRate < 1 ? selectedProduct.taxRate * 100 : selectedProduct.taxRate;
                const taxAmount = sellingPrice * (selectedProduct.taxRate < 1 ? selectedProduct.taxRate : selectedProduct.taxRate / 100);
                // desiredMargin stored as decimal (0.30 = 30%)
                const drawerMarginPct = selectedProduct.desiredMargin < 1 ? selectedProduct.desiredMargin * 100 : selectedProduct.desiredMargin;
                const markup =
                    selectedProduct.acquisitionCost > 0
                        ? ((sellingPrice - selectedProduct.acquisitionCost) / selectedProduct.acquisitionCost) * 100
                        : 0;
                const contributionMargin =
                    sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

                return (
                    <>
                        <div
                            onClick={() => setIsDetailsOpen(false)}
                            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 transition-opacity duration-200"
                        />
                        <div className="fixed right-0 top-0 h-full w-[460px] max-w-[90%] bg-surface-container-lowest border-l border-outline-variant shadow-2xl z-50 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-start border-b border-outline-variant pb-4 mb-6">
                                <div>
                                    <span
                                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                        style={categoryColor ? {
                                            backgroundColor: categoryColor + '22',
                                            color: categoryColor,
                                            borderColor: categoryColor + '44',
                                        } : { background: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)', borderColor: 'var(--color-outline-variant)' }}
                                    >
                                        {categoryName}
                                    </span>
                                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-2 leading-snug">
                                        {selectedProduct.name}
                                    </h3>
                                    <p className="font-data-tabular text-sm text-on-surface-variant mt-1 uppercase">SKU: {sku}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-6 flex-grow">
                                <div className="bg-primary-container rounded-xl p-5 border border-primary-fixed-dim flex flex-col items-center justify-center text-center">
                                    <span className="font-label-sm text-label-sm text-on-primary-container mb-1">Unit Net Profit</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-data-tabular text-primary-fixed-dim text-lg">R$</span>
                                        <span className={`font-data-tabular text-3xl font-bold ${netProfit > 0 ? "text-tertiary-fixed" : "text-error"}`}>
                                            {netProfit.toFixed(2)}
                                        </span>
                                    </div>
                                    <span className={`mt-2.5 px-3 py-0.5 rounded-full text-xs font-bold ${netProfit > 0 ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"}`}>
                                        {netProfit > 0 ? "PROFITABLE" : "LOSS WARNING"}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider mb-3">Pricing Metrics</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                                            <span className="text-xs text-on-surface-variant block mb-1">Markup</span>
                                            <span className="font-data-tabular text-lg font-bold text-on-surface">{markup.toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                                            <span className="text-xs text-on-surface-variant block mb-1">Contribution Margin</span>
                                            <span className="font-data-tabular text-lg font-bold text-on-surface">{contributionMargin.toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                                            <span className="text-xs text-on-surface-variant block mb-1">Stock</span>
                                            <span className="font-data-tabular text-lg font-bold text-on-surface">{selectedProduct.stockQuantity} units</span>
                                        </div>
                                        <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/40">
                                            <span className="text-xs text-on-surface-variant block mb-1">Loss Index</span>
                                            <span className="font-data-tabular text-lg font-bold text-on-surface">{(selectedProduct.lossIndex * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 flex flex-col gap-3">
                                    <h4 className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/40 pb-2">Cost Breakdown</h4>
                                    <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                                        <span>Acquisition Cost</span>
                                        <span className="font-data-tabular font-medium text-on-surface">R$ {selectedProduct.acquisitionCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                                        <span>Shipping Cost</span>
                                        <span className="font-data-tabular font-medium text-on-surface">R$ {selectedProduct.shippingCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                                        <span>Tax / Marketplace Fee ({taxRatePct.toFixed(1)}%)</span>
                                        <span className="font-data-tabular font-medium text-on-surface">R$ {taxAmount.toFixed(2)}</span>
                                    </div>
                                    {selectedProduct.directCosts > 0 && (
                                        <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                                            <span>Direct Costs</span>
                                            <span className="font-data-tabular font-medium text-on-surface">R$ {selectedProduct.directCosts.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-body-md text-on-surface-variant border-t border-outline-variant/40 pt-2 font-medium">
                                        <span className="text-on-surface">Desired Margin</span>
                                        <span className="font-data-tabular font-bold text-secondary text-lg">{drawerMarginPct.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-outline-variant pt-4 mt-6 flex gap-3">
                                <button
                                    onClick={(e) => handleDeleteClick(selectedProduct, e)}
                                    className="flex-1 py-2.5 rounded-lg border border-error text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label-sm text-label-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete Product
                                </button>
                                <button
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm font-semibold cursor-pointer"
                                >
                                    Close Details
                                </button>
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
                            <span className="material-symbols-outlined text-[32px]">warning</span>
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Confirmar Exclusão</h3>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            Voce tem certeza que deseja remover {" "}
                            <span className="font-semibold text-on-surface">{productToDelete.name}</span> do seu inventário? Essa ação não pode ser desfeita.
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
                                {isDeleting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                                Remover Produto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
