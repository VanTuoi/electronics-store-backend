import mongoose from "mongoose";

/**
 * Helper function to validate MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};