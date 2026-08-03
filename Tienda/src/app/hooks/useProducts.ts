import { useState, useEffect } from 'react';
import { api, ApiProduct } from '../services/api';

export function useProducts(params?: { 
  category?: string; 
  collection?: string; 
  search?: string; 
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sort?: string;
}) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getProducts(params)
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.category, params?.collection, params?.search, params?.limit, params?.minPrice, params?.maxPrice, params?.size, params?.color, params?.sort]);

  return { products, loading, error };
}
