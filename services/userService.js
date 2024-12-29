const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');
const { uploadSingleImage } = require('../middlewera/uploadImageMiddleware');


exports.uploadUserImage = uploadSingleImage("profileImg");
// Image processing
exports.resizeImage = (req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file) {
        
        sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 95 })
            .toFile(`uploads/users/${filename}`)
        // save image into our db
        req.body.profileImg = filename;
    }
    
    next();
}
// @desc   Get list of Users
// @route  GET /api/v1/users
//@access Private/Admin
exports.getUsers = factory.getAll(User);
// @desc   Get specific user by id
// @route  Get  /api/v1/users
// @access  Private/Admin
exports.getUser = factory.getOne(User);
// @desc   Create user
// @route  Post  /api/v1/users
// @access Private/Admin
exports.createUser = factory.createOne(User);
// @desc   Update specific User
// @route  Put  /api/v1/Users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone,
        email: req.body.email,
        profileImg: req.body.profileImg,
        role: req.body.role,
        password: req.body.password,
    }, {
        new: true,
    });
    if (!document) {
        return next(new ApiError(`No Document for this id${req.params.id}`, 404))
    }
    res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangeAt: Date.now(),
    }, {
        new: true,
    });
    if (!document) {
        return next(new ApiError(`No Document for this id${req.params.id}`, 404))
    }
    res.status(200).json({ data: document });
});
// @desc   Delete specific User
// @route  DELETE  /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc   Get logged user data
// @route  Get  /api/v1/users/getMe
// @access  Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});

// @desc   update logged user data
// @route  put  /api/v1/users/updateMyPassword
// @access  Private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
    // 1) update user password based user payload(req.user._id).
    const user = await User.findByIdAndUpdate(req.user._id, {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangeAt: Date.now(),
    }, {
        new: true,
    });
    // 2) generate token 
    const token = createToken(user._id);
    res.status(200).json({ data: user, token });
});

// @desc   update logged user data (without password , role)
// @route  put  /api/v1/users/updateMe
// @access  Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(req.user._id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
    },
        { new: true }
    );

    res.status(200).json({ data: updateUser });
});

// @desc   Deactivate logged user
// @route  Delete  /api/v1/users/deleteMe
// @access  Private/protect
exports.deleteLoggedUserDate = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({ status: "Success" });
})