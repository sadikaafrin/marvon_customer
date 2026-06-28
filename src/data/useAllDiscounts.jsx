import { useEffect, useState } from "react";

function useAllDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDiscounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const API_URL =
          import.meta.env.VITE_API_BASE_URL +
          import.meta.env.VITE_API_ALL_DISCOUNTS_URL;

        const res = await fetch(API_URL);

        if (!res.ok) throw new Error("Failed to fetch all discounts");

        const data = await res.json();

        if (data.success && Array.isArray(data.discounts)) {
          setDiscounts(data.discounts);
        } else {
          setDiscounts([]);
        }
      } catch (err) {
        setError(err.message);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDiscounts();
  }, []);

  return { discounts, loading, error };
}

export default useAllDiscounts;
