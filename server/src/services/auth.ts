import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenUser {
  _id: unknown;
  username: string;
  email: string;
}

interface JWTError extends Error {
  name: string;
  message: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || 'mysecretsshhhhh';

    jwt.verify(token, secretKey, (err: JWTError | null, decoded: TokenUser | undefined) => {
      if (err) {
        return res.sendStatus(403);
      }

      if (decoded) {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || 'mysecretsshhhhh';

  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};