const mongoose = require('mongoose');
const Product =  require('./productModel')
const reviewSchema = new mongoose.Schema({
    title: {
        type: String,   
    },
    ratings: {
        type: Number,
        min: [1, "Min ratings value is 1.0"],
        max: [5, "Max ratings value is 5.0"],
        required: [true, 'review ratings require'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to user"]
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: [true, 'Review must belong to product'],
    },
}
    , { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: "user", select: "name" });
    next();
})

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
    const result = await this.aggregate([
        // stage 1 : get all review in specific product
        { $match: { product: productId } },
        // stage 2: Grouping review based on productId and calc avgRatings, ratingsQuantity.
        {
            $group: {
                _id: 'product',
                avgRatings: { $avg: "$ratings" },
                ratingsQuantity: { $sum: 1 },
            }
        }
    ])

    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: result[0].avgRatings,
            ratingsQuantity: result[0].ratingsQuantity,
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0,
        })
    }
};
reviewSchema.post('save',async function () {
   await this.constructor.calcAverageRatingsAndQuantity(this.product)
})
reviewSchema.post('deleteOne',async function () {
   await this.constructor.calcAverageRatingsAndQuantity(this.productId)
})

module.exports = mongoose.model('Review', reviewSchema);