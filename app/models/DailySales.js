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

DailySalesSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailySales", DailySalesSchema);
