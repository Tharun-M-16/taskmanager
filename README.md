# 🚀 Project Bolt - MongoDB Integration

A comprehensive project management platform built with React, TypeScript, and MongoDB.

## 🏗️ **Architecture**

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Database**: MongoDB with Mongoose ODM

## 📋 **Prerequisites**

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

## 🗄️ **MongoDB Setup**

### **Option 1: Local MongoDB Installation**

1. **Install MongoDB Community Edition**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb
   
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   ```

2. **Start MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

### **Option 2: MongoDB Atlas (Cloud)**

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select cloud provider & region
   - Click "Create"

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

## 🚀 **Quick Start**

### **1. Clone and Install Dependencies**

```bash
# Clone the repository
git clone <your-repo-url>
cd project-bolt

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### **2. Environment Configuration**

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit backend/.env with your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/project-bolt
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-bolt

JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### **3. Start MongoDB**

```bash
# Start MongoDB service (if not already running)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

### **4. Seed Database**

```bash
# Navigate to backend directory
cd backend

# Run database seeder
node seeder/seedDatabase.js
```

**Expected Output:**
```
🌱 Starting database seeding...
✅ MongoDB Connected for seeding
🗑️ Database cleared

👥 Seeding users...
👤 Created user: John Doe (john.doe@example.com)
👤 Created user: Jane Smith (jane.smith@example.com)
...

📁 Seeding projects...
📁 Created project: Project Bolt (BOLT)
📁 Created project: E-commerce Platform (ECOMM)
...

✅ Seeding tasks...
✅ Created task: Setup project structure
✅ Created task: Design user interface
...

🎉 Database seeding completed successfully!
📊 Created 5 users, 3 projects, and 5 tasks

🔑 Admin Login Credentials:
   Email: john.doe@example.com
   Password: password123
   Role: admin
```

### **5. Start Backend Server**

```bash
# In backend directory
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# 🌍 Environment: development
# 🔗 Health check: http://localhost:5000/health
# 📱 Frontend: http://localhost:3000
```

### **6. Start Frontend (LAN accessible)**

```bash
# In project root directory
npm run dev

# Expected output (ports may differ):
# Local:   http://localhost:5177/
# Network: http://<your-lan-ip>:5177/

# If calling backend over LAN, set frontend API base URL:
# Create .env file in project root with:
# VITE_API_URL=http://<your-lan-ip>:5000/api
```

## 🔐 **Default Login Credentials**

After seeding the database, you can login with:

- **Admin User:**
  - Email: `john.doe@example.com`
  - Password: `password123`
  - Role: `admin`

- **Regular Users:**
  - Email: `jane.smith@example.com`
  - Password: `password123`
  - Role: `user`

## 🗄️ **Database Structure**

### **Collections**

1. **Users** - User accounts and authentication
2. **Projects** - Project information and team management
3. **Tasks** - Task details, assignments, and tracking

### **Key Features**

- **User Management**: Role-based access control (admin/user)
- **Project Control**: Create, edit, delete projects
- **Task Management**: Full CRUD operations with status tracking
- **Admin Panel**: Comprehensive website administration
- **Real-time Updates**: Live data synchronization

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification
- `POST /api/auth/refresh` - Token refresh

### **Admin (Protected)**
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/projects` - Project management
- `DELETE /api/admin/projects/:id` - Delete project
- `GET /api/admin/tasks` - Task management
- `DELETE /api/admin/tasks/:id` - Delete task

### **Health Check**
- `GET /health` - Server status

## 🛠️ **Development Commands**

```bash
# Backend
cd backend
npm run dev          # Start development server
npm start           # Start production server

# Frontend
npm run dev         # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔍 **Troubleshooting**

### **MongoDB Connection Issues**

1. **Check MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services list | grep mongodb
   
   # Ubuntu
   sudo systemctl status mongod
   ```

2. **Verify Connection String**
   ```bash
   # Test connection
   mongosh "mongodb://localhost:27017/project-bolt"
   ```

3. **Check Firewall/Port**
   - Ensure port 27017 is open
   - Check firewall settings

### **Backend Issues**

1. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Environment Variables**
   - Ensure `.env` file exists in backend directory
   - Check variable names and values

### **Frontend Issues**

1. **API Connection**
   - Verify backend is running on port 5000
   - Check CORS settings
   - Verify API_BASE_URL in environment

## 📊 **Database Monitoring**

### **MongoDB Compass (GUI)**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `project-bolt` database

### **Command Line**
```bash
# Connect to database
mongosh "mongodb://localhost:27017/project-bolt"

# Show collections
show collections

# Query users
db.users.find().pretty()

# Query projects
db.projects.find().pretty()

# Query tasks
db.tasks.find().pretty()
```

## 🚀 **Deployment**

### **Backend Deployment**
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Use PM2 or similar process manager

### **Frontend Deployment**
1. Build with `npm run build`
2. Deploy `dist` folder to hosting service
3. Set `VITE_API_URL` environment variable

## 📝 **Environment Variables**

### **Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/project-bolt
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For issues and questions:
1. Check troubleshooting section
2. Review MongoDB documentation
3. Open GitHub issue
4. Contact development team

---

**Happy Coding! 🎉**
