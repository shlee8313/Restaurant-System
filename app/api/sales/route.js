//file: /api/sales/route.js

import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import DailySales from "../../models/DailySales";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!restaurantId || !month || !year) {
      return NextResponse.json(
        { error: "Restaurant ID, month, and year are required" },
        { status: 400 }
      );
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const salesData = await DailySales.find({
      restaurantId,
      date: { $gte: startDate, $lte: endDate },
    }).sort("date");

    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const fullSalesData = allDates.map((date) => {
      const formattedDate = format(date, "yyyy-MM-dd");
      const dayData = salesData.find((item) => format(item.date, "yyyy-MM-dd") === formattedDate);
      if (dayData) {
        return {
          date: formattedDate,
          totalSales: dayData.totalSales,
          items: dayData.itemSales.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            sales: item.sales,
          })),
        };
      } else {
        return { date: formattedDate, totalSales: 0, items: [] };
      }
    });

    return NextResponse.json(fullSalesData);
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data", details: error.message },
      { status: 500 }
    );
  }
}
