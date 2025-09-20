/**
 * Manufacturing Flow Test Script
 * Tests the complete BOM -> MO -> WO -> Stock Ledger workflow
 * Based on the Wooden Table example from the test case
 */

// Import axios with error handling
let axios;
try {
  axios = require("axios");
} catch (error) {
  console.error(
    "❌ Error: axios is not installed. Please run: npm install axios"
  );
  process.exit(1);
}

// Configuration
const BASE_URL = "http://localhost:3001/api";
const FRONTEND_URL = "http://localhost:5173";

// Test data based on the Wooden Table example
const testData = {
  user: {
    loginId: "testuser4",
    email: "test4@example.com",
    password: "Test123!",
    role: "ADMIN",
  },
  product: {
    name: "Wooden Table",
    type: "FINISHED_GOOD",
    unit: "Unit",
    salesPrice: 150.0,
    currentStock: 0,
    reorderPoint: 5,
  },
  components: [
    {
      name: "Wooden Legs",
      type: "RAW_MATERIAL",
      unit: "Unit",
      currentStock: 50,
      reorderPoint: 10,
    },
    {
      name: "Wooden Top",
      type: "RAW_MATERIAL",
      unit: "Unit",
      currentStock: 20,
      reorderPoint: 5,
    },
    {
      name: "Screws",
      type: "RAW_MATERIAL",
      unit: "Unit",
      currentStock: 200,
      reorderPoint: 50,
    },
    {
      name: "Varnish Bottle",
      type: "RAW_MATERIAL",
      unit: "Bottle",
      currentStock: 15,
      reorderPoint: 3,
    },
  ],
  workCenters: [
    { name: "Assembly Line", status: "ACTIVE", capacity: 10, hourlyRate: 25.0 },
    { name: "Paint Floor", status: "ACTIVE", capacity: 5, hourlyRate: 30.0 },
    {
      name: "Packaging Line",
      status: "ACTIVE",
      capacity: 15,
      hourlyRate: 20.0,
    },
  ],
  bom: {
    finishedProduct: "Wooden Table",
    quantity: 1,
    reference: "BOM-TABLE-001",
    components: [
      { product_name: "Wooden Legs", quantity: 4, unit: "Unit" },
      { product_name: "Wooden Top", quantity: 1, unit: "Unit" },
      { product_name: "Screws", quantity: 12, unit: "Unit" },
      { product_name: "Varnish Bottle", quantity: 1, unit: "Bottle" },
    ],
    operations: [
      {
        operation: "Assembly",
        workCenter: "Assembly Line",
        expectedDuration: 60,
      },
      {
        operation: "Painting",
        workCenter: "Paint Floor",
        expectedDuration: 30,
      },
      {
        operation: "Packing",
        workCenter: "Packaging Line",
        expectedDuration: 20,
      },
    ],
  },
  manufacturingOrder: {
    productId: null, // Will be set after product creation
    quantity: 10, // Producing 10 units as per test case
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    bomId: null, // Will be set after BOM creation
  },
};

class ManufacturingFlowTester {
  constructor() {
    this.authToken = null;
    this.createdIds = {
      products: [],
      workCenters: [],
      boms: [],
      manufacturingOrders: [],
      workOrders: [],
    };
    this.testResults = [];
    this.testData = { ...testData }; // Create a copy of test data
  }

