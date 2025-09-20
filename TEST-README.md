# Manufacturing Flow Test Suite

This test suite validates the complete Bill of Materials (BOM) to Manufacturing Order (MO) to Work Order (WO) workflow based on the Wooden Table example.

## Test Scenario

The test follows this exact flow from your test case:

### 1. Bill of Materials (BOM)
- **Product**: Wooden Table (1 Unit)
- **Components**:
  - 4 × Wooden Legs
  - 1 × Wooden Top  
  - 12 × Screws
  - 1 × Varnish Bottle
- **Operations**:
  - Assembly - 60 mins (Assembly Line)
  - Painting - 30 mins (Paint Floor)
  - Packing - 20 mins (Packaging Line)

### 2. Manufacturing Order (MO)
- **Quantity**: 10 Units (scales the BOM recipe)
- **Auto-population**: Components and operations from BOM
- **Expected Component Quantities**:
  - 40 × Wooden Legs (4 × 10)
  - 10 × Wooden Top (1 × 10)
  - 120 × Screws (12 × 10)
  - 10 × Varnish Bottle (1 × 10)

### 3. Work Orders (WO)
- **Assembly**: Assembly Line, 60 mins
- **Painting**: Paint Floor, 30 mins
- **Packing**: Packaging Line, 20 mins

### 4. Stock Ledger Validation
- **Stock Out (Consumption)**:
  - Legs: -40 Units
  - Tops: -10 Units
  - Screws: -120 Units
  - Varnish: -10 Bottles
- **Stock In (Production)**:
  - Tables: +10 Units

## Prerequisites

1. **Backend Server**: Make sure your backend is running on `http://localhost:3000`
2. **Database**: Ensure your database is set up and migrated
3. **Node.js**: Install Node.js (version 14 or higher)

## Installation

1. Install test dependencies:
```bash
npm install --package-lock-only --package-lock=test-package.json
npm install axios
```

## Running the Test

### Option 1: Direct execution
```bash
node test-manufacturing-flow.js
```

### Option 2: Using npm script
```bash
npm run test
```

### Option 3: Watch mode (re-runs on file changes)
```bash
npm run test:watch
```

## Test Flow

The test performs these steps in sequence:

1. **User Registration & Login** - Creates a test user and authenticates
2. **Product Creation** - Creates the finished product and all component products
3. **Work Center Creation** - Creates Assembly Line, Paint Floor, and Packaging Line
4. **BOM Creation** - Creates the Bill of Materials with components and operations
5. **Manufacturing Order Creation** - Creates MO for 10 units
6. **BOM Auto-Population** - Verifies components are auto-populated and quantities scaled
7. **Work Order Creation** - Verifies work orders are auto-created from BOM operations
8. **MO Confirmation** - Confirms the manufacturing order
9. **Work Order Execution** - Starts and completes a work order
10. **Stock Ledger Updates** - Verifies stock movements are recorded correctly
11. **Current Stock Updates** - Verifies product stock levels are updated correctly
12. **Cleanup** - Removes all test data

## Expected Results

If all tests pass, you should see:
```
🎉 All tests passed! Manufacturing flow is working correctly.
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure your backend server is running on port 3000
2. **Authentication Failed**: Check if user registration/login endpoints are working
3. **Database Errors**: Ensure your database is properly set up and migrated
4. **Missing Endpoints**: Verify all API endpoints are implemented

### Debug Mode

To see detailed API responses, you can modify the `makeRequest` method in the test file to log responses:

```javascript
console.log('Response:', response.data);
```

## Test Data

The test uses this specific data structure:

- **User**: Manufacturing Manager role
- **Products**: Wooden Table + 4 component products
- **Work Centers**: 3 work centers for different operations
- **BOM**: Complete recipe with components and operations
- **MO**: 10 units production order

## Validation Points

The test validates:

✅ **BOM Creation**: All components and operations are saved correctly  
✅ **MO Auto-Population**: BOM data is automatically populated in MO  
✅ **Quantity Scaling**: Component quantities are multiplied by MO quantity  
✅ **Work Order Creation**: Operations become work orders with correct details  
✅ **Stock Movements**: Consumption and production movements are recorded  
✅ **Stock Updates**: Current stock levels are updated correctly  
✅ **Work Flow**: MO → WO → Stock Ledger flow works end-to-end  

## Customization

You can modify the test data in the `testData` object at the top of the test file to test different scenarios:

```javascript
const testData = {
  // Modify these values to test different scenarios
  product: { /* ... */ },
  components: [ /* ... */ ],
  bom: { /* ... */ },
  manufacturingOrder: { /* ... */ }
};
```

## Integration with CI/CD

This test can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Manufacturing Flow Tests
  run: |
    npm install axios
    node test-manufacturing-flow.js
```

## Support

If you encounter issues with the test:

1. Check the console output for specific error messages
2. Verify your backend API endpoints are working
3. Ensure your database schema matches the expected structure
4. Check that all required fields are being sent in API requests

The test is designed to be comprehensive and will help identify any issues in your manufacturing flow implementation.