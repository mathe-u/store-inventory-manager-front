const BASE_URL = "http://127.0.0.1:3333/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("API_TOKEN");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/${path}`, {
    ...options,
    headers,
  });

  if (response.status === 404) {
    const error = await response.json().catch(() => ({
      message: `Erro ao conectar com o servidor: ${response.statusText}`,
    }));
    throw new Error(error?.message ?? "API request failed");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: `API Request failed: ${response.statusText}` }));
    throw new Error(error?.message ?? "API request failed");
  }

  return response.json();
}

// ─── Authentication ─── //

export interface LoginResponse {
  token: string;
}

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ─── Categories ─── //

export interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface CreateCategoryBody {
  name: string;
  description?: string;
  color?: string; // hex: #RRGGBB
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
  color?: string;
}

export async function getCategories(search?: string): Promise<ApiCategory[]> {
  const path = search
    ? `categories/?search=${encodeURIComponent(search)}`
    : "categories/";
  return apiFetch<ApiCategory[]>(path);
}

export async function getCategoryById(id: string): Promise<ApiCategory> {
  return apiFetch<ApiCategory>(`categories/${id}`);
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<ApiCategory> {
  return apiFetch<ApiCategory>("categories/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCategory(
  id: string,
  body: UpdateCategoryBody,
): Promise<ApiCategory> {
  return apiFetch<ApiCategory>(`categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`categories/${id}`, { method: "DELETE" });
}

// ─── Products ─── //

export interface ApiProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  stockQuantity: number;
  minStockAlert: number;
  metadata: string; // raw JSON string from DB
  acquisitionCost: number;
  shippingCost: number;
  taxRate: number; // decimal: 0.18 = 18%
  directCosts: number;
  timeSpent: number;
  lossIndex: number; // decimal: 0.05 = 5%
  desiredMargin: number; // decimal: 0.30 = 30%
  categoryId: string | null;
  category: ApiCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductDetail {}

export interface CreateProductBody {
  name: string;
  stockQuantity?: number;
  minStockAlert?: number;
  metadata: Record<string, unknown>;
  acquisitionCost: number;
  shippingCost: number;
  taxRate: number; // decimal: 0.18 = 18%
  directCosts?: number;
  timeSpent?: number;
  lossIndex?: number;
  desiredMargin: number; // decimal: 0.30 = 30%
  imageUrl?: string;
  categoryId?: string;
}

export async function getProducts(search?: string): Promise<ApiProduct[]> {
  const path = search
    ? `products/?search=${encodeURIComponent(search)}`
    : "products/";
  return apiFetch<ApiProduct[]>(path);
}

export async function getProductById(id: string): Promise<ApiProductDetail> {
  return apiFetch<ApiProductDetail>(`products/${id}`);
}

export async function createProduct(
  body: CreateProductBody,
): Promise<ApiProduct> {
  return apiFetch<ApiProduct>("products/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
}

export interface UpdateProductBody {
  name?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  metadata?: Record<string, unknown>;
  acquisitionCost?: number;
  shippingCost?: number;
  taxRate?: number; // decimal: 0.18 = 18%
  directCosts?: number;
  timeSpent?: number;
  lossIndex?: number;
  desiredMargin?: number; // decimal: 0.30 = 30%
  imageUrl?: string;
  categoryId?: string | null;
}

export async function updateProduct(
  id: string,
  body: UpdateProductBody,
): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── Pricing ─── //

export interface PricingInput {
  acquisitionCost: number;
  shippingCost?: number;
  taxRate: number;         // decimal: 0.20 = 20%
  desiredMargin: number;   // decimal: 0.30 = 30%
  sellingPrice?: number;   // opcional — para calcular indicadores sobre o preço informado
  directCosts?: number;
  timeSpent?: number;
  lossIndex?: number;
}

export interface PricingAtSellingPrice {
  markup: number;
  contributionMargin: number;
  netProfit: number;
}

export interface PricingResult {
  totalBaseCost: number;
  suggestedPrice: number;
  markup: number;
  netProfit: number;
  atSellingPrice?: PricingAtSellingPrice; // presente se sellingPrice foi informado
}

export async function calculatePricing(
  body: PricingInput,
): Promise<PricingResult> {
  return apiFetch<PricingResult>("pricing/calculate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Sales ─── //

export type SaleStatus = "COMPLETED" | "LOSS" | "RETURNED" | "PENDING";

export interface ApiPaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export async function getPaymentMethods(): Promise<ApiPaymentMethod[]> {
  return apiFetch<ApiPaymentMethod[]>("payments/");
}

export interface ApiSale {
  id: string;
  productId: string;
  product?: ApiProduct; // Reaproveitando a interface ApiProduct já existente
  quantity: number;
  customerName: string;
  paymentMethod: ApiPaymentMethod;
  finalPrice: number;
  calculatedProfit: number;
  status: SaleStatus;
  createdAt: string;
}

export interface CreateSaleBody {
  productId: string;
  quantity: number;
  finalPrice: number; // Preço vendido no Marketplace
  status?: SaleStatus;
  customerName?: string | null;
  paymentMethodId?: string;
}

export interface UpdateSaleBody {
  quantity?: number;
  finalPrice?: number;
  status?: SaleStatus;
  customerName?: string | null;
  paymentMethodId?: string;
}

export interface SaleMutationResponse {
  sale: ApiSale;
  stockRemaining: number;
}

/**
 * Retorna o histórico completo de vendas, incluindo os dados dos produtos atrelados.
 * @param productName - Filtro opcional pelo nome do produto (server-side).
 * @param status - Filtro opcional pelo status da venda (server-side).
 */
export async function getSales(
  productName?: string,
  status?: SaleStatus,
): Promise<ApiSale[]> {
  const params = new URLSearchParams();
  if (productName) params.set("productName", productName);
  if (status) params.set("status", status);
  const query = params.toString();
  return apiFetch<ApiSale[]>(query ? `sales/?${query}` : "sales/");
}

/**
 * Cria um novo registro de venda. Deduz estoque se status for COMPLETED ou LOSS.
 */
export async function createSale(
  body: CreateSaleBody,
): Promise<SaleMutationResponse> {
  return apiFetch<SaleMutationResponse>("sales/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Atualiza uma venda existente. O backend recalculará o estoque e a taxa de perda automaticamente.
 */
export async function updateSale(
  id: string,
  body: UpdateSaleBody,
): Promise<SaleMutationResponse> {
  return apiFetch<SaleMutationResponse>(`sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Exclui uma venda e reverte suas alterações no estoque.
 */
export async function deleteSale(id: string): Promise<void> {
  return apiFetch<void>(`sales/${id}`, { method: "DELETE" });
}

// ─── Dashboard ─── //

export interface ApiProductSalesData {
  productId: string;
  name: string;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
  revenue: number;
}

export interface ApiDashboardStatsData {
  grossRevenue: number;
  grossRevenueDelta: number;
  netRevenue: number;
  netRevenueDelta: number;
  grossProfit: number;
  grossProfitDelta: number;
  netProfit: number;
  netProfitDelta: number;
  totalOrders: number;
  totalOrdersDelta: number;
  monthlyStats: { date: string; grossRevenue: number; costs: number }[];
  marginBreakdown: {
    netProfit: number;
    costs: number;
    deliveryTax: number;
  };
  topSelling: ApiProductSalesData[];
}

export interface ApiProductPriceEvolution {
  date: string;
  price: number;
}

export async function getDashboardStats(
  days: number = 30,
): Promise<ApiDashboardStatsData> {
  return apiFetch<ApiDashboardStatsData>(`dashboard/stats?days=${days}`);
}

export async function getProductPriceEvolution(
  productId: string,
  days: number = 30,
): Promise<ApiProductPriceEvolution[]> {
  return apiFetch<ApiProductPriceEvolution[]>(
    `dashboard/price-evolution/${productId}?days=${days}`,
  );
}
