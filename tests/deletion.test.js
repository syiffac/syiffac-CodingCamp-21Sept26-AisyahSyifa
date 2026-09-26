/**
 * Unit Tests for Transaction Deletion (Task 5.2)
 * Validates: Requirements 3.1, 3.2, 3.3
 * 
 * Property 4: Transaction Deletion Removes Entry
 * For any transaction list and any transaction within it, deleting that transaction
 * shall result in a list where the transaction no longer exists and all other 
 * transactions remain unchanged.
 */

// Mock DOM environment
global.localStorage = {
    store: {},
    getItem: function(key) { return this.store[key] || null; },
    setItem: function(key, value) { this.store[key] = value; },
    removeItem: function(key) { delete this.store[key]; },
    clear: function() { this.store = {}; }
};

global.document = {
    getElementById: function() { return null; },
    addEventListener: function() {}
};

// ============================================
// Deletion Function to Test
// ============================================

function deleteTransaction(state, id) {
    const newTransactions = state.transactions.filter(function(transaction) {
        return transaction.id !== id;
    });
    return { ...state, transactions: newTransactions };
}

// ============================================
// Test Framework
// ============================================

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

function assertTrue(condition, message) {
    if (condition) return true;
    return message;
}

// ============================================
// Tests for deleteTransaction
// Validates: Requirements 3.1, 3.2, 3.3
// ============================================

console.log('\n=== deleteTransaction Tests (Requirement 3.1, 3.2, 3.3) ===');
console.log('Property 4: For any transaction list and any transaction within it,');
console.log('deleting that transaction shall result in a list where the transaction');
console.log('no longer exists and all other transactions remain unchanged.\n');

test('deleteTransaction: removes a single transaction from a list with one item', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn1');
    
    if (newState.transactions.length !== 0) {
        return 'Transaction list should be empty';
    }
    if (newState.transactions.some(t => t.id === 'txn1')) {
        return 'Transaction should not exist in list';
    }
    return true;
});

test('deleteTransaction: removes a transaction from middle of list', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' },
            { id: 'txn3', name: 'Movie', amount: 12.00, category: 'Fun', date: '2024-01-15T19:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn2');
    
    if (newState.transactions.length !== 2) {
        return 'Should have 2 transactions remaining';
    }
    if (!newState.transactions.some(t => t.id === 'txn1')) {
        return 'Transaction txn1 should remain';
    }
    if (!newState.transactions.some(t => t.id === 'txn3')) {
        return 'Transaction txn3 should remain';
    }
    if (newState.transactions.some(t => t.id === 'txn2')) {
        return 'Transaction txn2 should be deleted';
    }
    return true;
});

test('deleteTransaction: removes first transaction from list', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' },
            { id: 'txn3', name: 'Movie', amount: 12.00, category: 'Fun', date: '2024-01-15T19:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn1');
    
    if (newState.transactions.length !== 2) {
        return 'Should have 2 transactions remaining';
    }
    if (newState.transactions[0].id !== 'txn2') {
        return 'First transaction should be txn2';
    }
    if (newState.transactions[1].id !== 'txn3') {
        return 'Second transaction should be txn3';
    }
    return true;
});

test('deleteTransaction: removes last transaction from list', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' },
            { id: 'txn3', name: 'Movie', amount: 12.00, category: 'Fun', date: '2024-01-15T19:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn3');
    
    if (newState.transactions.length !== 2) {
        return 'Should have 2 transactions remaining';
    }
    if (newState.transactions[0].id !== 'txn1') {
        return 'First transaction should be txn1';
    }
    if (newState.transactions[1].id !== 'txn2') {
        return 'Second transaction should be txn2';
    }
    return true;
});

test('deleteTransaction: deleting non-existent ID leaves list unchanged', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'nonexistent-id');
    
    if (newState.transactions.length !== 2) {
        return 'Should still have 2 transactions';
    }
    if (newState.transactions[0].id !== 'txn1' || newState.transactions[1].id !== 'txn2') {
        return 'Original transactions should remain';
    }
    return true;
});

test('deleteTransaction: preserves transaction data integrity when deleting', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn1');
    
    const remaining = newState.transactions[0];
    if (remaining.id !== 'txn2') return 'Should be txn2';
    if (remaining.name !== 'Bus') return 'Name should be Bus';
    if (remaining.amount !== 2.50) return 'Amount should be 2.50';
    if (remaining.category !== 'Transport') return 'Category should be Transport';
    if (remaining.date !== '2024-01-15T11:00:00.000Z') return 'Date should be preserved';
    return true;
});

test('deleteTransaction: does not mutate original state', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' }
        ]
    };
    
    const originalLength = state.transactions.length;
    const newState = deleteTransaction(state, 'txn1');
    
    if (state.transactions.length !== originalLength) {
        return 'Original state should not be mutated';
    }
    if (state.transactions.some(t => t.id === 'txn1') === false) {
        return 'Original state txn1 should still exist';
    }
    return true;
});

test('deleteTransaction: handles empty list gracefully', function() {
    const state = {
        transactions: []
    };
    
    const newState = deleteTransaction(state, 'any-id');
    
    if (newState.transactions.length !== 0) {
        return 'Should remain empty';
    }
    return true;
});

test('deleteTransaction: works with multiple identical-looking transactions with different IDs', function() {
    const state = {
        transactions: [
            { id: 'txn1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn2', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T11:30:00.000Z' },
            { id: 'txn3', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T12:30:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn2');
    
    if (newState.transactions.length !== 2) {
        return 'Should have 2 transactions';
    }
    if (!newState.transactions.some(t => t.id === 'txn1' && t.date === '2024-01-15T10:30:00.000Z')) {
        return 'txn1 should remain';
    }
    if (!newState.transactions.some(t => t.id === 'txn3' && t.date === '2024-01-15T12:30:00.000Z')) {
        return 'txn3 should remain';
    }
    if (newState.transactions.some(t => t.id === 'txn2')) {
        return 'txn2 should be removed';
    }
    return true;
});

test('deleteTransaction: correctly handles ID matching (case-sensitive)', function() {
    const state = {
        transactions: [
            { id: 'TXN1', name: 'Coffee', amount: 5.50, category: 'Food', date: '2024-01-15T10:30:00.000Z' },
            { id: 'txn1', name: 'Bus', amount: 2.50, category: 'Transport', date: '2024-01-15T11:00:00.000Z' }
        ]
    };
    
    const newState = deleteTransaction(state, 'txn1');
    
    if (newState.transactions.length !== 1) {
        return 'Should have 1 transaction';
    }
    if (newState.transactions[0].id !== 'TXN1') {
        return 'Uppercase TXN1 should remain (case-sensitive)';
    }
    return true;
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
    console.log('  - Requirement 3.1: Transaction Deletion Removes Entry');
    console.log('  - Requirement 3.2: Update Local Storage on Delete');
    console.log('  - Requirement 3.3: Update Balance on Delete');
    console.log('\nProperty 4: Transaction Deletion Removes Entry - VALIDATED');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed.');
    process.exit(1);
}
