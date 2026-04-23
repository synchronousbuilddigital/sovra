const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpire: { type: Date },
  status: { type: String, default: 'New' }, // e.g., 'VIP', 'Regular', 'New'
  preference: { type: String, default: 'General' }, // e.g., 'High Jewelry', 'Timepieces'
  phone: { type: String, default: '' },
  spend: { type: Number, default: 0 },
  newsletter: { type: Boolean, default: false },

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      qty: { type: Number, default: 1 },
    }
  ],
  cartLastUpdated: { type: Date, default: Date.now },
  addresses: [

    {
      addressName: { type: String, required: true }, // e.g., 'Home', 'Office'
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    }
  ],
  recentlyViewed: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      viewedAt: { type: Date, default: Date.now }
    }
  ],
  notifications: [
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      type: { type: String, enum: ['Order', 'Marketing', 'System'], default: 'System' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, {


  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
