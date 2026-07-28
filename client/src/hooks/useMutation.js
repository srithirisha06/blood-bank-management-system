import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic mutation hook for POST / PUT / DELETE operations.
 * Usage: const { mutate, loading, error } = useMutation('/donors', 'POST');
 */
const useMutation = (endpoint, method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (body = {}, urlSuffix = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = endpoint + urlSuffix;
      let res;
      if (method === 'POST') res = await api.post(url, body);
      else if (method === 'PUT') res = await api.put(url, body);
      else if (method === 'DELETE') res = await api.delete(url);
      return res?.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  return { mutate, loading, error };
};

export default useMutation;
