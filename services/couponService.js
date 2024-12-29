const factory = require('./handlersFactory');
const Coupon = require('../models/couponModel');

// @desc   Get list of coupons
// @route  GET /api/v1/coupons
//@access Private / Admin - Manager
exports.getCoupons = factory.getAll(Coupon);
// @desc   Get specific Coupon by id
// @route  Get  /api/v1/coupons/:id
// @access  Private / Admin - Manager
exports.getCoupon = factory.getOne(Coupon);
// @desc   Create Coupon
// @route  Post  /api/v1/Coupon
// @access Private / Admin - Manager
exports.createCoupon = factory.createOne(Coupon);
// @desc   Update specific Coupon
// @route  Put  /api/v1/Coupon/:id
// @access  Private / Admin - Manager
exports.updateCoupon = factory.updateOne(Coupon);
// @desc   Delete specific Coupon
// @route  DELETE  /api/v1/Coupon/:id
// @access  Private / Admin - Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
