/**
 * Expense Tracker Application
 * A mobile-friendly web application for tracking daily spending
 * 
 * Requirements traced: 11.1, 11.2
 */

const ExpenseTracker = (function() {
    'use strict';

    // ==========================================
    // INITIAL STATE
    // ==========================================
    
    const initialState = {
        transactions: [],
        customCategories: [],
        spendingLimit: null,
        theme: 'light',
        sortOrder: 'date-desc',
        selectedMonth: null
    };

    // ==========================================
    // PRIVATE STATE & SUBSCRIBERS
    // ==========================================
    
    let state = { ...initialState };
    const subscribers = new Set();

    // ==========================================
    // DOM ELEMENT REFERENCES (Task 4.1)
    // ==========================================
    
    const elements = {
        form: null,
        nameInput: null,
        amountInput: null,
        categorySelect: null
    };

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================

    /**
     * Get current state (returns a copy to prevent direct mutation)
     * @returns {Object} Current application state
     */
    function getState() {
        return { ...state };
    }

    /**
     * Update state with new values and notify subscribers
     * @param {Object} updates - Partial state updates
     */
    function updateState(updates) {
        state = { ...state, ...updates };
        saveState();
        notifySubscribers();
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call on state change
     * @returns {Function} Unsubscribe function
     */
    function subscribe(callback) {
        subscribers.add(callback);
        return function unsubscribe() {
            subscribers.delete(callback);
        };
    }

    /**
     * Notify all subscribers of state change
     */
    function notifySubscribers() {
        subscribers.forEach(function(callback) {
            callback(state);
        });
    }

    // ==========================================
    // LOCAL STORAGE (Task 3.2)
    // Requirements traced: 11.1, 11.2, 11.3, 11.4
    // ==========================================

    const STORAGE_KEY = 'expenseVisualizer';

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    function isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Load state from localStorage
     * @returns {Object|null} Parsed state or null if not found/invalid
     */
    function loadState() {
        try {
            const serializedState = localStorage.getItem(STORAGE_KEY);
            if (serializedState === null) {
                return null;
            }
            const parsed = JSON.parse(serializedState);
            // Validate the structure - must be an object
            if (typeof parsed !== 'object' || parsed === null) {
                return null;
            }
            return parsed;
        } catch (error) {
            console.error('Error loading state from localStorage:', error);
            return null;
        }
    }

    /**
     * Save current state to localStorage
     */
    function saveState() {
        try {
            const serializedState = JSON.stringify({
                transactions: state.transactions,
                customCategories: state.customCategories,
                spendingLimit: state.spendingLimit,
                theme: state.theme,
                sortOrder: state.sortOrder
            });
            localStorage.setItem(STORAGE_KEY, serializedState);
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
            // Could show a warning to user that data won't persist
        }
    }

    // ==========================================
    // ID GENERATION (Task 4.1)
    // ==========================================

    /**
     * Generate a unique ID for transactions
     * @returns {string} Unique identifier
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ==========================================
    // INPUT VALIDATION (Task 4.2)
    // Requirements traced: 1.2, 1.5
    // ==========================================

    /**
     * Validate the transaction name
     * @param {string} name - Item name to validate
     * @returns {Object} Validation result with valid flag and optional message
     */
    function validateName(name) {
        if (!name || name.trim().length === 0) {
            return { valid: false, message: 'Item name is required' };
        }
        if (name.trim().length > 100) {
            return { valid: false, message: 'Item name must be 100 characters or less' };
        }
        return { valid: true };
    }

    /**
     * Validate the transaction amount
     * @param {string|number} amount - Amount to validate
     * @returns {Object} Validation result with valid flag and optional message
     */
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

    /**
     * Validate the transaction category
     * @param {string} category - Category to validate
     * @returns {Object} Validation result with valid flag and optional message
     */
    function validateCategory(category) {
        if (!category) {
            return { valid: false, message: 'Please select a category' };
        }
        return { valid: true };
    }

    /**
     * Validate all form fields
     * @param {string} name - Item name
     * @param {string|number} amount - Amount
     * @param {string} category - Category
     * @returns {Object} Validation result with valid flag and errors object
     */
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

    // ==========================================
    // VALIDATION ERROR DISPLAY (Task 4.2)
    // ==========================================

    /**
     * Show a validation error for a specific field
     * @param {string} field - Field name ('name', 'amount', or 'category')
     * @param {string} message - Error message to display
     */
    function showValidationError(field, message) {
        const inputMap = {
            name: elements.nameInput,
            amount: elements.amountInput,
            category: elements.categorySelect
        };
        
        const input = inputMap[field];
        if (input) {
            input.classList.add('form__input--error', 'form__select--error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        const errorEl = document.getElementById(field + '-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('visually-hidden');
            errorEl.hidden = false;
        }
    }

    /**
     * Clear all validation errors
     */
    function clearValidationErrors() {
        ['name', 'amount', 'category'].forEach(function(field) {
            const inputMap = {
                name: elements.nameInput,
                amount: elements.amountInput,
                category: elements.categorySelect
            };
            
            const input = inputMap[field];
            if (input) {
                input.classList.remove('form__input--error', 'form__select--error');
                input.removeAttribute('aria-invalid');
            }
            
            const errorEl = document.getElementById(field + '-error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('visually-hidden');
                errorEl.hidden = true;
            }
        });
    }

    // ==========================================
    // CALCULATOR MODULE (Task 6.1)
    // Requirements traced: 3.1, 3.2, 3.3
    // ==========================================

    /**
     * Calculate the total balance (sum of all transaction amounts)
     * @returns {number} Total balance
     */
    function calculateTotalBalance() {
        return state.transactions.reduce(function(sum, transaction) {
            return sum + transaction.amount;
        }, 0);
    }

    /**
     * Calculate the total amount for a specific category
     * @param {string} category - Category name to sum
     * @returns {number} Total amount for the category
     */
    function calculateCategoryTotal(category) {
        return state.transactions.reduce(function(sum, transaction) {
            return transaction.category === category ? sum + transaction.amount : sum;
        }, 0);
    }

    /**
     * Calculate the total spending for a specific month
     * @param {string} month - Month in YYYY-MM format (e.g., "2024-01")
     * @returns {number} Total spending for the month
     */
    function calculateMonthlyTotal(month) {
        return state.transactions.reduce(function(sum, transaction) {
            // Extract YYYY-MM from ISO date string (e.g., "2024-01-15T10:30:00.000Z" -> "2024-01")
            const transactionMonth = transaction.date.substring(0, 7);
            return transactionMonth === month ? sum + transaction.amount : sum;
        }, 0);
    }

    // ==========================================
    // TRANSACTION OPERATIONS (Task 4.1)
    // Requirements traced: 1.1, 1.3, 1.4
    // ==========================================

    /**
     * Add a new transaction
     * @param {Object} transactionData - Transaction details
     * @returns {Object} Created transaction
     */
    function addTransaction(transactionData) {
        const transaction = {
            id: generateId(),
            name: transactionData.name.trim(),
            amount: parseFloat(transactionData.amount),
            category: transactionData.category,
            date: new Date().toISOString()
        };
        
        const newTransactions = [...state.transactions, transaction];
        updateState({ transactions: newTransactions });
        
        return transaction;
    }

    /**
     * Delete a transaction by ID
     * Requirements traced: 3.1, 3.2, 3.3
     * @param {string} id - Transaction ID to delete
     */
    function deleteTransaction(id) {
        const newTransactions = state.transactions.filter(function(transaction) {
            return transaction.id !== id;
        });
        updateState({ transactions: newTransactions });
    }

    // ==========================================
    // TRANSACTION LIST RENDERER (Task 5.1)
    // Requirements traced: 2.1, 2.2, 2.3, 2.4
    // ==========================================

    /**
     * Format a date for display
     * @param {string} isoDate - ISO date string
     * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
     */
    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Format a number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string (e.g., "$5.00")
     */
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    /**
     * Render the transaction list
     * Requirements traced: 2.1, 2.2, 2.3, 2.4
     */
    function renderTransactionList() {
        const listEl = document.getElementById('transaction-list');
        if (!listEl) return;

        // Get sorted transactions (Task 10.1)
        const transactions = getSortedTransactions();

        // Show empty state if no transactions
        if (transactions.length === 0) {
            listEl.innerHTML = '<li class="transactions__empty">No transactions yet. Add your first expense above!</li>';
            return;
        }

        // Build transaction items HTML
        const html = transactions.map(function(transaction) {
            return (
                '<li class="transactions__item" data-id="' + transaction.id + '">' +
                    '<div class="transactions__item-info">' +
                        '<div class="transactions__item-name">' + escapeHtml(transaction.name) + '</div>' +
                        '<div class="transactions__item-meta">' +
                            '<span class="transactions__item-category">' + escapeHtml(transaction.category) + '</span>' +
                            '<span class="transactions__item-date">' + formatDate(transaction.date) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="transactions__item-amount">' + formatCurrency(transaction.amount) + '</span>' +
                    '<button class="transactions__item-delete" aria-label="Delete transaction" data-id="' + transaction.id + '">' +
                        '✕' +
                    '</button>' +
                '</li>'
            );
        }).join('');

        listEl.innerHTML = html;
    }

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // FORM HANDLING (Task 4.1)
    // ==========================================

    /**
     * Cache DOM element references for the form
     */
    function cacheElements() {
        elements.form = document.getElementById('transaction-form');
        elements.nameInput = document.getElementById('item-name');
        elements.amountInput = document.getElementById('amount');
        elements.categorySelect = document.getElementById('category');
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        clearValidationErrors();
        
        const name = elements.nameInput.value;
        const amount = elements.amountInput.value;
        const category = elements.categorySelect.value;
        
        const validation = validateForm(name, amount, category);
        
        if (!validation.valid) {
            if (validation.errors.name) {
                showValidationError('name', validation.errors.name);
            }
            if (validation.errors.amount) {
                showValidationError('amount', validation.errors.amount);
            }
            if (validation.errors.category) {
                showValidationError('category', validation.errors.category);
            }
            return;
        }
        
        addTransaction({ name: name, amount: amount, category: category });
        
        // Clear form
        elements.form.reset();
        elements.nameInput.focus();
    }

    // ==========================================
    // PIE CHART INTEGRATION (Task 7.1)
    // Requirements traced: 5.1, 5.2, 5.3, 5.4, 5.5
    // ==========================================

    let chartInstance = null;
    const PREDEFINED_CATEGORIES = ['Food', 'Transport', 'Fun'];
    const PREDEFINED_COLORS = {
        'Food': '#22c55e',
        'Transport': '#3b82f6',
        'Fun': '#f59e0b'
    };
    const CUSTOM_COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

    /**
     * Get category totals and percentages
     * Includes all predefined categories even if zero
     * @returns {Object} Category breakdown with amounts and percentages
     */
    function getCategoryTotals() {
        const breakdown = {};
        const allCategories = new Set(PREDEFINED_CATEGORIES);
        
        // Add custom categories
        state.customCategories.forEach(function(cat) {
            allCategories.add(cat);
        });

        let total = calculateTotalBalance();
        
        // Initialize all categories with zero
        allCategories.forEach(function(category) {
            breakdown[category] = {
                amount: 0,
                percentage: 0
            };
        });

        // Calculate totals for each category
        state.transactions.forEach(function(transaction) {
            if (!breakdown[transaction.category]) {
                breakdown[transaction.category] = { amount: 0, percentage: 0 };
            }
            breakdown[transaction.category].amount += transaction.amount;
        });

        // Calculate percentages
        if (total > 0) {
            Object.keys(breakdown).forEach(function(category) {
                breakdown[category].percentage = (breakdown[category].amount / total) * 100;
            });
        }

        return breakdown;
    }

    /**
     * Get color for a category
     * @param {string} category - Category name
     * @param {number} index - Index for custom categories
     * @returns {string} Color hex code
     */
    function getCategoryColor(category, index) {
        if (PREDEFINED_COLORS[category]) {
            return PREDEFINED_COLORS[category];
        }
        return CUSTOM_COLORS[index % CUSTOM_COLORS.length];
    }

    /**
     * Initialize or update the pie chart
     * Requirements traced: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function updatePieChart() {
        const canvas = document.getElementById('expense-chart');
        if (!canvas) {
            console.warn('Chart canvas not found');
            return;
        }

        const breakdown = getCategoryTotals();
        const categories = Object.keys(breakdown).sort();
        const amounts = categories.map(function(cat) { return breakdown[cat].amount; });
        const colors = categories.map(function(cat, index) {
            return getCategoryColor(cat, index);
        });

        // Destroy existing chart if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 },
                            color: window.getComputedStyle(document.documentElement).getPropertyValue('--color-text') || '#1e293b'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                const percentage = breakdown[label].percentage.toFixed(1);
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // ==========================================
    // BALANCE DISPLAY (Task 6.1)
    // Requirements traced: 4.1, 4.2, 4.3
    // ==========================================

    /**
     * Render the balance display
     */
    function renderBalance() {
        const balanceAmount = document.getElementById('balance-amount');
        if (balanceAmount) {
            const total = calculateTotalBalance();
            balanceAmount.textContent = formatCurrency(total);
        }
    }

    // ==========================================
    // CUSTOM CATEGORIES (Task 8.1)
    // Requirements traced: 6.1, 6.2, 6.3, 6.4
    // ==========================================

    /**
     * Add a custom category
     * @param {string} name - Category name to add
     * @returns {Object} Result object with success flag and optional message
     */
    function addCustomCategory(name) {
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            return { success: false, message: 'Category name cannot be empty' };
        }
        
        if (trimmedName.length > 20) {
            return { success: false, message: 'Category name must be 20 characters or less' };
        }
        
        // Check for duplicates (case-insensitive)
        const lowerName = trimmedName.toLowerCase();
        const isDuplicate = state.customCategories.some(function(cat) {
            return cat.toLowerCase() === lowerName;
        }) || PREDEFINED_CATEGORIES.some(function(cat) {
            return cat.toLowerCase() === lowerName;
        });
        
        if (isDuplicate) {
            return { success: false, message: 'This category already exists' };
        }
        
        if (state.customCategories.length >= 5) {
            return { success: false, message: 'Maximum 5 custom categories allowed' };
        }
        
        updateState({
            customCategories: [...state.customCategories, trimmedName]
        });
        
        return { success: true };
    }

    /**
     * Remove a custom category
     * @param {string} name - Category name to remove
     */
    function removeCustomCategory(name) {
        const updated = state.customCategories.filter(function(cat) {
            return cat !== name;
        });
        updateState({ customCategories: updated });
    }

    /**
     * Update the category dropdown options
     */
    function updateCategoryDropdown() {
        const select = document.getElementById('category');
        if (!select) return;

        // Remove custom category options (keep only predefined)
        const options = select.querySelectorAll('option');
        options.forEach(function(option) {
            if (option.value && !PREDEFINED_CATEGORIES.includes(option.value)) {
                option.remove();
            }
        });

        // Add custom categories
        state.customCategories.forEach(function(category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });

        updateCategoryLimitWarning();
    }

    /**
     * Show/hide category limit warning
     */
    function updateCategoryLimitWarning() {
        const warning = document.getElementById('category-limit-warning');
        const addBtn = document.getElementById('add-category-btn');
        const input = document.getElementById('custom-category-input');

        if (state.customCategories.length >= 5) {
            if (warning) warning.hidden = false;
            if (addBtn) addBtn.disabled = true;
            if (input) input.disabled = true;
        } else {
            if (warning) warning.hidden = true;
            if (addBtn) addBtn.disabled = false;
            if (input) input.disabled = false;
        }
    }

    // ==========================================
    // SORTING (Task 10.1)
    // Requirements traced: 8.1, 8.2, 8.3, 8.4, 8.5
    // ==========================================

    /**
     * Sort transactions based on the sort order
     * @param {Array} transactions - Array of transactions to sort
     * @param {string} order - Sort order option
     * @returns {Array} Sorted transactions
     */
    function sortTransactions(transactions, order) {
        const sorted = [...transactions];

        switch (order) {
            case 'amount-desc':
                sorted.sort(function(a, b) { return b.amount - a.amount; });
                break;
            case 'amount-asc':
                sorted.sort(function(a, b) { return a.amount - b.amount; });
                break;
            case 'category-asc':
                sorted.sort(function(a, b) {
                    return a.category.localeCompare(b.category);
                });
                break;
            case 'category-desc':
                sorted.sort(function(a, b) {
                    return b.category.localeCompare(a.category);
                });
                break;
            case 'date-asc':
                sorted.sort(function(a, b) {
                    return new Date(a.date) - new Date(b.date);
                });
                break;
            case 'date-desc':
            default:
                sorted.sort(function(a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
                break;
        }

        return sorted;
    }

    /**
     * Set the transaction sort order
     * @param {string} order - Sort option value
     */
    function setSortOrder(order) {
        updateState({ sortOrder: order });
    }

    /**
     * Get sorted transactions based on current sort order
     * @returns {Array} Sorted transactions
     */
    function getSortedTransactions() {
        return sortTransactions(state.transactions, state.sortOrder);
    }

    // ==========================================
    // MONTHLY SUMMARY (Task 9.1)
    // Requirements traced: 7.1, 7.2, 7.3, 7.4
    // ==========================================

    /**
     * Get transactions for a specific month
     * @param {string} month - Month in YYYY-MM format
     * @returns {Array} Filtered transactions
     */
    function getMonthlyData(month) {
        return state.transactions.filter(function(transaction) {
            const transactionMonth = transaction.date.substring(0, 7);
            return transactionMonth === month;
        });
    }

    /**
     * Get monthly breakdown by category
     * @param {string} month - Month in YYYY-MM format
     * @returns {Object} Category breakdown for the month
     */
    function getMonthlyBreakdown(month) {
        const monthlyTransactions = getMonthlyData(month);
        const breakdown = {};
        const allCategories = new Set(PREDEFINED_CATEGORIES);
        
        state.customCategories.forEach(function(cat) {
            allCategories.add(cat);
        });

        // Initialize categories
        allCategories.forEach(function(category) {
            breakdown[category] = { amount: 0, percentage: 0 };
        });

        // Calculate totals
        let monthlyTotal = 0;
        monthlyTransactions.forEach(function(transaction) {
            if (!breakdown[transaction.category]) {
                breakdown[transaction.category] = { amount: 0, percentage: 0 };
            }
            breakdown[transaction.category].amount += transaction.amount;
            monthlyTotal += transaction.amount;
        });

        // Calculate percentages
        if (monthlyTotal > 0) {
            Object.keys(breakdown).forEach(function(category) {
                breakdown[category].percentage = (breakdown[category].amount / monthlyTotal) * 100;
            });
        }

        return breakdown;
    }

    /**
     * Render the monthly summary
     */
    function renderMonthlySummary() {
        const selectedMonth = state.selectedMonth;
        if (!selectedMonth) return;

        const totalEl = document.getElementById('monthly-total');
        const breakdownEl = document.getElementById('monthly-breakdown');

        if (totalEl) {
            const monthlyTotal = calculateMonthlyTotal(selectedMonth);
            totalEl.textContent = formatCurrency(monthlyTotal);
        }

        if (breakdownEl) {
            const breakdown = getMonthlyBreakdown(selectedMonth);
            const categories = Object.keys(breakdown)
                .filter(function(cat) { return breakdown[cat].amount > 0; })
                .sort();

            if (categories.length === 0) {
                breakdownEl.innerHTML = '<p class="monthly-summary__empty">No transactions for this month</p>';
            } else {
                const html = categories.map(function(category) {
                    const amount = breakdown[category].amount;
                    const percentage = breakdown[category].percentage.toFixed(1);
                    return (
                        '<div class="monthly-summary__breakdown-item">' +
                            '<span class="monthly-summary__breakdown-category">' + escapeHtml(category) + '</span>' +
                            '<span class="monthly-summary__breakdown-amount">' + formatCurrency(amount) + ' (' + percentage + '%)</span>' +
                        '</div>'
                    );
                }).join('');
                breakdownEl.innerHTML = html;
            }
        }
    }

    // ==========================================
    // SPENDING LIMIT (Task 11.1, 11.2)
    // Requirements traced: 10.1, 10.2, 10.3, 10.4
    // ==========================================

    /**
     * Set the spending limit
     * @param {number} limit - Spending limit amount (or null to remove)
     */
    function setSpendingLimit(limit) {
        updateState({ spendingLimit: limit });
    }

    /**
     * Update the spending limit display
     */
    function updateSpendingLimitDisplay() {
        const total = calculateTotalBalance();
        const limit = state.spendingLimit;
        const limitDisplay = document.getElementById('limit-display');
        const limitAmount = document.getElementById('limit-amount');
        const progressBar = document.getElementById('progress-bar');
        const warning = document.getElementById('limit-warning');

        if (!limit) {
            if (limitDisplay) limitDisplay.hidden = true;
            return;
        }

        if (limitDisplay) limitDisplay.hidden = false;
        if (limitAmount) limitAmount.textContent = formatCurrency(limit);

        // Update progress bar
        const percentage = Math.min((total / limit) * 100, 100);
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            
            // Change color if over budget
            if (total >= limit) {
                progressBar.classList.add('balance__progress-bar--warning');
            } else {
                progressBar.classList.remove('balance__progress-bar--warning');
            }
        }

        // Show/hide warning
        if (warning) {
            warning.hidden = total < limit;
        }
    }

    // ==========================================
    // THEME MANAGEMENT (Task 12.1)
    // Requirements traced: 9.1, 9.2, 9.3, 9.4
    // ==========================================

    /**
     * Apply the current theme to the document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    /**
     * Set the application theme
     * @param {string} theme - 'light' or 'dark'
     */
    function setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            // Apply the theme first: rendering below reads colors from CSS,
            // otherwise the chart keeps the previous theme's colors.
            applyTheme(theme);
            updateState({ theme: theme });
        }
    }

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // ==========================================
    // DEMO DATA (dummy data seeding)
    // ==========================================

    const DEMO_CUSTOM_CATEGORIES = ['Shopping', 'Bills'];
    const DEMO_SPENDING_LIMIT = 600;

    /**
     * Sample transactions template.
     * monthOffset: 0 = current month, 1 = previous month, 2 = two months ago
     * Days are kept <= 26 so they never roll over into the next month.
     * @type {Array<Object>}
     */
    const DEMO_TRANSACTIONS_TEMPLATE = [
        // Current month
        { monthOffset: 0, day: 3,  name: 'Coffee & Pastry',        amount: 4.75,   category: 'Food' },
        { monthOffset: 0, day: 6,  name: 'Bus Ticket',             amount: 2.50,   category: 'Transport' },
        { monthOffset: 0, day: 9,  name: 'Weekly Groceries',       amount: 41.30,  category: 'Food' },
        { monthOffset: 0, day: 12, name: 'Streaming Subscription', amount: 11.99,  category: 'Bills' },
        { monthOffset: 0, day: 17, name: 'Cinema Night',           amount: 14.00,  category: 'Fun' },
        { monthOffset: 0, day: 22, name: 'Running Sneakers',       amount: 89.00,  category: 'Shopping' },
        // Previous month
        { monthOffset: 1, day: 4,  name: 'Electricity Bill',       amount: 32.40,  category: 'Bills' },
        { monthOffset: 1, day: 8,  name: 'Taxi Ride',              amount: 9.80,   category: 'Transport' },
        { monthOffset: 1, day: 13, name: 'Restaurant Dinner',      amount: 47.25,  category: 'Food' },
        { monthOffset: 1, day: 16, name: 'Concert Ticket',         amount: 35.00,  category: 'Fun' },
        { monthOffset: 1, day: 20, name: 'Winter Jacket',          amount: 74.50,  category: 'Shopping' },
        { monthOffset: 1, day: 25, name: 'Internet Bill',          amount: 29.99,  category: 'Bills' },
        // Two months ago
        { monthOffset: 2, day: 5,  name: 'Monthly Train Pass',     amount: 60.00,  category: 'Transport' },
        { monthOffset: 2, day: 11, name: 'Pizza Delivery',         amount: 22.15,  category: 'Food' },
        { monthOffset: 2, day: 18, name: 'Video Game',             amount: 45.00,  category: 'Fun' },
        { monthOffset: 2, day: 24, name: 'Book Store',             amount: 27.80,  category: 'Shopping' }
    ];

    /**
     * Build demo transactions with dates spread over the last three months.
     * Dates are always in the past so the UI never shows a future expense.
     * @returns {Array<Object>} Ready-to-use transactions
     */
    function buildDemoTransactions() {
        const now = new Date();

        return DEMO_TRANSACTIONS_TEMPLATE.map(function(item, index) {
            const planned = new Date(now.getFullYear(), now.getMonth() - item.monthOffset, item.day, 9, 30, 0);
            // If the planned day is later than today, step back from now instead
            const timestamp = planned.getTime() > now.getTime()
                ? now.getTime() - ((index + 1) * 60 * 60 * 1000)
                : planned.getTime();

            return {
                id: generateId(),
                name: item.name,
                amount: item.amount,
                category: item.category,
                date: new Date(timestamp).toISOString()
            };
        });
    }

    /**
     * Replace the current data with demo data (transactions, categories, limit).
     * @returns {Object} A copy of the resulting state
     */
    function seedDemoData() {
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0');

        updateState({
            transactions: buildDemoTransactions(),
            customCategories: DEMO_CUSTOM_CATEGORIES.slice(),
            spendingLimit: DEMO_SPENDING_LIMIT,
            sortOrder: 'date-desc',
            selectedMonth: currentMonth
        });

        // Dropdowns are not part of renderAll(), so refresh them here
        updateCategoryDropdown();

        const monthSelect = document.getElementById('month-select');
        if (monthSelect) monthSelect.value = currentMonth;

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'date-desc';

        console.log('Demo data loaded: ' + state.transactions.length + ' transactions');
        return getState();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Render all UI components
     * Requirements traced: 2.1, 2.2, 2.3, 2.4
     */
    function renderAll() {
        renderTransactionList();
        renderBalance();
        updatePieChart();
        renderMonthlySummary();
        updateSpendingLimitDisplay();
    }

    /**
     * Attach all event listeners
     * Requirements traced: 1.1, 1.2, 1.4, 1.5, 3.1, 3.3
     */
    function attachEventListeners() {
        // Cache form elements
        cacheElements();
        
        // Attach form submit handler
        if (elements.form) {
            elements.form.addEventListener('submit', handleFormSubmit);
        }
        
        // Attach event delegation for transaction list delete buttons
        const transactionList = document.getElementById('transaction-list');
        if (transactionList) {
            transactionList.addEventListener('click', function(e) {
                if (e.target.classList.contains('transactions__item-delete')) {
                    const id = e.target.getAttribute('data-id');
                    if (id) {
                        deleteTransaction(id);
                    }
                }
            });
        }

        // Add Category button handler (Task 8.1)
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', function() {
                const input = document.getElementById('custom-category-input');
                if (input && input.value.trim()) {
                    const result = addCustomCategory(input.value);
                    if (result.success) {
                        input.value = '';
                        updateCategoryDropdown();
                        updatePieChart();
                    } else {
                        alert(result.message);
                    }
                }
            });
        }

        // Load demo data button
        const loadDemoBtn = document.getElementById('load-demo-btn');
        if (loadDemoBtn) {
            loadDemoBtn.addEventListener('click', function() {
                const hasData = state.transactions.length > 0;
                if (hasData && !window.confirm('Replace your current data with demo data?')) {
                    return;
                }
                seedDemoData();
            });
        }

        // Sort dropdown handler (Task 10.1)
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function(e) {
                setSortOrder(e.target.value);
            });
        }

        // Month selector handler (Task 9.1)
        const monthSelect = document.getElementById('month-select');
        if (monthSelect) {
            // Set current month as default
            const now = new Date();
            const currentMonth = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0');
            monthSelect.value = currentMonth;
            
            monthSelect.addEventListener('change', function(e) {
                updateState({ selectedMonth: e.target.value });
            });
        }

        // Spending limit button handler (Task 11)
        const setLimitBtn = document.getElementById('set-limit-btn');
        if (setLimitBtn) {
            setLimitBtn.addEventListener('click', function() {
                const modal = document.getElementById('limit-modal');
                if (modal) modal.hidden = false;
            });
        }

        // Spending limit modal handlers (Task 11)
        const modalCancel = document.getElementById('modal-cancel');
        const modalSave = document.getElementById('modal-save');
        const limitInput = document.getElementById('limit-input');
        const modal = document.getElementById('limit-modal');

        if (modalCancel) {
            modalCancel.addEventListener('click', function() {
                if (modal) modal.hidden = true;
            });
        }

        if (modalSave) {
            modalSave.addEventListener('click', function() {
                const limitValue = parseFloat(limitInput.value);
                if (!isNaN(limitValue) && limitValue > 0) {
                    setSpendingLimit(limitValue);
                    if (modal) modal.hidden = true;
                    limitInput.value = '';
                } else {
                    alert('Please enter a valid spending limit');
                }
            });
        }

        // Theme toggle button handler (Task 12.1)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Subscribe to state changes to re-render
        subscribe(function(newState) {
            renderAll();
        });
    }

    /**
     * Initialize the application
     * Requirements traced: 11.2, 11.3, 11.4
     */
    function init() {
        // Check localStorage availability
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage not available. Data will not persist between sessions.');
            // Could show a banner to user in future implementation
        }

        // Load state from localStorage
        const savedState = loadState();
        if (savedState) {
            state = { ...initialState, ...savedState };
        }

        // Set initial month to current month (Task 9.1)
        if (!state.selectedMonth) {
            const now = new Date();
            state.selectedMonth = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0');
        }

        // Apply theme
        applyTheme(state.theme);

        // Update category dropdown with custom categories
        updateCategoryDropdown();

        // Set month selector to current/saved month (Task 9.1)
        const monthSelect = document.getElementById('month-select');
        if (monthSelect) {
            monthSelect.value = state.selectedMonth;
        }

        // Render initial UI
        renderAll();

        // Attach event listeners
        attachEventListeners();

        console.log('Expense Tracker initialized');
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        init: init,
        getState: getState,
        updateState: updateState,
        subscribe: subscribe,
        // Transaction operations
        addTransaction: addTransaction,
        deleteTransaction: deleteTransaction,
        // Balance and display
        renderBalance: renderBalance,
        calculateTotalBalance: calculateTotalBalance,
        calculateCategoryTotal: calculateCategoryTotal,
        calculateMonthlyTotal: calculateMonthlyTotal,
        // Chart integration (Task 7)
        getCategoryTotals: getCategoryTotals,
        updatePieChart: updatePieChart,
        // Custom categories (Task 8)
        addCustomCategory: addCustomCategory,
        removeCustomCategory: removeCustomCategory,
        updateCategoryDropdown: updateCategoryDropdown,
        // Sorting (Task 10)
        sortTransactions: sortTransactions,
        setSortOrder: setSortOrder,
        getSortedTransactions: getSortedTransactions,
        // Monthly summary (Task 9)
        getMonthlyData: getMonthlyData,
        getMonthlyBreakdown: getMonthlyBreakdown,
        renderMonthlySummary: renderMonthlySummary,
        // Spending limit (Task 11)
        setSpendingLimit: setSpendingLimit,
        updateSpendingLimitDisplay: updateSpendingLimitDisplay,
        // Theme management (Task 12)
        setTheme: setTheme,
        toggleTheme: toggleTheme,
        applyTheme: applyTheme,
        // Demo data
        seedDemoData: seedDemoData,
        buildDemoTransactions: buildDemoTransactions,
        // Validation (exposed for testing)
        validateName: validateName,
        validateAmount: validateAmount,
        validateCategory: validateCategory,
        validateForm: validateForm
    };

})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', ExpenseTracker.init);
