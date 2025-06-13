module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files
    '**/*.js',   // Ignore all JS files
    '/node_modules/**/*',
    '.eslintrc.js'
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'indent': ['error', 2],
    'max-len': ['error', { 
      code: 120,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    'require-jsdoc': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Turn off explicit any warnings
    'import/no-unresolved': 'off' // Disable import resolution errors
  },
};
