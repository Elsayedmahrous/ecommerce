const express = require('express');
const { createReviewValidator, getReviewValidator,updateReviewValidator,deleteReviewValidator } = require('../utils/validators/reviewValidator')

const authService = require('../services/authService');

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    createFilterObj,
    setProductIdAndUserIdToBody,

} = require('../services/reviewService');

const router = express.Router({ mergeParams: true });

router.route('/').get(createFilterObj,getReviews).post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
);
router
    .route('/:id')
    .get(getReviewValidator,getReview)
    .put(
        authService.protect,
        authService.allowedTo('user'),
        updateReviewValidator,
        updateReview
    )
    .delete(
        authService.protect,
        deleteReviewValidator,
        deleteReview
    );

module.exports = router; 
