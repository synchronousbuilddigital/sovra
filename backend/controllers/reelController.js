const Reel = require('../models/reelModel');

const DEFAULT_REELS = [
  {
    title: 'Abstract Emerald Drop Earring',
    name: 'Abstract Emerald Drop Earring',
    category: 'Earrings',
    image: '/reels/reel-1.jpg',
    productId: '69d3b01f5ae9ac6e70b3f4b3',
    price: '₹9,500',
    order: 1,
    isActive: true,
  },
  {
    title: 'Nova Edge 18K Gold Band',
    name: 'Nova Edge 18K Gold Band',
    category: 'Rings',
    image: '/reels/reel-2.jpg',
    productId: '69d3b01f5ae9ac6e70b3f4a7',
    price: '₹9,500',
    order: 2,
    isActive: true,
  },
  {
    title: 'Starlit Solitaire Pearl Chain',
    name: 'Starlit Solitaire Pearl Chain',
    category: 'Necklaces',
    image: '/reels/reel-3.jpg',
    productId: '69d3b01f5ae9ac6e70b3f493',
    price: '₹18,500',
    order: 3,
    isActive: true,
  },
  {
    title: 'Luna Glow Heritage Cuff',
    name: 'Luna Glow Heritage Cuff',
    category: 'Bracelets',
    image: '/reels/reel-4.jpg',
    productId: '69d3b01f5ae9ac6e70b3f49b',
    price: '₹18,500',
    order: 4,
    isActive: true,
  },
  {
    title: 'Bloomy Moon Blossom Ring',
    name: 'Bloomy Moon Blossom Ring',
    category: 'Rings',
    image: '/reels/reel-5.png',
    productId: '69d3b01f5ae9ac6e70b3f4a9',
    price: '₹8,500',
    order: 5,
    isActive: true,
  },
];

// @desc    Get all reels (auto-seed if empty)
// @route   GET /api/reels
// @access  Public
const getReels = async (req, res) => {
  try {
    let count = await Reel.countDocuments();
    if (count === 0) {
      await Reel.insertMany(DEFAULT_REELS);
    }

    const filter = req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.home === 'true') {
      let showcaseReels = await Reel.find({ isActive: true, isHomeShowcase: true }).sort({ homeOrder: 1, order: 1, createdAt: -1 }).limit(5);
      if (showcaseReels.length === 0) {
        showcaseReels = await Reel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).limit(5);
      }
      return res.json(showcaseReels);
    }
    const reels = await Reel.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single reel
// @route   GET /api/reels/:id
// @access  Public
const getReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (reel) {
      res.json(reel);
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new reel
// @route   POST /api/reels
// @access  Private/Admin
const createReel = async (req, res) => {
  try {
    const { title, name, category, image, video, productId, price, order, isActive, isHomeShowcase, homeOrder } = req.body;

    if (!title && !name) {
      return res.status(400).json({ message: 'Reel title is required' });
    }
    if (!image) {
      return res.status(400).json({ message: 'Reel image/preview is required' });
    }

    const reel = new Reel({
      title: title || name,
      name: name || title,
      category: category || 'Jewellery',
      image,
      video: video || '',
      productId: productId || '',
      price: price || '',
      order: typeof order === 'number' ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      isHomeShowcase: Boolean(isHomeShowcase),
      homeOrder: typeof homeOrder === 'number' ? homeOrder : 0,
    });

    const createdReel = await reel.save();
    res.status(201).json(createdReel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing reel
// @route   PUT /api/reels/:id
// @access  Private/Admin
const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const { title, name, category, image, video, productId, price, order, isActive, isHomeShowcase, homeOrder } = req.body;

    if (title !== undefined) reel.title = title;
    if (name !== undefined) reel.name = name || title;
    if (category !== undefined) reel.category = category;
    if (image !== undefined) reel.image = image;
    if (video !== undefined) reel.video = video;
    if (productId !== undefined) reel.productId = productId;
    if (price !== undefined) reel.price = price;
    if (order !== undefined) reel.order = order;
    if (isActive !== undefined) reel.isActive = isActive;
    if (isHomeShowcase !== undefined) reel.isHomeShowcase = Boolean(isHomeShowcase);
    if (homeOrder !== undefined) reel.homeOrder = Number(homeOrder);

    const updatedReel = await reel.save();
    res.json(updatedReel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update home screen showcase reels (choose up to 5)
// @route   PUT /api/reels/home-showcase
// @access  Private/Admin
const updateHomeShowcase = async (req, res) => {
  try {
    const { reelIds } = req.body;
    if (!Array.isArray(reelIds)) {
      return res.status(400).json({ message: 'reelIds must be an array of IDs' });
    }

    if (reelIds.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 reels can be featured on the home screen showcase' });
    }

    // Reset all reels showcase flag and homeOrder
    await Reel.updateMany({}, { isHomeShowcase: false, homeOrder: 0 });

    // Set showcase for the chosen reel IDs in sequence
    const updatePromises = reelIds.map((id, index) =>
      Reel.findByIdAndUpdate(id, { isHomeShowcase: true, homeOrder: index + 1 }, { new: true })
    );

    await Promise.all(updatePromises);

    const allReels = await Reel.find({}).sort({ order: 1, createdAt: -1 });
    res.json({ message: 'Home screen showcase updated successfully', reels: allReels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    await reel.deleteOne();
    res.json({ message: 'Reel removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReels,
  getReelById,
  createReel,
  updateReel,
  updateHomeShowcase,
  deleteReel,
};
