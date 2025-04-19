import mongoose from 'mongoose';

export interface Order {
    id: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    note: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    adminNote: string;
    products: {
        id: string;
        price: number;
        quantity: number;
    }[];
    shippingFee: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSubSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    quantity: { type: Number, required: true }
}, { _id: false });


const orderSchema = new mongoose.Schema<Order>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: false },
    note: { type: String, required: false },
    status: { 
        type: String, 
        required: true, 
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },
    adminNote: { type: String, required: false },
    products: { type: [productSubSchema], required: true },
    shippingFee: { type: Number, required: true, default: 0 }
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

export const OrderModel = mongoose.model<Order>('Order', orderSchema);