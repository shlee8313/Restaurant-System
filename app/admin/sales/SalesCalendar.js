//file:  \client\renderer\app\admin\sales\SalesCalendar.js

"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from "xlsx";
import CalendarDay from "./CalendarDay";

const SalesCalendar = React.memo(
  ({ currentDate, setCurrentDate, salesData, fetchSalesData, selectedDate, setSelectedDate }) => {
    // const [selectedDate, setSelectedDate] = useState(null);

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    const isToday = (date) => {
      const today = new Date();
      return formatDate(date) === formatDate(today);
    };

    const changeMonth = useCallback(
      (increment) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
        setCurrentDate(newDate);
        setSelectedDate(null);
        fetchSalesData();
      },
      [currentDate, setCurrentDate, fetchSalesData]
    );

    const goToToday = useCallback(() => {
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      setCurrentDate(new Date(todayUTC.getFullYear(), todayUTC.getMonth(), 1));
      setSelectedDate(todayUTC);
    }, [setCurrentDate, setSelectedDate]);

    // 새로 추가: selectedDate가 변경될 때마다 실행
    useEffect(() => {
      // console.log("Selected Date changed:", selectedDate ? formatDate(selectedDate) : "None");
    }, [selectedDate]);

    const getDaysInMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const calendarDays = useMemo(() => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDayOfMonth = getFirstDayOfMonth(currentDate);
      const days = [];

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
        const dateString = formatDate(date);
        const dailySales = salesData.find((data) => data.date === dateString);

        const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
        // console.log(
        //   `Date: ${dateString}, isSelected: ${isSelected}, selectedDate: ${
        //     selectedDate ? formatDate(selectedDate) : "null"
        //   }`
        // );

        days.push({
          date,
          isToday: isToday(date),
          isSunday: date.getUTCDay() === 0,
          isSaturday: date.getUTCDay() === 6,
          isSelected,
          salesData: dailySales,
        });
      }

      return days;
    }, [currentDate, salesData, selectedDate]);

    // console.log("Rendered calendar days:", calendarDays);
    // console.log("Current Date:", formatDate(currentDate));
    // console.log("Sales Data:", salesData);
    // console.log("Selected Date:", selectedDate ? formatDate(selectedDate) : "None");
    /**
     *
     */
    const downloadExcel = useCallback(() => {
      const excelData = salesData.map((day) => ({
        날짜: day.date,
        총매출: day.totalSales,
        ...day.items.reduce((acc, item) => {
          acc[`${item.name} 수량`] = item.quantity;
          acc[`${item.name} 매출`] = item.sales;
          return acc;
        }, {}),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "매출 데이터");
      XLSX.writeFile(
        wb,
        `매출_${currentDate.getFullYear()}년_${currentDate.getMonth() + 1}월.xlsx`
      );
    }, [salesData, currentDate]);

    /**
     *
     */
    return (
      <div className="max-w-screen mx-auto p-4 h-full overflow-hidden mt-3 flex flex-col bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={goToToday}
              className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
            >
              오늘
            </button>
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
            <button
              onClick={downloadExcel}
              className="p-2 border border-gray-300 rounded-md bg-white shadow-sm text-gray-800 hover:bg-gray-100"
            >
              <Download />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <CalendarDay key={index} day={day} />
          ))}
        </div>
      </div>
    );
  }
);

export default SalesCalendar;
