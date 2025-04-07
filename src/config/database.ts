import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';

export const connectDB = async () => {
    try {
        const mongoUri = process.env.DB_HOST;
        if (!mongoUri) {
            throw new Error('DB_HOST is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

        const adminExists = await UserModel.findOne({ email: adminEmail });
        if (!adminExists) {
            await UserModel.create({
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}; 