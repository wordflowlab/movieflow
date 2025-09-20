// Test setup file for Jest
// Mock environment variables and global configurations

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VOLCANO_ACCESS_KEY = 'test-access-key';
process.env.VOLCANO_SECRET_KEY = 'test-secret-key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});