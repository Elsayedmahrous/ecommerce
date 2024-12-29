const factory = require('./handlersFactory');
const Brand = require('../models/brandModel ');
const { uploadSingleImage } = require('../middlewera/uploadImageMiddleware');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

exports.uploadBrandImage = uploadSingleImage("image")
// Image processing
exports.resizeImage = (req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`uploads/brands/${filename}`)
    // save image into our db
    req.body.image =filename;
    
    next();
}
// @desc   Get list of Brands
// @route  GET /api/v1/brands
//@access Public
exports.getBrands = factory.getAll(Brand);
// @desc   Get specific brand by id
// @route  Get  /api/v1/brands
// @access  Public
exports.getBrand = factory.getOne(Brand);
// @desc   Create brand
// @route  Post  /api/v1/brands
// @access Private
exports.createBrand = factory.createOne(Brand);
// @desc   Update specific Brand
// @route  Put  /api/v1/brand/:id
// @access  Private
exports.updateBrand = factory.updateOne(Brand);
// @desc   Delete specific Brand
// @route  DELETE  /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
