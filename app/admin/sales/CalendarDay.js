//file: \client\renderer\app\admin\sales\CalendarDay.js

import React from "react";
import Tooltip from "./Tooltip";

const CalendarDay = React.memo(({ day }) => {
  if (!day) return <div className="bg-white border border-gray-200"></div>;

  const { date, isToday, isSunday, isSaturday, isSelected, salesData } = day;

  // console.log("isSelected", isSelected);
  const tooltipContent = salesData && (
    <div>
      <div className="font-bold mb-2">총 매출: ₩{salesData.totalSales.toLocaleString()}</div>
      {salesData.items.map((item, index) => (
        <div key={index}>
          {item.name}: {item.quantity} (₩{item.sales.toLocaleString()})
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`bg-white p-4 border h-36 border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col
        ${isToday ? "bg-blue-50" : ""}
        ${isSelected ? "ring-2 ring-red-500" : ""}`}
    >
      <div
        className={`text-sm font-medium ${isSunday ? "text-red-500" : ""} ${
          isSaturday ? "text-blue-500" : ""
        }`}
      >
        {date.getUTCDate()}
      </div>
      {salesData && (
        <Tooltip content={tooltipContent}>
          <div className="text-lg font-medium text-gray-700 mt-1">
            ₩ {salesData.totalSales.toLocaleString()}
          </div>
        </Tooltip>
      )}
    </div>
  );
});

export default CalendarDay;
