const BASE_URL = 'http://127.0.0.1:3333/api/v1';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('API_TOKEN');
}

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/${path}`, {
        ...options,
        headers,
    });

    if (response.status === 404) {
        const error = await response.json().catch(() => ({ message: `Erro ao conectar com o servidor: ${response.statusText}` }));
        throw new Error(error?.message ?? 'API request failed');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `API Request failed: ${response.statusText}` }));
        throw new Error(error?.message ?? 'API request failed');
    }

    return response.json();
}


// ─── Authentication ─── //

export interface LoginResponse {
    token: string;
}

export async function login(email: string, password: string) {
    return apiFetch<LoginResponse>('auth/login', {
        method: 'POST',
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
    taxRate: number;       // decimal: 0.18 = 18%
    directCosts: number;
    timeSpent: number;
    lossIndex: number;     // decimal: 0.05 = 5%
    desiredMargin: number; // decimal: 0.30 = 30%
    categoryId: string | null;
    category: ApiCategory | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiProductDetail {
}

export interface CreateProductBody {
    name: string;
    stockQuantity?: number;
    minStockAlert?: number;
    metadata?: Record<string, unknown>;
    acquisitionCost: number;
    shippingCost: number;
    taxRate: number;       // decimal: 0.18 = 18%
    directCosts?: number;
    timeSpent?: number;
    lossIndex?: number;
    desiredMargin: number; // decimal: 0.30 = 30%
    imageUrl?: string;
    categoryId?: string;
}

export async function getProducts(): Promise<ApiProduct[]> {
    return apiFetch<ApiProduct[]>('products/');
}

export async function getProductById(id: string): Promise<ApiProductDetail> {
    return apiFetch<ApiProductDetail>(`products/${id}`);
}

export async function createProduct(body: CreateProductBody): Promise<ApiProduct> {
    return apiFetch<ApiProduct>('/products/', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function deleteProduct(id: string): Promise<void> {
    return apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
}
