const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const generateToken = require('../utils/generateToken');
const { sendEmail, getOTPTemplate } = require('../utils/sendEmail');

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user & get token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        status: user.status,
        preference: user.preference,
        phone: user.phone,
        spend: user.spend,
        newsletter: user.newsletter,
        addresses: user.addresses,

        token: generateToken(user._id),
      });

    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpire,
    });

    if (user) {
      // Send real email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your SOVRA Access Code',
          html: getOTPTemplate(otp, user.name),
        });
        console.log(`OTP sent to ${email}: ${otp}`);
      } catch (emailError) {
        console.error('Email failed to send:', emailError.message);
        // We still return 201 so the user can try "resend" if they set up .env later
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        message: 'A verification code has been sent to your email.',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Private
const verifyOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp === otp && user.otpExpire > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();

      res.json({ message: 'Email verified successfully', isVerified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/users/resend-otp
// @access  Private
const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your New SOVRA Access Code',
        html: getOTPTemplate(otp, user.name),
      });
      console.log(`New OTP sent to ${user.email}: ${otp}`);
      res.json({ message: 'A new verification code has been sent to your email.' });
    } catch (emailError) {
      console.error('Email failed to send:', emailError.message);
      res.status(500).json({ message: 'Failed to send email. Check server configuration.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist').populate('cart.product');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        status: user.status,
        phone: user.phone,
        preference: user.preference,
        spend: user.spend,
        wishlist: user.wishlist,
        cart: user.cart,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.preference = req.body.preference || user.preference;
    user.phone = req.body.phone || user.phone;
    user.newsletter = req.body.newsletter !== undefined ? req.body.newsletter : user.newsletter;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
      status: updatedUser.status,
      phone: updatedUser.phone,
      preference: updatedUser.preference,
      newsletter: updatedUser.newsletter,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// --- Wishlist Controllers ---

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Archival ID format.' });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'The archival piece no longer exists.' });
    }

    const user = await User.findById(req.user._id);
    if (!user.wishlist.some(id => id.toString() === productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.status(201).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update your curated wishlist.' });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Cart Controllers ---

// @desc    Add to cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, qty } = req.body;

  try {
    // 1. Validate Product ID format
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Archival ID format.' });
    }

    // 2. Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'The archival piece no longer exists in the vault.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Client record not found.' });
    }

    // Ensure cart exists
    if (!user.cart) user.cart = [];

    const item = user.cart.find((item) => item.product && item.product.toString() === productId);

    if (item) {
      const newQty = item.qty + Number(qty || 1);
      if (newQty > productExists.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${productExists.stock} units available in the Maison vaults.` });
      }
      item.qty = newQty;
    } else {
      const initialQty = Number(qty || 1);
      if (initialQty > productExists.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${productExists.stock} units available in the Maison vaults.` });
      }
      user.cart.push({ product: productId, qty: initialQty });
    }

    user.cartLastUpdated = Date.now();
    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(201).json(updatedUser.cart);
  } catch (error) {
    console.error('Add to Bag Error:', error.message);
    res.status(500).json({ message: 'Failed to synchronize with the Maison vaults.', error: error.message });
  }
};

