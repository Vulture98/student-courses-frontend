# 🎓 Academy - Student Course Management System

A comprehensive web application for managing educational courses, student enrollments, and academic progress. Built with modern web technologies and featuring a sleek, user-friendly interface.

## ✨ Key Features

### 👨‍🎓 Student Features
- **Authentication**
  - Email/Password login
  - Google OAuth integration
  - Secure session management  

- **Course Management**
  - View available courses
  - Track course progress
  - Mark course as completed

- **Profile Management**
  - Update personal information
  - Track academic progress

### 👨‍💼 Admin Features
- **Student Management**
  - View all student details
  - Suspend/activate student accounts
  - Track student progress
  - View enrollment history

- **Course Management**
  - Create new courses
  - Update course details
  - Manage course materials
  - Delete courses
  - Suspend/activate courses

- **Performance Monitoring**
  - Track student performance
  - Generate progress reports
  - View course completion rates

- **Notification System**
  - Email notification on course completion

## 🛠️ Technical Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Axios** - API requests
- **React-Toastify** - Notifications
- **Google OAuth** - Authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email services

### Integrations
- **Make.com** - Workflow automation
  - Automated notifications
  - Student enrollment processing
  - Course status updates

## 📱 User Interface

### Admin Panel
- Comprehensive dashboard
- Student management interface
- Course management tools
- Analytics visualization

## 🔒 Security Features
- JWT-based authentication
- Password encryption
- Role-based access control
- Session management
- Input validation

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vulture98/student-courses-frontend
   cd student-courses-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000 Or Backend deployed URL
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 👥 User Roles

### Student
- Register/Login to the platform
- Browse available courses
- Track progress
- Update profile

### Admin
- Manage student accounts
- Create/Edit courses
- Track performance

## 🔄 Workflow

### Student Workflow
1. Register/Login to account
2. Browse available courses

### Admin Workflow
1. Login to admin panel
2. Manage courses and students

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
