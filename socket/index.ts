import { Server } from "socket.io";
import { createServer } from "http";
import  Message  from "../models/message"; 

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("send-message", async (messageData) => {
    try {
      const message = new Message(messageData);
      await message.save();
      io.emit("receive-message", message);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default server;