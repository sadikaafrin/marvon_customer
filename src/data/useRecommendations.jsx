import { useEffect, useState } from "react";

/**
 * useRecommendations
 * Fetches custom recommended products for a given product ID.
 *
 * @param {number|string|null} productId - The source product's ID
 * @returns {{ recommendations, loading, error }}
 */
function useRecommendations(productId = null) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_GET_BY_PRODUCT_CUSTOM_RECOMMENDATION_URL}&product_id=${productId}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setRecommendations(data.recommendations || []);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching recommendations:", err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  return { recommendations, loading, error };
}

export default useRecommendations;