// @desc    Update cart quantity
// @route   PUT /api/users/cart/:id
// @access  Private
const updateCartQty = async (req, res) => {
  const { qty } = req.body;
  const productId = req.params.id;

  try {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Archival ID format.' });
    }

    const user = await User.findById(req.user._id);
    const item = user.cart.find((item) => item.product && item.product.toString() === productId);
    
    if (item) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in the archives.' });
      }

      if (Number(qty) > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} units available.` });
      }

      item.qty = Number(qty);
      user.cartLastUpdated = Date.now();
      await user.save();

      const updatedUser = await User.findById(req.user._id).populate('cart.product');
      res.json(updatedUser.cart);
    } else {
      res.status(404).json({ message: 'Item not found in your curated bag' });
    }
  } catch (error) {
    console.error('Update Cart Qty Error:', error.message);
    res.status(500).json({ message: 'Failed to update curation quantity.' });
  }
};

// @desc    Remove from cart
// @route   DELETE /api/users/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  const productId = req.params.id;

  try {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Archival ID format.' });
    }

    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((item) => item.product && item.product.toString() !== productId);

    user.cartLastUpdated = Date.now();
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Remove from Cart Error:', error.message);
    res.status(500).json({ message: 'Failed to remove piece from bag.' });
  }
};

// --- Address Book Controllers ---

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  const { addressName, address, city, postalCode, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    // If setting as default, unset others
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ addressName, address, city, postalCode, country, isDefault: isDefault || false });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  const { addressName, address, city, postalCode, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);

    if (addr) {
      // If setting as default, unset others
      if (isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }

      addr.addressName = addressName || addr.addressName;
      addr.address = address || addr.address;
      addr.city = city || addr.city;
      addr.postalCode = postalCode || addr.postalCode;
      addr.country = country || addr.country;
      addr.isDefault = isDefault !== undefined ? isDefault : addr.isDefault;

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Admin Controllers ---


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    const orders = await Order.find({}).lean();

    const usersWithSpend = users.map(user => {
      // Safely filter orders for this specific member
      const userOrders = orders.filter(o => o.user && o.user.toString() === user._id.toString());
      const totalSpend = userOrders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
      
      return {
        ...user,
        spend: totalSpend
      };
    });

    res.json(usersWithSpend);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error: Registry Audit Failed' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist')
      .populate('recentlyViewed.product');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user details' });
  }
};


// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      user.status = req.body.status || user.status;
      user.preference = req.body.preference || user.preference;
      user.phone = req.body.phone || user.phone;
      user.spend = req.body.spend || user.spend;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        status: updatedUser.status,
        phone: updatedUser.phone,
        preference: updatedUser.preference,
        spend: updatedUser.spend,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - SOVRA',
        html: getOTPTemplate(otp, user.name),
      });
      res.json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === otp && user.otpExpire > Date.now()) {
      user.password = password;
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();

      res.json({ message: 'Password reset successful. You can now login.' });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track recently viewed product
// @route   POST /api/users/recently-viewed
// @access  Private
const trackRecentlyViewed = async (req, res) => {
  const { productId } = req.body;

  try {
    const result = await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: { product: productId } }
    });

    if (result) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { 
          recentlyViewed: { 
            $each: [{ product: productId, viewedAt: Date.now() }], 
            $position: 0,
            $slice: 10 
          } 
        }
      });
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Track recently viewed error:', error.message);
    res.status(500).json({ message: 'Internal server error while tracking history.' });
  }
};

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed.product');
    if (user) {
      // Filter out any entries where the product no longer exists in the registry
      const validHistory = user.recentlyViewed.filter(item => item.product !== null);
      res.json(validHistory);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get abandoned carts for admin
// @route   GET /api/users/admin/abandoned-carts
// @access  Private/Admin
const getAbandonedCarts = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find users who have items in their cart AND haven't updated it in 24 hours
    const abandonedUsers = await User.find({
      'cart.0': { $exists: true },
      cartLastUpdated: { $lt: twentyFourHoursAgo }
    }).select('name email cart cartLastUpdated').sort({ cartLastUpdated: -1 });

    res.json(abandonedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Send recovery note to user
// @route   POST /api/users/admin/send-recovery/:id
// @access  Private/Admin
const sendRecoveryNote = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Client not found.' });

    // Push a recovery notification to the user
    user.notifications.push({
      title: 'A Note from Maison Sovra',
      message: 'We noticed some pieces were left in your vault. Is there anything we can clarify? Use code ARCHIVE5 for 5% off your next curation.',
      type: 'Order'
    });

    // Reset the timer so they don't get another reminder immediately
    user.cartLastUpdated = Date.now();
    await user.save();

    res.json({ message: 'Maison Reminder dispatched successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  verifyOTP,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  updateCartQty,
  removeFromCart,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  trackRecentlyViewed,
  getRecentlyViewed,
  getAbandonedCarts,
  sendRecoveryNote,

};



