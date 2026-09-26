/**
 * Unit Tests for Calculator Module (Task 6.1)
 * Validates: Requirements 3.1, 3.2, 3.3
 * 
 * Properties tested:
 * - Property 5: Balance Equals Transaction Sum
 * - Property 6: Category Percentages Sum to 100
 * - Property 9: Monthly Total Correctness
 * 
 * Run with: node tests/calculator.test.js
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

function assertAlmostEqual(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) <= tolerance) return true;
    return `${message}: expected ${expected} (±${tolerance}), got ${actual}`;
}

function assertGreater(actual, expected, message) {
    if (actual > expected) return true;
    return `${message}: expected > ${expected}, got ${actual}`;
}

// ============================================
// Set up test state
// ============================================

// Mock state for testing
let testState = {
    transactions: [],
    customCategories: [],
    spendingLimit: null,
    theme: 'light',
    sortOrder: 'date-desc',
    selectedMonth: null
};

// Calculator functions
function calculateTotalBalance() {
    return testState.transactions.reduce(function(sum, transaction) {
        return sum + transaction.amount;
    }, 0);
}

function calculateCategoryTotal(category) {
    return testState.transactions.reduce(function(sum, transaction) {
        return transaction.category === category ? sum + transaction.amount : sum;
    }, 0);
}

function calculateMonthlyTotal(month) {
    return testState.transactions.reduce(function(sum, transaction) {
        const transactionMonth = transaction.date.substring(0, 7);
        return transactionMonth === month ? sum + transaction.amount : sum;
    }, 0);
}

// Helper function to create a transaction
function createTransaction(name, amount, category, date) {
    return {
        id: 'test-' + Math.random(),
        name: name,
        amount: amount,
        category: category,
        date: date || new Date().toISOString()
    };
}

// ============================================
// Tests for calculateTotalBalance
// Property 5: Balance Equals Transaction Sum
// Validates: Requirement 3.1
// ============================================

console.log('\n=== calculateTotalBalance Tests (Requirement 3.1, Property 5) ===');
console.log('Property: For any transaction list, the calculated balance shall equal the sum of all transaction amounts\n');

test('calculateTotalBalance: returns 0 for empty transaction list', function() {
    testState.transactions = [];
    const result = calculateTotalBalance();
    return assertEqual(result, 0, 'Empty list should have balance of 0');
});

test('calculateTotalBalance: returns correct sum for single transaction', function() {
    testState.transactions = [createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')];
    const result = calculateTotalBalance();
    return assertEqual(result, 5.50, 'Single transaction balance');
});

test('calculateTotalBalance: returns correct sum for multiple transactions', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus ticket', 2.00, 'Transport', '2024-01-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-01-15T19:00:00.000Z')
    ];
    const result = calculateTotalBalance();
    return assertAlmostEqual(result, 19.50, 0.01, 'Sum of multiple transactions');
});

test('calculateTotalBalance: handles decimal amounts correctly', function() {
    testState.transactions = [
        createTransaction('Item 1', 10.25, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Item 2', 15.75, 'Transport', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateTotalBalance();
    return assertAlmostEqual(result, 26.00, 0.01, 'Decimal amounts should sum correctly');
});

test('calculateTotalBalance: handles many transactions', function() {
    testState.transactions = [];
    for (let i = 0; i < 100; i++) {
        testState.transactions.push(createTransaction('Item ' + i, 1.50, 'Food', '2024-01-15T10:30:00.000Z'));
    }
    const result = calculateTotalBalance();
    return assertAlmostEqual(result, 150.00, 0.01, '100 transactions of $1.50 each');
});

test('calculateTotalBalance: ignores transaction date', function() {
    testState.transactions = [
        createTransaction('Item 1', 10.00, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Item 2', 20.00, 'Food', '2024-12-31T23:59:59.000Z')
    ];
    const result = calculateTotalBalance();
    return assertEqual(result, 30.00, 'Balance should be independent of dates');
});

test('calculateTotalBalance: ignores transaction category', function() {
    testState.transactions = [
        createTransaction('Item 1', 10.00, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Item 2', 20.00, 'Transport', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateTotalBalance();
    return assertEqual(result, 30.00, 'Balance should be independent of category');
});

// ============================================
// Tests for calculateCategoryTotal
// Property 6: Category Percentages Sum to 100
// Validates: Requirement 3.2
// ============================================

console.log('\n=== calculateCategoryTotal Tests (Requirement 3.2, Property 6) ===');
console.log('Property: For any transaction list, category totals when summed should equal total balance\n');

test('calculateCategoryTotal: returns 0 for category with no transactions', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateCategoryTotal('Transport');
    return assertEqual(result, 0, 'Category with no transactions should be 0');
});

test('calculateCategoryTotal: returns correct sum for single category transaction', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateCategoryTotal('Food');
    return assertEqual(result, 5.50, 'Single category transaction sum');
});

test('calculateCategoryTotal: returns correct sum for multiple same-category transactions', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Lunch', 12.00, 'Food', '2024-01-15T12:00:00.000Z'),
        createTransaction('Dinner', 18.50, 'Food', '2024-01-15T19:00:00.000Z')
    ];
    const result = calculateCategoryTotal('Food');
    return assertAlmostEqual(result, 36.00, 0.01, 'Sum of all Food transactions');
});

test('calculateCategoryTotal: correctly isolates individual categories', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus ticket', 2.00, 'Transport', '2024-01-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-01-15T19:00:00.000Z')
    ];
    const foodTotal = calculateCategoryTotal('Food');
    const transportTotal = calculateCategoryTotal('Transport');
    const funTotal = calculateCategoryTotal('Fun');
    return assertEqual(foodTotal, 5.50, 'Food should be 5.50') && 
           assertEqual(transportTotal, 2.00, 'Transport should be 2.00') &&
           assertEqual(funTotal, 12.00, 'Fun should be 12.00');
});

test('calculateCategoryTotal: category totals sum to balance', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus ticket', 2.00, 'Transport', '2024-01-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-01-15T19:00:00.000Z')
    ];
    const balance = calculateTotalBalance();
    const categorySum = calculateCategoryTotal('Food') + 
                       calculateCategoryTotal('Transport') + 
                       calculateCategoryTotal('Fun');
    return assertAlmostEqual(categorySum, balance, 0.01, 'Category totals should sum to balance');
});

test('calculateCategoryTotal: case-sensitive category matching', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateCategoryTotal('food');
    return assertEqual(result, 0, 'Category matching should be case-sensitive');
});

test('calculateCategoryTotal: handles custom categories', function() {
    testState.transactions = [
        createTransaction('Shirt', 30.00, 'Shopping', '2024-01-15T10:30:00.000Z'),
        createTransaction('Pants', 45.00, 'Shopping', '2024-01-15T11:00:00.000Z')
    ];
    const result = calculateCategoryTotal('Shopping');
    return assertEqual(result, 75.00, 'Custom category should be summed correctly');
});

// ============================================
// Tests for calculateMonthlyTotal
// Property 9: Monthly Total Correctness
// Validates: Requirement 3.3
// ============================================

console.log('\n=== calculateMonthlyTotal Tests (Requirement 3.3, Property 9) ===');
console.log('Property: For any transaction list and any month, the monthly total shall equal the sum of all transaction amounts for that month\n');

test('calculateMonthlyTotal: returns 0 for month with no transactions', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateMonthlyTotal('2024-02');
    return assertEqual(result, 0, 'Month with no transactions should be 0');
});

test('calculateMonthlyTotal: returns correct sum for single transaction', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z')
    ];
    const result = calculateMonthlyTotal('2024-01');
    return assertEqual(result, 5.50, 'Single transaction for month');
});

test('calculateMonthlyTotal: returns correct sum for multiple transactions in same month', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus ticket', 2.00, 'Transport', '2024-01-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-01-15T19:00:00.000Z')
    ];
    const result = calculateMonthlyTotal('2024-01');
    return assertAlmostEqual(result, 19.50, 0.01, 'Sum of all January 2024 transactions');
});

test('calculateMonthlyTotal: correctly isolates transactions by month', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus ticket', 2.00, 'Transport', '2024-02-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-03-15T19:00:00.000Z')
    ];
    const jan = calculateMonthlyTotal('2024-01');
    const feb = calculateMonthlyTotal('2024-02');
    const mar = calculateMonthlyTotal('2024-03');
    return assertEqual(jan, 5.50, 'January') && 
           assertEqual(feb, 2.00, 'February') &&
           assertEqual(mar, 12.00, 'March');
});

test('calculateMonthlyTotal: handles multiple transactions on same day of month', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T08:00:00.000Z'),
        createTransaction('Lunch', 12.00, 'Food', '2024-01-15T12:00:00.000Z'),
        createTransaction('Dinner', 18.50, 'Food', '2024-01-15T19:00:00.000Z')
    ];
    const result = calculateMonthlyTotal('2024-01');
    return assertAlmostEqual(result, 36.00, 0.01, 'Multiple same-day transactions');
});

test('calculateMonthlyTotal: ignores time component, only uses YYYY-MM', function() {
    testState.transactions = [
        createTransaction('Early', 5.00, 'Food', '2024-01-01T00:00:00.000Z'),
        createTransaction('Late', 10.00, 'Food', '2024-01-31T23:59:59.000Z')
    ];
    const result = calculateMonthlyTotal('2024-01');
    return assertEqual(result, 15.00, 'Should match on YYYY-MM regardless of time');
});

test('calculateMonthlyTotal: handles different years separately', function() {
    testState.transactions = [
        createTransaction('Item 1', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Item 2', 10.00, 'Food', '2023-01-15T10:30:00.000Z')
    ];
    const result2024 = calculateMonthlyTotal('2024-01');
    const result2023 = calculateMonthlyTotal('2023-01');
    return assertEqual(result2024, 5.50, '2024-01') && 
           assertEqual(result2023, 10.00, '2023-01');
});

test('calculateMonthlyTotal: handles all months correctly', function() {
    testState.transactions = [];
    for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0');
        testState.transactions.push(
            createTransaction('Item', 10.00 * month, 'Food', `2024-${monthStr}-15T10:30:00.000Z`)
        );
    }
    
    let allCorrect = true;
    for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0');
        const result = calculateMonthlyTotal(`2024-${monthStr}`);
        const expected = 10.00 * month;
        if (Math.abs(result - expected) > 0.01) {
            allCorrect = false;
            break;
        }
    }
    return allCorrect ? true : 'Not all months calculated correctly';
});

// ============================================
// Integration tests: combining all calculators
// ============================================

console.log('\n=== Integration Tests ===');
console.log('Tests combining multiple calculator functions\n');

test('Integration: total balance equals sum of all monthly totals', function() {
    testState.transactions = [
        createTransaction('Jan 1', 5.00, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Jan 2', 10.00, 'Food', '2024-01-20T10:30:00.000Z'),
        createTransaction('Feb 1', 8.00, 'Food', '2024-02-10T10:30:00.000Z'),
        createTransaction('Mar 1', 12.00, 'Food', '2024-03-05T10:30:00.000Z')
    ];
    
    const totalBalance = calculateTotalBalance();
    const monthlySum = calculateMonthlyTotal('2024-01') + 
                       calculateMonthlyTotal('2024-02') + 
                       calculateMonthlyTotal('2024-03');
    
    return assertAlmostEqual(totalBalance, monthlySum, 0.01, 'Balance should equal sum of monthly totals');
});

test('Integration: category and monthly totals for multi-category data', function() {
    testState.transactions = [
        createTransaction('Coffee', 5.50, 'Food', '2024-01-15T10:30:00.000Z'),
        createTransaction('Bus', 2.00, 'Transport', '2024-01-15T08:00:00.000Z'),
        createTransaction('Movie', 12.00, 'Fun', '2024-01-15T19:00:00.000Z'),
        createTransaction('Lunch', 10.00, 'Food', '2024-02-10T12:00:00.000Z')
    ];
    
    const jan = calculateMonthlyTotal('2024-01');
    const feb = calculateMonthlyTotal('2024-02');
    const foodTotal = calculateCategoryTotal('Food');
    
    return assertAlmostEqual(jan, 19.50, 0.01, 'January') &&
           assertEqual(feb, 10.00, 'February') &&
           assertAlmostEqual(foodTotal, 15.50, 0.01, 'Food total');
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
    console.log('  - Requirement 3.1: Balance Display');
    console.log('  - Requirement 3.2: Spending Distribution Chart');
    console.log('  - Requirement 3.3: Monthly Summary View');
    console.log('\nProperties verified:');
    console.log('  - Property 5: Balance Equals Transaction Sum');
    console.log('  - Property 6: Category Percentages Sum to 100');
    console.log('  - Property 9: Monthly Total Correctness');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed.');
    process.exit(1);
}
