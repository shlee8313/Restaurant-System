import io from "socket.io-client";

let socket;

export const initSocket = (restaurantId) => {
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  console.log(socketServerUrl);
  socket = io(socketServerUrl, {
    query: { restaurantId },
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
