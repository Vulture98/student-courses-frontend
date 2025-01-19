import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/students`, {
        withCredentials: true
      });
      setStudents(response.data.data);
    } catch (error) {
      console.log('Could not load students:', error.message);
      toast.error('Failed to load students');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/courses`, {
        withCredentials: true
      });
      setCourses(response.data.data);
    } catch (error) {
      console.log('Could not load courses:', error.message);
      toast.error('Failed to load courses');
    }
  };

  const handleStudentSelect = async (studentId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/students/${studentId}`, {
        withCredentials: true
      });
      setSelectedStudent(response.data.data);
    } catch (error) {
      console.log('Could not load student details:', error.message);
      toast.error('Failed to load student info');
    }
  };

  const isEnrolled = (courseId) => {
    if (!selectedStudent?.enrolledCourses) return false;
    return selectedStudent.enrolledCourses.some(
      enrollment => enrollment.course._id === courseId
    );
  };

  const handleCourseAssignment = async (studentId, courseId, shouldAssign) => {
    try {
      setLoading(true);
      if (shouldAssign) {
        await axios.post(
          `${apiUrl}/api/admin/assign-courses`,
          {
            studentId,
            courseIds: [courseId]
          },
          { withCredentials: true }
        );
        toast.success('Course assigned successfully');
      } else {
        await axios.post(
          `${apiUrl}/api/admin/unassign-courses`,
          {
            studentId,
            courseIds: [courseId]
          },
          { withCredentials: true }
        );
        toast.success('Course unassigned successfully');
      }
      // Refresh student data
      handleStudentSelect(studentId);
    } catch (error) {
      console.error('Error managing course assignment:', error);
      toast.error(shouldAssign ? 'Error assigning course' : 'Error unassigning course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>
      
      {/* Search and Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students by name or email..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student List */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Students</h2>
          <div className="border rounded">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">SELECT</th>
                  <th className="p-2 text-left">NAME/EMAIL</th>
                  <th className="p-2 text-left">CATEGORY</th>
                  <th className="p-2 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedStudent?._id === student._id}
                        onChange={() => handleStudentSelect(student._id)}
                      />
                    </td>
                    <td className="p-2">
                      <div>{student.name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </td>
                    <td className="p-2">{student.subject}</td>
                    <td className="p-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-800 ml-2">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Courses */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Assigned Courses</h2>
          <div className="border rounded p-4">
            {selectedStudent ? (
              <div>
                <h3 className="font-medium mb-2">
                  Courses for {selectedStudent.name}
                </h3>
                {courses.map(course => (
                  <div key={course._id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-600">{course.subject}</div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={isEnrolled(course._id)}
                        onChange={(e) => handleCourseAssignment(
                          selectedStudent._id,
                          course._id,
                          e.target.checked
                        )}
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Select a student to manage courses</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
