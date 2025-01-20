import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiTrash, BiEdit, BiSearch } from 'react-icons/bi';
import { FaBan, FaUserGraduate, FaBook, FaChartBar, FaChevronLeft, FaChevronRight, FaLayerGroup, FaUserSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CourseManagement from './CourseManagement';
import Stats from './Stats';
import ActionLoader from '../common/ActionLoader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const [allCourses, setAllCourses] = useState([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectAllCourses, setSelectAllCourses] = useState(false);
  const [refreshStats, setRefreshStats] = useState(0);
  const studentsPerPage = 12;
  const coursesPerPage = 9;
  const subject = ['physics', 'mathematics', 'chemistry', 'biology', 'computer science', 'literature', 'history', 'economics', 'environmental science', 'psychology'];
  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: '',
    level: 'beginner',
    videoUrl: '',
    thumbnail: ''
  });
  const [selectAllStudents, setSelectAllStudents] = useState(false);

  // Add state for course pagination from backend
  const [coursePagination, setCoursePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [loadingAction, setLoadingAction] = useState({ isLoading: false, message: '' });
  const [globalLoading, setGlobalLoading] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Function to increment refreshStats
  const handleRefreshStats = () => {
    setRefreshStats(prev => prev + 1);
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/students`, { withCredentials: true });
      // Ensure enrolledCourses is properly populated
      const studentsWithValidCourses = response.data.data.map(student => ({
        ...student,
        enrolledCourses: student.enrolledCourses?.filter(enrollment =>
          enrollment && enrollment.course && enrollment.course._id
        ) || []
      }));
      setStudents(studentsWithValidCourses);
    } catch (error) {
      toast.error('Error fetching students');
    }
  };

  // Update fetchCourses to include search
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/courses`, {
        params: {
          page: coursePagination.currentPage,
          limit: coursesPerPage,
          search: courseSearchTerm
        }
      });

      if (response.data.success) {
        const { courses, currentPage, totalPages, total } = response.data.data;
        setCourses(courses);
        setCoursePagination({
          currentPage,
          totalPages,
          total
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalLoading = (isLoading) => {
    setGlobalLoading(isLoading);
  };

  const handleSuspendLoading = (isLoading) => {
    setSuspendLoading(isLoading);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${apiUrl}/api/courses/${courseId}`, { withCredentials: true });
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Error deleting course');
      }
    }
  };

  const handleSuspendCourse = async (courseId) => {
    try {
      await axios.patch(`${apiUrl}/api/courses/${courseId}/toggle-status`, {}, { withCredentials: true });
      toast.success('Course status updated');
      fetchCourses();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('Error updating course status');
    }
  };

  const handleEditCourse = async (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      subject: course.subject,
      level: course.level,
      videoUrl: course.videoUrl,
      thumbnail: course.thumbnail
    });
    setShowAddCourse(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(
          `${apiUrl}/api/courses/${editingCourse._id}`,
          courseForm,
          { withCredentials: true }
        );
        toast.success('Course updated successfully');
      } else {
        await axios.post(`${apiUrl}/api/courses`, courseForm, { withCredentials: true });
        toast.success('Course added successfully');
      }
      setShowAddCourse(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        subject: '',
        level: 'beginner',
        videoUrl: '',
        thumbnail: ''
      });
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(editingCourse ? 'Error updating course' : 'Error adding course');
    }
  };

  const assignCoursesToMultipleStudents = async () => {
    if (!selectedStudents.length || !selectedCourses.length) {
      toast.error('Please select both students and courses');
      return;
    }

    try {
      await axios.post(
        `${apiUrl}/api/courses/bulk-assign`,
        {
          studentIds: selectedStudents,
          courseIds: selectedCourses,
          assignmentType: 'one-to-one' // one-to-one, one-to-many, many-to-one, many-to-many
        },
        { withCredentials: true }
      );
      toast.success('Courses assigned successfully');
      setSelectedStudents([]);
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error assigning courses:', error);
      toast.error('Error assigning courses');
    }
  };

  // Filter and pagination logic
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const matchesSearch = student.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || student.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const indexOfLastStudent = currentStudentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginateStudents = (pageNumber) => {
    setCurrentStudentPage(pageNumber);
  };

  const totalStudentPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleResetFilters = () => {
    setSelectedSubject('');
    setSearchTerm('');
  };

  const handleSuspendStudent = async (studentId, isSuspended) => {
    try {
      const action = isSuspended ? 'unsuspend' : 'suspend';
      const response = await axios.put(
        `${apiUrl}/api/admin/students/toggleSuspension/${studentId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the student in the list with the new suspension status
        setStudents(prevStudents =>
          prevStudents.map(student =>
            student._id === studentId
              ? { ...student, isSuspended: response.data.data.isSuspended }
              : student
          )
        );
        setRefreshStats(prev => prev + 1);

        // Show success toast
        toast.success(response.data.message);

        // Show info toast about what this means
        toast.info(
          response.data.data.isSuspended
            ? "Student will not be able to login while suspended"
            : "Student can now login again"
        );
      }
    } catch (error) {
      console.error(`Error ${isSuspended ? 'unsuspending' : 'suspending'} student:`, error);
      toast.error(error.response?.data?.message || `Failed to ${isSuspended ? 'unsuspend' : 'suspend'} student`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${apiUrl}/api/admin/students/${studentId}`,
        { withCredentials: true }
      );
      // Simulate network delay for fetching updated courses
      // await new Promise(resolve => setTimeout(resolve, 2000));

      if (response.data.success) {
        // Remove student from the list
        setStudents(prevStudents =>
          prevStudents.filter(student => student._id !== studentId)
        );
        setRefreshStats(prev => prev + 1);

        // Show success toast
        toast.success(`Student ${response.data.data.name} has been permanently removed`);

      }
    } catch (error) {
      // console.error('Error deleting student:', error);
      // console.error('Error deleting student:', error.response?.data?.error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to delete student');
    }
  };

  const handleStudentSelect = (studentId) => {
    // await fetchStudents();
    setSelectedStudents(prev => {
      const newSelection = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];

      // Update select all state
      setSelectAllStudents(
        filteredStudents.every(student =>
          newSelection.includes(student._id)
        )
      );

      return newSelection;
    });
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllStudents = (checked) => {
    setSelectAllStudents(checked);
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectAllCourses = (checked) => {
    setSelectAllCourses(checked);
    if (checked) {
      setSelectedCourses(courses.map(course => course._id));
    } else {
      setSelectedCourses([]);
    }
  };

  const renderCourseDetails = (course) => {
    if (!course || !course._id) {
      return null;
    }

    const selectedStudent = students.find(s => selectedStudents.includes(s._id));
    if (!selectedStudent || !selectedStudent.enrolledCourses) {
      return null;
    }

    const enrollment = selectedStudent.enrolledCourses.find(e =>
      e && e.course && e.course._id === course._id
    );
    if (!enrollment) {
      return null;
    }

    return (
      <div className="mt-2 text-sm">
        {/* <div className="flex justify-between">
          <span>Progress: {enrollment.progress}%</span>
          <span>{enrollment.completed ? 'Completed' : 'In Progress'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full ${enrollment.completed ? 'bg-green-600' : 'bg-blue-600'
              }`}
            style={{ width: `${enrollment.progress}%` }}
          ></div>
        </div> */}
      </div>
    );
  };

  const isCommonCourse = (courseId) => {
    if (!courseId || selectedStudents.length === 0) return false;

    const validStudents = students.filter(s =>
      s && s.enrolledCourses && Array.isArray(s.enrolledCourses)
    );

    if (selectedStudents.length === 1) {
      const student = validStudents.find(s => s._id === selectedStudents[0]);
      return student?.enrolledCourses?.some(enrollment =>
        enrollment?.course && enrollment.course._id === courseId
      ) || false;
    }

    return selectedStudents.every(studentId => {
      const student = validStudents.find(s => s._id === studentId);
      return student?.enrolledCourses?.some(enrollment =>
        enrollment?.course && enrollment.course._id === courseId
      ) || false;
    });
  };

  const handleAssignCourses = async () => {
    if (!selectedCourses.length || !selectedStudents.length) {
      toast.error('Please select both courses and students');
      return;
    }

    setLoadingAction({ isLoading: true, message: 'Assigning selected courses...' });
    try {
      // Simulate network delay (2 seconds)
      // await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post(
        `${apiUrl}/api/admin/assign-courses`,
        {
          studentIds: selectedStudents,
          courseIds: selectedCourses
        },
        { withCredentials: true }
      );
      // console.log(`response.data.data: `, response.data.data);

      if (response.data.success) {
        // Clear selections first
        setSelectedStudents([]);
        setSelectedCourses([]);
        setSelectAllStudents(false); // Reset select all state
        setSelectAllCourses(false);

        toast.success(response.data.message);

        // If we have detailed results, show additional info
        if (response.data.data?.results) {
          const { results } = response.data.data;
          if (results.length === 1) {
            // Single student case
            const result = results[0];
            if (result.alreadyAssigned > 0) {
              toast.info(`${result.alreadyAssigned} course(s) were already assigned`);
            }
          } else {
            // Multiple students case
            const alreadyAssigned = results.filter(r => r.alreadyAssigned === selectedCourses.length).length;
            if (alreadyAssigned > 0) {
              toast.info(`${alreadyAssigned} student(s) already had all courses`);
            }
          }
        }

        // Fetch updated data after showing toasts
        await fetchStudents();

      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error('Error assigning courses:', error);
      toast.error(error.response?.data?.message || 'Failed to assign courses');
    } finally {
      setLoadingAction({ isLoading: false, message: '' });
    }
  };

  const handleRemoveCourses = async () => {
    if (!selectedCourses.length || !selectedStudents.length) {
      toast.error('Please select both courses and students');
      return;
    }

    setLoadingAction({ isLoading: true, message: 'Removing selected courses...' });
    try {
      // Simulate network delay (2 seconds)
      // await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post(
        `${apiUrl}/api/admin/unassign-courses`,
        {
          studentIds: selectedStudents,
          courseIds: selectedCourses
        },
        { withCredentials: true }
      );
      // console.log(`response.data.data: `, response.data.data);

      if (response.data.success) {
        // Show appropriate message based on response
        toast.success(response.data.message);

        // If we have detailed results, show additional info
        if (response.data.data?.results) {
          const { results } = response.data.data;
          if (results.length === 1) {
            // Single student case
            const result = results[0];
            if (result.notEnrolled > 0) {
              toast.info(`${result.notEnrolled} course(s) were not enrolled`);
            }
          } else {
            // Multiple students case
            const notEnrolled = results.filter(r => r.notEnrolled === selectedCourses.length).length;
            if (notEnrolled > 0) {
              toast.info(`${notEnrolled} student(s) were not enrolled in any of the selected courses`);
            }
          }
        }

        // Clear selections
        setSelectedStudents([]);
        setSelectedCourses([]);
        setSelectAllStudents(false);
        setSelectAllCourses(false);

        // Fetch updated data
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error removing courses:', error);
      toast.error(error.response?.data?.message || 'Failed to remove courses');
    } finally {
      setLoadingAction({ isLoading: false, message: '' });
    }
  };

  const handleFilterChange = async (type, value) => {
    if (type === 'subject') {
      setSelectedSubject(value);
    }

    // Clear previous selections
    setSelectedStudents([]);
    setAllCourses([]);

    // Filter students based on subject
    const filteredStudents = students.filter(student => {
      if (!value) return true; // Show all if no filter
      return student.subject === value;
    });

    // Auto-select filtered students
    if (value) {
      const studentIds = filteredStudents.map(student => student._id);
      setSelectedStudents(studentIds);

      // Get all available courses for the subject
      try {
        const response = await axios.get(`${apiUrl}/api/courses`, {
          params: { subject: value },
          withCredentials: true
        });
        setAllCourses(response.data.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Error fetching courses');
      }
    }
  };

  const handleStudentRowClick = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  useEffect(() => {
    setCurrentStudentPage(1);
    setSelectAllStudents(false);
    setSelectedStudents([]);
  }, [selectedSubject, searchTerm]);

  useEffect(() => {
    setCurrentCoursePage(1);
  }, [courseSearchTerm]);

  useEffect(() => {
    setCurrentStudentPage(1);
  }, [studentSearchTerm, selectedSubject]);

  // Update useEffect to refetch when page changes
  useEffect(() => {
    fetchCourses();
  }, [coursePagination.currentPage]);

  // Update useEffect to refetch when search changes
  useEffect(() => {
    setCoursePagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCourses();
  }, [courseSearchTerm]);

  // Update course pagination handler
  const paginateCourses = (pageNumber) => {
    setCoursePagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  };

  // Remove client-side filtering since backend handles it now
  const currentCourses = courses;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {globalLoading && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Updating course...</p>
          </div>
        </div>
      )}
      {suspendLoading && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Toggling Suspension...</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className='mb-10'>
          <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
          {/* <Stats /> */}
          <Stats refreshTrigger={refreshStats} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Student Management</h1>

          {/* Filters */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 items-center flex-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full p-2 pl-8 border rounded-md"
                />
                <BiSearch className="absolute left-2 top-3 text-gray-400" />
              </div>
              <select
                className="border rounded-md p-2 min-w-[150px]"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subject.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="w-full p-2 pl-8 border rounded-md"
              />
              <BiSearch className="absolute left-2 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Student List - Left Side */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Select Students</h2>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectAllStudents}
                    onChange={(e) => handleSelectAllStudents(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Select All</span>
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name/Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map(student => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStudentRowClick(student._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentSelect(student._id)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={e => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSuspendStudent(student._id, student.isSuspended)}
                              className={`transition-colors duration-200 ${student.isSuspended
                                ? 'text-green-600 hover:text-green-800' // Green for unsuspend
                                : 'text-red-600 hover:text-red-800'     // Red for suspend
                                }`}
                              title={student.isSuspended ? "Click to unsuspend" : "Click to suspend"}
                            >
                              <FaBan className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Delete student"
                            >
                              <BiTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalStudentPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => paginateStudents(currentStudentPage - 1)}
                    disabled={currentStudentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalStudentPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginateStudents(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentStudentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginateStudents(currentStudentPage + 1)}
                    disabled={currentStudentPage === totalStudentPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Course Selection - Right Side */}
            <div className="w-1/3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assigned Courses</h2>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectAllCourses}
                    onChange={(e) => handleSelectAllCourses(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Select All</span>
                </label>
              </div>
              {currentCourses.map(course => (
                <div
                  key={course._id}
                  className={`p-4 border rounded-lg cursor-pointer mb-2 ${isCommonCourse(course._id)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white'
                    }`}
                  onClick={() => handleCourseSelect(course._id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => handleCourseSelect(course._id)}
                      className="mt-1 mr-3"
                      disabled={!selectedStudents.length}
                    />
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.subject}</p>
                      {isCommonCourse(course._id) && renderCourseDetails(course)}
                    </div>
                  </div>
                </div>
              ))}
              {selectedStudents.length > 0 && selectedCourses.length > 0 && (
                <div className="flex gap-4">
                  <button
                    onClick={handleAssignCourses}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Assign Selected Courses
                  </button>
                  <button
                    onClick={handleRemoveCourses}
                    className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Remove Selected Courses
                  </button>
                </div>
              )}
              {/* Course Pagination */}
              {coursePagination.totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => paginateCourses(coursePagination.currentPage - 1)}
                    disabled={coursePagination.currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(coursePagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginateCourses(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${coursePagination.currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginateCourses(coursePagination.currentPage + 1)}
                    disabled={coursePagination.currentPage === coursePagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <CourseManagement /> */}
      <CourseManagement refreshStats={handleRefreshStats} onGlobalLoading={handleGlobalLoading} onSuspendLoading={handleSuspendLoading} />
      <ActionLoader isLoading={loadingAction.isLoading} message={loadingAction.message} />
    </div>
  );
};

export default AdminDashboard;