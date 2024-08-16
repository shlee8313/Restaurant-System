//file: \app\api\orders\route.js
// 테이블 있는 식당에서 손님이 주문하게
import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Order from "../../models/Order";
import Restaurant from "../../models/Restaurant";
import DailySales from "../../models/DailySales";
import Table from "../../models/Table";
// export const dynamic = "force-dynamic";
/**
 * 
  
 */
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const date = searchParams.get("date");
    // console.log("req date", date);

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }
    if (date) {
      // 특정 날짜의 매출 데이터 가져오기
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const orders = await Order.find({
        restaurantId,
        status: "completed",
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });
      console.log(orders);
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return NextResponse.json({ date, totalSales });
    } else {
      // 수정: 주문을 최신순으로 정렬
      const activeOrders = await Order.find({
        restaurantId,
        status: { $ne: "completed" },
      }).sort({ createdAt: 1 }); // 생성 시간 순으로 정렬
      return NextResponse.json(activeOrders);
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const orderData = await request.json();
    // console.log(orderData);
    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Prepare order data according to the schema
    const orderForSaving = {
      restaurantId: orderData.restaurantId,
      tableId: orderData.tableId,
      items: orderData.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      status: orderData.status,
      totalAmount,
      tempId: orderData.tempId, // 임시 ID 저장 (필요시)
    };
    // console.log(orderForSaving);
    const newOrder = new Order(orderForSaving);
    // console.log(newOrder);
    const savedOrder = await newOrder.save();
    // console.log(savedOrder);
    // Socket.io 서버 생성 및 이벤트 발송

    // Emit socket event for new order
    // const io = new Server(res.socket.server);
    // io.to(orderData.restaurantId).emit("newOrder", savedOrder);

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { orderId } = params;
    const { status } = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

/**
 *
 */
export async function PATCH(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { restaurantId, tableId, action, orderId, newStatus } = body;

    if (action === "completeAllOrders") {
      const orders = await Order.find({ restaurantId, tableId, status: { $ne: "completed" } });

      for (const order of orders) {
        order.status = "completed";
        await order.save();

        // Update DailySales
        const orderDate = order.createdAt.toISOString().split("T")[0];
        await DailySales.findOneAndUpdate(
          { restaurantId, date: orderDate },
          {
            $inc: { totalSales: order.totalAmount },
            $push: {
              itemSales: order.items.map((item) => ({
                itemId: item.id,
                name: item.name,
                quantity: item.quantity,
                sales: item.price * item.quantity,
              })),
            },
          },
          { upsert: true, new: true }
        );
      }

      // 테이블 상태를 'empty'로 변경
      await Table.findOneAndUpdate({ restaurantId, tableId }, { $set: { status: "empty" } });

      return res.json({
        message: "All orders completed and table status updated",
        modifiedCount: orders.length,
      });
    } else {
      // 기존의 단일 주문 상태 변경 로직
      const order = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: newStatus } },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (newStatus === "completed") {
        // Update DailySales for single order completion
        const orderDate = order.createdAt.toISOString().split("T")[0];
        await DailySales.findOneAndUpdate(
          { restaurantId: order.restaurantId, date: orderDate },
          {
            $inc: { totalSales: order.totalAmount },
            $push: {
              itemSales: order.items.map((item) => ({
                itemId: item.id,
                name: item.name,
                quantity: item.quantity,
                sales: item.price * item.quantity,
              })),
            },
          },
          { upsert: true, new: true }
        );
      }

      // 업데이트된 대기열 정보 가져오기
      const updatedQueue = await Order.find({
        restaurantId: order.restaurantId,
        status: { $in: ["pending", "preparing"] },
      }).sort("createdAt");

      return res.json({ message: "Order updated", order, updatedQueue });
    }
  } catch (error) {
    console.error("Failed to update order(s):", error);
    return res.status(500).json({ error: "Failed to update order(s)" });
  }
}
