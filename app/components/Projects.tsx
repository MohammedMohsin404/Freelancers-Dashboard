// components/Projects.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, FolderOpen } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Active' | 'Completed' | 'Overdue';
  deadline: string;
}

const Projects: React.FC = () => {
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      client: 'Client A',
      status: 'Active',
      deadline: '2024-05-20'
    },
    {
      id: '2',
      name: 'Mobile App',
      client: 'Client B',
      status: 'Completed',
      deadline: '2024-04-15'
    },
    {
      id: '3',
      name: 'Branding Project',
      client: 'Client C',
      status: 'Overdue',
      deadline: '2024-03-10'
    },
    {
      id: '4',
      name: 'Blog Post Series',
      client: 'Client D',
      status: 'Active',
      deadline: '2024-06-01'
    }
  ];

  const getStatusBadge = (status: Project['status']) => {
    const baseClasses = "badge badge-xs sm:badge-sm px-2 sm:px-3 py-1 sm:py-2 text-white font-medium text-xs sm:text-sm";
    
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-success hover:bg-success/90`;
      case 'Completed':
        return `${baseClasses} bg-warning hover:bg-warning/90`;
      case 'Overdue':
        return `${baseClasses} bg-error hover:bg-error/90`;
      default:
        return `${baseClasses} bg-neutral/60`;
    }
  };

  return (
    <motion.div 
      className="bg-base-200 p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-2xl font-bold text-base-content mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Projects
      </motion.h2>
      
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <motion.tr 
              className="text-base-content/70 border-b border-base-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <th className="text-left font-semibold text-lg bg-transparent">Project</th>
              <th className="text-left font-semibold text-lg bg-transparent">Client</th>
              <th className="text-left font-semibold text-lg bg-transparent">Status</th>
              <th className="text-left font-semibold text-lg bg-transparent">Deadline</th>
            </motion.tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <motion.tr 
                key={project.id} 
                className="border-b border-base-300 hover:bg-base-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <td className="text-base-content font-medium py-4 bg-transparent">{project.name}</td>
                <td className="text-base-content/70 py-4 bg-transparent">{project.client}</td>
                <td className="py-4 bg-transparent">
                  <motion.span 
                    className={getStatusBadge(project.status)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {project.status}
                  </motion.span>
                </td>
                <td className="text-base-content/70 py-4 bg-transparent">{project.deadline}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Projects;