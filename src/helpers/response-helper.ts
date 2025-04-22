import { Response } from 'express';
import { ApiError, ApiResponse, PaginationMeta } from "../types";

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500
} as const;

/**
 * Create a success response
 * @param message Success message
 * @param data Optional data to send
 * @param statusCode HTTP status code (default: 200)
 */
export const successResponse = <T>(
    message: string,
    data?: T,
    meta?: PaginationMeta,
    statusCode: number = HTTP_STATUS.OK
): ApiResponse<T> => ({
    success: true,
    message,
    data: data || null,
    meta,
    statusCode
});

/**
 * Create an error response
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 * @param errors Optional array of specific errors
 */
export const errorResponse = (
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER,
    errors?: ApiError[]
): ApiResponse<null> => ({
    success: false,
    message,
    data: null,
    statusCode,
    errors
});

/**
 * Send API response
 * @param res Express Response object
 * @param response ApiResponse object
 */
export const sendResponse = <T>(
    res: Response,
    response: ApiResponse<T>
): void => {
    res.status(response.statusCode).json(response);
};

// Utility functions for common responses
export const notFoundResponse = (message: string = 'Resource not found') => 
    errorResponse(message, HTTP_STATUS.NOT_FOUND);

export const badRequestResponse = (message: string, errors?: ApiError[]) => 
    errorResponse(message, HTTP_STATUS.BAD_REQUEST, errors);

export const serverErrorResponse = (message: string = 'Internal server error') => 
    errorResponse(message, HTTP_STATUS.INTERNAL_SERVER);

export const createdResponse = <T>(message: string, data?: T, meta?: PaginationMeta,) => 
    successResponse(message, data, meta, HTTP_STATUS.CREATED); 