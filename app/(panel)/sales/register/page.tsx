"use client";

import { useState } from "react";
import Link from "next/link";

export default function LogNewSale() {
  // Set current date as default for the date input
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split("T")[0]);

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2">
            <span className="material-symbols-outlined text-[16px]">
              payments
            </span>
            <Link href="/sales" className="hover:text-secondary transition-colors cursor-pointer">
              Vendas
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-on-surface">Registrar Nova Venda</span>
          </div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-1">
            Registrar Nova Venda
          </h2>
          <p className="text-on-surface-variant">
            Registre uma nova transação no seu Marketplace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sales"
            className="px-4 py-2.5 rounded-DEFAULT border border-outline text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors cursor-pointer flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Voltar
          </Link>
        </div>
      </div>

      {/* Asymmetric 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-gutter items-start">
          {/* Left Column: The Form Canvas (Spans 7) */}
          <div className="lg:col-span-7">
            <form className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
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

              {/* Product Selector (Searchable Mockup) */}
              <div className="space-y-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant"
                  htmlFor="product-search"
                >
                  Produto listado
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                    search
                  </span>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
                    id="product-search"
                    placeholder="Digite o nome do produto..."
                    type="text"
                  />
                  {/* Dropdown Mock */}
                  <div className="hidden absolute top-full left-0 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-10 overflow-hidden">
                    <ul className="py-1">
                      <li className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex justify-between items-center border-b border-outline-variant last:border-0">
                        <div>
                          <div className="font-body-md text-body-md text-on-surface font-medium">
                            Sony PlayStation 5 Disc Edition
                          </div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">
                            Categoria: Eletrônicos
                          </div>
                        </div>
                        <div className="font-data-tabular text-data-tabular text-on-surface-variant">
                          Estoque: 4
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Row: Quantity & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="block font-label-sm text-label-sm text-on-surface-variant"
                    htmlFor="sale-qty"
                  >
                    Quantidade vendida
                  </label>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm text-right"
                    id="sale-qty"
                    min="1"
                    type="number"
                    defaultValue="1"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block font-label-sm text-label-sm text-on-surface-variant"
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
                    />
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant my-2" />

              {/* Customer Info (Optional) */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label
                    className="block font-label-sm text-label-sm text-on-surface-variant"
                    htmlFor="customer-name"
                  >
                    Nome do cliente
                  </label>
                  <span className="font-label-sm text-label-sm text-outline-variant font-normal">
                    Optional
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
                  />
                </div>
              </div>

              {/* Payment Method (Bento Radio Group) */}
              <div className="space-y-3">
                <label className="block font-label-sm text-label-sm text-on-surface-variant">
                  Método de pagamento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="cursor-pointer relative">
                    <input
                      className="peer sr-only"
                      defaultChecked
                      name="payment"
                      type="radio"
                      value="cash"
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
                    />
                    <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                      <span className="material-symbols-outlined">
                        account_balance_wallet
                      </span>
                      <span className="font-label-sm text-label-sm">
                        Cartão de crédito
                      </span>
                    </div>
                  </label>

                  <label className="cursor-pointer relative">
                    <input
                      className="peer sr-only"
                      name="payment"
                      type="radio"
                      value="other"
                    />
                    <div className="w-full h-full bg-surface border border-outline-variant rounded-lg py-3 flex flex-col items-center justify-center gap-1 peer-checked:border-secondary peer-checked:bg-surface-container peer-checked:text-secondary transition-all text-on-surface-variant hover:bg-surface-container-low">
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                      <span className="font-label-sm text-label-sm">
                        Outros
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Fee Adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label
                      className="block font-label-sm text-label-sm text-on-surface-variant"
                      htmlFor="fee-adjust"
                    >
                      Taxa do Marketplace
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-data-tabular text-data-tabular text-outline">
                      $
                    </span>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-4 py-3 font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm text-right"
                      id="fee-adjust"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
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
                  className="px-6 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-on-secondary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Confirmar Venda
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
                {/* Header */}
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Lucro Esperado
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">
                      Baseado no custo registrado do produto
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
                  <span className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface block tracking-tight">
                    <span className="text-outline-variant text-2xl align-top mr-1">
                      $
                    </span>
                    145.00
                  </span>
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
                    <span className="text-tertiary-fixed-dim material-symbols-outlined text-[14px]">
                      arrow_upward
                    </span>
                    32% Margem
                  </div>
                </div>

                {/* Tonal Data Breakdown */}
                <div className="space-y-3 z-10 relative border-t border-outline-variant pt-4">
                  <div className="flex justify-between items-center font-body-md text-body-md">
                    <span className="text-on-surface-variant">
                      Preço de venda (Receita)
                    </span>
                    <span className="font-data-tabular text-data-tabular text-on-surface">
                      $450.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      Custo das mercadorias (COGS)
                      <span
                        className="material-symbols-outlined text-[14px] text-outline cursor-help"
                        title="Puxado dos registros do inventário"
                      >
                        info
                      </span>
                    </span>
                    <span className="font-data-tabular text-data-tabular text-on-surface">
                      -$290.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md">
                    <span className="text-on-surface-variant">
                      Taxas do Marketplace
                    </span>
                    <span className="font-data-tabular text-data-tabular text-on-surface">
                      -$15.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Contextual Assistance Card (Minimalist) */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="mt-0.5 text-secondary">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider mb-1">
                    Alerta de Inventário
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    Registrar esta venda reduzirá o inventário deste item para{" "}
                    <strong className="text-on-surface font-medium">
                      3 unidades
                    </strong>
                    . Você está se aproximando do seu limite de reabastecimento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
