const Product = require('../models/productModel');
const Order = require('../models/orderModel');


// Helper function to generate SKU
const generateSKU = (category, productCount = 0) => {
  const prefix = category.substring(0, 3).toUpperCase();
  const date = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SOV-${prefix}-${date}-${random}`;
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Fetches all jewelry pieces from the archive with optional filtering by search terms, category, and price range.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Product category
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: A list of products
 */
// Helper to safely escape user input for MongoDB regular expressions (ReDoS prevention)
const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.slice(0, 100).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const getProducts = async (req, res) => {
  try {
    // If no products have showOnHome flagged yet, initialize the first 8 so admin immediately sees which 8 are showcased
    const currentHomeCount = await Product.countDocuments({ showOnHome: true });
    if (currentHomeCount === 0) {
      const top8 = await Product.find().sort({ createdAt: -1 }).limit(8);
      if (top8.length > 0) {
        await Product.updateMany(
          { _id: { $in: top8.map(p => p._id) } },
          { $set: { showOnHome: true } }
        );
      }
    }

    const isAll = req.query.pageSize === 'all' || req.query.pageSize === '0' || Number(req.query.pageSize) >= 1000;
    const pageSize = isAll ? 0 : (Number(req.query.pageSize) || 10);
    const page = Number(req.query.pageNumber) || 1;

    const rawKeyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const sanitizedKeyword = rawKeyword ? escapeRegex(rawKeyword) : '';
    const keyword = sanitizedKeyword
      ? {
        name: {
          $regex: sanitizedKeyword,
          $options: 'i',
        },
      }
      : {};

    const rawCategory = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const sanitizedCategory = rawCategory && rawCategory !== 'all' ? escapeRegex(rawCategory) : '';
    const category = sanitizedCategory
      ? { category: { $regex: `^${sanitizedCategory}$`, $options: 'i' } }
      : {};

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const priceFilter = {};
    if (minPrice || maxPrice) {
      priceFilter.price = {};
      if (minPrice) priceFilter.price.$gte = minPrice;
      if (maxPrice) priceFilter.price.$lte = maxPrice;
    }

    const query = { ...keyword, ...category, ...priceFilter };
    if (req.query.showOnHome !== undefined) {
      query.showOnHome = req.query.showOnHome === 'true';
    }

    // Sorting logic
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : '';
    let sortOptions = {};
    if (sortParam === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sortParam === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sortParam === 'alphabetical') {
      sortOptions = { name: 1 };
    } else if (sortParam === 'shuffle') {
      sortOptions = { shuffleOrder: 1 };
    } else {
      sortOptions = { shuffleOrder: 1, createdAt: -1 }; // Default: Randomized Shuffle Feel
    }

    const count = await Product.countDocuments(query);
    let queryChain = Product.find(query).sort(sortOptions);
    if (pageSize > 0) {
      queryChain = queryChain.limit(pageSize).skip(pageSize * (page - 1));
    }
    const products = await queryChain;

    res.json({
      products,
      page,
      pages: pageSize > 0 ? Math.ceil(count / pageSize) : 1,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get products featured on the Home Screen shop showcase (Max 8)
// @route   GET /api/products/home
// @access  Public
const getHomeProducts = async (req, res) => {
  try {
    let products = await Product.find({ showOnHome: true }).limit(8);
    // If fewer than 8 products have showOnHome: true, backfill from latest products to ensure exactly 8 are showcased
    if (products.length < 8) {
      const existingIds = products.map(p => p._id);
      const remainingNeeded = 8 - products.length;
      const backfill = await Product.find({ _id: { $nin: existingIds } })
        .sort({ shuffleOrder: 1, createdAt: -1 })
        .limit(remainingNeeded);
      
      // Persist the backfilled products as showOnHome: true so they stay synchronized with Admin panel
      if (backfill.length > 0) {
        await Product.updateMany(
          { _id: { $in: backfill.map(p => p._id) } },
          { $set: { showOnHome: true } }
        );
      }
      products = [...products, ...backfill];
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
const getProductById = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Archival ID format.' });
    }
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Piece not found in the archive.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Archival retrieval failure.', error: error.message });
  }
};


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category, details, img, stock]
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input or validation failed
 */
const createProduct = async (req, res) => {
  try {
    const { name, price, mrp, showOnHome, details, img, images, category, stock, material, plating, stone, length, weight, features, hero } = req.body;

    if (showOnHome) {
      const homeCount = await Product.countDocuments({ showOnHome: true });
      if (homeCount >= 8) {
        return res.status(400).json({
          message: 'Only 8 products can be showcased on the Home Screen. Please remove one before adding another.'
        });
      }
    }

    const sku = generateSKU(category);

    const product = new Product({
      sku,
      name,
      price,
      mrp: mrp ? Number(mrp) : 0,
      showOnHome: Boolean(showOnHome),
      details,
      img,
      images: images || [],
      category,
      stock: Math.max(0, parseInt(stock, 10) || 0),
      material: material || 'Stainless Steel',
      plating: plating || 'Gold 18K PVD Plating',
      stone: stone || 'Natural',
      length: length || '46 cm',
      weight: weight || '6g',
      features: features || ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic'],
      hero: hero || false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, mrp, showOnHome, details, img, images, category, stock, material, plating, stone, length, weight, features, hero } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      if (showOnHome && !product.showOnHome) {
        const homeCount = await Product.countDocuments({ showOnHome: true, _id: { $ne: product._id } });
        if (homeCount >= 8) {
          return res.status(400).json({
            message: 'Only 8 products can be showcased on the Home Screen. Please remove one before adding another.'
          });
        }
      }

      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      if (mrp !== undefined) product.mrp = Number(mrp);
      if (showOnHome !== undefined) product.showOnHome = Boolean(showOnHome);
      product.details = details || product.details;
      product.img = img || product.img;
      product.images = images || product.images;
      product.category = category || product.category;
      product.stock = stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : product.stock;
      product.material = material || product.material;
      product.plating = plating || product.plating;
      product.stone = stone || product.stone;
      product.length = length || product.length;
      product.weight = weight || product.weight;
      product.features = features || product.features;
      product.hero = hero !== undefined ? hero : product.hero;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5 stars.' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return res.status(400).json({ message: 'A written testimonial comment is required.' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found in archive vaults.' });
    }

    // Check if user already reviewed this piece
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted an archival review for this piece.' });
    }

    // Verified Acquisition Check: Only customers who have purchased and paid for this item can review (Admins exempt for curation testing)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': req.params.id,
      isPaid: true,
    });

    if (!hasPurchased && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'Verified Acquisition Required: Only clients who have acquired and paid for this piece may submit an archival review.'
      });
    }

    const review = {
      name: req.user.name,
      rating: numRating,
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = Number(
      (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1)
    );

    await product.save();
    res.status(201).json({ message: 'Archival testimonial successfully recorded.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle whether product is showcased on Home Screen
// @route   PATCH /api/products/:id/toggle-home
// @access  Private/Admin
const toggleHomeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const willShowOnHome = req.body && typeof req.body.showOnHome === 'boolean'
      ? req.body.showOnHome
      : !product.showOnHome;

    if (willShowOnHome) {
      const homeCount = await Product.countDocuments({ showOnHome: true, _id: { $ne: product._id } });
      if (homeCount >= 8) {
        return res.status(400).json({
          message: 'Only 8 products can be showcased on the Home Screen. Please remove one before adding another.'
        });
      }
    }

    product.showOnHome = willShowOnHome;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle product home showcase status', error: error.message });
  }
};

module.exports = {
  getProducts,
  getHomeProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  toggleHomeProduct,
};

