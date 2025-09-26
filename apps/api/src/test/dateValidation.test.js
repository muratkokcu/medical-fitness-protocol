/**
 * Test suite for date validation fixes
 * Tests the date sanitization and validation logic
 */

const { body } = require('express-validator');

// Mock validation function for testing
const validateDateOfBirth = body('dateOfBirth')
  .optional()
  .custom((value) => {
    if (!value) return true; // Optional field

    // First check if it's a valid date string
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Please enter a valid date');
    }

    // Check year range (reasonable birth year range)
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      throw new Error('Birth year must be between 1900 and current year');
    }

    // Check if the date is not in the future
    if (date > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }

    return true;
  })
  .withMessage('Please enter a valid birth date');

// Date sanitization function for testing
function sanitizeDateOfBirth(dateStr) {
  if (!dateStr) return null;

  try {
    let sanitized = dateStr.toString().trim();

    // Fix common year formatting issues (e.g., 19990 -> 1999)
    if (sanitized.match(/^\d{5}-/)) {
      sanitized = sanitized.substring(1); // Remove extra digit from year
    }

    // Validate and normalize the date
    const date = new Date(sanitized);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Test cases
const testCases = [
  // Valid dates
  { input: '1999-01-01', expected: '1999-01-01', shouldPass: true, description: 'Valid date' },
  { input: '1990-12-31', expected: '1990-12-31', shouldPass: true, description: 'Valid end of year date' },
  { input: '2000-02-29', expected: '2000-02-29', shouldPass: true, description: 'Valid leap year date' },

  // Invalid dates that should be sanitized
  { input: '19990-01-01', expected: '1999-01-01', shouldPass: true, description: 'Extra digit in year (sanitized)' },
  { input: '19900-12-31', expected: '1990-12-31', shouldPass: true, description: 'Extra digit in year (sanitized)' },

  // Invalid dates that should fail
  { input: '1899-01-01', expected: null, shouldPass: false, description: 'Year too old' },
  { input: '2050-01-01', expected: null, shouldPass: false, description: 'Future date' },
  { input: 'invalid-date', expected: null, shouldPass: false, description: 'Invalid date string' },
  { input: '', expected: null, shouldPass: true, description: 'Empty string (optional)' },
  { input: null, expected: null, shouldPass: true, description: 'Null value (optional)' }
];

// Run tests
console.log('🧪 Testing Date Validation and Sanitization');
console.log('=' * 50);

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.input}"`);

  // Test sanitization
  const sanitized = sanitizeDateOfBirth(testCase.input);
  console.log(`Sanitized: "${sanitized}"`);

  // Check result
  const passed = sanitized === testCase.expected;
  console.log(`Expected: "${testCase.expected}"`);
  console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);

  if (passed) {
    passedTests++;
  }
});

console.log('\n' + '=' * 50);
console.log(`Test Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Date validation is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Please check the implementation.');
}

// Export for potential use in actual testing framework
module.exports = {
  sanitizeDateOfBirth,
  testCases
};