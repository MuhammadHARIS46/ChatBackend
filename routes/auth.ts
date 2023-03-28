import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import fetchUser from "../middleware/fetchUser";
const router = Router();
const JWT_SECRET = "mysecretkey";

interface CustomRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface CustomResponse extends Response {
  json: (body?: any) => this;
}

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req: CustomRequest, res: CustomResponse) => {
    const { name, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: "Sorry, a user with this email already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, JWT_SECRET);

      res.json({ success: true, token });
    } catch (error) {
      console.log((error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req: Request, res: CustomResponse) => {
    try {
      const { email, password } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid credentials" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(payload, JWT_SECRET);

      return res.json({
        success: true,
        auth_token: authToken,
        userId: user.id,
      });
    } catch (error) {
      console.log((error as Error).message);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

router.get("/getuser", fetchUser, async (req: Request, res: Response) => {
  const loggedInUser = req.user;
  try {
    const user = await User.find({ _id: { $ne: loggedInUser } });
    res.json(user);
  } catch (error) {
    console.log((error as Error).message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
