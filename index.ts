import connectToMongo from "./db";
import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from "./routes/auth"
import messageRoutes from "./routes/message"
import http from "http";
import socketServer from "./socket";
import { Server, Socket } from "socket.io";
import Message from "./models/Message";
const app: Application = express();
const port: number = 8000;

connectToMongo();

app.use(cors());

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", messageRoutes);

const server = http.createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket: Socket) => {
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

server.listen(port, () => {
  console.log(`inotebook backend listening on port ${port}`);
});
