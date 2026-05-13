import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ReturnRequest from "../models/ReturnRequest.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Core KPIs
    const [ordersCount, usersCount, productsCount, returnsCount] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      ReturnRequest.countDocuments({ status: "Requested" })
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 2. Sales & AOV Trend (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrendRaw = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: "Cancelled" }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          revenue: 1,
          orders: 1,
          aov: { $cond: [ { $eq: ["$orders", 0] }, 0, { $divide: ["$revenue", "$orders"] } ] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const found = salesTrendRaw.find(s => s._id === dateStr);
      salesData.push({
        name: d.toLocaleDateString("en-IN", { weekday: "short" }),
        fullDate: dateStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
        aov: found ? Math.round(found.aov) : 0
      });
    }

    // 3. Top Products
    const topProductsAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          sold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "doc"
        }
      },
      { $unwind: { path: "$doc", preserveNullAndEmptyArrays: true } }
    ]);

    const topProducts = topProductsAgg.map(p => ({
      _id: p._id,
      name: p.name,
      sold: p.sold,
      revenue: p.revenue,
      image: p.doc ? p.doc.coverImage : null
    }));

    // 4. Feeds
    const [recentOrders, recentReturns, recentCustomers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(4).populate("user", "name email"),
      ReturnRequest.find({ status: "Requested" }).sort({ createdAt: -1 }).limit(4).populate("user", "name email").populate("order", "_id"),
      User.find({ role: "user" }).sort({ createdAt: -1 }).limit(4),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5)
    ]);

    res.json({
      kpis: {
        totalRevenue,
        ordersCount,
        usersCount,
        productsCount,
        pendingReturns: returnsCount
      },
      salesData,
      topProducts,
      recentOrders,
      recentReturns,
      recentCustomers,
      lowStockAlerts
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
