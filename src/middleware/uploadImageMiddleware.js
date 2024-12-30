const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptional = () => {
    // 2- DiskStorage engine
    const multerStorage = multer.memoryStorage();
    const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new ApiError('Only Images allowed', 400), false)
    }
}
    const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
    return upload;
    
}

exports.uploadSingleImage = (fieldName) => {
    return multerOptional().single(fieldName);
};

exports.uploadMixImages = (arrayOfFields) => {
    return multerOptional().fields(arrayOfFields);  
}