const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');

// @desc   Add address to user addresses list
// @route  Post /api/v1/addresses
//@access Private/user
exports.addAddress = asyncHandler(async (req, res, next) => {
    // $addToSet ==> add address object to user addresses array if address not exist

    const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { addresses: req.body }
    },
        { new: true },
    );
    res.status(200).json({
        status: "success",
        message: "Address added successfully.",
        date: user.addresses,
    });
});

// @desc   Remove address from user addresses list
// @route  Post /api/v1/addresses
//@access Private/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
    // $pull ==> add address from user addresses array if addressId exist
    
    const user = await User.findByIdAndUpdate(req.user._id, {
        $pull: { addresses: { _id: req.params.addressId } },
    },
        { new: true },
    );
    res.status(200).json({
        status: "success",
        message: "address removed successfully.",
        date: user.addresses,
    });
});

// @desc   Get logged user addresses
// @route  Get /api/v1/addresses
//@access Private/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('addresses');

    res.status(200).json({ status: "success", results: user.addresses.length , data: user.addresses });
})