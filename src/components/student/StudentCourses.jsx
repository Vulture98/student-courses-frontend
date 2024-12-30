import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/student/courses`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCourses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const updateProgress = async (courseId, progress) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/student/courses/progress`,
        {
          courseId,
          progress
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Course List */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">My Courses</h2>
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => handleCourseSelect(course)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedCourse?._id === course._id
                    ? 'bg-blue-100 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">
                  Progress: {course.progress || 0}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div className="md:col-span-2">
          {selectedCourse ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{selectedCourse.title}</h2>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe
                  src={selectedCourse.videoUrl}
                  className="w-full h-full rounded"
                  allowFullScreen
                  onEnded={() => updateProgress(selectedCourse._id, 100)}
                ></iframe>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-full">
              <p className="text-gray-500">Select a course to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
