import { Request, Response, Router } from "express";

import Message, { IMessage } from "../models/Message";
import fetchUser from "../middleware/fetchUser";
import User from "../models/User";
const router = Router();


router.post("/send-message", fetchUser, async (req: Request, res: Response) => {
  try {
    const senderId = req.user;

    const { recipientId, content } = req.body;

    if (!senderId || !recipientId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sender or recipient ID" });
    }

    const newMessage: IMessage = new Message({
      user: req.user,
      recipient: recipientId,
      content,
    });

    const savedMessage = await newMessage.save();

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get(
  "/messages/:userId",
  fetchUser,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user1 = await User.findById(userId);
      const user2 = await User.findById(req.user);
      if (!user1 || !user2) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid user ID" });
      }

      const messages = await Message.find({
        $or: [
          { user: user1._id, recipient: user2._id },
          { user: user2._id, recipient: user1._id },
        ],
      }).populate("user recipient", "name");
      return res.json({ success: true, messages });
    } catch (error) {
      console.log((error as Error).message);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

export default router;
