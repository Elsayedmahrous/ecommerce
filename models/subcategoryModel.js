const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        tirm: true,
        unique: [true, "SubCategory must be unique"],
        minlength: [2, " Too short SubCategory name"],
        maxlength: [32, " Too long SubCategory name"],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "category",
        require: [true, 'SubCategory must be belong to parent category'],
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('SubCategory', subCategorySchema);