//file: \app\api\sales\todaySales\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import Order from "../../../models/Order";
// export const dynamic = "force-dynamic";
/**
 *
 */
// export const dynamic = "force-dynamic";
export async function GET(req) {
  console.log("Sales API called for today's total sales");

  try {
    await dbConnect();
    console.log("Database connected");

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const today = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    console.log("Fetching today's sales for restaurant:", restaurantId);

    const todaySales = await DailySales.findOne({
      restaurantId,
      date: { $gte: today, $lte: endOfToday },
    });

    console.log("Today's sales:", todaySales?.totalSales || 0);

    return res.json({
      date: format(today, "yyyy-MM-dd"),
      totalSales: todaySales ? todaySales.totalSales : 0,
    });
  } catch (error) {
    console.error("Failed to fetch today's sales data:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch today's sales data", details: error.message });
  }
}
