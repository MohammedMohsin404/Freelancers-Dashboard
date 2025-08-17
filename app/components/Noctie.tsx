// components/Noctie.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoctieItem {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

const Noctie: React.FC = () => {
  const [items, setItems] = useState<NoctieItem[]>([
    {
      id: '1',
      title: 'Update website design',
      date: 'June 10',
      completed: false
    },
    {
      id: '2',
      title: 'Prepare invoice for Client Y',
      date: 'May 25',
      completed: false
    },
    {
      id: '3',
      title: 'Meeting with Client A',
      date: 'May 30',
      completed: true
    }
  ]);

  const toggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <motion.div 
      className="bg-base-100 p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold text-base-content mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Noctie
      </motion.h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div 
              key={item.id} 
              className="flex items-start gap-4 p-4 bg-base-100 rounded-lg hover:bg-base-100/80 transition-colors border border-base-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
              whileHover={{ 
                scale: 1.01,
                y: -1,
                transition: { duration: 0.2 }
              }}
              layout
            >
              <motion.div 
                className="flex-shrink-0 pt-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.button
                  onClick={() => toggleComplete(item.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                    item.completed
                      ? 'bg-success border-success'
                      : 'border-base-content/30 hover:border-primary'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={item.completed ? { 
                    backgroundColor: "var(--success)", 
                    borderColor: "var(--success)" 
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {item.completed && (
                      <motion.svg 
                        className="w-3 h-3 text-white mx-auto mt-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3, type: "spring" }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              
              <div className="flex-grow">
                <motion.h3 
                  className={`font-medium transition-colors ${
                    item.completed 
                      ? 'text-base-content/50 line-through' 
                      : 'text-base-content'
                  }`}
                  animate={item.completed ? {
                    opacity: 0.5,
                    textDecoration: "line-through"
                  } : {
                    opacity: 1,
                    textDecoration: "none"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {item.title}
                </motion.h3>
                
                <motion.div 
                  className="flex items-center gap-2 mt-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                >
                  <motion.svg 
                    className="w-4 h-4 text-base-content/50" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </motion.svg>
                  <motion.span 
                    className={`text-sm transition-colors ${
                      item.completed 
                        ? 'text-base-content/40' 
                        : 'text-base-content/70'
                    }`}
                    animate={item.completed ? { opacity: 0.4 } : { opacity: 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.date}
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Noctie;