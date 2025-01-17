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

async function startServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 3001;

    console.log('Creating Apollo Server...');
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      },
    });

    console.log('Starting Apollo Server...');
    await server.start();
    console.log('Apollo Server started successfully');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Set up Apollo middleware with logging
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Log incoming GraphQL requests
          console.log('GraphQL Request:', {
            operation: req.body.operationName,
            variables: req.body.variables
          });

          const token = req.headers.authorization || '';
          const user = await verifyToken(token);
          return { user };
        },
      })
    );

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../../client/dist')));
      app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    });

    // MongoDB connection is independent of server startup
    console.log('Setting up database connection...');
    
    db.once('open', () => {
      console.log('✅ Database connected successfully');
    });

    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
}

// Initialize server
console.log('0. Beginning server startup...');
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});