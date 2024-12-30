const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');
   
//* Nested route
//* GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
    let filterObject = {};
    if (req.params.productId) filterObject = { product: req.params.productId }; 
    req.filterObj = filterObject;
    next();
}
/**
 * @desc   Get list of reviews
 * @route  GET /api/v1/reviews
 * @access Public
 */
exports.getReviews = factory.getAll(Review);
/**
 * @desc   Get specific Review by id
 * @route  Get  /api/v1/Reviews/:id
 * @access  Public
 */
exports.getReview = factory.getOne(Review);
//* Nested Route
exports.setProductIdAndUserIdToBody = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user._id;  
    next();
}
/**
 * @desc   Create Review
 * @route  Post  /api/v1/Reviews
 * @access Private/protect/User
 */
exports.createReview = factory.createOne(Review);
/**
 * @desc   Update specific Review
 * @route  Put  /api/v1/Reviews/:id
 * @access  Private/protect/User
 */
exports.updateReview = factory.updateOne(Review);
/**
 * @desc   Delete specific Review
 * @route  DELETE  /api/v1/Reviews/:id
 *  @access  Private/protect/User_Admin_manager
 */
exports.deleteReview = factory.deleteOne(Review);
