import { Request } from "express";
import { UserDocument as MongooseUserDocument } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: MongooseUserDocument;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  role?: 'admin' | 'user';
}

export interface JwtPayload {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface User {
  _id: string;
  fullName: string;
  userName: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  gender: 'Male' | 'Female';
  status: 'Normal' | 'Locked';
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
} 