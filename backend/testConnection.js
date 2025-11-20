import { connectDB, getDBStatus, testConnection } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const testMongoDBConnection = async () => {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  try {
    // Test connection
    console.log('1️⃣ Attempting to connect to MongoDB...');
    await connectDB();
    
    // Get connection status
    console.log('\n2️⃣ Checking connection status...');
    const status = getDBStatus();
    console.log('📊 Connection Status:', status);
    
    // Test ping
    console.log('\n3️⃣ Testing database ping...');
    const pingResult = await testConnection();
    console.log('🏓 Ping Result:', pingResult);
    
    console.log('\n✅ MongoDB connection test completed successfully!');
    
    // Close connection
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB connection test failed:', error.message);
    process.exit(1);
  }
};

testMongoDBConnection();
