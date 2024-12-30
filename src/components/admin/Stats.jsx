import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaUserSlash, FaBook, FaBookDead } from 'react-icons/fa';

const Stats = ({ refreshTrigger }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({
    totalStudents: 0,
    suspendedStudents: 0,
    totalCourses: 0,
    suspendedCourses: 0
  });

  useEffect(() => {
    const getStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/stats`, { withCredentials: true });
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    getStats();
  }, [refreshTrigger, apiUrl]); // Add apiUrl to dependencies

  const statItems = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Suspended Students',
      value: stats.suspendedStudents,
      icon: FaUserSlash,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: FaBook,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Suspended Courses',
      value: stats.suspendedCourses,
      icon: FaBookDead,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{item.title}</p>
              <p className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </p>
            </div>
            <div className={`${item.color} p-3 rounded-full`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
