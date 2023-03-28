import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const JWT_SECRET = "mysecretkey";


const fetchUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('auth_token');

  if (!token) {
    return res.status(401).send({ error: "Please authenticate using" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET) as UserPayload & JwtPayload;
    req.user = data.user.id
    next();
  } catch (error) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
}






export default fetchUser;
