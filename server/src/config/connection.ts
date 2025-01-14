import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks')
  .then(() => console.log('🎯 Connected to MongoDB successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('📚 MongoDB connection opened successfully');
});

export default db;