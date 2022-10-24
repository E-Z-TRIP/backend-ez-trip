import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    userId : [{type: mongoose.Schema.Types.ObjectId, ref : 'users'}],
    trip : [{type: mongoose.Schema.Types.ObjectId, ref: 'trips'}],
    bookingDate: Date,
    nbDays: Number,
    nbTravelers: Number,
    comments: String,
    status: String,
})

const Order = mongoose.model('orders', orderSchema)

export default Order;