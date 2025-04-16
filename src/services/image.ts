import fs from 'fs';
import cloudinary from '../config/cloudinary.config';

export class ImageService {
    static async uploadImage(filePath: string) {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'products'
            });
            
            fs.unlinkSync(filePath);            
            return {
                url: result.secure_url,
                publicId: result.public_id
            };
        } catch (error) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }

    static async deleteImage(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }

    static async uploadMultipleImages(files: Express.Multer.File[]) {
        const uploadPromises = files?.map(file => this.uploadImage(file.path));
        return Promise.all(uploadPromises);
    }

    static async deleteMultipleImages(publicIds: string[]) {
        const deletePromises = publicIds?.map(publicId => this.deleteImage(publicId));
        return Promise.all(deletePromises);
    }

    static async deleteMultipleImagesByUrls(urls: string[]) {
        const deletePromises = urls?.map(url => this.deleteImage(url));
        return Promise.all(deletePromises);
    }
}
