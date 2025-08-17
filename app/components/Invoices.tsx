// components/Invoices.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

const Invoices: React.FC = () => {
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: '#1234',
      client: 'Client X',
      amount: 500,
      status: 'Paid'
    },
    {
      id: '2',
      invoiceNumber: '#1235',
      client: 'Client Y',
      amount: 700,
      status: 'Unpaid'
    }
  ];

  const getStatusBadge = (status: Invoice['status']) => {
    const baseClasses = "badge badge-sm px-3 py-2 text-white font-medium";
    
    switch (status) {
      case 'Paid':
        return `${baseClasses} bg-success hover:bg-success/90`;
      case 'Unpaid':
        return `${baseClasses} bg-error hover:bg-error/90`;
      case 'Pending':
        return `${baseClasses} bg-warning hover:bg-warning/90`;
      default:
        return `${baseClasses} bg-neutral/60`;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <motion.div 
      className="bg-base-100 p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.h2 
        className="text-2xl font-bold text-base-content mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Invoices
      </motion.h2>
      
      <div className="space-y-4">
        {invoices.map((invoice, index) => (
          <motion.div 
            key={invoice.id} 
            className="bg-base-100 p-4 rounded-lg border border-base-300 hover:bg-base-100/80 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
            whileHover={{ 
              scale: 1.02, 
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="flex justify-between items-start mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
            >
              <h3 className="text-lg font-semibold text-base-content">
                Invoice {invoice.invoiceNumber}
              </h3>
              <motion.span 
                className={getStatusBadge(invoice.status)}
                whileHover={{ scale: 1.1, rotate: 1 }}
                whileTap={{ scale: 0.9 }}
              >
                {invoice.status}
              </motion.span>
            </motion.div>
            
            <motion.p 
              className="text-base-content/70 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
            >
              {invoice.client}
            </motion.p>
            
            <motion.div 
              className="text-2xl font-bold text-base-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + (index * 0.1), type: "spring" }}
            >
              {formatCurrency(invoice.amount)}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Invoices;