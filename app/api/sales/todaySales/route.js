//file: \app\api\sales\todaySales\route.js

import { NextResponse } from "next/server";
import { startOfDay, endOfDay, format } from "date-fns";
import dbConnect from "../../../lib/mongoose";
import DailySales from "../../../models/DailySales";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    const today = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    console.log("Fetching today's sales for restaurant:", restaurantId);

    const todaySales = await DailySales.findOne({
      restaurantId,
      date: { $gte: today, $lte: endOfToday },
    });

    console.log("Today's sales:", todaySales?.totalSales || 0);

    return NextResponse.json({
      date: format(today, "yyyy-MM-dd"),
      totalSales: todaySales ? todaySales.totalSales : 0,
    });
  } catch (error) {
    console.error("Failed to fetch today's sales data:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's sales data", details: error.message },
      { status: 500 }
    );
  }
}
