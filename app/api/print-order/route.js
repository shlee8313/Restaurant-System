import { NextResponse } from "next/server";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(request) {
  console.log("API route handler started");

  try {
    const { order, tableId } = await request.json();
    console.log("Request body:", { order, tableId });

    // 텍스트 파일 내용 생성
    const content = `\uFEFF주문 영수증
==============================

테이블: ${tableId}

주문 시간: ${new Date(order.orderedAt).toLocaleString()}
=============================
품목         수량    
${order.items
  .map((item) => `${item.name.padEnd(12)} ${item.quantity.toString().padEnd(7)}`)
  .join("\n")}
=============================

    `;

    // 텍스트 파일 경로 (지정된 파일 경로 사용)
    const filePath = path.join(process.cwd(), "public", "printer-order.txt");

    // UTF-8 with BOM으로 파일에 내용 쓰기
    await fs.writeFile(filePath, content, { encoding: "utf8" });

    // 프린터 이름 (기본 프린터를 사용하려면 비워두세요)
    const printerName = ""; // 예: "HP LaserJet Professional P1102"

    // PowerShell 명령어 생성 (UTF-8 인코딩 명시)
    const psCommand = printerName
      ? `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Content "${filePath}" -Encoding UTF8 | Out-Printer -Name "${printerName}"`
      : `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Content "${filePath}" -Encoding UTF8 | Out-Printer`;

    // PowerShell 실행
    const { stdout, stderr } = await execPromise(`powershell -Command "${psCommand}"`);

    if (stderr) {
      console.error(`PowerShell error: ${stderr}`);
      return NextResponse.json(
        { error: "Failed to print order", details: stderr },
        { status: 500 }
      );
    }

    console.log(`Print command executed successfully: ${stdout}`);

    // 출력 후 파일 내용 지우기
    await fs.writeFile(filePath, "", { encoding: "utf8" });

    return NextResponse.json(
      { message: "Order sent to printer and content cleared" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Printing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process print order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
