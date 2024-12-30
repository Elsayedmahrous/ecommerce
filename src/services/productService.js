const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const factory = require('./handlersFactory');
const Product = require('../models/productModel');
const { uploadMixImages } = require('../middleware/uploadImageMiddleware');

exports.uploadProductImages = uploadMixImages([{
    name: "imageCover",
    maxCount: 1,
}, {
    name: "images",
    maxCount: 5,
    },
]);

exports.resizeProductImages = async(req, res ,next) => {
    if (req.files.imageCover) {
        const imageCoverFileName = `product-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1330)
            .toFormat("jpeg")
            .jpeg({ quality: 95 })
            .toFile(`uploads/products/${imageCoverFileName}`)
        req.body.imageCover = imageCoverFileName;
    }

    //* 2- Image processing for images
    if (req.files.images) {
        req.body.images = [];
       await Promise.all(req.files.images.map(async (img, index) => {
            const imagesFileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
            await sharp(img.buffer)
                .resize(2000, 1330)
                .toFormat("jpeg")
                .jpeg({ quality: 95 })
                .toFile(`uploads/products/${imagesFileName}`)
            req.body.images.push(imagesFileName);
       }));
        
        next();
    }
}
/**
 * @desc   Get list of products
 * @route  GET /api/v1/products
 * @access Public
 */
exports.getProducts = factory.getAll(Product);
/**
 * @desc   Get specific product by id
 * @route  Get  /api/v1/products
 * @access  Public
 */
exports.getProduct = factory.getOne(Product, "reviews");
/**
 * @desc   Create product
 * @route  Post  /api/v1/products
 * @access Private
 */
exports.createProduct = factory.createOne(Product);
/**
 * @desc   update specific product
 * @route  Put  /api/v1/products/:id
 * @access  Private
 */
exports.updateProduct = factory.updateOne(Product);
/**
 * @desc   Delete specific product
 * @route  DELETE  /api/v1/products/:id
 * @access  Private
 */
exports.deleteProduct = factory.deleteOne(Product);
