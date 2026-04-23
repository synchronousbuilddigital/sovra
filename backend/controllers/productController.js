const Product = require('../models/productModel');

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
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
      : {};

    const category = req.query.category && req.query.category !== 'all'
      ? { category: { $regex: req.query.category, $options: 'i' } }
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

    // Sorting logic
    let sortOptions = {};
    if (req.query.sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (req.query.sort === 'alphabetical') {
      sortOptions = { name: 1 };
    } else if (req.query.sort === 'shuffle') {
      sortOptions = { shuffleOrder: 1 };
    } else {
      sortOptions = { shuffleOrder: 1, createdAt: -1 }; // Default: Randomized Shuffle Feel
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
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
    const { name, price, details, img, images, category, stock, material, plating, stone, length, weight, features, hero } = req.body;

    const sku = generateSKU(category);

    const product = new Product({
      sku,
      name,
      price,
      details,
      img,
      images: images || [],
      category,
      stock: stock || 0,
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
    const { name, price, details, img, images, category, stock, material, plating, stone, length, weight, features, hero } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.details = details || product.details;
      product.img = img || product.img;
      product.images = images || product.images;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
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

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};

