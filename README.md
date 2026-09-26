# Expense & Budget Visualizer

A mobile-friendly web application for tracking daily spending, visualizing expenses by category, and managing a monthly spending budget. The application operates entirely client-side using browser Local Storage for data persistence—no backend infrastructure required.

## Features

### Core Features ✅

- **Transaction Entry**: Add spending transactions with item name, amount, and category
- **Transaction Management**: View, delete, and sort transactions with multiple sort options
- **Balance Display**: See total spending at a glance, prominently displayed at the top
- **Category Breakdown**: Visual pie chart showing spending distribution across categories
- **Monthly Summary**: Filter and analyze spending for any month with category breakdown
- **Custom Categories**: Create up to 5 custom categories beyond the predefined Food, Transport, and Fun
- **Spending Limit**: Set a monthly budget with progress bar and warning when over limit
- **Theme Toggle**: Switch between light and dark modes with preference persistence
- **Data Persistence**: All data automatically saved to browser Local Storage and persists between sessions
- **Input Validation**: Comprehensive validation for all form inputs with user-friendly error messages
- **Responsive Design**: Mobile-first design that works on all screen sizes (320px and up)

### Data Storage

- **Local Storage Key**: `expenseVisualizer`
- **Stored Data**: 
  - All transactions (id, name, amount, category, date)
  - Custom categories
  - Spending limit
  - User theme preference
  - Sort order preference

### Sorting Options

- Newest First (date descending)
- Oldest First (date ascending)
- Amount High to Low
- Amount Low to High
- Category A-Z
- Category Z-A

## Project Structure

```
revou/
├── index.html           # Main HTML file with semantic structure
├── css/
│   └── styles.css       # Mobile-first CSS with theme support
├── js/
│   └── app.js           # Single JavaScript file with all functionality
├── tests/
│   ├── checkpoint.test.js        # Comprehensive test suite
│   └── validation.test.js        # Validation tests
└── README.md            # Project documentation
```

## Technology Stack

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Mobile-first responsive design with CSS custom properties
- **Vanilla JavaScript**: Pure JavaScript—no frameworks
- **Chart.js**: For pie chart visualization (CDN)
- **Local Storage API**: For client-side data persistence

## Browser Compatibility

The application has been designed and tested for compatibility with:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)
- Safari (latest 2 versions)

All features work in modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- Local Storage API
- Chart.js library

## Getting Started

### Installation

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process, dependencies, or server setup required!

### Usage

1. **Add a Transaction**:
   - Enter the item name, amount, and category
   - Click "Add Transaction"
   - The transaction appears in the list and updates the chart

2. **View Your Spending**:
   - Check the total balance at the top
   - View the pie chart to see spending by category
   - Browse the monthly summary for a specific month

3. **Sort Transactions**:
   - Use the "Sort by" dropdown to reorder transactions
   - Choose from 6 different sort options

4. **Set a Budget**:
   - Click "Set Limit" in the balance section
   - Enter your monthly spending limit
   - The progress bar shows your spending vs. limit

5. **Add Custom Categories**:
   - Enter a category name and click "Add Category"
   - Up to 5 custom categories can be added
   - Custom categories appear in the dropdown and pie chart

6. **Switch Themes**:
   - Click the moon/sun icon in the header
   - Theme preference is saved automatically

7. **Select a Month**:
   - Use the month selector to view spending for different months
   - The monthly summary updates automatically

## Validation Rules

### Transaction Name
- Required (cannot be empty or whitespace only)
- Maximum 100 characters
- Displayed escaped to prevent XSS

### Transaction Amount
- Required
- Must be a positive number greater than 0
- Maximum 999,999,999.99
- Accepts up to 2 decimal places

### Category
- Required
- Must select from predefined (Food, Transport, Fun) or custom categories

### Custom Category
- Maximum 20 characters
- Cannot duplicate existing categories (case-insensitive)
- Limited to 5 custom categories total

## Key Implementation Details

### State Management
- Centralized state object managed through `updateState()` function
- All state changes trigger subscriber notifications
- State persisted to Local Storage immediately on change

### Event Handling
- Event delegation used for transaction list (delegated delete clicks)
- Form submission validation before adding transaction
- Proper error handling for all user interactions

### Chart Integration
- Chart.js pie chart automatically updates on transaction changes
- All predefined categories displayed even with 0 spending
- Dynamic colors assigned to custom categories
- Chart respects theme changes

### Data Calculations
- Category totals calculated dynamically from transaction list
- Monthly filtering based on transaction date ISO strings (YYYY-MM)
- Percentages calculated with floating-point tolerance handling
- Balance updates in real-time after add/delete operations

### Performance
- Efficient DOM updates using HTML string building
- Proper cleanup of Chart.js instances
- Debounced localStorage writes through updateState
- Minimal DOM queries using cached element references

### Accessibility
- Semantic HTML5 elements (header, main, section, nav, etc.)
- Proper ARIA labels and roles
- Visually hidden labels for screen readers
- Keyboard navigation support on form elements
- Sufficient color contrast in both light and dark themes

