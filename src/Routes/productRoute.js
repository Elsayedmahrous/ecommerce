const express = require('express');
const { getProductValidator, createProductValidator, updateProductValidator, deleteProductValidator } =
    require('../utils/validators/productValidator');

const authService = require('../services/authService');

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    resizeProductImages

} = require('../services/productService');

const router = express.Router();
const reviewsRoute = require('../Routes/reviewRoute');

router.use('/:productId/reviews', reviewsRoute)

router.route('/').get(getProducts).post(
    authService.protect,
    authService.allowedTo('admin','manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
);
router
    .route('/:id')
    .get(getProductValidator, getProduct)
    .put(
        authService.protect,
        authService.allowedTo('admin','manager'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProduct
    )
    .delete(
        authService.protect,
        authService.allowedTo('admin'),
        deleteProductValidator,
        deleteProduct
    );


module.exports = router; 
