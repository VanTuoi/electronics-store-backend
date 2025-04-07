import mongoose from 'mongoose';
import { Product } from '../types/product';

const productImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
    publicId: { type: String, required: true }
});

const productSpecSchema = new mongoose.Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
});

const dimensionsSchema = new mongoose.Schema({
    height: Number,
    width: Number,
    depth: Number,
    unit: String
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: String,
    usage: String,
    features: [String],

    price: Number,
    priceText: String,
    discountPrice: Number,
    discountPercent: Number,
    images: [productImageSchema],
    specs: [productSpecSchema],

    material: String,
    capacity: String,
    weightKg: Number,
    dimensions: dimensionsSchema,
    protectionLevel: String,
    inputVoltage: String,
    outputVoltage: String,

    origin: String
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

export const ProductModel = mongoose.model<Product>('Product', productSchema); 