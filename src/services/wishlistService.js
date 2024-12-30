const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
/**
 * @desc   Add product to wishlist
 * @route  Post /api/v1/wishlist
 * @access Private/user
 */
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
    // $addToSet ==> add productId to wishlist array if productId not exist

    const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { wishlist: req.body.productId }
    },
        { new: true },
    );
    res.status(200).json({
        status: "success",
        message: "Product added successfully to your wishlist.",
        date: user.wishlist,
    });
});
/**
 * @desc   Remove product to wishlist
 * @route  Post /api/v1/wishlist
 * @access Private/user
 */
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
    //* $pull ==> add productId from wishlist array if productId exist
    
    const user = await User.findByIdAndUpdate(req.user._id, {
        $pull: { wishlist: req.params.productId }
    },
        { new: true },
    );
    res.status(200).json({
        status: "success",
        message: "Product removed successfully from your wishlist.",
        date: user.wishlist,
    });
});
/**
 * @desc   Get logged user wishlist
 * @route  Get /api/v1/wishlist
 * @access Private/user
 */
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({ status: "success", results: user.wishlist.length,data: user.wishlist });
})