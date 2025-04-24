import { createMocks } from 'node-mocks-http';

// Mock Prisma client
export const mockPrisma = {
  movie: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  seat: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock auth middleware
export const mockAuth = {
  withAdminAuth: jest.fn().mockImplementation((handler) => handler),
  withAuth: jest.fn().mockImplementation((handler) => handler),
  isAdmin: jest.fn().mockReturnValue(true),
};

// Helper function to create mock requests
export const createMockRequest = (options: {
  method?: string;
  body?: any;
  query?: any;
  headers?: any;
}) => {
  return createMocks({
    method: options.method as 'GET' | 'POST' || 'GET',
    body: options.body || {},
    query: options.query || {},
    headers: options.headers || {},
  });
}; 