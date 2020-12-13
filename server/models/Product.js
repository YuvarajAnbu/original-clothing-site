const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  catagory: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: String,
    trim: true,
  },
  stock: [
    {
      images: [String],
      color: String,
      sizeRemaining: [
        {
          size: String,
          remaining: Number,
        },
      ],
    },
  ],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: Number,
      review: {
        type: String,
        trim: true,
      },
    },
  ],
  sales: {
    type: Number,
    default: 0,
  },
  salesPerMonth: [
    {
      sales: {
        type: Number,
        default: 0,
      },
      month: { type: Number, default: 0 },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
