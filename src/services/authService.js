const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');
const createToken = require('../utils/createToken');
/**
 * @desc   signup
 * @route  GET /api/v1/auth/signup
 * @access Pubic
 */
exports.signup = asyncHandler(async (req, res, next) => {
    // 1- Create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })

    // 2- Generate token
    const token = createToken(user._id);
    res.status(201).json({ data: user, token });
});

/**
 * @desc   login
 * @route  GET /api/v1/auth/login
 * @access Pubic
 */
exports.login = asyncHandler(async (req, res, next) => {
    // 1) check if password and email in the body (validation);
    // 2) check if user exist & check if password is correct
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiError('Incorrect email or password', 401));
    };
    // 3) generate token
    const token = createToken(user._id);
    // 4) send response to client side
    res.status(201).json({ data: user, token });

});
//*@desc  make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
    //TODO 1) check if token exist , if exist get
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    };
    if (!token) {
        return next(new ApiError('You are not login, Please login to get access this route', 401));
    };
    //TODO 2) Verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //TODO 3) Check if user exist 
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser) {
        return next(new ApiError('The user that belong to this token dose no longer exist', 401))
    }
    //TODO 4) Check if user change his password after token created
    if (currentUser.passwordChangeAt) {
        const passChangedTimestamp = parseInt(currentUser.passwordChangeAt.getTime() / 1000, 10);
        if (passChangedTimestamp > decoded.iat) {
            return next(new ApiError('User recently changed his password. please login again...', 401));
        }
    }
    req.user = currentUser;
    next();
});
/**
 * @desc Authorization (User permissions)
 * ["admin", "manager"]
 */
exports.allowedTo = (...roles) => asyncHandler(async (req, res, next) => {
    //TODO 1) access roles
    //TODO 1) access registered user (req.user.role) 
    if (!roles.includes(req.user.role)) {
        return next(new ApiError('You not allowed to access this route',403))
    };
    next()
});

/**
 * @desc   Forget password
 * @route  Post /api/v1/auth/forgetPassword
 * @access Pubic
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    //TODO 1) Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError(`There is no user with that email ${req.body.email}`, 404));
    }
    //TODO 2) If user exist, generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    //* save hashed password reset code into db
    user.passwordResetCode = hashedResetCode;
    //* Add expiration time for password reset code (10min).
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
    await user.save();
    //TODO 3) send  the reset code via email
    const message = `Hi${user.name},\n We received a request to reset the on your E-shop Account.\n ${resetCode} \n
    Enter this code to complete the reset. \n Thanks for helping us keep your account secure.`
    try {
        await sendEmail({
            email: user.email, subject: "Your password reset code (valid for 10 min)",
            message,
        });
    } catch (err) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();
        return next(new ApiError(`There is an error in sending email, ${err}`, 500));
    }
    res.status(200).json({ status: "Success", message: "Reset code sent to email" });
});

/**
 * @desc   Verify Pass Reset code
 * @route  Post /api/v1/auth/verifyResetCode
 * @access Pubic
 */
exports.verifyPasResetCode = asyncHandler(async (req, res, next) => {
    //TODO 1) get user based on reset code
    const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ApiError('Reset code invalid or expired'));
    }
    //TODO 2) Reset code valid 
    user.passwordResetVerified = true;
    await user.save();
    res.status(200).json({
        status: 'Success',
    })
});

/**
 * @desc   Reset password
 * @route  Post /api/v1/auth/resetPassword
 * @access Pubic
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //* Get user based on email.
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError(` there is no user with email ${req.body.email}`,404));
    };
    //* check if reset code verified 
    if (!user.passwordResetVerified) {
        return next(new ApiError('Reset code not verified ', 400));
    };

    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    //* if everything is ok, generate token;
    const token = createToken(user._id);
    res.status(200).json({ token });
})