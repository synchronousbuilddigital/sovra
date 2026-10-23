const Category = require('../models/categoryModel');
const logger = require('../utils/logger');

// Initial seed categories to ensure zero downtime and seamless migration
const DEFAULT_CATEGORIES = [
  {
    name: 'Rings',
    slug: 'rings',
    title: 'Heritage Rings',
    subtitle: 'The Archive I',
    tagline: 'Collection Alpha',
    count: '12 Pieces',
    desc: 'Modern tokens of individual stories. Forged in the heart of London using centuries-old techniques met with contemporary vision.',
    homeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkXJLhnNmK6xvBpC0QYgMtgFm4EjXPbd1mChYNGxRizSftvUBqJpKAY_ZDce4SNeaccK64kFO5_5Yv_nbMHt52UZRQ1oRTgfv1My8JfbfFCwc6WxDGYLK-7gfr89S19Du1aYqUAsw0g5QaPy2AjEHLkuoglqa6550Cb6iw1G6VFS_a6GiN5lpBApPlJ1aVRiyuin5AtoszSKQ7gTXXMf_fzoAxHctQnZcxr13MiwUAjTFt7h-_H1nsd9cu3yf6_4Adm9Fnx7VIwHhb',
    collectionImage: '/ring_hero.png',
    showOnHome: true,
    order: 1,
    isActive: true,
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    title: 'Stellar Earrings',
    subtitle: 'The Archive II',
    tagline: 'Signature Ornaments',
    count: '08 Pieces',
    desc: 'Subtle signatures of brilliance. Sculpted light to frame the face with an unmatched radiance.',
    homeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe1TJaSxbCjPeBOwrYEK4VNhCj-0xVe78ZJaC6QgYI1qtnh7AF-fmFo-fXuETFNZ8pUM9n_qWsO3AfMtvCn5uHlMypBEi0GIlopHr49Lbm7R7-2ucWwE0tXurU45Z1x2xiTWYIOA4JaFRxrx5DXIgdEnPkvmGsduNUPoS-gzKudmNiD0SGQGWYcmUzYT949bg4vDSrdZUPTkL2eyYWliaU7pQR5wVb0DOIjGHdSEy1KClZcrKhBHZ__FJc0xszjO4TqTLJxp0L86VE',
    collectionImage: '/earring_hero.png',
    showOnHome: true,
    order: 2,
    isActive: true,
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    title: 'Celestial Necklaces',
    subtitle: 'The Archive III',
    tagline: 'Luminous Chains',
    count: '15 Pieces',
    desc: 'Handcrafted silhouettes inspired by the deep-blue night sky. Each piece is a testament to eternal elegance and refined craftsmanship.',
    homeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv9_mVnLSdhf6SKw5pIeTcYIvJXoOVoSa3qX3Fbfwt7dcHmW79gcV-3lACiTAMsFuMPhTLN7iT1UvcGV6unWAXJzBmsLWHtD0xKd2wi8WUHB4rhedHLKd4EbgqUxag1Kj2te7n9rgHRaSOdu7zeQfwnR4vYLs8bGvJ1xaqDiVyO5oX7GCdOY8QAxZpNJeskhYjfpiBwwlQLeDQatcAatJ8eT85s48qrZI2QAvi1qLGZx3XDXh2gor68pmQ7382lMBdZA7OT3SGPKm0',
    collectionImage: '/necklace_hero.png',
    showOnHome: true,
    order: 3,
    isActive: true,
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    title: 'Ether Bracelets',
    subtitle: 'The Archive IV',
    tagline: 'Architectural Cuffs',
    count: '10 Pieces',
    desc: 'Fluid curves of 18k gold and high-clarity gemstones. Designed to follow the natural movement of the spirit.',
    homeImage: '/bracelet_hero.png',
    collectionImage: '/bracelet_hero.png',
    showOnHome: true,
    order: 4,
    isActive: true,
  },
];

