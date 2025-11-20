# MongoDB Setup Guide for Project Bolt

## 🚀 Quick Start

### 1. Install MongoDB

#### Option A: Local MongoDB Installation
```bash
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Copy the example file
cp backend/env.example backend/.env
```

Edit `backend/.env` with your MongoDB connection details:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/project-bolt

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-bolt

# Other required variables
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Test Connection

```bash
# Test MongoDB connection
node testConnection.js

# Expected output:
# 🧪 Testing MongoDB Connection...
# 1️⃣ Attempting to connect to MongoDB...
# ✅ MongoDB Connected: localhost
# 📊 Database: project-bolt
# 🔌 Port: 27017
# 2️⃣ Checking connection status...
# 📊 Connection Status: { isConnected: true, readyState: 1, ... }
# 3️⃣ Testing database ping...
# 🏓 Ping Result: { success: true, message: 'Database connection is healthy' }
# ✅ MongoDB connection test completed successfully!
```

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 6. Seed the Database (Optional)

```bash
# Seed with sample data
node seeder/seedDatabase.js

# This will create:
# - 5 sample users (1 admin, 4 regular users)
# - 3 sample projects
# - 5 sample tasks
# - Admin credentials: john.doe@example.com / password123
```

## 🔧 Configuration Details

### Database Connection Options

The database configuration in `backend/config/database.js` includes:

- **Connection Pooling**: Up to 10 concurrent connections
- **Timeout Handling**: 5-second server selection timeout
- **Socket Management**: 45-second socket timeout
- **IPv4 Preference**: Uses IPv4 for better compatibility
- **Error Handling**: Comprehensive error logging and reconnection
- **Graceful Shutdown**: Proper cleanup on application termination

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/project-bolt` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:3000` |

## 🗄️ Database Models

### User Model
- **Fields**: name, email, password, avatar, role, isActive, lastLogin
- **Features**: Password hashing, role-based access, virtual fields
- **Indexes**: email (unique), role

### Project Model
- **Fields**: name, key, description, owner, members, status, visibility, tags
- **Features**: Member management, role-based permissions, project settings
- **Indexes**: key (unique), owner, status, members, tags

### Task Model
- **Fields**: title, description, status, priority, type, project, assignee, reporter
- **Features**: Time tracking, comments, attachments, dependencies
- **Indexes**: project, assignee, status, priority, dueDate

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### 2. Authentication Failed
- Verify username/password in connection string
- Check if user has proper permissions
- Ensure database exists

#### 3. Network Issues
- Check firewall settings
- Verify MongoDB is listening on correct port
- For Atlas, ensure IP is whitelisted

#### 4. Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F
```

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📊 Monitoring

### Health Check Endpoint
```bash
GET http://localhost:5000/health
```

### Database Status
```javascript
import { getDBStatus } from './config/database.js';

const status = getDBStatus();
console.log(status);
// Output: { isConnected: true, readyState: 1, host: 'localhost', port: 27017, name: 'project-bolt' }
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets in production
3. **Database Access**: Limit database user permissions
4. **Network Security**: Use VPN for production databases
5. **Regular Updates**: Keep MongoDB and dependencies updated

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Node.js MongoDB Driver](https://mongodb.github.io/node-mongodb-native/)

## 🆘 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify MongoDB is running and accessible
3. Test connection with `node testConnection.js`
4. Check environment variables are set correctly
5. Ensure all dependencies are installed

---

**Happy Coding! 🚀**
