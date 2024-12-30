const factory = require('./handlersFactory');
const Category = require('../models/categoryModel');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
//* upload single image
exports.uploadCategoryImage = uploadSingleImage("image")
//* Image processing
exports.resizeImage = (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file) {
        sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/categories/${filename}`)
    // save image into our db
    req.body.image = filename;
    }
    
    next();
}
/**
 *  @desc   Get list of categories
 *  @access Public
 *  @route  GET /api/v1/categories
 */
exports.getCategories = factory.getAll(Category);
/**
 * @desc   Get specific category by id
 * @route  Get  /api/v1/categories
 * @access  Public
 */
exports.getCategory = factory.getOne(Category);
/**
 * @desc   Create category
 * @route  Post  /api/v1/categories
 * @access Private/Admin-manager
 */
exports.createCategory = factory.createOne(Category)
/**
 * @desc   Update specific category
 * @route  Put  /api/v1/categories/:id
 * @access  Private//Admin-manager
 */
exports.updateCategory = factory.updateOne(Category);
/**
 * @desc   Delete specific category
 * @route  DELETE  /api/v1/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = factory.deleteOne(Category);
