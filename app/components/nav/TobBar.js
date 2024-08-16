//file: \app\components\nav\TobBar.js

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import useSalesStore from "../../store/useSalesStore";
// import { useEffect } from "react";

const TopNavigation = () => {
  const { currentPage } = useNavigationStore();
  const { fullLogout, restaurant, restaurantToken } = useAuthStore();
  const { todaySales } = useSalesStore();
  const router = useRouter();
  console.log(todaySales);
  useEffect(() => {
    if (restaurant && restaurantToken) {
      console.log("Triggering fetchTodaySales in TopBar");
      // fetchTodaySales(restaurant.restaurantId, restaurantToken);
    }
  }, [restaurant, restaurantToken]);

  const handleLogout = () => {
    router.push("/auth/login");
    fullLogout();
  };

  return (
    <header className="bg-gray-100 shadow-md py-1 pl-5 flex justify-between items-center">
      <h2 className="text-md font-semibold">{currentPage}</h2>
      <div>
        <span className="mr-10 text-md text-gray-700">
          오늘의 매출: {todaySales.toLocaleString()}원
        </span>
        <button
          onClick={handleLogout}
          className="bg-gray-500 text-white px-4 py-2 mr-20 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
