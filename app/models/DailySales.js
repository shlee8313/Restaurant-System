// models/DailySales.js
const mongoose = require("mongoose");

const DailySalesSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  date: { type: Date, required: true },
  totalSales: { type: Number, default: 0 },
  itemSales: [
    {
      itemId: String,
      name: String,
      quantity: Number,
      sales: Number,
    },
  ],
});

// 인덱스를 스키마 정의 내부에 추가
DailySalesSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

// 모델이 이미 존재하는 경우 사용하고, 그렇지 않으면 새로 생성
const DailySales = mongoose.models.DailySales || mongoose.model("DailySales", DailySalesSchema);

export default DailySales;
