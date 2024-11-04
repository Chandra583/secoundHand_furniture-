import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  }],
  totalAmount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  const populatedCart = await this.populate('items.product', 'price');
  this.totalAmount = populatedCart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  next();
});

export default mongoose.model('Cart', cartSchema); 