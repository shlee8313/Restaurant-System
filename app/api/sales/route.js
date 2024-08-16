//file: /api/sales/route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
// import Order from "../../models/Order";
const DailySales = require("../../models/DailySales");
// const { authenticate } = require("../middleware/auth");
const {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay,
} = require("date-fns");
// export const dynamic = "force-dynamic";
/**
 *
 */
// export const dynamic = "force-dynamic";
export async function GET(req) {
  console.log("Sales API called");

  try {
    await dbConnect();
    console.log("Database connected");

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log(`Query params: restaurantId=${restaurantId}, month=${month}, year=${year}`);

    if (!restaurantId || !month || !year) {
      return res.status(400).json({ error: "Restaurant ID, month, and year are required" });
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

    return res.json(fullSalesData);
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    return res.status(500).json({ error: "Failed to fetch sales data", details: error.message });
  }
}
