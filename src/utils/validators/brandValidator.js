// const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require("../../middleware/vaildationMiddleware");
const { default: slugify } = require('slugify');

exports.getBrandValidator = [
    check('id').isMongoId().withMessage('Invalid Brand id'),
    validatorMiddleware
];

exports.createBrandValidator = [
    check('name')
        .notEmpty()
        .withMessage('Brand required')
        .isLength({ min: 2 })
        .withMessage('Too short Brand name')
        .isLength({ max: 32 })
        .withMessage('Too long Brand name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware
];

exports.updateBrandValidator = [
    check('id').isMongoId().withMessage('Invalid Brand id'),
    body('name').optional().custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
    }),
    validatorMiddleware
];

exports.deleteBrandValidator = [
    check('id').isMongoId().withMessage('Invalid Brand id'),
    validatorMiddleware
];