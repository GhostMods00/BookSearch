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
    console.log('🚀 Starting server initialization...');

    const app = express();
    const PORT = process.env.PORT || 3001;

    console.log('📦 Creating Apollo Server...');
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    console.log('🌟 Starting Apollo Server...');
    await server.start();
    console.log('✨ Apollo Server started successfully');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    console.log('🔗 Setting up Apollo middleware...');
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization || '';
          const user = await verifyToken(token);
          return { user };
        },
      })
    );

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../../client/build')));
      app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, '../../client/build/index.html'));
      });
    }

    console.log('📡 Waiting for database connection...');
    
    db.once('open', () => {
      app.listen(PORT, () => {
        console.log('✅ Database connected successfully');
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`🎯 GraphQL available at http://localhost:${PORT}/graphql`);
      });
    });

  } catch (error) {
    console.error('❌ Server initialization error:', error);
  }
}

startServer().catch(console.error);