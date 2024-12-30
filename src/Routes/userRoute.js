const express = require('express');
const {
    getUserValidator,
    createUserValidator,
    updateUserValidator,
    deleteUserValidator,
    changeUserPasswordValidator,
    updateLoggedUserValidator,
} =
    require('../utils/validators/userValidator');

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    changeUserPassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUserDate

} = require('../services/userService');

const authService = require('../services/authService');
const router = express.Router();

router.get("/getMe", authService.protect , getLoggedUserData, getUser);
router.put("/changeMyPassword", authService.protect , updateLoggedUserPassword);
router.put("/updateMe", authService.protect , updateLoggedUserValidator ,updateLoggedUserData);
router.delete("/deleteMe", authService.protect , deleteLoggedUserDate);
// Admin
router.put("/changePassword/:id",changeUserPasswordValidator,changeUserPassword);

router.route('/').get(
    authService.protect,
    authService.allowedTo('admin'),
    getUsers
)
    .post(
    authService.protect,
    authService.allowedTo('admin'),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
);
router
    .route('/:id')
    .get(getUserValidator,getUser)
    .put(
        authService.protect,
        authService.allowedTo('admin'),
        uploadUserImage,
        resizeImage,
        updateUserValidator,
        updateUser
    )
    .delete(
        authService.protect,
        authService.allowedTo('admin'),
        deleteUserValidator,
        deleteUser
    );


module.exports = router; 
