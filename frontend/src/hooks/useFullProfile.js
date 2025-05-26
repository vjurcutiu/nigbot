// hooks/useFullProfile.js
import { useState, useEffect } from 'react';

export default function useFullProfile({ loadOverview, loadDetails }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { id } = await loadOverview();    // e.g. candidateService.getProfile()
        const full   = await loadDetails(id);    // e.g. candidateService.getFull(id)
        setData(full);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadOverview, loadDetails]);

  return { data, loading, error };
}
