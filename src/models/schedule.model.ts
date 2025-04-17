import mongoose from 'mongoose';

export interface Schedule {
    id: string;
    name: string;
    phone: string;
    note: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    adminNote: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const scheduleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    note: String,
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    adminNote: String
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

export const ScheduleModel = mongoose.model<Schedule>('Schedule', scheduleSchema);