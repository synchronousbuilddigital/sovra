const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const generateToken = require('../utils/generateToken');
const { sendEmail, getOTPTemplate, getOTPText } = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
 * @desc    Authenticate with Google OAuth ID Token
 * @route   POST /api/users/google-login
 * @access  Public
 */
const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google authentication token' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user is a designated administrator from environment config
    const designatedAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isDesignatedAdmin = Boolean(designatedAdminEmail && cleanEmail === designatedAdminEmail);

    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [{ email: cleanEmail }, { googleId }],
    });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (isDesignatedAdmin && !user.isAdmin) {
        user.isAdmin = true;
        updated = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // First-time Google user - create verified account
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        name: name || (isDesignatedAdmin ? 'SOVRA Admin' : 'Google Patron'),
        email: cleanEmail,
        password: randomPassword,
        googleId,
        authProvider: 'google',
        avatar: picture || '',
        isAdmin: isDesignatedAdmin,
        isVerified: true,
        status: isDesignatedAdmin ? 'Elite' : 'New',
        preference: 'General',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      status: user.status,
      preference: user.preference,
      phone: user.phone || '',
      spend: user.spend || 0,
      newsletter: user.newsletter || false,
      addresses: user.addresses || [],
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Verification Error:', error.message);
    res.status(401).json({ message: 'Google sign-in verification failed. Please try again.' });
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
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpire,
      otpAttempts: 0,
      otpLastSent: Date.now(),
    });

    if (user) {
      // Send real email
      try {
        await sendEmail({
          email: user.email,
          subject: `Your SOVRA Access Code: ${otp}`,
          text: getOTPText(otp, user.name, 'signup'),
          html: getOTPTemplate(otp, user.name, 'signup'),
        });
        // OTP email dispatched securely
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

    // Security: Lockout after 5 failed attempts
    if (user.otpAttempts >= 5) {
      user.otp = undefined;
      user.otpExpire = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: 'Maximum verification attempts exceeded. Please request a new verification code.' });
    }

    if (!user.otp || !user.otpExpire || new Date(user.otpExpire).getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Maximum attempts reached. Please request a new code.'
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Email verified successfully', isVerified: true });
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

    // Security: 60-second cooldown between resends
    if (user.otpLastSent && (Date.now() - new Date(user.otpLastSent).getTime() < 60000)) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - new Date(user.otpLastSent).getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSeconds} seconds before requesting a new code.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    user.otpAttempts = 0;
    user.otpLastSent = Date.now();
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: `Your New SOVRA Access Code: ${otp}`,
        text: getOTPText(otp, user.name, 'signup'),
        html: getOTPTemplate(otp, user.name, 'signup'),
      });
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
    user.preference = req.body.preference || user.preference;
    user.phone = req.body.phone || user.phone;
    user.newsletter = req.body.newsletter !== undefined ? req.body.newsletter : user.newsletter;

    // Security: Handle email change and require re-verification
    if (req.body.email && req.body.email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const newEmail = req.body.email.toLowerCase().trim();
      const emailExists = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'This email is already in use by another account.' });
      }

      user.email = newEmail;
      user.isVerified = false;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      user.otpLastSent = Date.now();

      try {
        await sendEmail({
          email: user.email,
          subject: `Your SOVRA Verification Code: ${otp}`,
          text: getOTPText(otp, user.name, 'verification'),
          html: getOTPTemplate(otp, user.name, 'verification'),
        });
      } catch (err) {
        console.error('Email change verification send failed:', err.message);
      }
    }
    
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
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
      message: !updatedUser.isVerified ? 'Email updated. A verification code has been sent to your new email.' : undefined,
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

      const parsedQty = parseInt(qty, 10);
      if (isNaN(parsedQty) || parsedQty < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1 unit.' });
      }

      if (parsedQty > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} units available.` });
      }

      item.qty = parsedQty;
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
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Security restriction: An administrator cannot delete their own account.' });
    }

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
    if (req.params.id === req.user._id.toString() && req.body.isAdmin === false) {
      return res.status(400).json({ message: 'Security restriction: An administrator cannot revoke their own administrative status.' });
    }

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

    // Cooldown on password reset requests (60 seconds)
    if (user.otpLastSent && (Date.now() - new Date(user.otpLastSent).getTime() < 60000)) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - new Date(user.otpLastSent).getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSeconds} seconds before requesting another reset code.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    user.otpAttempts = 0;
    user.otpLastSent = Date.now();
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: `Your SOVRA Password Reset Code: ${otp}`,
        text: getOTPText(otp, user.name, 'reset'),
        html: getOTPTemplate(otp, user.name, 'reset'),
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

    // Lockout after 5 failed attempts
    if (user.otpAttempts >= 5) {
      user.otp = undefined;
      user.otpExpire = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: 'Maximum reset attempts exceeded. Please request a new code.' });
    }

    if (!user.otp || !user.otpExpire || new Date(user.otpExpire).getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new code.' });
    }

    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid reset code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Maximum reset attempts exceeded. Please request a new code.'
      });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
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
  googleLogin,
};



