import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import {
    badRequestResponse,
    createdResponse,
    notFoundResponse,
    sendResponse,
    serverErrorResponse,
    successResponse
} from '../helpers/response-helper';
import { ProductModel } from '../models/product.model';
import { ImageService } from '../services/image';
import { ProductImage } from '../types/product';

interface ProductQuery {
    category?: string | { $in: string[] };
    isHidden?: boolean;
    price?: { $gte?: number; $lte?: number };
    
    quantity?: { $gte?: number; $lte?: number };
    $or?: Array<{
        [key: string]: { $regex: unknown; $options: string };
    }>;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       required:
 *         - url
 *         - publicId
 *       properties:
 *         url:
 *           type: string
 *           description: URL of the image
 *         publicId:
 *           type: string
 *           description: Public ID from cloud storage
 *         isMain:
 *           type: boolean
 *           description: Whether this is the main product image
 *           default: false
 *     ProductSpec:
 *       type: object
 *       required:
 *         - key
 *         - value
 *       properties:
 *         key:
 *           type: string
 *           description: Specification key
 *         value:
 *           type: string
 *           description: Specification value
 *     Dimensions:
 *       type: object
 *       properties:
 *         height:
 *           type: number
 *           description: Height of the product
 *         width:
 *           type: number
 *           description: Width of the product
 *         depth:
 *           type: number
 *           description: Depth of the product
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., mm, cm, m)
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: Product ID (auto-generated)
 *         name:
 *           type: string
 *           description: Product name
 *         code:
 *           type: string
 *           description: Product code
 *         category:
 *           type: string
 *           description: Category ID reference
 *         description:
 *           type: string
 *           description: Product description
 *         usage:
 *           type: string
 *           description: Usage instructions
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: List of product features
 *         price:
 *           type: number
 *           description: Product price
 *         priceText:
 *           type: string
 *           description: Price in text format
 *         discountPrice:
 *           type: number
 *           description: Discounted price
 *         discountPercent:
 *           type: number
 *           description: Discount percentage
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *           description: Product images
 *         specs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductSpec'
 *           description: Product specifications
 *         material:
 *           type: string
 *           description: Product material
 *         capacity:
 *           type: string
 *           description: Product capacity
 *         weightKg:
 *           type: number
 *           description: Weight in kilograms
 *         dimensions:
 *           $ref: '#/components/schemas/Dimensions'
 *         protectionLevel:
 *           type: string
 *           description: Protection level
 *         inputVoltage:
 *           type: string
 *           description: Input voltage
 *         outputVoltage:
 *           type: string
 *           description: Output voltage
 *         origin:
 *           type: string
 *           description: Product origin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               code:
 *                 type: string
 *                 description: Product code
 *               category:
 *                 type: string
 *                 description: Category ID
 *               description:
 *                 type: string
 *                 description: Product description
 *               usage:
 *                 type: string
 *                 description: Usage instructions
 *               features:
 *                 type: string
 *                 format: json
 *                 example: '["Feature 1", "Feature 2"]'
 *                 description: JSON string array of product features
 *               price:
 *                 type: number
 *                 description: Product price
 *               priceText:
 *                 type: string
 *                 description: Price in text format
 *               discountPrice:
 *                 type: number
 *                 description: Discounted price
 *               discountPercent:
 *                 type: number
 *                 description: Discount percentage
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                 description: Product images (max 5 files)
 *               specs:
 *                 type: string
 *                 format: json
 *                 example: '[{"key":"Size","value":"Large"}]'
 *                 description: JSON string array of product specifications
 *               material:
 *                 type: string
 *                 description: Product material
 *               capacity:
 *                 type: string
 *                 description: Product capacity
 *               weightKg:
 *                 type: number
 *                 description: Weight in kilograms
 *               dimensions:
 *                 type: string
 *                 format: json
 *                 example: '{"height":100,"width":50,"depth":25,"unit":"cm"}'
 *                 description: JSON string of product dimensions
 *               protectionLevel:
 *                 type: string
 *                 description: Protection level
 *               inputVoltage:
 *                 type: string
 *                 description: Input voltage
 *               outputVoltage:
 *                 type: string
 *                 description: Output voltage
 *               origin:
 *                 type: string
 *                 description: Product origin
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        
        const uploadedImages = await ImageService.uploadMultipleImages(files);
        
        const body = { ...req.body };
        
        if (body.features && typeof body.features === 'string') {
            body.features = JSON.parse(body.features);
        }
        if (body.specs && typeof body.specs === 'string') {
            body.specs = JSON.parse(body.specs);
        }
        if (body.dimensions && typeof body.dimensions === 'string') {
            body.dimensions = JSON.parse(body.dimensions);
        }

        const coverUploadedImages = uploadedImages.map((img: ProductImage) => ({
            url: img.url,
            publicId: img.publicId,
            isMain: false 
        }))

        if (req.body.mainImageIndex !== undefined) {
            const mainIndex = parseInt(req.body.mainImageIndex);
        
            if (!isNaN(mainIndex) && mainIndex >= 0 && mainIndex < coverUploadedImages.length) {
                for (let i = 0; i < coverUploadedImages.length; i++){
                    if (i === mainIndex){
                        coverUploadedImages[i].isMain = true;
                    } else {
                        coverUploadedImages[i].isMain = false;
                    }
                }
            }
        }
        
        if (coverUploadedImages.length > 0 && !coverUploadedImages.some(img => img.isMain)) {
            coverUploadedImages[0].isMain = true;
        }

        const productData = {
            ...body,
            images: coverUploadedImages
        };

        const product = await ProductModel.create(productData);
        sendResponse(res, createdResponse('Tạo sản phẩm thành công', product));
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        if (error instanceof SyntaxError) {
            return sendResponse(res, badRequestResponse('Dữ liệu JSON không hợp lệ'));
        }
        sendResponse(res, serverErrorResponse('Không thể tạo sản phẩm'));
    }
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID to filter by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price to filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price to filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price-asc, price-desc, newest, oldest]
 *         description: Sort option for products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 10
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Invalid category ID
 *       500:
 *         description: Server error
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            categoryId, 
            search, 
            minPrice, 
            maxPrice, 
            sortBy, 
            page = 1, 
            limit = 10 
        } = req.query;
        
        const query: ProductQuery = { isHidden: false };

        if (categoryId) {
            const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
            for (const id of categoryIds) {
                if (!isValidObjectId(id)) {
                    return sendResponse(res, badRequestResponse("Invalid category ID format"));
                }
            }
            query.category = { $in: categoryIds.map(id => String(id)) };
        }

        if (search && typeof search === "string" && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const priceFilter: any = {};
        if (minPrice) priceFilter.$gte = parseFloat(minPrice as string);
        if (maxPrice) priceFilter.$lte = parseFloat(maxPrice as string);
        if (Object.keys(priceFilter).length > 0) query.price = priceFilter;

        const sortOptions: any = {};
        switch (sortBy) {
            case 'price-asc':
                sortOptions.price = 1;
                break;
            case 'price-desc':
                sortOptions.price = -1;
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            case 'oldest':
                sortOptions.createdAt = 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const [products, total] = await Promise.all([
            ProductModel.find(query)
                .populate("category", "name")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNumber),
            ProductModel.countDocuments(query)
        ]);

        sendResponse(res, successResponse("Products retrieved successfully",
            products,{
                total,
                page: pageNumber,
                pages: Math.ceil(total / limitNumber),
                limit: limitNumber
            }));
    } catch (error) {
        console.error("Get products error:", error);
        sendResponse(res, serverErrorResponse("Failed to fetch products"));
    }
};

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get products for admin (Admin only)
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID to filter by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: quantityFrom
 *         schema:
 *           type: integer
 *         description: Minimum quantity to filter
 *       - in: query
 *         name: quantityTo
 *         schema:
 *           type: integer
 *         description: Maximum quantity to filter
 *       - in: query
 *         name: showHidden
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to show hidden products
 *     responses:
 *       200:
 *         description: List of admin products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid category ID format
 *       500:
 *         description: Server error
 */
