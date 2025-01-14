import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import { fileURLToPath } from 'url';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { verifyToken } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create Apollo Server
console.log('Creating Apollo Server...');
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start Apollo Server
await server.start();
console.log('🚀 Apollo Server started successfully');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up Apollo middleware
app.use('/graphql', expressMiddleware(server, {
  context: async ({ req }) => {
    // Get the user token from the headers
    const token = req.headers.authorization || '';
    // Try to retrieve a user with the token
    const user = await verifyToken(token);
    // Add the user to the context
    return { user };
  },
}));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

console.log('Waiting for database connection...');
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌟 Database connected successfully`);
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📫 Use GraphQL at http://localhost:${PORT}/graphql`);
  });
});

// Add error handling for database connection
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});