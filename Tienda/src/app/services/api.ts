const BASE = import.meta.env.VITE_API_URL || '/api';

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
  collections: { id: string; name: string; slug: string; tag?: string }[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  tag?: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

export interface ApiOrder {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingDepartment?: string;
  shippingPhone?: string;
  addressId?: string;
  address?: ApiAddress;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    variant: {
      id: string;
      size: string;
      color?: string;
      stock: number;
      product: { id: string; name: string; images: string[] };
    };
  }[];
}

export interface ApiAddress {
  id: string;
  line1: string;
  city: string;
  department: string;
  phone: string;
  isDefault: boolean;
  recipientName?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const api = {
  getProducts: (params?: { category?: string; collection?: string; search?: string; limit?: number; minPrice?: number; maxPrice?: number; size?: string; color?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.collection) query.set('collection', params.collection);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.minPrice) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params?.size) query.set('size', params.size);
    if (params?.color) query.set('color', params.color);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<ApiProduct[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id: string) => request<ApiProduct>(`/products/${id}`),
  getCategories: () => request<ApiCategory[]>('/categories'),
  getCollections: () => request<ApiCollection[]>('/collections'),
  getCollectionBySlug: (slug: string) => request<ApiCollection>(`/collections/${slug}`),
  subscribeNewsletter: (email: string) =>
    request<{ message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  createOrder: async (data: unknown): Promise<any> => {
    const token = localStorage.getItem('void_token');
    const res = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Error al crear pedido');
    return payload;
  },
  uploadImage: async (formData: FormData): Promise<{ url: string }> => {
    const token = localStorage.getItem('void_token');
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Error al subir');
    return payload;
  },
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
  adminHardDeleteProduct: (id: string) =>
    authRequest<void>(`/admin/products/${id}/hard`, { method: 'DELETE' }),
  adminGetOrders: () => authRequest<any[]>('/admin/orders'),
  adminUpdateOrderStatus: (id: string, status: string) =>
    authRequest<any>(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminGetCategories: () => authRequest<ApiCategory[]>('/admin/categories'),
  adminCreateCategory: (data: { name: string; slug: string }) =>
    authRequest<ApiCategory>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCategory: (id: string, data: { name?: string; slug?: string }) =>
    authRequest<ApiCategory>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCategory: (id: string) =>
    authRequest<void>(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Collections
  adminGetCollections: () => authRequest<ApiCollection[]>('/admin/collections'),
  adminCreateCollection: (data: { name: string; slug: string; tag?: string; description?: string; image?: string }) =>
    authRequest<ApiCollection>('/admin/collections', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCollection: (id: string, data: { name?: string; slug?: string; tag?: string; description?: string; image?: string }) =>
    authRequest<ApiCollection>(`/admin/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCollection: (id: string) =>
    authRequest<void>(`/admin/collections/${id}`, { method: 'DELETE' }),

  // Newsletter
  adminGetNewsletterSubscribers: () => authRequest<ApiNewsletterSubscriber[]>('/admin/newsletter/subscribers'),
  adminSendNewsletter: (data: { subject: string; title: string; message: string; ctaText?: string; ctaLink?: string; imageUrl?: string }) =>
    authRequest<NewsletterSendResult>('/admin/newsletter/send', { method: 'POST', body: JSON.stringify(data) }),

  // ── User endpoints ──
  getProfile: () => authRequest<ApiUser>('/user/profile'),
  updateProfile: (data: { email?: string; currentPassword?: string; newPassword?: string }) =>
    authRequest<ApiUser>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getMyOrders: () => authRequest<ApiOrder[]>('/user/orders'),
  getOrderById: (id: string) => authRequest<ApiOrder>(`/user/orders/${id}`),
  getAddresses: () => authRequest<ApiAddress[]>('/user/addresses'),
  createAddress: (data: Partial<ApiAddress>) =>
    authRequest<ApiAddress>('/user/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: Partial<ApiAddress>) =>
    authRequest<ApiAddress>(`/user/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id: string) =>
    authRequest<void>(`/user/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id: string) =>
    authRequest<ApiAddress>(`/user/addresses/${id}/default`, { method: 'PUT' }),
};
