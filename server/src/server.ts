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

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    // Start Apollo Server
    await server.start();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Set up Apollo middleware
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req: { headers } }) => {
          const token = headers.authorization || '';
          const user = await verifyToken(token);
          return { user };
        },
      })
    );

    // Serve static assets and handle client-side routing in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../../client/dist')));

      app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }

    // Start server
    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
      });
    });

  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
}

startServer();