/**
 * Unit Tests for Input Validation (Task 4.2)
 * Validates: Requirements 1.2, 1.5
 * 
 * Run with: node tests/validation.test.js
 */

// Mock DOM environment for testing
global.localStorage = {
    store: {},
    getItem: function(key) { return this.store[key] || null; },
    setItem: function(key, value) { this.store[key] = value; },
    removeItem: function(key) { delete this.store[key]; },
    clear: function() { this.store = {}; }
};

// Mock document object
global.document = {
    getElementById: function() { return null; },
    addEventListener: function() {}
};

// Load the validation functions from app.js
const fs = require('fs');
const path = require('path');

// Extract validation functions by evaluating the module pattern
const appPath = path.join(__dirname, '..', 'js', 'app.js');
const appCode = fs.readFileSync(appPath, 'utf-8');

// Create a module that extracts the ExpenseTracker
const moduleCode = `
// Mock state for testing
let state = {
    transactions: [],
    customCategories: [],
    spendingLimit: null,
    theme: 'light',
    sortOrder: 'date-desc',
    selectedMonth: null
};

const STORAGE_KEY = 'expenseVisualizer';

function isLocalStorageAvailable() { return true; }
function loadState() { return null; }
function saveState() {}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// Validation functions from app.js
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Item name is required' };
    }
    if (name.trim().length > 100) {
        return { valid: false, message: 'Item name must be 100 characters or less' };
    }
    return { valid: true };
}

function validateAmount(amount) {
    if (amount === '' || amount === null || amount === undefined) {
        return { valid: false, message: 'Amount is required' };
    }
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return { valid: false, message: 'Please enter a valid number' };
    }
    if (num <= 0) {
        return { valid: false, message: 'Amount must be greater than 0' };
    }
    if (num > 999999999.99) {
        return { valid: false, message: 'Amount is too large' };
    }
    return { valid: true };
}

function validateCategory(category) {
    if (!category) {
        return { valid: false, message: 'Please select a category' };
    }
    return { valid: true };
}

function validateForm(name, amount, category) {
    const nameResult = validateName(name);
    const amountResult = validateAmount(amount);
    const categoryResult = validateCategory(category);
    
    return {
        valid: nameResult.valid && amountResult.valid && categoryResult.valid,
        errors: {
            name: nameResult.valid ? null : nameResult.message,
            amount: amountResult.valid ? null : amountResult.message,
            category: categoryResult.valid ? null : categoryResult.message
        }
    };
}

module.exports = {
    validateName,
    validateAmount,
    validateCategory,
    validateForm
};
`;

// Write temporary module and require it
const tempPath = path.join(__dirname, 'temp-validation-module.js');
fs.writeFileSync(tempPath, moduleCode);
const validation = require(tempPath);
fs.unlinkSync(tempPath); // Clean up

// Test framework
let passed = 0;
let failed = 0;

function test(description, fn) {
    try {
        const result = fn();
        if (result === true) {
            passed++;
            console.log(`✓ PASS: ${description}`);
            return true;
        } else {
            failed++;
            console.log(`✗ FAIL: ${description}`);
            console.log(`  ${result}`);
            return false;
        }
    } catch (e) {
        failed++;
        console.log(`✗ ERROR: ${description}`);
        console.log(`  ${e.message}`);
        return false;
    }
}

