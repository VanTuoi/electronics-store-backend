import dotenv from 'dotenv';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/user.model';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7200';

/**
 * Generate JWT token
 * @param user UserDocument object
 * @returns JWT token string
 */
export const generateToken = (user: UserDocument): string => {
  const tokenId = Math.random().toString(36).substring(2);
  return jwt.sign(
    {
      sub: user._id,
      jti: tokenId,
      id: user._id,
      email: user.email,
      role: user.role,
      iss: 'electronics-store-api',
      aud: 'electronics-store-client'
    },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRES_IN) }
  );
};

/**
 * Verify JWT token
 * @param token JWT token string
 * @returns decoded JWT payload
 */
export const verifyToken = (token: string): jwt.JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

/**
 * Extract JWT token from request
 * Check Authorization header first, then cookies
 * @param req Express Request object
 * @returns token string or null if not found
 */
export const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    
    return req.cookies.token || null;
};

/**
 * Validate token format
 * @param token JWT token string
 * @returns boolean indicating if token format is valid
 */
export const isValidTokenFormat = (token: string): boolean => {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    return jwtRegex.test(token);
}; 