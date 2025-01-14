import jwt from 'jsonwebtoken';
import type { UserDocument } from '../models/User.js';
import User from '../models/User.js';

export const verifyToken = async (token: string) => {
  try {
    if (!token || !token.startsWith('Bearer ')) {
      return null;
    }

    const tokenStr = token.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || 'mysecretsshhhhh';
    const { _id } = jwt.verify(tokenStr, secretKey) as { _id: string };
    
    return await User.findById(_id);
  } catch (err) {
    return null;
  }
};

export const signToken = (user: UserDocument) => {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username
  };
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET_KEY || 'mysecretsshhhhh', 
    { expiresIn: '2h' }
  );
};