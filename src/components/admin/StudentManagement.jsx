import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaBan, FaCheck, FaTimes } from 'react-icons/fa';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [newlySelectedCourses, setNewlySelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/students`, { withCredentials: true }),
        axios.get(`${apiUrl}/api/courses`, { withCredentials: true })
      ]);
      setStudents(usersRes.data.data);
      setCourses(coursesRes.data.data);
    } catch (error) {
      toast.error('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleCourseSelect = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
      setNewlySelectedCourses(newlySelectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
      setNewlySelectedCourses([...newlySelectedCourses, courseId]);
    }
  };

  const handleAssignCourses = async () => {
    try {
      await Promise.all(
        selectedStudents.map(userId =>
          axios.post(`${apiUrl}/api/student/assign`, {
            userIds: [userId],
            courseIds: selectedCourses
          }, { withCredentials: true })
        )
      );
      toast.success('Courses assigned successfully');
      fetchData();
      setNewlySelectedCourses([]);
    } catch (error) {
      toast.error('Error assigning courses');
      console.error(error);
    }
  };

  const handleDeassignCourses = async () => {
    try {
      await Promise.all(
        selectedStudents.map(userId =>
          axios.post(`${apiUrl}/api/student/unassign`, {
            userIds: [userId],
            courseIds: selectedCourses
          }, { withCredentials: true })
        )
      );
      toast.success('Courses unassigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Error unassigning courses');
      console.error(error);
    }
  };

  const handleSuspendStudent = async (studentId) => {
    try {
      await axios.patch(`${apiUrl}/api/admin/students/${studentId}/suspend`, {}, 
        { withCredentials: true }
      );
      toast.success('Student suspended');
      fetchData();
    } catch (error) {
      toast.error('Error suspending student');
      console.error(error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${apiUrl}/api/admin/students/${studentId}`, 
          { withCredentials: true }
        );
        toast.success('Student deleted');
        fetchData();
      } catch (error) {
        toast.error('Error deleting student');
        console.error(error);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !subjectFilter || 
      student.enrolledCourses.some(course => 
        course.subjectCategory.toLowerCase() === subjectFilter.toLowerCase()
      );
    
    const matchesLevel = !levelFilter || 
      student.enrolledCourses.some(course => 
        course.levelCategory.toLowerCase() === levelFilter.toLowerCase()
      );
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const filteredCourses = courses.filter(course => {
    const matchesSubject = !subjectFilter || 
      course.subjectCategory.toLowerCase() === subjectFilter.toLowerCase();
    
    const matchesLevel = !levelFilter || 
      course.levelCategory.toLowerCase() === levelFilter.toLowerCase();
    
    return matchesSubject && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search students by name or email..."
            className="border rounded p-2 flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            <option value="physics">Physics</option>
            <option value="mathematics">Mathematics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="computer science">Computer Science</option>
            <option value="literature">Literature</option>
            <option value="history">History</option>
            <option value="economics">Economics</option>
            <option value="environmental science">Environmental Science</option>
            <option value="psychology">Psychology</option>
          </select>
          <select
            className="border rounded p-2"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Panel - Students */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Students ({filteredStudents.length})</h2>
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div
                  key={student._id}
                  className={`border rounded p-3 flex items-center justify-between ${
                    selectedStudents.includes(student._id) ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelect(student._id)}
                      className="h-4 w-4"
                    />
                    <div>
                      <h3
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/admin/students/${student._id}`)}
                      >
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.enrolledCourses.map((course, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-200 rounded px-2 py-1"
                            >
                              {course.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSuspendStudent(student._id)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title={student.isSuspended ? "Unsuspend Student" : "Suspend Student"}
                    >
                      <FaBan />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Student"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Courses */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Available Courses ({filteredCourses.length})</h2>
            <div className="space-y-2">
              {filteredCourses.map(course => (
                <div
                  key={course._id}
                  className={`border rounded p-3 flex items-center justify-between ${
                    selectedCourses.includes(course._id)
                      ? newlySelectedCourses.includes(course._id)
                        ? 'bg-green-50 border-green-500'
                        : 'bg-blue-50 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => handleCourseSelect(course._id)}
                      className="h-4 w-4"
                    />
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-blue-100 rounded px-2 py-1">
                          {course.subjectCategory}
                        </span>
                        <span className="text-xs bg-purple-100 rounded px-2 py-1">
                          {course.levelCategory}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {(selectedStudents.length > 0 && selectedCourses.length > 0) && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleAssignCourses}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Assign Selected Courses
                </button>
                <button
                  onClick={handleDeassignCourses}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deassign Selected Courses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
