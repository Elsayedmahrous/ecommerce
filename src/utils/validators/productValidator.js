const slugify = require('slugify');
const { check, body } = require('express-validator');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subcategoryModel')

const validatorMiddleware = require('../../middleware/vaildationMiddleware');

exports.createProductValidator = [
    check('title')
        .isLength({ min: 3 })
        .withMessage('must be at least 3 chars')
        .notEmpty()
        .withMessage('product required')
        .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('description')
        .notEmpty()
        .withMessage('product description is required')
        .isLength({ max: 2000 })
        .withMessage(" Too long description"),
    check('quantity')
        .notEmpty()
        .withMessage('product quantity is required')
        .isNumeric()
        .withMessage("product quantity must be a number"),
    check('sold')
        .optional()
        .isNumeric()
        .withMessage('product quantity must be a number'),
    check('price')
        .notEmpty()
        .withMessage('product price is required')
        .isNumeric()
        .withMessage('product price must be a number')
        .isLength({ max: 32 })
        .withMessage('Too long price'),
    check('priceAfterDiscount')
        .optional()
        .isNumeric()
        .withMessage('product priceAfterDiscount must be a number')
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error('priceAfterDiscount must be lower than price');
            }
            return true;
        }),
    check('colors')
        .optional()
        .isArray()
        .withMessage('image should be array of string'),
    check('category')
        .notEmpty()
        .withMessage('product must be belong to a category')
        .isMongoId()
        .withMessage('Invalid ID formate')
        .custom((categoryId) =>
            Category.findById(categoryId).then((category) => {
            if(!category) {
                return Promise.reject(new Error(`No category for this id: ${categoryId}`))
                }
            })),
    check('subcategories')
        .optional()
        .isMongoId()
        .withMessage('Invalid ID formate')
        .custom((subcategoriesIds) => SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then((result) => {
            if (result.length < 1 || result.length != subcategoriesIds.length) {
                return Promise.reject(new Error(`Invalid subcategories Ids`));
            }
        }))
        .custom((val, { req }) => SubCategory.find({ category: req.body.category }).then((subcategories) => {
            const subcategoriesIdsInDB = [];
            subcategories.forEach((subCategory) => {
                subcategoriesIdsInDB.push(subCategory._id.toString());
            });
            // check if subcategories ids in db include subcategories in req.body
            if (!val.every((v) => subcategoriesIdsInDB.includes(v))) {
                return Promise.reject(new Error(`subcategories belong to category`));
            }
        })),
    check('brand')
        .optional()
        .isMongoId()
        .withMessage('Invalid ID formate'),
    check('ratingsAverage')
        .optional()
        .isNumeric()
        .withMessage('ratingsAverage must be a number')
        .isLength({ min: 1 })
        .withMessage('Rating must be above or equal 1.0')
        .isLength({ max: 5 })
        .withMessage('Rating must be abelow or equal 5.0'),
    check('ratingsQuantity')
        .optional()
        .isNumeric()
        .withMessage('ratingsQuantity must be a number'),
    
    validatorMiddleware,
    
];

exports.getProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware
];

exports.updateProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    body('title').optional().custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
    }),
    validatorMiddleware
];

exports.deleteProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware
];
