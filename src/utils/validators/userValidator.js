const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');
const validatorMiddleware = require("../../middleware/vaildationMiddleware");
const User = require('../../models/userModel');

exports.getUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id'),
    validatorMiddleware
];

exports.createUserValidator = [
    check('name')
        .notEmpty()
        .withMessage('User required')
        .isLength({ min: 2 })
        .withMessage('Too short User name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) => User.findOne({ email: val }).then((user)=> {
            if(user) {
                return Promise.reject(new Error('E-mail already in user'))
            }
        })),
    
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('password must be least 6 characters')
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),
    
    check('profileImg')
        .optional(),
    
    check('role')
        .optional(),
    
    check('passwordConfirm').notEmpty().withMessage('Password confirmation required'),

    check('phone')
        .optional()
        .isMobilePhone("ar-EG", "ar-SA")
        .withMessage('Invalid phone number only accepted Egy and SA phone number'),
    validatorMiddleware
];
exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id'),
    body('name').optional().custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) => User.findOne({ email: val }).then((user)=> {
        if(user) {
            return Promise.reject(new Error('E-mail already in user'))
        }
    })),
    check('phone')
        .optional()
        .isMobilePhone("ar-EG", "ar-SA")
        .withMessage('Invalid phone number only accepted Egy and SA phone number'),
    check('profileImg')
        .optional(),
    
    check('role')
        .optional(),
    validatorMiddleware
];

exports.changeUserPasswordValidator = [
    check('currentPassword').notEmpty().withMessage('you must enter your password current'),
    check('passwordConfirm').notEmpty().withMessage('you must enter the password confirm'),
    check('password').notEmpty().withMessage('you must enter the password')
        .custom(async (val, { req }) => {
            // 1) verify current password
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new Error('There is no user for this id');
            };
            const isCorrectPassword = await bcrypt.compare(req.body.currentPassword, user.password)
            if (!isCorrectPassword) {
                throw new Error('Incorrect current password');
            };
            // 2) verify password confirm
            if (val != req.body.passwordConfirm) {
                throw new Error('Password confirmation incorrect');
            };
            return true;
        }),
    validatorMiddleware
]
exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id'),
    validatorMiddleware
];

exports.updateLoggedUserValidator = [
    body('name').optional().custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) => User.findOne({ email: val }).then((user)=> {
        if(user) {
            return Promise.reject(new Error('E-mail already in user'))
        }
    })),
    check('phone')
        .optional()
        .isMobilePhone("ar-EG", "ar-SA")
        .withMessage('Invalid phone number only accepted Egy and SA phone number'),
    validatorMiddleware
];