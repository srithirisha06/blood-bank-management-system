import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic data-fetching hook with loading, error, and refetch support.
 * Usage: const { data, loading, error, refetch } = useFetch('/donors');
 */
const useFetch = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (overrideParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(endpoint, { params: { ...params, ...overrideParams } });
      if (res.data.success !== false) {
        setData(res.data);
      }
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
