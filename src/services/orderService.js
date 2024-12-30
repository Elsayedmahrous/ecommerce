const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

/**
 * @desc    create cash order
 * @route   Post /api/v1/orders/cartId
 * @access  Protected/ User
 */
exports.createCashOrder = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;
    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(
            new ApiError(`There is no such as cart with id ${req.params.cartId}`, 404)
        )
    }
    // 2) Get order with price depend on cart price "Check if coupon apply"

    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice

    // 3) Create order with default paymentMethodType cash

    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
    });
    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
        const bulkOption = cart.cartItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        }));
        await Product.bulkWrite(bulkOption, {});
        
        // 5) Clear cart depend on cartId
        await Cart.findByIdAndDelete(req.params.cartId);
    }
    res.status(201).json({ status: 'success', data: order });
    
});

exports.filterOrderForLoggedUser = asyncHandler(async(req, res, next) => {
    if(req.user.role === "user") req.filterObj = { user: req.user._id };
    next();
})
/**
 * @desc    Get all orders
 * @route   Get /api/v1/orders
 * @access  Protected/ User-Admin-manager
 */
exports.findAllOrders = factory.getAll(Order);
/**
 * @desc    Get specific orders
 * @route   Get /api/v1/orders/:id
 * @access  Protected/ User-Admin-manager
 */
exports.findSpecificOrder = factory.getOne(Order);
/**
 * @desc    update order paid status to paid
 * @route   Put /api/v1/orders/:id/pay
 * @access  Protected/ Admin-manager
 */
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(
            new ApiError(`There is no such a order for this user: ${req.params.id}`, 404),
        )
    };
    // update order to paid 
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();
    res.status(200).json({ status: 'success', data: updatedOrder });
});
/**
 * @desc    update order delivered status
 * @route   Put /api/v1/orders/:deliver
 * @access  Protected/ Admin-manager
 */
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(
            new ApiError(`There is no such a order for this user: ${req.params.id}`, 404),
        )
    };
    // update order to paid 
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.status(200).json({ status: 'success', data: updatedOrder });
});
/**
 * @desc    Get check out session from stripe and sent it as response
 * @route   Get /api/v1/orders/checkout-session/cartId
 * @access  Protected/ User
 */
exports.checkoutSession = asyncHandler(async (req, res, next) => {
    //* app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  //TODO 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  //TODO 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //TODO 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
            price_data: {
                currency: 'egp',
                product_data: { name: req.user.name },
                unit_amount: totalOrderPrice * 100,
            },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/carts`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  //TODO 4) send session to response
  res.status(200).json({ status: 'success', session });
});