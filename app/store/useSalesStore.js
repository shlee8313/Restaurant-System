//file: \app\store\useSalesStore.js

import { create } from "zustand";

const useSalesStore = create((set) => ({
  todaySales: 0,
  isLoading: false,
  error: null,
  setTodaySales: (sales) => set({ todaySales: Number(sales) || 0 }),

  fetchTodaySales: async (restaurantId, token) => {
    console.log("Fetching today's sales for:", restaurantId);
    try {
      const response = await fetch(`/api/sales/today?restaurantId=${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Fetched sales data:", data.totalSales);
        set({ todaySales: Number(data.totalSales) || 0, error: null });
      } else {
        console.error("API error:", data.error);
        set({ error: data.error || "Failed to fetch sales data" });
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      set({ error: error.message || "Network error occurred" });
    }
  },
}));

export default useSalesStore;
