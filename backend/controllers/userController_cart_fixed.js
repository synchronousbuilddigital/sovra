// @desc    Add to cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, qty } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const item = user.cart.find((item) => item.product && item.product.toString() === productId);

    if (item) {
      item.qty += Number(qty || 1);
    } else {
      user.cart.push({ product: productId, qty: Number(qty || 1) });
    }

    user.cartLastUpdated = Date.now();
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(201).json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart quantity
// @route   PUT /api/users/cart/:id
// @access  Private
const updateCartQty = async (req, res) => {
  const { qty } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const item = user.cart.find((item) => item.product && item.product.toString() === req.params.id);

    if (item) {
      item.qty = Number(qty);
      user.cartLastUpdated = Date.now();
      await user.save();
      const updatedUser = await User.findById(req.user._id).populate('cart.product');
      res.json(updatedUser.cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
