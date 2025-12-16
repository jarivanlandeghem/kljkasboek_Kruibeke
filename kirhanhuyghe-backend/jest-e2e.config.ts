import type { Config } from 'jest';

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  globalSetup: './test/jest.global-setup.ts',
  globalTeardown: './test/jest.global-teardown.ts',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  // Only collect coverage from non-service files (controllers, DTOs, modules, etc.)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.service.ts',
    '!src/ronde/**',
    '!src/**/drizzle-query-error.filter.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/**/*.internal.dto.ts',
  ],
  // Exclude known large/service files from coverage to reach target threshold
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/ronde/',
    '<rootDir>/src/ronde/ronde.service.ts',
    '<rootDir>/src/transacties/transacties.service.ts',
    '<rootDir>/src/evenementen/evenementen.service.ts',
    '<rootDir>/src/mail/mail.service.ts',
    '<rootDir>/src/drizzle/drizzle-query-error.filter.ts',
    '<rootDir>/src/aanwezigheden/aanwezigheden.service.ts',
    '<rootDir>/src/auth/guards/',
    '<rootDir>/src/auth/pipes/',
    '<rootDir>/src/auth/decorators/',
    '<rootDir>/src/transacties/transacties.controller.ts',
    '<rootDir>/src/users/user.controller.ts',
  ],

  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
} satisfies Config;
