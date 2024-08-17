//file: \client\renderer\app\admin\sales\page.js

//file: \client\renderer\app\admin\sales\page.js

"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SalesCalendar from "./SalesCalendar";

const SalesCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { restaurant } = useAuthStore();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  /**
   *
   */
  const fetchSalesData = useCallback(async () => {
    if (!restaurant) return;
    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales?restaurantId=${
        restaurant.restaurantId
      }&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("restaurantToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [restaurant, currentDate]);

  useEffect(() => {
    if (!restaurant) {
      router.push("/auth/login");
    } else {
      fetchSalesData();
    }
  }, [restaurant, router, currentDate, fetchSalesData]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SalesCalendar
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      salesData={salesData}
      fetchSalesData={fetchSalesData}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
  );
};

export default SalesCalendarPage;

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { ChevronLeft, ChevronRight, Download } from "lucide-react";
// import * as XLSX from "xlsx";
// import useAuthStore from "@/app/store/useAuthStore";
// import { useRouter } from "next/navigation";
// import LoadingSpinner from "@/app/components/LoadingSpinner";

// // Tooltip 컴포넌트 최적화
// const Tooltip = React.memo(({ children, content }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   return (
//     <div className="relative inline-block">
//       <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
//         {children}
//       </div>
//       {isVisible && (
//         <div className="absolute z-10 p-2 -mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
//           {content}
//         </div>
//       )}
//     </div>
//   );
// });

// const SalesCalendar = () => {
//   console.log("Rendering SalesCalendar component");
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [viewMode, setViewMode] = useState("total");
//   const [salesData, setSalesData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { restaurant } = useAuthStore();
//   const router = useRouter();

//   useEffect(() => {
//     console.log("Component mounted or restaurant/currentDate changed:", {
//       restaurant,
//       currentDate,
//     });
//     if (!restaurant) {
//       console.log("No restaurant data, redirecting to login");
//       router.push("/auth/login");
//     } else {
//       console.log("Fetching sales data");
//       fetchSalesData();
//     }
//   }, [restaurant, router, currentDate]);

//   const fetchSalesData = useCallback(async () => {
//     console.log("Fetching sales data for:", currentDate);
//     setIsLoading(true);
//     try {
//       const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales?restaurantId=${
//         restaurant.restaurantId
//       }&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`;
//       console.log("Fetch URL:", url);
//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("restaurantToken")}`,
//         },
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch sales data");
//       }
//       const data = await response.json();
//       console.log("Fetched sales data:", data);
//       setSalesData(data);
//     } catch (error) {
//       console.error("Failed to fetch sales data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [restaurant, currentDate]);

//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const changeMonth = useCallback(
//     (increment) => {
//       const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
//       console.log("Changing month to:", newDate);
//       setCurrentDate(newDate);
//       setSelectedDate(null);
//       fetchSalesData();
//     },
//     [currentDate, fetchSalesData]
//   );

//   const handleDateClick = useCallback(
//     (day) => {
//       const clickedDate = `${currentDate.getFullYear()}-${String(
//         currentDate.getMonth() + 1
//       ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//       console.log("Clicked date:", clickedDate);
//       const selectedData = salesData.find((data) => data.date === clickedDate);
//       console.log("Selected data:", selectedData);
//       setSelectedDate(selectedData ? clickedDate : null);
//     },
//     [currentDate, salesData]
//   );

//   const goToToday = useCallback(() => {
//     const today = new Date();
//     console.log("Going to today:", today);
//     setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
//     setSelectedDate(today.toISOString().split("T")[0]);
//     fetchSalesData();
//   }, [fetchSalesData]);

//   const renderCalendarContent = useCallback(
//     (day) => {
//       const dateString = `${currentDate.getFullYear()}-${String(
//         currentDate.getMonth() + 1
//       ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//       const dailySales = salesData.find((data) => data.date === dateString);

//       console.log("Rendering calendar content for:", dateString, "Data:", dailySales);

//       if (!dailySales) return null;

//       const tooltipContent = (
//         <div>
//           <div className="font-bold mb-2">총 매출: ₩{dailySales.totalSales.toLocaleString()}</div>
//           {dailySales.items.map((item, index) => (
//             <div key={index}>
//               {item.name}: {item.quantity} (₩{item.sales.toLocaleString()})
//             </div>
//           ))}
//         </div>
//       );

//       if (viewMode === "total") {
//         return (
//           <Tooltip content={tooltipContent}>
//             <div className="text-lg font-medium text-gray-700 mt-1">
//               ₩ {dailySales.totalSales.toLocaleString()}
//             </div>
//           </Tooltip>
//         );
//       } else {
//         return (
//           <Tooltip content={tooltipContent}>
//             <div className="text-xs text-gray-600 mt-1">
//               {dailySales.items.slice(0, 5).map((item, index) => (
//                 <div key={index} className="truncate">
//                   {item.name}: {item.quantity}
//                 </div>
//               ))}
//               {dailySales.items.length > 5 && (
//                 <div className="text-blue-600 font-semibold text-sm">
//                   + {dailySales.items.length - 5} more
//                 </div>
//               )}
//             </div>
//           </Tooltip>
//         );
//       }
//     },
//     [salesData, currentDate, viewMode]
//   );

//   const renderCalendar = useCallback(() => {
//     console.log("Rendering calendar for:", currentDate);
//     const daysInMonth = getDaysInMonth(currentDate);
//     const firstDayOfMonth = getFirstDayOfMonth(currentDate);
//     const days = [];

//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(<div key={`empty-${i}`} className="bg-white border border-gray-200"></div>);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateString = `${currentDate.getFullYear()}-${String(
//         currentDate.getMonth() + 1
//       ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//       const isToday = dateString === new Date().toISOString().split("T")[0];
//       const isSunday =
//         new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0;
//       const isSaturday =
//         new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 6;

//       days.push(
//         <div
//           key={day}
//           className={`bg-white p-4 border h-36 border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col
//             ${selectedDate === dateString ? "ring-2 ring-blue-400" : ""}
//             ${isToday ? "bg-blue-50" : ""}`}
//           onClick={() => handleDateClick(day)}
//         >
//           <div
//             className={`text-sm font-medium ${isSunday ? "text-red-500" : ""} ${
//               isSaturday ? "text-blue-500" : ""
//             }`}
//           >
//             {day}
//           </div>
//           {renderCalendarContent(day)}
//         </div>
//       );
//     }

//     return days;
//   }, [currentDate, selectedDate, handleDateClick, renderCalendarContent]);

//   const downloadExcel = useCallback(() => {
//     console.log("Downloading Excel for:", currentDate);
//     const excelData = salesData.map((day) => ({
//       날짜: day.date,
//       총매출: day.totalSales,
//       ...day.items.reduce((acc, item) => {
//         acc[`${item.name} 수량`] = item.quantity;
//         acc[`${item.name} 매출`] = item.sales;
//         return acc;
//       }, {}),
//     }));

//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(excelData);
//     XLSX.utils.book_append_sheet(wb, ws, "매출 데이터");
//     XLSX.writeFile(wb, `매출_${currentDate.getFullYear()}년_${currentDate.getMonth() + 1}월.xlsx`);
//   }, [salesData, currentDate]);

//   if (isLoading) {
//     console.log("Rendering loading spinner");
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="max-w-screen mx-auto p-4 h-full overflow-hidden mt-3 flex flex-col bg-gray-50">
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
//           </h2>
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={goToToday}
//             className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
//           >
//             오늘
//           </button>
//           <button
//             onClick={() => changeMonth(-1)}
//             className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
//           >
//             <ChevronLeft />
//           </button>
//           <button
//             onClick={() => changeMonth(1)}
//             className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
//           >
//             <ChevronRight />
//           </button>
//           <button
//             onClick={downloadExcel}
//             className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
//           >
//             <Download />
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
//     </div>
//   );
// };

// export default SalesCalendar;