  // Utility methods
  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));

      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  }

  // Test methods
  async testUserRegistration() {
    this.log("Testing user registration...");

    // First try to delete existing user if it exists
    try {
      const loginResult = await this.makeRequest("POST", "/auth/login", {
        identifier: testData.user.loginId,
        password: testData.user.password,
      });

      if (loginResult.success) {
        // User exists, try to delete it (this might fail if no delete endpoint exists)
        this.log("Existing user found, attempting to clean up...", "info");
        // Try to delete the user - this might not work if no delete endpoint exists
        await this.makeRequest(
          "DELETE",
          `/users/${loginResult.data.data.user.id}`
        );
      }
    } catch (error) {
      // User doesn't exist, that's fine
    }

    const result = await this.makeRequest(
      "POST",
      "/auth/register",
      testData.user
    );

    if (result.success) {
      this.log("User registration successful", "success");
      return true;
    } else if (result.error.includes("already exists")) {
      this.log("User already exists, proceeding with login", "info");
      return true;
    } else {
      this.log(`User registration failed: ${result.error}`, "error");
      return false;
    }
  }

  async testUserLogin() {
    this.log("Testing user login...");

    const result = await this.makeRequest("POST", "/auth/login", {
      identifier: testData.user.loginId,
      password: testData.user.password,
    });

    if (result.success && result.data.data && result.data.data.token) {
      this.authToken = result.data.data.token;
      this.log("User login successful", "success");
      return true;
    } else {
      this.log(`User login failed: ${result.error}`, "error");
      this.log(`Response data: ${JSON.stringify(result.data)}`, "error");
      this.log(`Response status: ${result.status}`, "error");
      return false;
    }
  }

  async testProductCreation() {
    this.log("Testing product creation...");

    // Create finished product
    const finishedProductResult = await this.makeRequest(
      "POST",
      "/products",
      testData.product
    );
    if (finishedProductResult.success) {
      this.createdIds.products.push(finishedProductResult.data.data.id);
      this.testData.manufacturingOrder.productId =
        finishedProductResult.data.data.id;
      this.log(
        `Product ID set to: ${this.testData.manufacturingOrder.productId}`,
        "info"
      );
      this.log("Finished product created successfully", "success");
    } else {
      this.log(
        `Finished product creation failed: ${finishedProductResult.error}`,
        "error"
      );
      return false;
    }

    // Create component products
    for (const component of testData.components) {
      const result = await this.makeRequest("POST", "/products", component);
      if (result.success) {
        this.createdIds.products.push(result.data.id);
        this.log(
          `Component product '${component.name}' created successfully`,
          "success"
        );
      } else {
        this.log(
          `Component product '${component.name}' creation failed: ${result.error}`,
          "error"
        );
        return false;
      }
    }

    return true;
  }

  async testWorkCenterCreation() {
    this.log("Testing work center creation...");

    for (const workCenter of testData.workCenters) {
      const result = await this.makeRequest(
        "POST",
        "/work-centers",
        workCenter
      );
      if (result.success) {
        this.createdIds.workCenters.push(result.data.id);
        this.log(
          `Work center '${workCenter.name}' created successfully`,
          "success"
        );
      } else {
        this.log(
          `Work center '${workCenter.name}' creation failed: ${result.error}`,
          "error"
        );
        return false;
      }
    }

    return true;
  }

  async testBOMCreation() {
    this.log("Testing BOM creation...");

    // Get the finished product ID
    const productsResult = await this.makeRequest("GET", "/products");
    if (!productsResult.success) {
      this.log(`Failed to fetch products: ${productsResult.error}`, "error");
      return false;
    }

    const finishedProduct = productsResult.data.data.products.find(
      (p) => p.name === testData.bom.finishedProduct
    );
    if (!finishedProduct) {
      this.log(
        `Finished product '${testData.bom.finishedProduct}' not found`,
        "error"
      );
      return false;
    }

    // Get work center IDs
    const workCentersResult = await this.makeRequest("GET", "/work-centers");
    if (!workCentersResult.success) {
      this.log(
        `Failed to fetch work centers: ${workCentersResult.error}`,
        "error"
      );
      this.log(
        `Response data: ${JSON.stringify(workCentersResult.data)}`,
        "error"
      );
      this.log(`Response status: ${workCentersResult.status}`, "error");
      return false;
    }

    // Map operations to use work center IDs
    const operationsWithIds = testData.bom.operations.map((op, index) => {
      const workCenter = workCentersResult.data.data.workCenters.find(
        (wc) => wc.name === op.workCenter
      );
      if (!workCenter) {
        throw new Error(`Work center '${op.workCenter}' not found`);
      }
      return {
        sequence: index + 1,
        name: op.operation,
        timeMinutes: op.expectedDuration,
        workCenterId: workCenter.id,
      };
    });

    // Map components to use product IDs
    const componentsWithIds = testData.bom.components.map((comp) => {
      const product = productsResult.data.data.products.find(
        (p) => p.name === comp.product_name
      );
      if (!product) {
        throw new Error(`Component product '${comp.product_name}' not found`);
      }
      return {
        productId: product.id,
        quantity: comp.quantity,
        unit: comp.unit,
      };
    });

    const bomData = {
      productId: finishedProduct.id,
      version: "1.0",
      components: componentsWithIds,
      operations: operationsWithIds,
    };

    const result = await this.makeRequest("POST", "/boms", bomData);
    if (result.success) {
      this.log(`BOM created with ID: ${result.data.data.id}`, "success");
      this.createdIds.boms.push(result.data.data.id);
      this.testData.manufacturingOrder.bomId = result.data.data.id;
      this.log("BOM created successfully", "success");
      return true;
    } else {
      this.log(`BOM creation failed: ${result.error}`, "error");
      return false;
    }
  }

  async testManufacturingOrderCreation() {
    this.log("Testing Manufacturing Order creation...");
    this.log(
      `Creating MO with BOM ID: ${this.testData.manufacturingOrder.bomId}`,
      "info"
    );
    this.log(
      `Product ID: ${this.testData.manufacturingOrder.productId}`,
      "info"
    );

    const result = await this.makeRequest(
      "POST",
      "/manufacturing-orders",
      this.testData.manufacturingOrder
    );
    if (result.success) {
      this.log(
        `Manufacturing Order created with ID: ${result.data.data.id}`,
        "success"
      );
      this.createdIds.manufacturingOrders.push(result.data.data.id);
      this.log("Manufacturing Order created successfully", "success");
      return result.data;
    } else {
      this.log(`Manufacturing Order creation failed: ${result.error}`, "error");
      this.log(`Response data: ${JSON.stringify(result.data)}`, "error");
      this.log(`Response status: ${result.status}`, "error");
      return false;
    }
  }

  async testBOMAutoPopulation() {
    this.log("Testing BOM auto-population in MO...");

    const moId = this.createdIds.manufacturingOrders[0];
    this.log(`Fetching MO with ID: ${moId}`, "info");
    const result = await this.makeRequest(
      "GET",
      `/manufacturing-orders/${moId}`
    );

    if (result.success) {
      const mo = result.data.data;
      this.log(`MO data: ${JSON.stringify(mo, null, 2)}`, "info");

      // Check if components are auto-populated
      this.log(
        `Components check: mo.components exists: ${!!mo.components}, length: ${
          mo.components?.length
        }`,
        "info"
      );
      if (mo.components && mo.components.length > 0) {
        this.log("BOM components auto-populated successfully", "success");

        // Verify component quantities are scaled
        const expectedComponents = testData.bom.components.map((comp) => ({
          ...comp,
          quantity: comp.quantity * testData.manufacturingOrder.quantity,
        }));

        let allComponentsCorrect = true;
        for (const expected of expectedComponents) {
          const actual = mo.components.find(
            (c) => c.componentName === expected.product_name
          );
          if (!actual || actual.toConsume !== expected.quantity) {
            this.log(
              `Component ${expected.product_name} quantity mismatch. Expected: ${expected.quantity}, Actual: ${actual?.toConsume}`,
              "error"
            );
            allComponentsCorrect = false;
          }
        }

        if (allComponentsCorrect) {
          this.log("Component quantities scaled correctly", "success");
        }

        return allComponentsCorrect;
      } else {
        this.log("BOM components not auto-populated", "error");
        return false;
      }
    } else {
      this.log(`Failed to fetch MO: ${result.error}`, "error");
      return false;
    }
  }

  async testWorkOrderCreation() {
    this.log("Testing Work Order creation...");

    const moId = this.createdIds.manufacturingOrders[0];

    // Get the manufacturing order to check work orders
    const result = await this.makeRequest(
      "GET",
      `/manufacturing-orders/${moId}`
    );

    if (
      result.success &&
      result.data.data.workOrders &&
      result.data.data.workOrders.length > 0
    ) {
      this.log("Work Orders auto-created successfully", "success");

      // Verify work order details
      const workOrders = result.data.data.workOrders;
      const expectedOperations = testData.bom.operations;

      let allWorkOrdersCorrect = true;
      for (const expected of expectedOperations) {
        const actual = workOrders.find(
          (wo) => wo.operationName === expected.operation
        );
        if (!actual) {
          this.log(
            `Work Order for operation '${expected.operation}' not found`,
            "error"
          );
          allWorkOrdersCorrect = false;
        } else if (actual.estimatedTimeMinutes !== expected.expectedDuration) {
          this.log(
            `Work Order duration mismatch for '${expected.operation}'. Expected: ${expected.expectedDuration}, Actual: ${actual.estimatedTimeMinutes}`,
            "error"
          );
          allWorkOrdersCorrect = false;
        }
      }

      if (allWorkOrdersCorrect) {
        this.log("Work Order details are correct", "success");
      }

      this.createdIds.workOrders = workOrders.map((wo) => wo.id);
      return allWorkOrdersCorrect;
    } else {
      this.log("Work Orders not auto-created", "error");
      return false;
    }
  }

  async testManufacturingOrderConfirmation() {
    this.log("Testing Manufacturing Order confirmation...");

    const moId = this.createdIds.manufacturingOrders[0];
    const result = await this.makeRequest(
      "PATCH",
      `/manufacturing-orders/${moId}/status`,
      {
        status: "CONFIRMED",
      }
    );

    if (result.success) {
      this.log("Manufacturing Order confirmed successfully", "success");
      return true;
    } else {
      this.log(
        `Manufacturing Order confirmation failed: ${result.error}`,
        "error"
      );
      return false;
    }
  }

  async testWorkOrderExecution() {
    this.log("Testing Work Order execution...");

    this.log(
      `Work orders available: ${this.createdIds.workOrders.length}`,
      "info"
    );
    this.log(
      `Work order IDs: ${JSON.stringify(this.createdIds.workOrders)}`,
      "info"
    );

    const workOrderId = this.createdIds.workOrders[0];

    // Start work order
    const startResult = await this.makeRequest(
      "PATCH",
      `/work-orders/${workOrderId}/start`
    );

    if (startResult.success) {
      this.log("Work Order started successfully", "success");

      // Wait a bit to simulate work
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete work order
      const completeResult = await this.makeRequest(
        "PATCH",
        `/work-orders/${workOrderId}/done`
      );

      if (completeResult.success) {
        this.log("Work Order completed successfully", "success");

        // Mark manufacturing order as IN_PROGRESS first, then TO_CLOSE, then DONE
        const moId = this.createdIds.manufacturingOrders[0];

        // Step 1: IN_PROGRESS
        const inProgressResult = await this.makeRequest(
          "PATCH",
          `/manufacturing-orders/${moId}/status`,
          { status: "IN_PROGRESS" }
        );

        if (inProgressResult.success) {
          this.log("Manufacturing Order marked as IN_PROGRESS", "success");

          // Step 2: TO_CLOSE
          const toCloseResult = await this.makeRequest(
            "PATCH",
            `/manufacturing-orders/${moId}/status`,
            { status: "TO_CLOSE" }
          );

          if (toCloseResult.success) {
            this.log("Manufacturing Order marked as TO_CLOSE", "success");

            // Step 3: DONE
            const doneResult = await this.makeRequest(
              "PATCH",
              `/manufacturing-orders/${moId}/status`,
              { status: "DONE" }
            );

            if (doneResult.success) {
              this.log("Manufacturing Order marked as DONE", "success");
            } else {
              this.log(
                `Failed to mark MO as DONE: ${doneResult.error}`,
                "error"
              );
            }
          } else {
            this.log(
              `Failed to mark MO as TO_CLOSE: ${toCloseResult.error}`,
              "error"
            );
          }
        } else {
          this.log(
            `Failed to mark MO as IN_PROGRESS: ${inProgressResult.error}`,
            "error"
          );
        }

        return true;
      } else {
        this.log(
          `Work Order completion failed: ${completeResult.error}`,
          "error"
        );
        this.log(
          `Response data: ${JSON.stringify(completeResult.data)}`,
          "error"
        );
        this.log(`Response status: ${completeResult.status}`, "error");
        return false;
      }
    } else {
      this.log(`Work Order start failed: ${startResult.error}`, "error");
      this.log(`Response data: ${JSON.stringify(startResult.data)}`, "error");
      this.log(`Response status: ${startResult.status}`, "error");
      return false;
    }
  }

  async testStockLedgerUpdates() {
    this.log("Testing Stock Ledger updates...");

    // Check stock movements
    const result = await this.makeRequest("GET", "/stock-movements");

    if (result.success) {
      const movements = result.data;
      this.log(
        `Stock movements: ${JSON.stringify(movements, null, 2)}`,
        "info"
      );

      // Check for consumption movements (OUT)
      const consumptionMovements = movements.filter(
        (m) => m.movementType === "OUT"
      );
      const productionMovements = movements.filter(
        (m) => m.movementType === "IN"
      );

      if (consumptionMovements.length > 0) {
        this.log("Stock consumption movements recorded", "success");
      } else {
        this.log("No stock consumption movements found", "error");
        return false;
      }

      if (productionMovements.length > 0) {
        this.log("Stock production movements recorded", "success");
      } else {
        this.log("No stock production movements found", "error");
        return false;
      }

      // Verify quantities
      const expectedConsumption = {
        "Wooden Legs": 40, // 4 * 10 units
        "Wooden Top": 10, // 1 * 10 units
        Screws: 120, // 12 * 10 units
        "Varnish Bottle": 10, // 1 * 10 units
      };

      const expectedProduction = {
        "Wooden Table": 10, // 10 units produced
      };

      let consumptionCorrect = true;
      for (const [product, expectedQty] of Object.entries(
        expectedConsumption
      )) {
        const movement = consumptionMovements.find(
          (m) => m.product?.name === product
        );
        if (!movement || Math.abs(movement.quantity) !== expectedQty) {
          this.log(
            `Consumption quantity mismatch for ${product}. Expected: ${expectedQty}, Actual: ${movement?.quantity}`,
            "error"
          );
          consumptionCorrect = false;
        }
      }

      let productionCorrect = true;
      for (const [product, expectedQty] of Object.entries(expectedProduction)) {
        const movement = productionMovements.find(
          (m) => m.product?.name === product
        );
        if (!movement || movement.quantity !== expectedQty) {
          this.log(
            `Production quantity mismatch for ${product}. Expected: ${expectedQty}, Actual: ${movement?.quantity}`,
            "error"
          );
          productionCorrect = false;
        }
      }

      if (consumptionCorrect && productionCorrect) {
        this.log("Stock Ledger quantities are correct", "success");
        return true;
      } else {
        return false;
      }
    } else {
      this.log(`Failed to fetch stock ledger: ${result.error}`, "error");
      return false;
    }
  }

  async testCurrentStockUpdates() {
    this.log("Testing current stock updates...");

    // Check updated stock levels
    const result = await this.makeRequest("GET", "/products");

    if (result.success) {
      const products = result.data.data.products;

      // Check component stock reductions
      const expectedStockReductions = {
        "Wooden Legs": 10, // 50 - 40
        "Wooden Top": 10, // 20 - 10
        Screws: 80, // 200 - 120
        "Varnish Bottle": 5, // 15 - 10
      };

      const expectedStockIncrease = {
        "Wooden Table": 10, // 0 + 10
      };

      let stockUpdatesCorrect = true;

      for (const [productName, expectedStock] of Object.entries(
        expectedStockReductions
      )) {
        const product = products.find((p) => p.name === productName);
        if (!product || product.currentStock !== expectedStock) {
          this.log(
            `Stock reduction incorrect for ${productName}. Expected: ${expectedStock}, Actual: ${product?.currentStock}`,
            "error"
          );
          stockUpdatesCorrect = false;
        }
      }

      for (const [productName, expectedStock] of Object.entries(
        expectedStockIncrease
      )) {
        const product = products.find((p) => p.name === productName);
        if (!product || product.currentStock !== expectedStock) {
          this.log(
            `Stock increase incorrect for ${productName}. Expected: ${expectedStock}, Actual: ${product?.currentStock}`,
            "error"
          );
          stockUpdatesCorrect = false;
        }
      }

      if (stockUpdatesCorrect) {
        this.log("Current stock updates are correct", "success");
        return true;
      } else {
        return false;
      }
    } else {
      this.log(`Failed to fetch products: ${result.error}`, "error");
      return false;
    }
  }

  async cleanup() {
    this.log("Cleaning up test data...");

    // Delete in reverse order to respect foreign key constraints
    for (const moId of this.createdIds.manufacturingOrders) {
      await this.makeRequest("DELETE", `/manufacturing-orders/${moId}`);
    }

    for (const bomId of this.createdIds.boms) {
      await this.makeRequest("DELETE", `/boms/${bomId}`);
    }

    for (const wcId of this.createdIds.workCenters) {
      await this.makeRequest("DELETE", `/work-centers/${wcId}`);
    }

    for (const productId of this.createdIds.products) {
      await this.makeRequest("DELETE", `/products/${productId}`);
    }

    this.log("Cleanup completed", "success");
  }

  async runFullTest() {
    this.log("🚀 Starting Manufacturing Flow Test Suite", "info");
    this.log("=".repeat(50), "info");

    // Wait a bit to let any rate limiting reset
    this.log("Waiting for rate limiting to reset...", "info");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const tests = [
      { name: "User Registration", fn: () => this.testUserRegistration() },
      { name: "User Login", fn: () => this.testUserLogin() },
      { name: "Product Creation", fn: () => this.testProductCreation() },
      { name: "Work Center Creation", fn: () => this.testWorkCenterCreation() },
      { name: "BOM Creation", fn: () => this.testBOMCreation() },
      {
        name: "Manufacturing Order Creation",
        fn: () => this.testManufacturingOrderCreation(),
      },
      { name: "BOM Auto-Population", fn: () => this.testBOMAutoPopulation() },
      { name: "Work Order Creation", fn: () => this.testWorkOrderCreation() },
      {
        name: "MO Confirmation",
        fn: () => this.testManufacturingOrderConfirmation(),
      },
      { name: "Work Order Execution", fn: () => this.testWorkOrderExecution() },
      { name: "Stock Ledger Updates", fn: () => this.testStockLedgerUpdates() },
      {
        name: "Current Stock Updates",
        fn: () => this.testCurrentStockUpdates(),
      },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passedTests++;
          this.testResults.push({ name: test.name, status: "PASSED" });
        } else {
          this.testResults.push({ name: test.name, status: "FAILED" });
        }
      } catch (error) {
        this.log(
          `Test '${test.name}' threw an error: ${error.message}`,
          "error"
        );
        this.testResults.push({ name: test.name, status: "ERROR" });
      }
    }

    // Cleanup
    await this.cleanup();

    // Summary
    this.log("=".repeat(50), "info");
    this.log("📊 Test Results Summary:", "info");
    this.log(`Total Tests: ${totalTests}`, "info");
    this.log(`Passed: ${passedTests}`, "success");
    this.log(`Failed: ${totalTests - passedTests}`, "error");
    this.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
      "info"
    );

    this.log("\nDetailed Results:", "info");
    this.testResults.forEach((result) => {
      const icon = result.status === "PASSED" ? "✅" : "❌";
      this.log(`${icon} ${result.name}: ${result.status}`);
    });

    if (passedTests === totalTests) {
      this.log(
        "\n🎉 All tests passed! Manufacturing flow is working correctly.",
        "success"
      );
      return true;
    } else {
      this.log(
        "\n⚠️ Some tests failed. Please check the errors above.",
        "error"
      );
      return false;
    }
  }
}

// Run the test
async function runTest() {
  const tester = new ManufacturingFlowTester();

  try {
    const success = await tester.runFullTest();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("Test suite failed with error:", error);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = { ManufacturingFlowTester, testData };

// Run if called directly
if (require.main === module) {
  runTest();
}
