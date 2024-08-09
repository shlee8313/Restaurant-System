import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";

import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route handler started");

  let printer;
  try {
    const { order, tableId } = await request.json();
    console.log("Request body:", { order, tableId });

    console.log("Initializing printer");
    printer = new ThermalPrinter({
      type: PrinterTypes.HP, // 프린터 제조사에 따라 변경 가능
      interface: "printer:HP LaserJet Professional P1102", // Windows 프린터 이름
      driver: require("printer"),
      options: {
        timeout: 5000, // 5초 타임아웃
      },
    });

    console.log("Printer configuration:", printer.getConfig());

    console.log("Checking printer connection...");
    const isConnected = await printer.isPrinterConnected();
    console.log("Printer connected:", isConnected);

    if (!isConnected) {
      throw new Error("Printer is not connected");
    }

    // 주문 정보 인쇄
    console.log("Printing order information");
    printer.alignCenter();
    printer.setTextQuadArea();
    printer.println("주문 영수증");
    printer.setTextNormal();
    printer.drawLine();

    printer.alignLeft();
    printer.println(`주문 ID: ${order._id}`);
    printer.println(`테이블: ${tableId}`);
    printer.println(`주문 시간: ${new Date(order.orderedAt).toLocaleString()}`);
    printer.drawLine();

    printer.tableCustom([
      { text: "품목", width: 0.4 },
      { text: "수량", width: 0.2 },
      { text: "가격", width: 0.4 },
    ]);

    order.items.forEach((item) => {
      printer.tableCustom([
        { text: item.name, width: 0.4 },
        { text: item.quantity.toString(), width: 0.2 },
        { text: `${item.price * item.quantity}원`, width: 0.4 },
      ]);
    });

    printer.drawLine();
    printer.alignRight();
    printer.println(`총 금액: ${order.totalAmount}원`);
    printer.cut();

    console.log("Executing print command");
    const result = await printer.execute();
    console.log("Print command executed successfully", result);

    return NextResponse.json({ message: "Order printed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Printing error:", error);
    return NextResponse.json(
      {
        error: "Failed to print order",
        details: error.message,
        printerConfig: printer ? printer.getConfig() : "Printer not initialized",
      },
      { status: 500 }
    );
  }
}
