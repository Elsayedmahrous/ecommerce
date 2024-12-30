const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require("../../middleware/vaildationMiddleware");
const User = require('../../models/userModel');

//@desc    Signup
//@route    Get/api/v1/auth/signup
//@access    Public

exports.signupValidator = [
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
    
    check('passwordConfirm').notEmpty().withMessage('Password confirmation required'),

    validatorMiddleware
];
exports.loginValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),
    
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('password must be least 6 characters'),

    validatorMiddleware
];

