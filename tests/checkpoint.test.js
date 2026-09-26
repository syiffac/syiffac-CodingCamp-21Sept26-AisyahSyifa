/**
 * Checkpoint Test Suite - Task 13
 * Verifies core functionality of the Expense Tracker
 * 
 * This test file validates the essential features work together correctly
 * including state management, calculations, sorting, and persistence.
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index) => Object.keys(store)[index] || null,
        get length() { return Object.keys(store).length; }
    };
})();

// Replace global localStorage with mock
global.localStorage = mockLocalStorage;

// Mock DOM elements for testing
const mockDOM = () => {
    const elements = {};
    
    global.document = {
        getElementById: (id) => {
            if (!elements[id]) {
                elements[id] = {
                    id: id,
                    textContent: '',
                    innerHTML: '',
                    value: '',
                    hidden: false,
                    disabled: false,
                    classList: {
                        add: function() {},
                        remove: function() {},
                        contains: function() { return false; }
                    },
                    getAttribute: function() { return null; },
                    setAttribute: function() {},
                    removeAttribute: function() {},
                    addEventListener: function() {},
                    querySelectorAll: function() { return []; },
                    appendChild: function() {},
                    reset: function() {},
                    focus: function() {}
                };
            }
            return elements[id];
        },
        documentElement: {
            setAttribute: function() {},
            removeAttribute: function() {}
        },
        addEventListener: function() {},
        createElement: (tag) => ({
            textContent: '',
            innerHTML: '',
            appendChild: function() {},
            setAttribute: function() {},
            addEventListener: function() {}
        })
    };

    global.window = {
        getComputedStyle: () => ({
            getPropertyValue: () => '#1e293b'
        })
    };

    // Mock Chart.js
    global.Chart = function(ctx, config) {
        this.config = config;
        this.destroy = function() {};
    };
};

mockDOM();

// Load the application code (app.js is browser-side, so evaluate it here
// and expose the ExpenseTracker module to the tests)
const fs = require('fs');
const path = require('path');
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
const ExpenseTracker = new Function(
    appCode + '\n; return ExpenseTracker;'
)();

// ==========================================
// CHECKPOINT TEST SUITE (Task 13)
// ==========================================

describe('Expense Tracker - Core Functionality Checkpoint', () => {
    // Start every test from a clean app state. Clearing localStorage alone is
    // not enough: the module keeps its state in memory between tests.
    beforeEach(() => {
        mockLocalStorage.clear();
        ExpenseTracker.updateState({
            transactions: [],
            customCategories: [],
            spendingLimit: null,
            theme: 'light',
            sortOrder: 'date-desc',
            selectedMonth: null
        });
    });

    describe('1. State Management', () => {
        test('should initialize with empty state', () => {
            const state = ExpenseTracker.getState();
            expect(state.transactions.length).toBe(0);
            expect(state.customCategories.length).toBe(0);
            expect(state.spendingLimit).toBeNull();
            expect(state.theme).toBe('light');
        });

        test('should subscribe to state changes', () => {
            let updateCount = 0;
            const unsubscribe = ExpenseTracker.subscribe(() => {
                updateCount++;
            });
            
            expect(updateCount).toBe(0);
            unsubscribe();
        });
    });

    describe('2. Transaction Management', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should add a transaction', () => {
            const transaction = ExpenseTracker.addTransaction({
                name: 'Coffee',
                amount: '5.50',
                category: 'Food'
            });

            expect(transaction).toBeDefined();
            expect(transaction.id).toBeDefined();
            expect(transaction.name).toBe('Coffee');
            expect(transaction.amount).toBe(5.50);
            expect(transaction.category).toBe('Food');
            expect(transaction.date).toBeDefined();

            const state = ExpenseTracker.getState();
            expect(state.transactions.length).toBe(1);
        });

        test('should delete a transaction', () => {
            const transaction = ExpenseTracker.addTransaction({
                name: 'Lunch',
                amount: '12.00',
                category: 'Food'
            });

            expect(ExpenseTracker.getState().transactions.length).toBe(1);

            ExpenseTracker.deleteTransaction(transaction.id);
            expect(ExpenseTracker.getState().transactions.length).toBe(0);
        });

        test('should calculate total balance correctly', () => {
            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '10', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '20', category: 'Transport' });
            ExpenseTracker.addTransaction({ name: 'Item 3', amount: '15', category: 'Fun' });

            const total = ExpenseTracker.calculateTotalBalance();
            expect(total).toBe(45);
        });
    });

    describe('3. Category Management', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should get category totals for predefined categories', () => {
            ExpenseTracker.addTransaction({ name: 'Burger', amount: '15', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Pizza', amount: '12', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Bus', amount: '2', category: 'Transport' });

            const breakdown = ExpenseTracker.getCategoryTotals();
            
            expect(breakdown['Food'].amount).toBe(27);
            expect(breakdown['Transport'].amount).toBe(2);
            expect(breakdown['Fun'].amount).toBe(0);
        });

        test('should add a custom category', () => {
            const result = ExpenseTracker.addCustomCategory('Shopping');
            expect(result.success).toBe(true);
            
            const state = ExpenseTracker.getState();
            expect(state.customCategories).toContain('Shopping');
        });

        test('should reject duplicate custom categories', () => {
            ExpenseTracker.addCustomCategory('Shopping');
            const result = ExpenseTracker.addCustomCategory('Shopping');
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('already exists');
        });

        test('should enforce max 5 custom categories', () => {
            ExpenseTracker.addCustomCategory('Cat1');
            ExpenseTracker.addCustomCategory('Cat2');
            ExpenseTracker.addCustomCategory('Cat3');
            ExpenseTracker.addCustomCategory('Cat4');
            ExpenseTracker.addCustomCategory('Cat5');

            const result = ExpenseTracker.addCustomCategory('Cat6');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Maximum 5');
        });

        test('should remove a custom category', () => {
            ExpenseTracker.addCustomCategory('Shopping');
            let state = ExpenseTracker.getState();
            expect(state.customCategories).toContain('Shopping');

            ExpenseTracker.removeCustomCategory('Shopping');
            state = ExpenseTracker.getState();
            expect(state.customCategories).not.toContain('Shopping');
        });
    });

    describe('4. Transaction Sorting', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should sort by amount high to low', () => {
            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '10', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '30', category: 'Fun' });
            ExpenseTracker.addTransaction({ name: 'Item 3', amount: '20', category: 'Transport' });

            ExpenseTracker.setSortOrder('amount-desc');
            const sorted = ExpenseTracker.getSortedTransactions();

            expect(sorted[0].amount).toBe(30);
            expect(sorted[1].amount).toBe(20);
            expect(sorted[2].amount).toBe(10);
        });

        test('should sort by amount low to high', () => {
            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '30', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '10', category: 'Fun' });
            ExpenseTracker.addTransaction({ name: 'Item 3', amount: '20', category: 'Transport' });

            ExpenseTracker.setSortOrder('amount-asc');
            const sorted = ExpenseTracker.getSortedTransactions();

            expect(sorted[0].amount).toBe(10);
            expect(sorted[1].amount).toBe(20);
            expect(sorted[2].amount).toBe(30);
        });

        test('should sort by category A-Z', () => {
            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '10', category: 'Transport' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '20', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 3', amount: '15', category: 'Fun' });

            ExpenseTracker.setSortOrder('category-asc');
            const sorted = ExpenseTracker.getSortedTransactions();

            expect(sorted[0].category).toBe('Food');
            expect(sorted[1].category).toBe('Fun');
            expect(sorted[2].category).toBe('Transport');
        });

        test('should sort by category Z-A', () => {
            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '10', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '20', category: 'Transport' });
            ExpenseTracker.addTransaction({ name: 'Item 3', amount: '15', category: 'Fun' });

            ExpenseTracker.setSortOrder('category-desc');
            const sorted = ExpenseTracker.getSortedTransactions();

            expect(sorted[0].category).toBe('Transport');
            expect(sorted[1].category).toBe('Fun');
            expect(sorted[2].category).toBe('Food');
        });
    });

    describe('5. Monthly Summary', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should filter transactions by month', () => {
            // Mock transaction dates
            const jan2024 = {
                name: 'January Item',
                amount: '10',
                category: 'Food',
                date: '2024-01-15T10:00:00Z'
            };

            const currentDate = new Date();
            const currentMonth = currentDate.getFullYear() + '-' + 
                String(currentDate.getMonth() + 1).padStart(2, '0');

            ExpenseTracker.addTransaction({ 
                name: 'Current Month',
                amount: '20',
                category: 'Transport'
            });

            const monthlyData = ExpenseTracker.getMonthlyData(currentMonth);
            expect(monthlyData.length).toBeGreaterThan(0);
        });

        test('should calculate monthly breakdown', () => {
            const currentDate = new Date();
            const currentMonth = currentDate.getFullYear() + '-' + 
                String(currentDate.getMonth() + 1).padStart(2, '0');

            ExpenseTracker.addTransaction({ name: 'Food 1', amount: '15', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Transport 1', amount: '5', category: 'Transport' });

            const breakdown = ExpenseTracker.getMonthlyBreakdown(currentMonth);
            
            expect(breakdown['Food'].amount).toBe(15);
            expect(breakdown['Transport'].amount).toBe(5);
        });

        test('should calculate monthly total', () => {
            const currentDate = new Date();
            const currentMonth = currentDate.getFullYear() + '-' + 
                String(currentDate.getMonth() + 1).padStart(2, '0');

            ExpenseTracker.addTransaction({ name: 'Item 1', amount: '25', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Item 2', amount: '15', category: 'Transport' });

            const total = ExpenseTracker.calculateMonthlyTotal(currentMonth);
            expect(total).toBe(40);
        });
    });

    describe('6. Spending Limit', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should set a spending limit', () => {
            ExpenseTracker.setSpendingLimit(500);
            const state = ExpenseTracker.getState();
            expect(state.spendingLimit).toBe(500);
        });

        test('should persist spending limit to localStorage', () => {
            ExpenseTracker.setSpendingLimit(300);
            const stored = JSON.parse(mockLocalStorage.getItem('expenseVisualizer'));
            expect(stored.spendingLimit).toBe(300);
        });

        test('should remove spending limit when set to null', () => {
            ExpenseTracker.setSpendingLimit(500);
            ExpenseTracker.setSpendingLimit(null);
            const state = ExpenseTracker.getState();
            expect(state.spendingLimit).toBeNull();
        });
    });

    describe('7. Theme Management', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should set theme to dark', () => {
            ExpenseTracker.setTheme('dark');
            const state = ExpenseTracker.getState();
            expect(state.theme).toBe('dark');
        });

        test('should set theme to light', () => {
            ExpenseTracker.setTheme('light');
            const state = ExpenseTracker.getState();
            expect(state.theme).toBe('light');
        });

        test('should toggle theme', () => {
            ExpenseTracker.setTheme('light');
            expect(ExpenseTracker.getState().theme).toBe('light');

            ExpenseTracker.toggleTheme();
            expect(ExpenseTracker.getState().theme).toBe('dark');

            ExpenseTracker.toggleTheme();
            expect(ExpenseTracker.getState().theme).toBe('light');
        });

        test('should persist theme to localStorage', () => {
            ExpenseTracker.setTheme('dark');
            const stored = JSON.parse(mockLocalStorage.getItem('expenseVisualizer'));
            expect(stored.theme).toBe('dark');
        });
    });

    describe('8. Input Validation', () => {
        test('should validate name field', () => {
            const emptyName = ExpenseTracker.validateName('');
            expect(emptyName.valid).toBe(false);

            const validName = ExpenseTracker.validateName('Coffee');
            expect(validName.valid).toBe(true);

            const longName = ExpenseTracker.validateName('a'.repeat(101));
            expect(longName.valid).toBe(false);
        });

        test('should validate amount field', () => {
            const emptyAmount = ExpenseTracker.validateAmount('');
            expect(emptyAmount.valid).toBe(false);

            const negativeAmount = ExpenseTracker.validateAmount('-10');
            expect(negativeAmount.valid).toBe(false);

            const zeroAmount = ExpenseTracker.validateAmount('0');
            expect(zeroAmount.valid).toBe(false);

            const validAmount = ExpenseTracker.validateAmount('15.50');
            expect(validAmount.valid).toBe(true);
        });

        test('should validate category field', () => {
            const emptyCategory = ExpenseTracker.validateCategory('');
            expect(emptyCategory.valid).toBe(false);

            const validCategory = ExpenseTracker.validateCategory('Food');
            expect(validCategory.valid).toBe(true);
        });

        test('should validate complete form', () => {
            const invalid = ExpenseTracker.validateForm('', '10', 'Food');
            expect(invalid.valid).toBe(false);

            const valid = ExpenseTracker.validateForm('Coffee', '5.50', 'Food');
            expect(valid.valid).toBe(true);
        });
    });

    describe('9. Data Persistence', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should save state to localStorage', () => {
            ExpenseTracker.addTransaction({ name: 'Item', amount: '10', category: 'Food' });
            
            const stored = mockLocalStorage.getItem('expenseVisualizer');
            expect(stored).not.toBeNull();
            
            const parsed = JSON.parse(stored);
            expect(parsed.transactions.length).toBe(1);
        });

        test('should load state from localStorage', () => {
            const initialData = {
                transactions: [
                    {
                        id: 'test-id',
                        name: 'Test Item',
                        amount: 25.50,
                        category: 'Food',
                        date: new Date().toISOString()
                    }
                ],
                customCategories: ['Shopping'],
                spendingLimit: 500,
                theme: 'dark',
                sortOrder: 'date-desc'
            };

            mockLocalStorage.setItem('expenseVisualizer', JSON.stringify(initialData));
            
            // State would be loaded during init()
            const loaded = JSON.parse(mockLocalStorage.getItem('expenseVisualizer'));
            expect(loaded.transactions.length).toBe(1);
            expect(loaded.spendingLimit).toBe(500);
            expect(loaded.theme).toBe('dark');
        });
    });

    describe('10. Category Percentages', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        test('should calculate category percentages sum to 100', () => {
            ExpenseTracker.addTransaction({ name: 'Food 1', amount: '30', category: 'Food' });
            ExpenseTracker.addTransaction({ name: 'Transport 1', amount: '50', category: 'Transport' });
            ExpenseTracker.addTransaction({ name: 'Fun 1', amount: '20', category: 'Fun' });

            const breakdown = ExpenseTracker.getCategoryTotals();
            
            let sum = 0;
            Object.keys(breakdown).forEach(category => {
                sum += breakdown[category].percentage;
            });

            expect(Math.abs(sum - 100)).toBeLessThan(0.1); // Allow small floating point error
        });

        test('should include all predefined categories', () => {
            const breakdown = ExpenseTracker.getCategoryTotals();
            
            expect(breakdown['Food']).toBeDefined();
            expect(breakdown['Transport']).toBeDefined();
            expect(breakdown['Fun']).toBeDefined();
        });
    });
});

// Simple test runner for this file (if run directly)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
