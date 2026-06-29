import { useState, useEffect } from "react";



const API_URL = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_GET_BY_TRUST_SOLD_URL;

export default function useOrderStats() {
    const [stats, setStats] = useState({
        totalUniqueUsers: 0,
        totalOrders: 0,
        userData: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                setStats(prev => ({ ...prev, loading: true, error: null }));
                
                const response = await fetch(`${API_URL}?action=get-order-info-user`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setStats({
                        totalUniqueUsers: data.total_unique_users || 0,
                        totalOrders: data.total_orders || 0,
                        userData: data.data || [],
                        loading: false,
                        error: null
                    });
                } else {
                    setStats(prev => ({
                        ...prev,
                        loading: false,
                        error: data.message || 'Failed to fetch data'
                    }));
                }
            } catch (error) {
                console.error('Error fetching order stats:', error);
                setStats(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message || 'Network error'
                }));
            }
        };

        fetchOrderStats();
    }, []);

    return stats;
}