export const getProductsForAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, search, quantityFrom, quantityTo, showHidden } = req.query;
        const query: ProductQuery = {};

        if (showHidden === 'true') {
            query.isHidden = true; 
        } else if (showHidden === 'false') {
            query.isHidden = false;
        } 

        if (categoryId) {
            if (!isValidObjectId(categoryId as string)) {
                return sendResponse(res, badRequestResponse("Invalid categoryId ID format"));
            }
            query.category = categoryId as string;
        }

        if (search && typeof search === "string" && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const quantityFilter: ProductQuery["quantity"] = {};
        const from = parseInt(quantityFrom as string, 10);
        const to = parseInt(quantityTo as string, 10);

        if (!isNaN(from)) {
            quantityFilter.$gte = from;
        }

        if (!isNaN(to)) {
            quantityFilter.$lte = to;
        }

        if (Object.keys(quantityFilter).length > 0) {
            query.quantity = quantityFilter;
        }

        const products = await ProductModel.find(query)
            .populate("category", "name")
            .sort({ createdAt: -1 });

        sendResponse(res, successResponse("Products retrieved successfully", products));
    } catch (error) {
        console.error("Get products error:", error);
        sendResponse(res, serverErrorResponse("Failed to fetch products"));
    }
};

/**
 * @swagger
 * /api/products/random:
 *   get:
 *     summary: Get random products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of random products to return (default is 5)
 *     responses:
 *       200:
 *         description: Random products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Random products retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid limit parameter
 *       500:
 *         description: Server error
 */
