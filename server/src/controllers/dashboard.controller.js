const { Product, Order, ContactInquiry, CustomDesignRequest } = require('../models');

async function getDashboard(req, res) {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    featuredProducts,
    totalOrders,
    pendingOrders,
    paymentVerifiedOrders,
    deliveredOrders,
    totalInquiries,
    unreadInquiries,
    totalCustomRequests,
    newCustomRequests,
    recentOrders,
    recentInquiries,
    recentCustomRequests,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ status: 'published' }),
    Product.countDocuments({ status: 'draft' }),
    Product.countDocuments({ featured: true }),

    Order.countDocuments({}),
    Order.countDocuments({ status: 'PENDING' }),
    Order.countDocuments({ status: 'PAYMENT_VERIFIED' }),
    Order.countDocuments({ status: 'DELIVERED' }),

    ContactInquiry.countDocuments({}),
    ContactInquiry.countDocuments({ read: false }),

    CustomDesignRequest.countDocuments({}),
    CustomDesignRequest.countDocuments({ status: 'NEW' }),

    Order.find({}).sort({ createdAt: -1 }).limit(5).select('orderId productName price status createdAt'),
    ContactInquiry.find({}).sort({ createdAt: -1 }).limit(5).select('name subject read createdAt'),
    CustomDesignRequest.find({}).sort({ createdAt: -1 }).limit(5).select('name designType status createdAt'),
  ]);

  // Manually recorded revenue — sum of verified/delivered orders only.
  // Never claim this reflects an automatic payment system (spec §53).
  const revenueAgg = await Order.aggregate([
    { $match: { status: { $in: ['PAYMENT_VERIFIED', 'DELIVERED'] } } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const recordedRevenue = revenueAgg[0]?.total || 0;

  return res.json({
    success: true,
    stats: {
      products: {
        total: totalProducts,
        published: publishedProducts,
        draft: draftProducts,
        featured: featuredProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        paymentVerified: paymentVerifiedOrders,
        delivered: deliveredOrders,
      },
      inquiries: {
        total: totalInquiries,
        unread: unreadInquiries,
      },
      customRequests: {
        total: totalCustomRequests,
        new: newCustomRequests,
      },
      // Manually recorded/verified revenue — not from an automatic payment system.
      recordedRevenue,
    },
    recentActivity: {
      orders: recentOrders,
      inquiries: recentInquiries,
      customRequests: recentCustomRequests,
    },
  });
}

module.exports = { getDashboard };
