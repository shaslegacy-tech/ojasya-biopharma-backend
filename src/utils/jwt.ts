// backend/utils/jwt.ts
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (payload: any, expiresIn: string | number = '1d') => {
  const secret: Secret = (process.env.JWT_SECRET as string) ?? 'secret';
  const options = { expiresIn } as unknown as SignOptions;
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string) => {
  const secret: Secret = (process.env.JWT_SECRET as string) ?? 'secret';
  return jwt.verify(token, secret);
};
