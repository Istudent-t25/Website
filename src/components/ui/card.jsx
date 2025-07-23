// src/components/ui/card.jsx
import { motion } from "framer-motion";

export const Card = ({ className = "", children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl shadow-md bg-white p-5 border border-gray-200 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = "" }) => {
  return <div className={`mb-3 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }) => {
  return <h3 className={`text-lg font-bold text-gray-800 ${className}`}>{children}</h3>;
};

export const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`text-sm text-gray-700 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = "" }) => {
  return <div className={`mt-4 border-t pt-3 ${className}`}>{children}</div>;
};