export const getRandomProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 5 } = req.query;
        const numLimit = Number(limit);

        if (isNaN(numLimit) || numLimit <= 0) {
            return sendResponse(res, badRequestResponse('Invalid limit parameter'));
        }

        const totalProducts = await ProductModel.countDocuments({ isHidden: false });

        const actualLimit = numLimit > totalProducts ? totalProducts : numLimit;

        const products = await ProductModel.aggregate([
            { $match: { isHidden: false } },
            { $sample: { size: actualLimit } },
            { $sort: { priceText: -1 } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $addFields: {
                    id: '$_id',
                    'category.id': '$category._id'
                }
            },
            {
                $project: {
                    _id: 0,
                    'category._id': 0,
                    '__v': 0,
                    'category.__v': 0
                }
            }
        ]);
        

        sendResponse(res, successResponse('Random products retrieved successfully', products));
    } catch (error) {
        console.error('Get random products error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch random products'));
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid product ID format
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to fetch product
 */
export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid product ID format'));
        }

        const product = await ProductModel.findById(id)
            .populate('category', 'name');

        if (!product) {
            return sendResponse(res, notFoundResponse('Product not found'));
        }

        sendResponse(res, successResponse('Product retrieved successfully', product));
    } catch (error) {
        console.error('Get product error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch product'));
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               category:
 *                 type: string
 *                 description: Category ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                 description: New product images to add (max 5 files)
 *               deleteImages:
 *                 type: string
 *                 format: json
 *                 example: '["public_id_1", "public_id_2"]'
 *                 description: JSON array of image publicIds to delete
 *               features:
 *                 type: string
 *                 format: json
 *                 example: '["Feature 1", "Feature 2"]'
 *                 description: JSON string array of product features
 *               specs:
 *                 type: string
 *                 format: json
 *                 example: '[{"key":"Size","value":"Large"}]'
 *                 description: JSON string array of product specifications
 *               dimensions:
 *                 type: string
 *                 format: json
 *                 example: '{"height":100,"width":50,"depth":25,"unit":"cm"}'
 *                 description: JSON string of product dimensions
 *               # ... other fields same as create
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid product ID format'));
        }

        const body = { ...req.body };
        if (body.category && !isValidObjectId(body.category)) {
            return sendResponse(res, badRequestResponse('Invalid category ID format'));
        }

        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            return sendResponse(res, notFoundResponse('Product not found'));
        }

        let updatedImages = [...(existingProduct.images || [])];

        if (files && files.length > 0) {
            const newImages = await ImageService.uploadMultipleImages(files);
            
            updatedImages = [
                ...updatedImages,
                ...newImages.map((img) => ({
                    url: img.url,
                    publicId: img.publicId,
                    isMain: false
                }))
            ];
        }


        if (req.body.deleteImages) {
            try {
                const deleteImageUrls = JSON.parse(req.body.deleteImages);
                await ImageService.deleteMultipleImagesByUrls(deleteImageUrls);
                updatedImages = updatedImages.filter(img => !deleteImageUrls.includes(img.url));
            } catch (error) {
                console.error('Error parsing deleteImages:', error);
            }
        }

        if (req.body.mainImageIndex !== undefined) {
            const mainIndex = parseInt(req.body.mainImageIndex);
        
            if (!isNaN(mainIndex) && mainIndex >= 0 && mainIndex < updatedImages.length) {
                for (let i = 0; i < updatedImages.length; i++){
                    if (i === mainIndex){
                        updatedImages[i].isMain = true;
                    } else {
                    updatedImages[i].isMain = false;
                    }
                }
            }
        }
        
        if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
            updatedImages[0].isMain = true;
        }
        
        const updateData = {
            ...body,
            images: updatedImages
        };

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category', 'name');

        sendResponse(res, successResponse('Product updated successfully', updatedProduct));
    } catch (error) {
        console.error('Update product error:', error);
        if (error instanceof SyntaxError) {
            return sendResponse(res, badRequestResponse('Invalid JSON data format'));
        }
        sendResponse(res, serverErrorResponse('Failed to update product'));
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid product ID format'));
        }

        const product = await ProductModel.findByIdAndDelete(id);

        if (!product) {
            return sendResponse(res, notFoundResponse('Product not found'));
        }

        sendResponse(res, successResponse('Product deleted successfully'));
    } catch (error) {
        console.error('Delete product error:', error);
        sendResponse(res, serverErrorResponse('Failed to delete product'));
    }
}; 