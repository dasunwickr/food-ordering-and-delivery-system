import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { UserType } from "@/store/auth-store";

interface UserTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: UserType) => void;
}

export function UserTypeSelector({ isOpen, onClose, onSelect }: UserTypeSelectorProps) {
  if (!isOpen) return null;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 },
    }),
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Choose Account Type</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <motion.button
                custom={0}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onClick={() => onSelect("customer")}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-lg">🍔</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Customer</h3>
                  <p className="text-sm text-muted-foreground">Order food from local restaurants</p>
                </div>
              </motion.button>

              <motion.button
                custom={1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onClick={() => onSelect("restaurant")}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-green-600 text-lg">🍳</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Restaurant Owner</h3>
                  <p className="text-sm text-muted-foreground">Add your restaurant to our platform</p>
                </div>
              </motion.button>

              <motion.button
                custom={2}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onClick={() => onSelect("driver")}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 text-lg">🛵</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Delivery Driver</h3>
                  <p className="text-sm text-muted-foreground">Deliver food and earn money</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}