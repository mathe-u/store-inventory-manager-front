"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/src/lib/api";

export default function RegisterProductPage() {
    const router = useRouter();

    // Basic Info States
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [category, setCategory] = useState("");
    const [costPrice, setCostPrice] = useState("150.00");
    const [stockQuantity, setStockQuantity] = useState("0");

    // Pricing Parameter States
    const [sellingPrice, setSellingPrice] = useState("349.90");
    const [desiredMargin, setDesiredMargin] = useState("20");
    const [shippingCost, setShippingCost] = useState("25.00");
    const [icmsTax, setIcmsTax] = useState("18");

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Perform Calculations directly in render
    const cost = parseFloat(costPrice) || 0;
    const price = parseFloat(sellingPrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const taxRate = (parseFloat(icmsTax) || 0) / 100;
    const targetMarginRate = (parseFloat(desiredMargin) || 0) / 100;

    const taxAmount = price * taxRate;
    const totalCosts = cost + shipping + taxAmount;
    const netProfit = price - totalCosts;

    const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;
    const contributionMargin = price > 0 ? (netProfit / price) * 100 : 0;

    let minPrice = 0;
    const denominator = 1 - taxRate - targetMarginRate;
    if (denominator > 0) {
        minPrice = (cost + shipping) / denominator;
    }

    const getStatusStyling = (profit: number) => {
        if (profit > 0) {
            return {
                text: "PROFITABLE",
                badgeClass: "mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-tertiary-container text-on-tertiary-container",
                valueClass: "font-data-tabular text-tertiary-fixed text-4xl font-bold tracking-tight",
            };
        } else if (profit < 0) {
            return {
                text: "LOSS WARNING",
                badgeClass: "mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-error-container text-on-error-container",
                valueClass: "font-data-tabular text-error text-4xl font-bold tracking-tight",
            };
        } else {
            return {
                text: "BREAK EVEN",
                badgeClass: "mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-surface-variant text-on-surface-variant",
                valueClass: "font-data-tabular text-primary-fixed text-4xl font-bold tracking-tight",
            };
        }
    };

    const status = getStatusStyling(netProfit);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sku || !category) {
            setSaveError("Please fill in all basic product information.");
            return;
        }

        setIsSaving(true);
        setSaveError("");

        try {
            await createProduct({
                name,
                acquisitionCost: parseFloat(costPrice) || 0,
                shippingCost: parseFloat(shippingCost) || 0,
                taxRate: parseFloat(icmsTax) || 0,
                desiredMargin: parseFloat(desiredMargin) || 0,
                stockQuantity: parseInt(stockQuantity) || 0,
                metadata: {
                    sku: sku.toUpperCase(),
                    category,
                    sellingPrice: parseFloat(sellingPrice) || 0,
                    minPrice,
                },
            });
            router.push("/inventory");
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save product.");
            setIsSaving(false);
        }
    };

    // Generate a composite key for reactive re-render flashes of output cells
    const flashKey = `${cost}-${price}-${shipping}-${icmsTax}-${desiredMargin}`;

    return (
        <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
            {/* Page Header */}
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                        <span>Inventory</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-on-surface">Register Product</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">New Product Listing</h2>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/inventory")}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-DEFAULT border border-outline text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors cursor-pointer disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[16px]">save</span>
                        )}
                        {isSaving ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </div>

            {/* Save Error */}
            {saveError && (
                <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-error text-[24px]">error</span>
                    <p className="font-body-md text-sm">{saveError}</p>
                    <button onClick={() => setSaveError("")} className="ml-auto text-error hover:opacity-70 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Column (8 cols): Forms */}
                <div className="lg:col-span-8 flex flex-col gap-stack-default">
                    {/* Basic Info Section */}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                                <span className="material-symbols-outlined text-primary">info</span>
                                Basic Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="productName">Product Name</label>
                                <input
                                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all"
                                    id="productName"
                                    placeholder="e.g. Wireless Bluetooth Headphones Pro"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="productSKU">SKU</label>
                                <input
                                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all uppercase font-data-tabular"
                                    id="productSKU"
                                    placeholder="WBH-PRO-01"
                                    type="text"
                                    required
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="productCategory">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all appearance-none"
                                        id="productCategory"
                                        required
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="" disabled>Select category...</option>
                                        <option value="Electronics">Electronics &amp; Audio</option>
                                        <option value="Home Goods">Home Goods</option>
                                        <option value="Apparel">Apparel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="costPrice">Base Cost Price (Acquisition)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-on-surface-variant font-data-tabular font-bold">R$</span>
                                    <input
                                        className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all text-right font-data-tabular"
                                        id="costPrice"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                        required
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="stockQuantity">Initial Stock Quantity</label>
                                <input
                                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all text-right font-data-tabular"
                                    id="stockQuantity"
                                    placeholder="0"
                                    min="0"
                                    type="number"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Intelligent Pricing Section */}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-surface-container-highest to-transparent opacity-50 pointer-events-none rounded-bl-full"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
                                    <span className="material-symbols-outlined text-secondary">calculate</span>
                                    Intelligent Pricing
                                </h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Adjust parameters to simulate your financial outcomes.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 relative z-10">
                            {/* Selling Price */}
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface border border-outline-variant hover:border-secondary transition-colors group">
                                <div className="flex justify-between items-center">
                                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="sellingPrice">Intended Selling Price</label>
                                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:text-secondary">storefront</span>
                                </div>
                                <div className="relative flex items-center mt-1">
                                    <span className="absolute left-0 text-primary font-data-tabular font-bold text-lg">R$</span>
                                    <input
                                        className="w-full pl-7 pr-3 py-1 text-lg font-bold text-primary border-none shadow-none focus:ring-0 bg-transparent p-0 font-data-tabular text-right focus:outline-none"
                                        id="sellingPrice"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                        required
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Desired Margin */}
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface border border-outline-variant hover:border-secondary transition-colors group">
                                <div className="flex justify-between items-center">
                                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="desiredMargin">Target Net Margin</label>
                                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:text-secondary">trending_up</span>
                                </div>
                                <div className="relative flex items-center mt-1">
                                    <input
                                        className="w-full pr-6 py-1 text-lg font-bold text-primary border-none shadow-none focus:ring-0 bg-transparent p-0 font-data-tabular text-right focus:outline-none"
                                        id="desiredMargin"
                                        placeholder="0"
                                        step="1"
                                        type="number"
                                        required
                                        value={desiredMargin}
                                        onChange={(e) => setDesiredMargin(e.target.value)}
                                    />
                                    <span className="absolute right-0 text-primary font-data-tabular font-bold text-lg">%</span>
                                </div>
                            </div>

                            {/* Shipping Cost */}
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface border border-outline-variant">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="shippingCost">Estimated Shipping Cost</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-on-surface-variant font-data-tabular">R$</span>
                                    <input
                                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all text-right font-data-tabular"
                                        id="shippingCost"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                        required
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* ICMS Tax */}
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface border border-outline-variant">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="icmsTax">ICMS / Marketplace Fee</label>
                                <div className="relative flex items-center">
                                    <input
                                        className="w-full pr-6 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-on-surface-variant placeholder:opacity-55 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-container transition-all text-right font-data-tabular"
                                        id="icmsTax"
                                        placeholder="0"
                                        step="0.1"
                                        type="number"
                                        required
                                        value={icmsTax}
                                        onChange={(e) => setIcmsTax(e.target.value)}
                                    />
                                    <span className="absolute right-3 text-on-surface-variant font-data-tabular">%</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Calculator Results */}
                <div className="lg:col-span-4 sticky top-24">
                    <div className="bg-primary-container rounded-xl shadow-lg border border-primary-fixed-dim overflow-hidden flex flex-col h-full">
                        {/* Results Header */}
                        <div className="p-5 border-b border-on-primary-fixed-variant bg-inverse-surface">
                            <h3 className="font-label-sm text-label-sm text-inverse-primary uppercase tracking-wider font-semibold">Financial Projection</h3>
                        </div>

                        {/* Primary Metric: Net Profit */}
                        <div className="p-6 flex flex-col items-center justify-center border-b border-on-primary-fixed-variant bg-primary-container">
                            <span className="font-label-sm text-label-sm text-on-primary-container mb-2">Net Profit per Unit</span>
                            <div className="flex items-baseline gap-1" key={`profit-${flashKey}`}>
                                <span className="font-data-tabular text-primary-fixed-dim text-xl">R$</span>
                                <span className={`${status.valueClass} value-updated`} id="calcNetProfit">
                                    {netProfit.toFixed(2)}
                                </span>
                            </div>
                            <div className={status.badgeClass} id="profitStatus">
                                {status.text}
                            </div>
                        </div>

                        {/* Secondary Metrics Grid */}
                        <div className="p-5 flex flex-col gap-4 flex-grow bg-primary-container">
                            <div className="flex justify-between items-center pb-3 border-b border-on-primary-fixed-variant/50">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-on-primary-container text-[18px]">percent</span>
                                    <span className="font-body-md text-body-md text-primary-fixed-dim">Markup</span>
                                </div>
                                <span className="font-data-tabular text-on-primary font-medium value-updated" key={`markup-${flashKey}`}>
                                    {markup.toFixed(1)}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-on-primary-fixed-variant/50">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-on-primary-container text-[18px]">pie_chart</span>
                                    <span className="font-body-md text-body-md text-primary-fixed-dim">Contribution Margin</span>
                                </div>
                                <span className="font-data-tabular text-on-primary font-medium value-updated" key={`contribution-${flashKey}`}>
                                    {contributionMargin.toFixed(1)}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-label-sm text-secondary-fixed-dim">Suggested Min. Price</span>
                                    <span className="text-xs text-on-primary-container mt-0.5">To meet target margin</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-data-tabular text-primary-fixed-dim text-sm">R$</span>
                                    <span className="font-data-tabular text-secondary-fixed font-bold text-lg value-updated" key={`minprice-${flashKey}`}>
                                        {minPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 bg-inverse-surface mt-auto">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer font-semibold disabled:opacity-75"
                            >
                                {isSaving ? (
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                                )}
                                {isSaving ? "Saving..." : "Apply Pricing"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
