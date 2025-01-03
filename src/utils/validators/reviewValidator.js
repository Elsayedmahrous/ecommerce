const { check, body } = require('express-validator');
const validatorMiddleware = require("../../middleware/vaildationMiddleware");
const Review = require('../../models/reviewModel')

exports.createReviewValidator = [
    check('title').optional(),
    check('ratings')
        .notEmpty()
        .withMessage('ratings value require')
        .isFloat({ min: 1, max: 5 })
        .withMessage('Ratings value must be between 1 to 5'),
    check('user').isMongoId().withMessage('Invalid Review id format'),
    check('product')
        .isMongoId()
        .withMessage('Invalided Review id format')
        .custom((val, { req }) => {
            // check if logged user create review before
           return Review.findOne({ user: req.user._id, product: req.params.product }).then((review) => {
                if (review) {
                    return Promise.reject(new Error("You already created a review before")
                    );
               }
           });
        }),

    validatorMiddleware
];

exports.getReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id'),
    validatorMiddleware
];


exports.updateReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id')
        .custom((val, { req }) => {
        // check review ownership before update 
      return Review.findById(val).then((review) => {
            if (!review) {
                return Promise.reject(new Error(`There is no review with id ${val}`))
            }
            if (review.user._id.toString() !== req.user._id.toString()) {
                return Promise.reject(new Error(`You are not allowed perform this action`))
            }
        })
    }),
    validatorMiddleware
];

exports.deleteReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id')
        .custom((val, { req }) => {
            // check review ownership before update 
            if (req.user.role === "user") {
                return Review.findById(val).then((review) => {
                    if (!review) {
                        return Promise.reject(new Error(`There is no review with id ${val}`));
                    }
                    if (review.user._id.toString() !== req.user._id.toString()) {
                        return Promise.reject(new Error(`You are not allowed perform this action`));
                    }
                })
            }
            return true;
    }),
    validatorMiddleware
];