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
import axios from "axios";
import DisplayCategoriesFood from "@/components/common/categories/categories";

// Types
interface MenuItem {
  id: number;
  itemName: string;
  category: string;
  availabilityStatus: boolean;
  price: number;
}

interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  potionSize: string; // typo intentional? should be portionSize?
  price: number;
  totalPrice: number;
}

interface CustomerDetails {
  name: string;
  contact: string;
  longitude: number;
  latitude: number;
}

interface Order {
  orderId: string;
  customerId: string;
  restaurantId: string;
  customerDetails: CustomerDetails;
  cartItems: CartItem[];
  orderTotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentType: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string | null;
}

interface CategoryCount {
  name: string;
  count: number;
  icon: React.ReactNode;
}

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
  // Fetch menu items on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get<MenuItem[]>(
          `http://localhost/api/menu-service/menu/restaurant/${restaurantId}`
        );
        const fetchedItems = response.data;

        setMenuItems(fetchedItems);

        // Calculate stats
        const available = fetchedItems.filter((item) => item.availabilityStatus).length;
        setMenuStats({
          total: fetchedItems.length,
          available,
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

      // Clock update
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    };

    fetchMenuItems();
  }, []);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Pending":
          return "bg-yellow-100 text-yellow-800";
        case "ACCEPTED":
          return "bg-green-100 text-green-800";
        case "REJECTED":
          return "bg-red-100 text-red-800";
        case "COMPLETED":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>("http://localhost/api/order-service/order/getAll");
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // State for category stats
  const [categoryStats, setCategoryStats] = useState<CategoryCount[]>([]);

  // Loading state
  if (loading) return <p>Loading menu data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      {/* Existing JSX */}
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Clock */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Restaurant Dashboard</h1>
              <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-700 mb-1">
                <Clock className="mr-2" size={20} />
                <span className="text-xl font-mono">{currentTime.toLocaleTimeString()}</span>
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
                  <p className="text-2xl font-bold">${dummyRevenueData.today.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Week</p>
                  <p className="text-xl font-bold">${dummyRevenueData.thisWeek.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">This Month</p>
                  <p className="text-xl font-bold">${dummyRevenueData.thisMonth.toFixed(2)}</p>
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
            <DisplayCategoriesFood/>
          </div>

          {/* Recent Orders Table */}
          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Recent Orders</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading orders...
                      </td>
                    </tr>
                  )}

                  {!ordersLoading && orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No recent orders
                      </td>
                    </tr>
                  )}

                  {!ordersLoading &&
                    orders.slice(0, 5).map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerDetails.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.cartItems.reduce(
                            (acc, curr) => acc + curr.quantity,
                            0
                          )}{" "}
                          items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.orderStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
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