const express = require('express');

const {
    createSubCategory,
    getSubCategory,
    getSubCategories,
    updateSubCategory,
    deleteSubCategory,
    setCategoryIdToBody,
    createFilterObj
}
    = require('../services/subCategoryservice');

const authService = require('../services/authService');

const {
    createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator
} =
    require('../utils/validators/subCategoryValidator');

// mergeParams: Allow us to access parameters on other routers
// ex:  we need access categoryId from category router
const router = express.Router({mergeParams: true});

router.route('/')
    .get(createFilterObj, getSubCategories)
    .post(
        authService.protect,
        authService.allowedTo('admin','manager'),
        setCategoryIdToBody,
        createSubCategoryValidator,
        
    );
router.route("/:id")
    .get(getSubCategoryValidator, getSubCategory)
    .put(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        updateSubCategoryValidator,
        updateSubCategory
    )
    .delete(
        authService.protect,
        authService.allowedTo('admin'),
        deleteSubCategoryValidator,
        deleteSubCategory
    );

module.exports = router;