## File Size & Performance

- **Total Bundled Size**: < 100KB (without Chart.js CDN)
- **Initial Load**: < 2 seconds on typical connection
- **UI Response Time**: < 100ms for all interactions
- **Scrolling Performance**: Smooth scrolling with 100+ transactions

## Error Handling

The application gracefully handles:
- **localStorage unavailable**: Data persists in memory for the session
- **Chart.js CDN failure**: Falls back to text-based category breakdown
- **Invalid input**: Clear validation messages displayed inline
- **Edge cases**: Handles empty transactions, negative amounts, duplicate categories

## Testing

### Test Coverage

The `checkpoint.test.js` file includes comprehensive tests covering:
- State management and subscriptions
- Transaction CRUD operations
- Category management
- All sorting modes
- Monthly filtering and calculations
- Spending limit functionality
- Theme persistence
- Input validation
- Data persistence
- Calculation accuracy

### Running Tests

Tests are written to be framework-independent. They use Jest syntax but include DOM mocks for browser independence.

## Known Limitations

1. **Recurring Transactions**: Not supported—each transaction must be added individually
2. **Budget Categories**: Spending limit is global, not per-category
3. **Data Export**: No built-in export to CSV or other formats
4. **Multi-currency**: Application uses dollar sign ($) format; multi-currency support not available
5. **Offline Sync**: No offline sync capability (single device only)

## Future Enhancements

Potential features for future versions:
- Transaction editing capability
- Recurring transaction templates
- Per-category spending limits
- Data export to CSV/PDF
- Receipt image storage
- Budget forecasting and trends
- Weekly spending view
- Transaction tagging
- Search/filter functionality
- Multi-currency support

## Development Notes

### Code Organization

The `app.js` file is organized into logical sections using comments:
1. State Management
2. Local Storage Adapter
3. ID Generation
4. Input Validation
5. Transaction Operations
6. Transaction List Rendering
7. Form Handling
8. Chart Integration
9. Balance Display
10. Custom Categories
11. Sorting
12. Monthly Summary
13. Spending Limit
14. Theme Management
15. Initialization

### Module Pattern

The entire application uses the JavaScript module pattern (IIFE) to:
- Encapsulate private functions and variables
- Prevent global namespace pollution
- Expose only necessary public API

### Public API

The `ExpenseTracker` object exposes:
- State management: `getState()`, `updateState()`, `subscribe()`
- Transaction operations: `addTransaction()`, `deleteTransaction()`
- Calculations: `calculateTotalBalance()`, `calculateCategoryTotal()`, `calculateMonthlyTotal()`
- Chart: `getCategoryTotals()`, `updatePieChart()`
- Categories: `addCustomCategory()`, `removeCustomCategory()`, `updateCategoryDropdown()`
- Sorting: `sortTransactions()`, `setSortOrder()`, `getSortedTransactions()`
- Monthly: `getMonthlyData()`, `getMonthlyBreakdown()`, `renderMonthlySummary()`
- Limit: `setSpendingLimit()`, `updateSpendingLimitDisplay()`
- Theme: `setTheme()`, `toggleTheme()`, `applyTheme()`
- Validation: `validateName()`, `validateAmount()`, `validateCategory()`, `validateForm()`

## CSS Variables Reference

The application uses CSS custom properties for theming:

### Light Theme (Default)
- Primary: `#2563eb`
- Background: `#f8fafc`
- Text: `#1e293b`

### Dark Theme
- Primary: `#3b82f6`
- Background: `#0f172a`
- Text: `#f1f5f9`

## Browser DevTools Tips

1. **Inspect Local Storage**: `localStorage.getItem('expenseVisualizer')`
2. **Clear All Data**: `localStorage.removeItem('expenseVisualizer')`
3. **Check State**: `ExpenseTracker.getState()`
4. **Add Transaction**: `ExpenseTracker.addTransaction({name: 'Test', amount: '10', category: 'Food'})`

## Responsive Design Breakpoints

- **Mobile**: 320px - 640px (single column, full-width buttons)
- **Tablet**: 641px - 1024px (optimized spacing, larger touch targets)
- **Desktop**: 1025px+ (max-width container at 800px, optimal readability)

## Requirements Compliance

This implementation satisfies all 15 requirements from the specification:

✅ Requirement 1: Transaction Entry
✅ Requirement 2: Transaction Display  
✅ Requirement 3: Transaction Deletion
✅ Requirement 4: Balance Display
✅ Requirement 5: Spending Distribution Chart
✅ Requirement 6: Custom Categories
✅ Requirement 7: Monthly Summary View
✅ Requirement 8: Transaction Sorting
✅ Requirement 9: Theme Toggle
✅ Requirement 10: Spending Limit
✅ Requirement 11: Data Persistence
✅ Requirement 12: Browser Compatibility
✅ Requirement 13: Performance
✅ Requirement 14: User Interface Design
✅ Requirement 15: Project Structure

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions about the application, please refer to the test files for usage examples or review the code comments for implementation details.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Complete ✅
