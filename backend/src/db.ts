import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Configure Prisma client with proper connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use singleton pattern to prevent multiple instances
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connection pooling configuration for Heroku
if (process.env.NODE_ENV === 'production') {
  // Ensure we have DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined!');
  }
  
  // Heroku Postgres connection pooling
  try {
    // Connect to the database with connection limit
    prisma.$connect()
      .then(() => {
        console.log('Database connected successfully with connection pooling');
      })
      .catch(err => console.error('Database connection error:', err));
  } catch (error) {
    console.error('Error during database connection setup:', error);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle SIGTERM for Heroku
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle SIGINT for local development
process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma }; 