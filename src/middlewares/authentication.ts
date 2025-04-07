import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import { extractToken, verifyToken } from '../helpers/jwt-helper';
import {
  errorResponse,
  HTTP_STATUS,
  sendResponse
} from "../helpers/response-helper";
import { UserDocument } from "../models/user.model";
import { ApiResponse, AuthenticatedRequest } from "../types";

dotenv.config();

export const verifyTokenMiddleware = (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<void>>,
    next: NextFunction
): void => {
    const token = extractToken(req);

    if (!token) {
        sendResponse(res, errorResponse(
            'Authentication token is required',
            HTTP_STATUS.UNAUTHORIZED
        ));
        return;
    }

    try {
        const decoded = verifyToken(token) as UserDocument;
        req.user = decoded;
        next();
    } catch (error) {
        sendResponse(res, errorResponse(
            'Invalid or expired token',
            HTTP_STATUS.UNAUTHORIZED
        ));
    }
};

export const verifyAdminRole = (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<void>>,
    next: NextFunction
): void => {
    if (!req.user) {
        sendResponse(res, errorResponse(
            'User information not found',
            HTTP_STATUS.UNAUTHORIZED
        ));
        return;
    }

    if (req.user.role !== 'admin') {
        sendResponse(res, errorResponse(
            'Access denied. Admin role required',
            HTTP_STATUS.FORBIDDEN
        ));
        return;
    }

    next();
}; 