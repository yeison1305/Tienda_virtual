const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('void_token');
  return request<T>(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

export interface ApiProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  active: boolean;
  category: { id: string; name: string; slug: string };
  variants: { id: string; size: string; color?: string; stock: number; sku: string }[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiNewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface NewsletterSendResult {
  sent: number;
  failed: number;
}

export const api = {
  getProducts: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<ApiProduct[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id: string) => request<ApiProduct>(`/products/${id}`),
  getCategories: () => request<ApiCategory[]>('/categories'),
  subscribeNewsletter: (email: string) =>
    request<{ message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string; role: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<{ user: { id: string; email: string; role: string }; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: (token: string) =>
    request<{ user: { id: string; email: string; role: string } }>('/auth/me', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }),

  // ── Admin endpoints ──
  adminGetStats: () => authRequest<any>('/admin/stats'),
  adminGetProducts: () => authRequest<ApiProduct[]>('/admin/products'),
  adminCreateProduct: (data: any) =>
    authRequest<ApiProduct>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id: string, data: any) =>
    authRequest<ApiProduct>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id: string) =>
    authRequest<void>(`/admin/products/${id}`, { method: 'DELETE' }),
  adminGetOrders: () => authRequest<any[]>('/admin/orders'),
  adminUpdateOrderStatus: (id: string, status: string) =>
    authRequest<any>(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminGetCategories: () => authRequest<ApiCategory[]>('/admin/categories'),
  adminCreateCategory: (data: { name: string; slug: string }) =>
    authRequest<ApiCategory>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  adminDeleteCategory: (id: string) =>
    authRequest<void>(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Newsletter
  adminGetNewsletterSubscribers: () => authRequest<ApiNewsletterSubscriber[]>('/admin/newsletter/subscribers'),
  adminSendNewsletter: (data: { subject: string; title: string; message: string; ctaText?: string; ctaLink?: string; imageUrl?: string }) =>
    authRequest<NewsletterSendResult>('/admin/newsletter/send', { method: 'POST', body: JSON.stringify(data) }),
};
