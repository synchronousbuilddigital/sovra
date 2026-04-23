const User = require('../models/userModel');

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Robust sorting with fallbacks for missing timestamps
      const sortedNotifications = (user.notifications || []).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      res.json(sortedNotifications);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const notification = user.notifications.id(req.params.id);
    if (notification) {
      notification.isRead = true;
      await user.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
