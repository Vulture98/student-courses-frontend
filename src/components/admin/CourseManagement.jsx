import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaPlay, FaBan, FaCheckCircle } from 'react-icons/fa';

const CourseManagement = ({ refreshStats, onGlobalLoading, onSuspendLoading }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const courseManagementRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: '',
    level: 'Beginner',
    videoUrl: '',
    thumbnail: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const coursesPerPage = 9; // Show 9 courses in 3x3 grid

  const subjects = ['physics', 'mathematics', 'chemistry', 'biology', 'computer science', 'literature', 'history', 'economics', 'environmental science', 'psychology'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${apiUrl}/api/courses?limit=1000`, // Get all courses
        { withCredentials: true }
      );
      if (response.data.success) {
        setAllCourses(response.data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search term
  const filteredCourses = allCourses.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (course.title?.toLowerCase() || '').includes(searchLower) ||
      (course.description?.toLowerCase() || '').includes(searchLower) ||
      (course.subject?.toLowerCase() || '').includes(searchLower) ||
      (course.level?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Calculate pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const pageCount = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const scrollPosition = window.scrollY;
    onGlobalLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/courses`,
        courseForm,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Course added successfully');
        setShowAddModal(false);
        resetForm();
        // Simulate network delay for fetching updated courses
        // await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchCourses();
        // Refresh stats after adding course
        if (refreshStats) refreshStats();
        // Restore scroll position after a brief delay
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
      // console.error('Error adding course:', error);
      // console.log(`error.response.data:`, error.response.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to add course');
      // toast.error(error.response?.data?.message || 'Failed to add course');
    } finally {
      onGlobalLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    // const container = courseManagementRef.current;
    // const scrollPosition = container ? container.scrollTop : 0;    
    const scrollPosition = window.scrollY;
    // setCrudLoading(true);
    onGlobalLoading(true);

    try {
      // Simulate network delay for the update
      // await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.put(
        `${apiUrl}/api/courses/${editingCourse._id}`,
        courseForm,
        { withCredentials: true }
      );
      // console.log(`response.data: `, response.data);
      if (response.data.success) {
        toast.success('Course updated successfully');
        setEditingCourse(null);
        resetForm();
        // Simulate network delay for fetching updated courses
        // await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchCourses();
        // Restore scroll position after a brief delay
        // setTimeout(() => {
        //   if (container) container.scrollTop = scrollPosition;
        // }, 100);
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
      // console.log(`error.response:`, error.response);
      // console.log(`error.response?.request?.response:`, error.response?.request?.response);
      // console.log(`error.response?.request?.response?.message:`, error.response?.request?.response?.message);
      // console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update course');
    } finally {
      onGlobalLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    const scrollPosition = window.scrollY;
    onGlobalLoading(true);
    try {
      const response = await axios.delete(
        `${apiUrl}/api/courses/${courseId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Course deleted successfully');
        // Simulate network delay for fetching updated courses
        // await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchCourses();
        // Refresh stats after deleting course
        if (refreshStats) refreshStats();
        // Restore scroll position after a brief delay
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      onGlobalLoading(false);
    }
  };

  const handleToggleSuspended = async (courseId) => {
    const container = courseManagementRef.current;
    const scrollPosition = container ? container.scrollTop : 0;
    onSuspendLoading(true);
    try {
      const response = await axios.patch(
        `${apiUrl}/api/courses/${courseId}/toggle-suspended`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the course in the local state to prevent re-fetch
        setAllCourses(prevCourses =>
          prevCourses.map(course =>
            course._id === courseId
              ? { ...course, isSuspended: !course.isSuspended }
              : course
          )
        );

        // Call refreshStats before toast to ensure UI updates
        if (refreshStats) refreshStats();

        toast.success(response.data.message);
        // Simulate network delay for fetching updated courses
        // await new Promise(resolve => setTimeout(resolve, 2000));
        // Restore scroll position after a brief delay
        setTimeout(() => {
          if (container) container.scrollTop = scrollPosition;
        }, 0);
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error('Failed to toggle course status');
    } finally {
      onSuspendLoading(false);
    }
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      subject: '',
      level: 'Beginner',
      videoUrl: '',
      thumbnail: ''
    });
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      subject: course.subject,
      level: course.level,
      videoUrl: course.videoUrl,
      thumbnail: course.thumbnail
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (courseManagementRef.current) {
      courseManagementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWatchVideo = (videoUrl) => {
    window.open(videoUrl, '_blank');
  };

  const renderCourseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              setEditingCourse(null);
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTrash className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  value={courseForm.subject}
                  onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                  required
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Video URL</label>
              <input
                type="url"
                value={courseForm.videoUrl}
                onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
              <input
                type="url"
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingCourse(null);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-4">Loading courses...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 relative">
      {/* {crudLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )} */}
      {/* {crudLoading && (
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Updating course...</p>
          </div>
        </div>
      )} */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaPlus /> Add Course
          </button>
        </div>
      </div>

      {currentCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map(course => (
              <div key={course._id} className="border rounded-lg p-4 space-y-4">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleWatchVideo(course.videoUrl)}
                    className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors duration-200"
                    title="Watch Video"
                  >
                    <FaPlay />
                  </button>
                </div>
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(course)}
                      className="text-blue-500 hover:text-blue-600"
                      title="Edit Course"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete Course"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      onClick={() => handleToggleSuspended(course._id)}
                      className={`${!course.isSuspended ? 'text-gray-400 hover:text-red-500' : 'text-red-500'}`}
                      title={`${!course.isSuspended ? 'Suspend Course' : 'Activate Course'}`}
                    >
                      <FaBan size={20} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                      {course.subject}
                    </span>
                    <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Previous
            </button>
            {[...Array(pageCount)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={`px-3 py-1 rounded ${currentPage === pageCount
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
          </p>
        </div>
      )}

      {(showAddModal || editingCourse) && renderCourseModal()}
    </div>
  );
};

export default CourseManagement;