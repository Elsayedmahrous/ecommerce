const factory = require('./handlersFactory');
const SubCategory = require('../models/subcategoryModel');
exports.setCategoryIdToBody = (req, res, next) => {
    if (!req.body.category) req.body.category = req.params.categoryId;
    next();
}
/**
 * @desc   Create subCategory
 * @route  Post  /api/v1/categories
 * @access Private
 */
exports.createSubCategory = factory.createOne(SubCategory);
//* Nested route
//* GET /api/v1/categories/:categoryId/subcategory
exports.createFilterObj = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId) filterObject = { category: req.params.categoryId }; 
    req.filterObj = filterObject;
    next();
}
/**
 * @desc   Get list of subCategories
 * @route  GET /api/v1/subcategories
 * @access Public
 */
exports.getSubCategories = factory.getAll(SubCategory);
/**
 * @desc   Get specific subcategory by id
 * @route  Get  /api/v1/subcategories
 * @access  Public
 */
exports.getSubCategory = factory.getOne(SubCategory);
/**
 * @desc   Update specific subCategory
 * @route  Put  /api/v1/subcategories/:id
 * @access  Private
 */
exports.updateSubCategory = factory.updateOne(SubCategory);
/**
 * @desc   Delete specific subcategory
 * @route  DELETE  /api/v1/subcategories/:id
 * @access  Private
 */
exports.deleteSubCategory = factory.deleteOne(SubCategory);

