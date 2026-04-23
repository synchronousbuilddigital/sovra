const Order = require('../models/orderModel');
const User = require('../models/userModel');

const Material = require('../models/materialModel');

// @desc    Get dashboard stats
// @route   GET /api/analytics/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments(); // Count all registered accounts


    // Calculate Dynamic Revenue and Trends
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const fullArchive = await Order.find({});
    const totalRevenue = fullArchive.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    const thisMonthOrders = await Order.find({ createdAt: { $gte: thisMonthStart } });
    const lastMonthOrders = await Order.find({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });

    const thisMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

    let revenueTrend = '+0%';
    if (lastMonthRevenue > 0) {
      const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueTrend = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    } else if (thisMonthRevenue > 0) {
      revenueTrend = '+100%';
    }

    res.json({
      totalRevenue: totalRevenue,
      totalOrders,

      totalUsers,
      revenueTrend,
      orderTrend: totalOrders > 0 ? '+100%' : '+0%', // Dynamic Order trend
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueData = async (req, res) => {
  try {
    // Basic implementation: grouping by month
    const revenueByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(revenueByMonth);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStats,
  getRevenueData,
};
