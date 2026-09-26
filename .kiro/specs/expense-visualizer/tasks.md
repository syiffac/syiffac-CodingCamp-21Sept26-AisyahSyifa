# Implementation Plan: Expense & Budget Visualizer

## Overview

A mobile-friendly web application for tracking daily spending through transaction entry, balance monitoring, and visual spending analysis. The application operates entirely client-side using browser Local Storage for data persistence.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure: `css/` and `js/`
  - Create `index.html` with semantic HTML5 structure
  - Include form section with Item Name, Amount, Category dropdown
  - Include transaction list container
  - Include total balance display area
  - Include pie chart canvas container
  - Include monthly summary section
  - Include theme toggle button
  - Link Chart.js via CDN
  - _Requirements: 14.1, 15.1, 15.2, 15.3_

- [x] 2. Implement CSS styling with mobile-first responsive design
  - [x] 2.1 Create `css/styles.css` with mobile-first approach
    - Define CSS custom properties for colors, spacing, typography
    - Style form inputs with proper touch targets
    - Style transaction list with scrollable container
    - Style balance display prominently at top
    - Style pie chart container
    - Ensure responsive design works on 320px+ screens
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 2.2 Implement dark/light theme support
    - Define theme-specific CSS variables
    - Implement theme switching via `data-theme` attribute on `html` element
    - Add smooth transitions for theme changes
    - Ensure chart colors adapt to theme
    - _Requirements: 9.1, 9.2_

- [x] 3. Implement JavaScript core - State Management & Local Storage
  - [x] 3.1 Create `js/app.js` with module pattern
    - Define initial state object matching AppState interface
    - Implement `getState()` function
    - Implement `updateState()` function with subscriber notification
    - Implement `subscribe()` function for state change listeners
    - _Requirements: 11.1, 11.2_

  - [x] 3.2 Implement Local Storage adapter
    - Implement `loadState()` to retrieve stored data on page load
    - Implement `saveState()` to persist data immediately on changes
    - Handle Local Storage unavailability gracefully
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x]* 3.3 Write property tests for state management
    - **Property 1: Transaction Creation Preserves Data**
    - Generate random valid transaction data, verify all fields preserved
    - **Validates: Requirements 1.1**

- [x] 4. Implement Transaction Form & Validation
  - [x] 4.1 Build transaction form handler
    - Get form elements and attach submit event listener
    - Generate unique ID for each transaction
    - Add timestamp to transaction
    - Clear form after successful submission
    - _Requirements: 1.1, 1.4_

  - [x] 4.2 Implement input validation
    - Validate all fields are filled (non-empty after trim)
    - Validate amount is positive number > 0
    - Show inline validation error messages
    - Prevent submission on validation failure
    - _Requirements: 1.2, 1.5_

  - [ ]* 4.3 Write property tests for input validation
    - **Property 2: Input Validation Rejects Empty Fields**
    - Generate empty/whitespace inputs, verify rejection
    - **Validates: Requirements 1.2**
    - **Property 3: Positive Amount Validation**
    - Generate various numeric values, verify only positive accepted
    - **Validates: Requirements 1.5**

- [ ] 5. Implement Transaction List Rendering & Deletion
  - [x] 5.1 Create transaction list renderer
    - Implement `renderTransactionList()` function
    - Create list items with name, amount, category, formatted date
    - Display empty state message when no transactions exist
    - Enable scrolling when list exceeds visible area
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 5.2 Implement transaction deletion
    - Implement `deleteTransaction(id)` function
    - Add delete button to each transaction item
    - Attach click handlers for delete buttons
    - Update Local Storage after deletion
    - Re-render list after deletion
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.3 Write property tests for transaction operations
    - **Property 4: Transaction Deletion Removes Entry**
    - Generate random transaction lists, delete random element, verify removal
    - **Validates: Requirements 3.1**

- [ ] 6. Implement Balance Calculation & Display
  - [ ] 6.1 Create calculator module
    - Implement `calculateTotal()` to sum all transaction amounts
    - Implement `renderBalance()` to display formatted currency
    - Update balance display after any transaction add/delete
    - Display zero when no transactions exist
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 6.2 Write property tests for balance calculation
    - **Property 5: Balance Equals Transaction Sum**
    - Generate random transaction lists, verify sum correctness
    - **Validates: Requirements 4.2**

- [ ] 7. Implement Pie Chart Integration
  - [ ] 7.1 Create Chart.js integration
    - Initialize Chart.js pie chart on canvas element
    - Implement `getCategoryTotals()` to calculate breakdown
    - Define fixed colors for each category
    - Include all predefined categories (Food, Transport, Fun) even at 0%
    - Update chart immediately after transaction changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property tests for chart calculations
    - **Property 6: Category Percentages Sum to 100**
    - Generate random transactions, verify percentages sum to 100%
    - **Validates: Requirements 5.2**
    - **Property 7: Predefined Categories Always Present**
    - Generate any transaction list, verify Food, Transport, Fun always included
    - **Validates: Requirements 5.5**

