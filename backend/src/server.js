require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(config.port, () => {
    console.log(`\n🌍 ViewPoint API Server`);
    console.log(`   Environment : ${config.nodeEnv}`);
    console.log(`   Port        : ${config.port}`);
    console.log(`   URL         : http://localhost:${config.port}`);
    console.log(`   Health      : http://localhost:${config.port}/api/health\n`);
  });
};

startServer();

