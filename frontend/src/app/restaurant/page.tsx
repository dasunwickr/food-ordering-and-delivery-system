"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Coffee,
  Clock,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  TrendingUp,
} from "lucide-react";
import Head from "next/head";
import DisplayCategories from "@/components/common/categories/categories"; // Adjust the import path as needed
import axios from "axios";

// Types
interface MenuItem {
  id: number;
  itemName: string; // Changed from name -> itemName
  category: string;
  price: number;
  availabilityStatus: boolean; // Changed from available -> availabilityStatus
}

interface OrderSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  percentChange: number;
}

interface RevenueSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  percentChange: number;
}

interface CategoryCount {
  name: string;
  count: number;
  icon: React.ReactNode;
}

// Dashboard component
const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuStats, setMenuStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    percentChange: 0,
  });
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    percentChange: 0,
  });
  const [categoryStats, setCategoryStats] = useState<CategoryCount[]>([]);

  // Dummy data left unchanged
  const dummyOrderData = {
    today: 42,
    thisWeek: 285,
    thisMonth: 1124,
    percentChange: 8.5,
  };
  const dummyRevenueData = {
    today: 1258.75,
    thisWeek: 8932.5,
    thisMonth: 34876.25,
    percentChange: 12.3,
  };

  useEffect(() => {
    // Fetch menu items from backend
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get<MenuItem[]>(
          "http://localhost/api/menu-service/menu/all"
        );
        const fetchedItems = response.data;

        // Set menu items state
        setMenuItems(fetchedItems);

        // Calculate menu stats
        const available = fetchedItems.filter((item) => item.availabilityStatus).length;
        setMenuStats({
          total: fetchedItems.length,
          available: available,
          unavailable: fetchedItems.length - available,
        });

        // Build category stats
        const categories: Record<string, number> = {};
        fetchedItems.forEach((item) => {
          if (item.availabilityStatus) {
            categories[item.category] = (categories[item.category] || 0) + 1;
          }
        });

        const categoryIcons: Record<string, React.ReactNode> = {
          Pizza: <ShoppingBag size={20} />,
          Burgers: <ShoppingBag size={20} />,
          Sides: <ShoppingBag size={20} />,
          Salads: <ShoppingBag size={20} />,
          Desserts: <ShoppingBag size={20} />,
          Drinks: <Coffee size={20} />,
        };

        const categoryCounts: CategoryCount[] = Object.keys(categories).map((name) => ({
          name,
          count: categories[name],
          icon: categoryIcons[name] || <ShoppingBag size={20} />,
        }));

        setCategoryStats(categoryCounts);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
        setError("Unable to load menu items.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();

    // Set clock timer
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for the clock display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <p>Loading menu data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <Head>
        <title>Restaurant Dashboard</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Clock */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Restaurant Dashboard</h1>
              <p className="text-gray-500">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-700 mb-1">
                <Clock className="mr-2" size={20} />
                <span className="text-xl font-mono">{formatTime(currentTime)}</span>
              </div>
              <p className="text-sm text-gray-500">Restaurant is Open</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Menu Items Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Menu Items</h2>
                <ShoppingBag className="text-blue-500" size={24} />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center p-2">
                  <p className="text-gray-500 text-sm">Total</p>
                  <p className="text-2xl font-bold">{menuStats.total}</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-gray-500 text-sm">Available</p>
                  <p className="text-2xl font-bold text-green-600">{menuStats.available}</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-gray-500 text-sm">Unavailable</p>
                  <p className="text-2xl font-bold text-red-500">{menuStats.unavailable}</p>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
                <Users className="text-purple-500" size={24} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Today</p>
                  <p className="text-2xl font-bold">{dummyOrderData.today}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Week</p>
                  <p className="text-xl font-bold">{dummyOrderData.thisWeek}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Month</p>
                  <p className="text-xl font-bold">{dummyOrderData.thisMonth}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span
                  className={`flex items-center text-sm ${
                    dummyOrderData.percentChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {dummyOrderData.percentChange >= 0 ? (
                    <ArrowUp size={16} className="mr-1" />
                  ) : (
                    <ArrowDown size={16} className="mr-1" />
                  )}
                  {Math.abs(dummyOrderData.percentChange)}% from last week
                </span>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
                <DollarSign className="text-green-500" size={24} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Today</p>
                  <p className="text-2xl font-bold">${dummyRevenueData.today.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Week</p>
                  <p className="text-xl font-bold">
                    ${dummyRevenueData.thisWeek.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Month</p>
                  <p className="text-xl font-bold">
                    ${dummyRevenueData.thisMonth.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span
                  className={`flex items-center text-sm ${
                    dummyRevenueData.percentChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {dummyRevenueData.percentChange >= 0 ? (
                    <TrendingUp size={16} className="mr-1" />
                  ) : (
                    <ArrowDown size={16} className="mr-1" />
                  )}
                  {Math.abs(dummyRevenueData.percentChange)}% from last week
                </span>
              </div>
            </div>
          </div>

          {/* Available Items by Category */}
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Available Items by Category</h2>
          <div>
            <DisplayCategories/>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { id: "#1425", customer: "John Smith", items: 3, total: 34.97, status: "Completed", time: "10 mins ago" },
                    { id: "#1424", customer: "Sarah Johnson", items: 2, total: 22.98, status: "Preparing", time: "15 mins ago" },
                    { id: "#1423", customer: "Michael Brown", items: 4, total: 47.96, status: "Delivering", time: "25 mins ago" },
                    { id: "#1422", customer: "Emily Davis", items: 1, total: 15.99, status: "Completed", time: "35 mins ago" },
                    { id: "#1421", customer: "David Wilson", items: 2, total: 24.98, status: "Completed", time: "45 mins ago" }
                  ].map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Preparing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;