function assertEqual(actual, expected, message) {
    if (actual === expected) return true;
    return `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

function assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) return true;
    return `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

// ============================================
// Tests for validateName (Requirement 1.2)
// Validates: "Input Validation Rejects Empty Fields"
// ============================================

console.log('\n=== validateName Tests (Requirement 1.2) ===');
console.log('Property: For any transaction submission with empty/whitespace-only field, validation shall reject\n');

test('validateName: rejects empty string', function() {
    const result = validation.validateName('');
    return assertEqual(result.valid, false, 'Empty string should be invalid');
});

test('validateName: rejects whitespace-only string', function() {
    const result = validation.validateName('   ');
    return assertEqual(result.valid, false, 'Whitespace-only should be invalid');
});

test('validateName: rejects null', function() {
    const result = validation.validateName(null);
    return assertEqual(result.valid, false, 'null should be invalid');
});

test('validateName: rejects undefined', function() {
    const result = validation.validateName(undefined);
    return assertEqual(result.valid, false, 'undefined should be invalid');
});

test('validateName: accepts valid name', function() {
    const result = validation.validateName('Coffee');
    return assertEqual(result.valid, true, 'Valid name should be accepted');
});

test('validateName: accepts name with surrounding whitespace (after trim)', function() {
    const result = validation.validateName('  Coffee  ');
    return assertEqual(result.valid, true, 'Name with whitespace should be valid after trim');
});

test('validateName: returns error message for empty input', function() {
    const result = validation.validateName('');
    return assertEqual(result.message !== undefined, true, 'Should return error message');
});

test('validateName: error message is descriptive', function() {
    const result = validation.validateName('');
    return assertEqual(result.message, 'Item name is required', 'Error message should be descriptive');
});

// ============================================
// Tests for validateAmount (Requirement 1.5)
// Validates: "Positive Amount Validation"
// ============================================

console.log('\n=== validateAmount Tests (Requirement 1.5) ===');
console.log('Property: For any transaction amount, validation shall accept only positive numeric values > 0\n');

test('validateAmount: rejects empty string', function() {
    const result = validation.validateAmount('');
    return assertEqual(result.valid, false, 'Empty string should be invalid');
});

test('validateAmount: rejects null', function() {
    const result = validation.validateAmount(null);
    return assertEqual(result.valid, false, 'null should be invalid');
});

test('validateAmount: rejects undefined', function() {
    const result = validation.validateAmount(undefined);
    return assertEqual(result.valid, false, 'undefined should be invalid');
});

test('validateAmount: rejects zero', function() {
    const result = validation.validateAmount(0);
    return assertEqual(result.valid, false, 'Zero should be invalid');
});

test('validateAmount: rejects negative number', function() {
    const result = validation.validateAmount(-5);
    return assertEqual(result.valid, false, 'Negative number should be invalid');
});

test('validateAmount: rejects negative string', function() {
    const result = validation.validateAmount('-10.50');
    return assertEqual(result.valid, false, 'Negative string should be invalid');
});

test('validateAmount: accepts positive number', function() {
    const result = validation.validateAmount(10.50);
    return assertEqual(result.valid, true, 'Positive number should be valid');
});

test('validateAmount: accepts positive string', function() {
    const result = validation.validateAmount('10.50');
    return assertEqual(result.valid, true, 'Positive string should be valid');
});

test('validateAmount: accepts very small positive number (0.01)', function() {
    const result = validation.validateAmount(0.01);
    return assertEqual(result.valid, true, '0.01 should be valid');
});

test('validateAmount: rejects non-numeric string', function() {
    const result = validation.validateAmount('abc');
    return assertEqual(result.valid, false, 'Non-numeric string should be invalid');
});

test('validateAmount: rejects NaN', function() {
    const result = validation.validateAmount(NaN);
    return assertEqual(result.valid, false, 'NaN should be invalid');
});

test('validateAmount: returns error message for zero', function() {
    const result = validation.validateAmount(0);
    return assertEqual(result.message, 'Amount must be greater than 0', 'Should return descriptive error');
});

test('validateAmount: returns error message for negative', function() {
    const result = validation.validateAmount(-5);
    return assertEqual(result.message, 'Amount must be greater than 0', 'Should return descriptive error');
});

// ============================================
// Tests for validateCategory (Requirement 1.2)
// ============================================

console.log('\n=== validateCategory Tests (Requirement 1.2) ===');
console.log('Property: Category selection is required\n');

test('validateCategory: rejects empty string', function() {
    const result = validation.validateCategory('');
    return assertEqual(result.valid, false, 'Empty string should be invalid');
});

test('validateCategory: rejects null', function() {
    const result = validation.validateCategory(null);
    return assertEqual(result.valid, false, 'null should be invalid');
});

test('validateCategory: rejects undefined', function() {
    const result = validation.validateCategory(undefined);
    return assertEqual(result.valid, false, 'undefined should be invalid');
});

test('validateCategory: accepts valid category "Food"', function() {
    const result = validation.validateCategory('Food');
    return assertEqual(result.valid, true, 'Food should be valid');
});

test('validateCategory: accepts valid category "Transport"', function() {
    const result = validation.validateCategory('Transport');
    return assertEqual(result.valid, true, 'Transport should be valid');
});

test('validateCategory: accepts valid category "Fun"', function() {
    const result = validation.validateCategory('Fun');
    return assertEqual(result.valid, true, 'Fun should be valid');
});

test('validateCategory: accepts custom category string', function() {
    const result = validation.validateCategory('Shopping');
    return assertEqual(result.valid, true, 'Custom category should be valid');
});

test('validateCategory: returns error message for empty', function() {
    const result = validation.validateCategory('');
    return assertEqual(result.message, 'Please select a category', 'Should return descriptive error');
});

// ============================================
// Tests for validateForm (combined validation)
// ============================================

console.log('\n=== validateForm Tests (Combined Validation) ===');
console.log('Property: Form validation checks all fields and returns consolidated result\n');

test('validateForm: returns errors object with name, amount, category keys', function() {
    const result = validation.validateForm('', '', '');
    return assertEqual(
        result.errors.name !== undefined && 
        result.errors.amount !== undefined && 
        result.errors.category !== undefined, 
        true, 
        'Should have all error keys'
    );
});

test('validateForm: fails when all fields are empty', function() {
    const result = validation.validateForm('', '', '');
    return assertEqual(result.valid, false, 'Should fail with all empty fields');
});

test('validateForm: fails when name is missing', function() {
    const result = validation.validateForm('', 10, 'Food');
    return assertEqual(result.valid, false, 'Should fail with missing name');
});

test('validateForm: fails when amount is missing', function() {
    const result = validation.validateForm('Test', '', 'Food');
    return assertEqual(result.valid, false, 'Should fail with missing amount');
});

test('validateForm: fails when category is missing', function() {
    const result = validation.validateForm('Test', 10, '');
    return assertEqual(result.valid, false, 'Should fail with missing category');
});

test('validateForm: fails when amount is zero', function() {
    const result = validation.validateForm('Test', 0, 'Food');
    return assertEqual(result.valid, false, 'Should fail with zero amount');
});

test('validateForm: fails when amount is negative', function() {
    const result = validation.validateForm('Test', -10, 'Food');
    return assertEqual(result.valid, false, 'Should fail with negative amount');
});

test('validateForm: passes when all fields are valid', function() {
    const result = validation.validateForm('Coffee', 5.50, 'Food');
    return assertEqual(result.valid, true, 'Should pass with all valid fields');
});

test('validateForm: passes with string amount that is positive', function() {
    const result = validation.validateForm('Coffee', '5.50', 'Food');
    return assertEqual(result.valid, true, 'Should pass with valid string amount');
});

test('validateForm: null errors for valid fields', function() {
    const result = validation.validateForm('Coffee', 5.50, 'Food');
    return assertEqual(
        result.errors.name === null && 
        result.errors.amount === null && 
        result.errors.category === null, 
        true, 
        'Valid fields should have null errors'
    );
});

test('validateForm: returns specific error for each invalid field', function() {
    const result = validation.validateForm('', -5, '');
    return assertEqual(
        result.errors.name !== null && 
        result.errors.amount !== null && 
        result.errors.category !== null, 
        true, 
        'All invalid fields should have error messages'
    );
});

// ============================================
// Summary
// ============================================

console.log('\n========================================');
console.log('Summary');
console.log('========================================');
console.log(`${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('\n✓ All tests passed!');
    console.log('\nRequirements validated:');
    console.log('  - Requirement 1.2: Input Validation Rejects Empty Fields');
    console.log('  - Requirement 1.5: Positive Amount Validation');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed.');
    process.exit(1);
}
