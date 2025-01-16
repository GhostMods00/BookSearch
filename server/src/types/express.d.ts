import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: unknown;
        username: string;
        email: string;
      };
    }
  }
}

export {};