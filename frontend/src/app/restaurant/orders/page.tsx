"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  ChevronDown,
  Loader2,
  Clock,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
} from "lucide-react";

// Define types for the Order data structure
interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  potionSize: string;
  price: number;
  totalPrice: number;
  image: string;
}

interface CustomerDetails {
  name: string;
  contact: string;
  longitude: number;
  latitude: number;
}

interface DriverDetails {
  driverId?: string;
  driverName?: string;
  vehicleNumber?: string;
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
  driverDetails: DriverDetails | null;
  createdAt: string;
  updatedAt: string;
}

// Custom status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusIcon = () => {
    switch (status) {
      case "Pending":
        return <Clock size={14} className="mr-1" />;
      case "ACCEPTED":
        return <Check size={14} className="mr-1" />;
      case "REJECTED":
        return <X size={14} className="mr-1" />;
      case "COMPLETED":
        return <Package size={14} className="mr-1" />;
      default:
        return null;
    }
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles()}`}
    >
      {getStatusIcon()}
      {status}
    </span>
  );
};

// Main component
const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount" | "my-orders">("newest");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Get restaurantId from localStorage
  const restaurantIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;

  // Fetch all orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost/api/order-service/order/getAll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setProcessingOrderId(orderId);
      const response = await fetch(
        `http://localhost/api/order-service/order/update-status/${orderId}?status=${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, orderStatus: status } : order
        )
      );
    } catch (err) {
      console.error(`Error updating order status to ${status}:`, err);
      setError(`Failed to update order status to ${status}. Please try again.`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId.toLowerCase().includes(term) ||
          order.customerDetails.name.toLowerCase().includes(term) ||
          order.customerDetails.contact.includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "amount") {
        return b.totalAmount - a.totalAmount;
      } else if (sortBy === "my-orders") {
        // Show orders of current restaurant first
        const aMatch = a.restaurantId === restaurantIdFromStorage;
        const bMatch = b.restaurantId === restaurantIdFromStorage;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      }
      return 0;
    });

    return result;
  }, [orders, searchTerm, statusFilter, sortBy, restaurantIdFromStorage]);

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.orderStatus === "Pending").length;
    const accepted = orders.filter((order) => order.orderStatus === "ACCEPTED").length;
    const rejected = orders.filter((order) => order.orderStatus === "REJECTED").length;
    const total = orders.length;
    return { pending, accepted, rejected, total };
  }, [orders]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h3 className="text-red-800 font-medium text-lg mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No orders available</h3>
          <p className="mt-1 text-gray-500">There are currently no orders in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">View and manage all customer orders</p>
      </header>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Accepted Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Rejected Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "amount" | "my-orders")}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Amount (High to Low)</option>
              <option value="my-orders">My Restaurant's Orders</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Order results message */}
      <div className="mb-4 text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white shadow rounded-lg overflow-hidden border border-gray-100"
          >
            {/* Order header */}
            <div
              className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleOrderDetails(order.orderId)}
            >
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2">
                  <Package className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-700">#{order.orderId.slice(-6)}</span>
                </div>
                <StatusBadge status={order.orderStatus} />
                <div className="flex items-center space-x-2">
                  <User className="text-gray-400" size={16} />
                  <span className="text-gray-700">{order.customerDetails.name}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 mt-2 md:mt-0">
                <div className="flex items-center space-x-2">
                  <CreditCard className="text-gray-400" size={16} />
                  <span className="text-gray-700">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={16} />
                  <span className="text-gray-700 text-sm">{formatDate(order.createdAt)}</span>
                </div>
                <ChevronDown
                  className={`text-gray-400 transition-transform ${
                    expandedOrderId === order.orderId ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </div>
            </div>

            {/* Order details (expanded) */}
            {expandedOrderId === order.orderId && (
              <div className="border-t border-gray-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Customer Information</h3>
                    <div className="bg-gray-50 rounded-md p-3 space-y-2">
                      <div className="flex items-start space-x-2">
                        <User className="text-gray-400 mt-0.5" size={16} />
                        <span className="text-gray-700">{order.customerDetails.name}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Phone className="text-gray-400 mt-0.5" size={16} />
                        <span className="text-gray-700">{order.customerDetails.contact}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="text-gray-400 mt-0.5" size={16} />
                        <span className="text-gray-700">
                          Location: {order.customerDetails.latitude.toFixed(4)},{" "}
                          {order.customerDetails.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Order Information</h3>
                    <div className="bg-gray-50 rounded-md p-3 space-y-2">
                      <div className="flex items-start space-x-2">
                        <CreditCard className="text-gray-400 mt-0.5" size={16} />
                        <span className="text-gray-700">Payment Method: {order.paymentType}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Truck className="text-gray-400 mt-0.5" size={16} />
                        <span className="text-gray-700">
                          {order.driverDetails ? `Driver: ${order.driverDetails.driverName}` : "No driver assigned"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order Total:</span>
                        <span className="font-medium">${order.orderTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order items */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Order Items</h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.cartItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.potionSize}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${item.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action buttons */}
                {order.orderStatus === "Pending" && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.orderId, "REJECTED");
                      }}
                      disabled={processingOrderId === order.orderId}
                      className="px-4 py-2 bg-white border border-red-500 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {processingOrderId === order.orderId ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : (
                        <X className="mr-2" size={16} />
                      )}
                      Reject Order
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.orderId, "ACCEPTED");
                      }}
                      disabled={processingOrderId === order.orderId}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {processingOrderId === order.orderId ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : (
                        <Check className="mr-2" size={16} />
                      )}
                      Accept Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No results state */}
      {filteredOrders.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Filter className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching orders</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;