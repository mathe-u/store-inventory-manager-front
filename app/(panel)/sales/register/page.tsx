"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getProducts,
  createSale,
  calculatePricing,
  ApiProduct,
  PricingResult,
} from "@/src/lib/api";
import PageHeader from "@/src/components/PageHeader";

function parseMetadata(rawMetadata: string): Record<string, unknown> {
  try {
    return JSON.parse(rawMetadata);
  } catch (e) {
    return {};
  }
}

function deriveSellingPrice(product: ApiProduct): number {
  const meta = parseMetadata(product.metadata);
  if (typeof meta.sellingPrice === "number") {
    return meta.sellingPrice;
  }
  return 0;
}

export default function LogNewSale() {
  const router = useRouter();

  // API State
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Form Fields State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [saleDate, setSaleDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [saleStatus, setSaleStatus] = useState<
    "COMPLETED" | "LOSS" | "RETURNED" | "PENDING"
  >("COMPLETED");

  // Mock Form Fields (Optional in UI but not sent to API)
  const [customerName, setCustomerName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  // Pricing Calculation State
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(
    null,
  );
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Products on mount
  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProductsError("Falha ao carregar a lista de produtos.");
        setProductsLoading(false);
      });
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Auto-fill price when product changes
  useEffect(() => {
    if (selectedProduct) {
      const price = deriveSellingPrice(selectedProduct);
      setFinalPrice(price > 0 ? price.toFixed(2) : "");
    } else {
      setFinalPrice("");
    }
  }, [selectedProductId, selectedProduct]);

  // Debounced pricing calculation
  useEffect(() => {
    if (!selectedProduct) {
      setPricingResult(null);
      return;
    }

    const priceNum = parseFloat(finalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setPricingResult(null);
      return;
    }

    setPricingLoading(true);
    setPricingError(null);

    const delayDebounceFn = setTimeout(() => {
      calculatePricing({
        acquisitionCost: selectedProduct.acquisitionCost,
        shippingCost: selectedProduct.shippingCost,
        taxRate: selectedProduct.taxRate,
        desiredMargin: selectedProduct.desiredMargin,
        directCosts: selectedProduct.directCosts,
        lossIndex: selectedProduct.lossIndex,
        sellingPrice: priceNum,
      })
        .then((res) => {
          setPricingResult(res);
          setPricingLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setPricingError("Erro ao calcular precificação.");
          setPricingLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedProduct, finalPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setSubmitError("Por favor, selecione um produto.");
      return;
    }

    const priceNum = parseFloat(finalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setSubmitError("Por favor, insira um preço de venda válido.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createSale({
        productId: selectedProductId,
        quantity,
        finalPrice: priceNum,
        status: saleStatus,
      });
      router.push("/sales");
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || "Ocorreu um erro ao registrar a venda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derive display values for Live Summary
  const priceVal = parseFloat(finalPrice) || 0;
  const totalRevenue = priceVal * quantity;

  // Expected values from the pricingResult or locally calculated if pricing is loading
  const netProfitPerUnit = pricingResult?.atSellingPrice?.netProfit ?? 0;
  const expectedProfitVal = netProfitPerUnit * quantity;

  const contributionMarginVal =
    pricingResult?.atSellingPrice?.contributionMargin ?? 0;

  // Tax calculations
  const taxRateVal = selectedProduct ? selectedProduct.taxRate : 0;
  const costVal = selectedProduct ? selectedProduct.acquisitionCost : 0;
  const shipVal = selectedProduct ? selectedProduct.shippingCost : 0;
  const customsValue = customsValueVal();
  function customsValueVal() {
    return costVal + shipVal;
  }
  const baseICMS =
    taxRateVal < 1 ? customsValue / (1 - taxRateVal) : customsValue;
  const icmsTaxAmount = taxRateVal < 1 ? baseICMS * taxRateVal : 0;
  const totalTaxVal = icmsTaxAmount * quantity;

  const totalBaseCost = pricingResult
    ? pricingResult.totalBaseCost * quantity
    : 0;

  const currentStock = selectedProduct ? selectedProduct.stockQuantity : 0;
  const minStock = selectedProduct ? selectedProduct.minStockAlert : 0;
  const remainingStock = Math.max(0, currentStock - quantity);

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      {/* Page Header */}
      <PageHeader
        title="Registrar Nova Venda"
        description="Registre uma nova transação no seu marketplace."
        breadcrumbs={[
          { label: "Vendas", icon: "payments", href: "/sales" },
          { label: "Nova Venda" },
        ]}
        actionButton={{
          label: "Voltar",
          icon: "arrow_back",
          variant: "outlined",
          href: "/sales",
        }}
      ></PageHeader>

      {/* Asymmetric 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-gutter items-start">
        {/* Left Column: The Form Canvas (Spans 7) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden"
          >
            {/* Decorative subtle gradient top border indication */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-tertiary-fixed opacity-80" />

            <div className="mb-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Detalhes da venda
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Selecione o item vendido e registre os termos da venda.
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">
                  error
                </span>
                <p className="text-xs font-semibold">{submitError}</p>
              </div>
            )}

            {/* Product Selector */}
            <div className="space-y-2">
              <label
                className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                htmlFor="product-select"
              >
                Produto listado
              </label>
              <div className="relative">
                <select
                  id="product-select"
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={productsLoading}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm appearance-none disabled:opacity-60"
                >
                  <option value="">
                    {productsLoading
                      ? "Carregando produtos..."
                      : "Selecione o produto vendido..."}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Disponível: {p.stockQuantity} un. | Custo: R${" "}
                      {p.acquisitionCost.toFixed(2)})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
              {productsError && (
                <p className="text-xs text-error font-semibold mt-1">
                  {productsError}
                </p>
              )}
            </div>

            {/* Row: Quantity & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                  htmlFor="sale-qty"
                >
                  Quantidade vendida
                </label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm text-right font-semibold"
                  id="sale-qty"
                  min="1"
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                  htmlFor="sale-date"
                >
                  Data da venda
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    calendar_today
                  </span>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
                    id="sale-date"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row: Final Price & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                  htmlFor="final-price"
                >
                  Preço de Venda (Unitário)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-data-tabular text-data-tabular text-outline font-semibold">
                    R$
                  </span>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm text-right font-semibold"
                    id="final-price"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    required
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                  htmlFor="sale-status"
                >
                  Status da Venda
                </label>
                <div className="relative">
                  <select
                    id="sale-status"
                    value={saleStatus}
                    onChange={(e) => setSaleStatus(e.target.value as any)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm appearance-none font-semibold"
                  >
                    <option value="COMPLETED">Concluída (COMPLETED)</option>
                    <option value="PENDING">Pendente (PENDING)</option>
                    <option value="LOSS">Perda (LOSS)</option>
                    <option value="RETURNED">Devolvida (RETURNED)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant my-2" />

            {/* Customer Info (Optional Visual Form Field) */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant font-medium"
                  htmlFor="customer-name"
                >
                  Nome do cliente
                </label>
                <span className="font-label-sm text-label-sm text-outline-variant font-normal">
                  Opcional
                </span>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  person
                </span>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
                  id="customer-name"
                  placeholder="Ex: Matheus Silva"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method (Bento Radio Group - Visual Form Field) */}
            <div className="space-y-3">
              <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium">
                Método de pagamento
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="payment"
                    type="radio"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      payments
                    </span>
                    <span className="font-label-sm text-label-sm">
                      Dinheiro
                    </span>
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="payment"
                    type="radio"
                    value="pix"
                    checked={paymentMethod === "pix"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                    <span className="material-symbols-outlined">
                      send_money
                    </span>
                    <span className="font-label-sm text-label-sm">Pix</span>
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="payment"
                    type="radio"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                    <span className="material-symbols-outlined">
                      account_balance_wallet
                    </span>
                    <span className="font-label-sm text-label-sm">Cartão</span>
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="payment"
                    type="radio"
                    value="other"
                    checked={paymentMethod === "other"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                    <span className="material-symbols-outlined">
                      more_horiz
                    </span>
                    <span className="font-label-sm text-label-sm">Outros</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-outline-variant">
              <Link
                href="/sales"
                className="px-6 py-2 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border border-transparent flex items-center justify-center cursor-pointer"
              >
                Cancelar
              </Link>
              <button
                className="px-6 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                type="submit"
                disabled={isSubmitting || productsLoading}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    Processando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    Confirmar Venda
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Summary / Expected Profit (Spans 5) */}
        <div className="lg:col-span-5 relative">
          {/* Sticky Container for Desktop */}
          <div className="sticky top-24 space-y-6">
            {/* Primary Profit Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              {/* Decorative subtle gradient top border indication */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-tertiary-fixed opacity-80" />

              {/* Header */}
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Lucro Esperado
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">
                    {selectedProduct
                      ? `Baseado nos custos de: ${selectedProduct.name}`
                      : "Selecione um produto para simular"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trending_up
                  </span>
                </div>
              </div>

              {/* Big Number Display */}
              <div className="my-8 z-10 relative">
                {pricingLoading ? (
                  <div className="flex flex-col gap-2 py-2">
                    <div className="h-12 w-32 bg-on-surface-variant/20 animate-pulse rounded" />
                    <div className="h-6 w-24 bg-on-surface-variant/20 animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <span className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface block tracking-tight">
                      <span className="text-outline-variant text-2xl align-top mr-1">
                        R$
                      </span>
                      {expectedProfitVal.toFixed(2)}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded font-label-sm text-label-sm font-semibold ${expectedProfitVal > 0 ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {expectedProfitVal > 0
                          ? "arrow_upward"
                          : "arrow_downward"}
                      </span>
                      {contributionMarginVal.toFixed(1)}% Margem
                    </div>
                  </>
                )}
                {pricingError && (
                  <p className="text-xs text-error font-semibold mt-1">
                    {pricingError}
                  </p>
                )}
              </div>

              {/* Tonal Data Breakdown */}
              <div className="space-y-3 z-10 relative border-t border-outline-variant pt-4">
                <div className="flex justify-between items-center font-body-md text-body-md">
                  <span className="text-on-surface-variant">
                    Preço de venda (Receita)
                  </span>
                  <span className="font-data-tabular text-data-tabular text-on-surface font-semibold">
                    R$ {totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-body-md text-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Custo total base (COGS)
                    <span
                      className="material-symbols-outlined text-[14px] text-outline cursor-help"
                      title="Puxado dos custos de aquisição, frete e diretos do produto"
                    >
                      info
                    </span>
                  </span>
                  <span className="font-data-tabular text-data-tabular text-on-surface">
                    -R$ {totalBaseCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-body-md text-body-md">
                  <span className="text-on-surface-variant">
                    Taxes & ICMS (
                    {selectedProduct
                      ? (selectedProduct.taxRate * 100).toFixed(1)
                      : "0.0"}
                    %)
                  </span>
                  <span className="font-data-tabular text-data-tabular text-on-surface">
                    -R$ {totalTaxVal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contextual Assistance Card */}
            {selectedProduct && (
              <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm flex items-start gap-4 animate-in fade-in duration-200">
                <div className="mt-0.5 text-secondary">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider mb-1">
                    Alerta de Inventário
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    Registrar esta venda reduzirá o inventário deste item para{" "}
                    <strong
                      className={`font-semibold ${remainingStock <= minStock ? "text-error" : "text-on-surface"}`}
                    >
                      {remainingStock}{" "}
                      {remainingStock === 1 ? "unidade" : "unidades"}
                    </strong>
                    .{" "}
                    {remainingStock <= minStock && (
                      <span className="text-error font-medium">
                        {" "}
                        Você atingirá o limite mínimo de alerta ({minStock}{" "}
                        un.).
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