- [ ] 8. Implement Custom Categories Feature
  - [ ] 8.1 Build custom category management
    - Add "Add Category" input and button in form area
    - Implement `addCustomCategory()` with duplicate validation
    - Enforce maximum of 5 custom categories
    - Display limit reached message when max exceeded
    - Update category dropdown to include custom categories
    - Persist custom categories in state
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.2 Integrate custom categories with pie chart
    - Display custom categories in pie chart
    - Assign unique colors to custom categories
    - _Requirements: 6.5_

  - [ ]* 8.3 Write property tests for category limit
    - **Property 8: Custom Category Limit Enforcement**
    - Generate attempts to add 6th category, verify rejection
    - **Validates: Requirements 6.2**

- [ ] 9. Implement Monthly Summary View
  - [ ] 9.1 Create monthly summary component
    - Add month selector (dropdown or tabs)
    - Implement `getMonthlyData()` to filter transactions by month
    - Implement `renderMonthlySummary()` to display totals and breakdown
    - Calculate percentage per category for selected month
    - Display zero values when no transactions for month
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.2 Write property tests for monthly calculations
    - **Property 9: Monthly Total Correctness**
    - Generate transactions with various dates, verify monthly sum
    - **Validates: Requirements 7.1, 7.2**
    - **Property 10: Month Selection Filters Correctly**
    - Generate transactions, select random month, verify correct filtering
    - **Validates: Requirements 7.3**

- [ ] 10. Implement Transaction Sorting Feature
  - [ ] 10.1 Build sorting functionality
    - Add sort dropdown above transaction list
    - Implement sort options: Amount (high-low), Amount (low-high), Category (A-Z), Category (Z-A)
    - Implement `sortTransactions()` function
    - Persist sort preference in state
    - Re-render list with sorted transactions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 10.2 Write property tests for sorting
    - **Property 11: High-to-Low Sort Order**
    - Generate random lists, verify descending amount order
    - **Validates: Requirements 8.1**
    - **Property 12: Low-to-High Sort Order**
    - Generate random lists, verify ascending amount order
    - **Validates: Requirements 8.2**
    - **Property 13: Alphabetical Category Sort Order**
    - Generate random lists, verify A-Z category order
    - **Validates: Requirements 8.3**
    - **Property 14: Reverse Alphabetical Category Sort Order**
    - Generate random lists, verify Z-A category order
    - **Validates: Requirements 8.4**

- [ ] 11. Implement Spending Limit Feature
  - [ ] 11.1 Create spending limit management
    - Add "Set Limit" button/input in balance section
    - Implement `setSpendingLimit()` function
    - Persist limit in state
    - _Requirements: 10.1, 10.4_

  - [ ] 11.2 Build spending limit display
    - Display progress bar showing current spending vs limit
    - Show remaining budget or "over budget" warning when limit reached/exceeded
    - Hide limit-related UI when no limit set
    - _Requirements: 10.2, 10.3_

  - [ ]* 11.3 Write property tests for spending limit
    - **Property 15: Spending Limit Warning**
    - Generate transactions and limits, verify warning displays correctly
    - **Validates: Requirements 10.2**

- [ ] 12. Implement Dark/Light Theme Toggle
  - [ ] 12.1 Build theme toggle functionality
    - Add theme toggle button to header
    - Toggle `data-theme` attribute on `html` element
    - Save theme preference to Local Storage when changed
    - Load saved theme on page initialization
    - Default to light mode when no preference saved
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 13. Checkpoint - Verify core functionality
  - Ensure all tests pass, ask the user if questions arise.
  - Verify Local Storage persistence works correctly
  - Test theme persistence across page reloads
  - Verify all features work together

- [ ] 14. Final integration and cross-browser testing
  - Test all features in combination
  - Verify Chrome, Firefox, Edge, Safari compatibility
  - Test responsive design on multiple screen sizes
  - Verify performance with 100+ transactions
  - Ensure graceful degradation for Local Storage unavailability
  - Ensure graceful degradation for Chart.js CDN failure
  - _Requirements: 12.1, 12.2, 12.3, 13.1, 13.2, 13.3_

- [ ] 15. Documentation and deployment preparation
  - Update README.md with project description and features
  - Add usage instructions
  - Document browser compatibility
  - Verify all files are in correct locations
  - Prepare for GitHub Pages deployment

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The application uses only HTML, CSS, and Vanilla JavaScript with Chart.js for charting
- All data persists in browser Local Storage

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 8, "tasks": ["9.2", "10.1"] },
    { "id": 9, "tasks": ["10.2", "11.1"] },
    { "id": 10, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 11, "tasks": ["13"] },
    { "id": 12, "tasks": ["14", "15"] }
  ]
}
```