// Helper to seed defaults if collection is empty
const ensureDefaults = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    logger.info('Auto-seeding default categories...');
    await Category.insertMany(DEFAULT_CATEGORIES);
    logger.info('Default categories seeded successfully.');
  } else {
    const sample = await Category.findOne({ name: 'Rings' });
    if (sample && sample.homeImage === '/ring_hero.png') {
      for (const def of DEFAULT_CATEGORIES) {
        await Category.updateOne(
          { name: def.name },
          {
            $set: {
              homeImage: def.homeImage,
              collectionImage: def.collectionImage,
              tagline: def.tagline,
              count: def.count,
              order: def.order,
            },
          }
        );
      }
    }
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    await ensureDefaults();
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// @desc    Get categories for Home Screen (strictly 4)
// @route   GET /api/categories/home
// @access  Public
const getHomeCategories = async (req, res) => {
  try {
    await ensureDefaults();
    // Find categories explicitly set to show on Home
    let homeCategories = await Category.find({ showOnHome: true, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .limit(4);

    // If fewer than 4 are marked, pad with remaining active categories to guarantee 4 slots
    if (homeCategories.length < 4) {
      const existingIds = homeCategories.map((c) => c._id);
      const needed = 4 - homeCategories.length;
      const additional = await Category.find({ _id: { $nin: existingIds }, isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .limit(needed);
      homeCategories = [...homeCategories, ...additional];
    }

    res.json(homeCategories);
  } catch (error) {
    logger.error(`Error fetching home categories: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch home categories' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      title,
      subtitle,
      tagline,
      count: customCount,
      desc,
      homeImage,
      collectionImage,
      showOnHome = false,
      order = 0,
      isActive = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    if (!homeImage || !homeImage.trim()) {
      return res.status(400).json({ message: 'Home screen image is required' });
    }

    const cleanName = name.trim();
    const slug = (customSlug && customSlug.trim())
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existingName = await Category.findOne({ name: cleanName });
    if (existingName) {
      return res.status(400).json({ message: `Category '${cleanName}' already exists` });
    }

    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: `A category with slug '${slug}' already exists` });
    }

    // STRICT HOME SCREEN RULE: Max 4 categories
    if (showOnHome) {
      const homeCount = await Category.countDocuments({ showOnHome: true });
      if (homeCount >= 4) {
        return res.status(400).json({
          message: 'Only 4 categories can be featured on the Home Screen. Please uncheck one before selecting another.',
        });
      }
    }

    const category = new Category({
      name: cleanName,
      slug,
      title: title && title.trim() ? title.trim() : `Exclusive ${cleanName}`,
      subtitle: subtitle && subtitle.trim() ? subtitle.trim() : 'The Archive',
      tagline: tagline && tagline.trim() ? tagline.trim() : '',
      count: customCount && customCount.trim() ? customCount.trim() : '',
      desc: desc && desc.trim() ? desc.trim() : '',
      homeImage: homeImage.trim(),
      collectionImage: collectionImage && collectionImage.trim() ? collectionImage.trim() : homeImage.trim(),
      showOnHome: Boolean(showOnHome),
      order: Number(order) || 0,
      isActive: Boolean(isActive),
    });

    const createdCategory = await category.save();
    logger.info(`Category created: ${cleanName} (ID: ${createdCategory._id})`);
    res.status(201).json(createdCategory);
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({ message: error.message || 'Failed to create category' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const {
      name,
      slug: customSlug,
      title,
      subtitle,
      tagline,
      count: customCount,
      desc,
      homeImage,
      collectionImage,
      showOnHome,
      order,
      isActive,
    } = req.body;

    // Check name uniqueness if updated
    if (name && name.trim() && name.trim() !== category.name) {
      const cleanName = name.trim();
      const existingName = await Category.findOne({ name: cleanName, _id: { $ne: req.params.id } });
      if (existingName) {
        return res.status(400).json({ message: `Category '${cleanName}' already exists` });
      }
      category.name = cleanName;
    }

    // Check slug uniqueness if updated
    if (customSlug && customSlug.trim()) {
      const slug = customSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (slug !== category.slug) {
        const existingSlug = await Category.findOne({ slug, _id: { $ne: req.params.id } });
        if (existingSlug) {
          return res.status(400).json({ message: `A category with slug '${slug}' already exists` });
        }
        category.slug = slug;
      }
    }

    // STRICT HOME SCREEN RULE: Max 4 categories
    if (showOnHome !== undefined) {
      const wantsHome = Boolean(showOnHome);
      if (wantsHome && !category.showOnHome) {
        const homeCount = await Category.countDocuments({
          showOnHome: true,
          _id: { $ne: req.params.id },
        });
        if (homeCount >= 4) {
          return res.status(400).json({
            message: 'Only 4 categories can be featured on the Home Screen. Please uncheck one before selecting another.',
          });
        }
      }
      category.showOnHome = wantsHome;
    }

    if (title !== undefined) category.title = title;
    if (subtitle !== undefined) category.subtitle = subtitle;
    if (tagline !== undefined) category.tagline = tagline;
    if (customCount !== undefined) category.count = customCount;
    if (desc !== undefined) category.desc = desc;
    if (homeImage) category.homeImage = homeImage.trim();
    if (collectionImage !== undefined) {
      category.collectionImage = collectionImage.trim() || category.homeImage;
    }
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    const updatedCategory = await category.save();
    logger.info(`Category updated: ${updatedCategory.name} (ID: ${updatedCategory._id})`);
    res.json(updatedCategory);
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    res.status(500).json({ message: error.message || 'Failed to update category' });
  }
};

// @desc    Quick toggle for Home Screen visibility (with 4-slot limit)
// @route   PATCH /api/categories/:id/toggle-home
// @access  Private/Admin
const toggleHomeCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const nextState = !category.showOnHome;

    if (nextState) {
      const homeCount = await Category.countDocuments({
        showOnHome: true,
        _id: { $ne: req.params.id },
      });
      if (homeCount >= 4) {
        return res.status(400).json({
          message: 'Only 4 categories can be featured on the Home Screen. Please uncheck one before selecting another.',
        });
      }
    }

    category.showOnHome = nextState;
    await category.save();
    res.json(category);
  } catch (error) {
    logger.error(`Error toggling home category: ${error.message}`);
    res.status(500).json({ message: error.message || 'Failed to toggle home category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const name = category.name;
    await Category.deleteOne({ _id: req.params.id });
    logger.info(`Category deleted: ${name} (ID: ${req.params.id})`);

    res.json({ message: `Category '${name}' deleted successfully` });
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  getHomeCategories,
  createCategory,
  updateCategory,
  toggleHomeCategory,
  deleteCategory,
};
