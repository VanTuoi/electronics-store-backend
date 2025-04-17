import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import corsOptions from './config/cors.config';
import { connectDB } from './config/database';
import { swaggerSpec } from './config/swagger';
import { setupLogger } from './helpers/logger.helper';
import { notFoundResponse, sendResponse, serverErrorResponse } from './helpers/response-helper';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import scheduleRoutes from './routes/schedule.routes';

config();

setupLogger();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/schedules', scheduleRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.get('/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use((_, res) => {
    sendResponse(res, notFoundResponse('Route not found'));
});

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    sendResponse(res, serverErrorResponse('Something went wrong'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const message = `Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`;
    if (process.env.NODE_ENV !== 'production') {
        console.log(message);
    }
}); 