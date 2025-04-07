import mongoose from 'mongoose';

export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const CategoryModel = mongoose.model<Category>('Category', categorySchema); 