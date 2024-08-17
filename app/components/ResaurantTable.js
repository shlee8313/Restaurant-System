//file: \app\components\RestaurantTable.js
import React from "react";

const RestaurantTable = React.memo(
  ({
    table,
    handleOrderStatusChange,
    handleCallComplete,
    handlePayment,
    activeTab,
    handleTabChange,
    orderQueue,
    formatNumber,
  }) => {
    console.log(`Rendering table content for table: ${table.tableId}`);

    const orders = table.orders || (table.order ? [table.order] : []);
    const tableTotalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const getStatusColor = (status) => {
      const colors = {
        pending: "bg-red-500 text-white",
        preparing: "bg-yellow-500 text-white",
        served: "bg-gray-400 text-gray-700",
        completed: "bg-green-200 text-gray-700",
      };
      return colors[status] || "bg-gray-500";
    };

    const getStatusText = (status) => {
      const texts = {
        pending: "Order Received",
        preparing: "Preparing",
        served: "Served",
        completed: "Completed",
      };
      return texts[status] || "Unknown";
    };

    return (
      <div className="mt-2 w-full h-full flex flex-col">
        {orders.length > 0 ? (
          <>
            <div className="flex border-b">
              {orders.map((order, index) => {
                const orderIndex = orderQueue.findIndex(
                  (queueOrder) => queueOrder._id === order._id
                );
                return (
                  <div
                    key={order._id || index}
                    className={`py-2 px-4 text-sm font-semibold rounded-t-lg mr-1 ${
                      activeTab === index
                        ? "bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-400 -mb-px z-10"
                        : "bg-gray-300 text-gray-600 border-t-2 border-l-2 border-r-2 border-gray-300 hover:bg-gray-300 border"
                    }`}
                    onClick={() => handleTabChange(table.tableId, index)}
                  >
                    Order #
                    {orderQueue.length > 0 && orderIndex >= 0 && (
                      <span className="px-2 py-1 rounded-full bg-pink-600 text-white">
                        {orderIndex + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bg-white border-2 border-blue-400 rounded-b-lg rounded-tr-lg flex-grow overflow-x-hidden overflow-y-auto custom-scrollbar">
              <div className="p-1">
                {orders.map((order, orderIndex) => (
                  <div
                    key={order._id || orderIndex}
                    className={`${activeTab === orderIndex ? "block " : "hidden "}`}
                  >
                    <ul className="text-sm">
                      {order.items &&
                        order.items.map((item, itemIndex) => (
                          <li key={item._id || itemIndex} className="border-b border-blue-200">
                            <div className="mt-1 mx-3 flex justify-between items-center p-2">
                              <div className="flex-grow flex items-center">
                                <span>{item.name}</span>
                                <span className="ml-2 bg-gray-600 text-white text-md font-medium px-2 py-1 rounded-lg">
                                  {item.quantity}
                                </span>
                              </div>
                              <div>{formatNumber(item.price * item.quantity)}원</div>
                            </div>
                          </li>
                        ))}
                    </ul>
                    {order.items && order.items.every((item) => item.price === 0) ? (
                      <button
                        className="mt-2 text-sm px-2 py-1 rounded-xl bg-gray-800 text-white right-0"
                        onClick={() => handleCallComplete(table.tableId, order)}
                      >
                        호출
                      </button>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <button
                            className={`mt-2 text-sm px-3 py-1 rounded-lg ml-auto ${getStatusColor(
                              order.status
                            )}`}
                            onClick={
                              order.status !== "served"
                                ? () => handleOrderStatusChange(table.tableId, order)
                                : undefined
                            }
                            disabled={order.status === "served"}
                          >
                            {getStatusText(order.status)}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="mt-2 font-bold text-right p-2 border-t border-gray-200">
              <button
                onClick={() => handlePayment(table.tableId)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-4"
              >
                결제
              </button>
              <span>총액: {formatNumber(tableTotalAmount)}원</span>
            </div>
          </>
        ) : (
          <p className="text-sm p-4">주문 없음</p>
        )}
      </div>
    );
  }
);

export default RestaurantTable;
