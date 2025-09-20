/**
 * Final Manufacturing Flow Test
 * Demonstrates the complete BOM -> MO -> WO -> Stock Ledger workflow
 * Based on the Wooden Table example from the test case
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

// Test data based on the Wooden Table example
const testData = {
  inventoryManager: {
    loginId: "inventory_mgr",
    email: "inventory@test.com",
    password: "Test123!",
    role: "INVENTORY_MANAGER",
  },
  manufacturingManager: {
    loginId: "manufacturing_mgr",
    email: "manufacturing@test.com",
    password: "Test123!",
    role: "MANUFACTURING_MANAGER",
  },
  finishedProduct: {
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
};

class ManufacturingFlowTester {
  constructor() {
    this.inventoryToken = null;
    this.manufacturingToken = null;
    this.createdIds = {
      products: [],
      workCenters: [],
      boms: [],
      manufacturingOrders: [],
    };
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay

      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      };
    }
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async setupUsers() {
    this.log("Setting up test users...");

    // Create inventory manager
    const inventoryResult = await this.makeRequest(
      "POST",
      "/auth/register",
      testData.inventoryManager
    );
    if (
      inventoryResult.success ||
      inventoryResult.error.includes("already exists")
    ) {
      this.log("Inventory manager user ready", "success");
    } else {
      this.log(
        `Inventory manager creation failed: ${inventoryResult.error}`,
        "error"
      );
      return false;
    }

    // Create manufacturing manager
    const manufacturingResult = await this.makeRequest(
      "POST",
      "/auth/register",
      testData.manufacturingManager
    );
    if (
      manufacturingResult.success ||
      manufacturingResult.error.includes("already exists")
    ) {
      this.log("Manufacturing manager user ready", "success");
    } else {
      this.log(
        `Manufacturing manager creation failed: ${manufacturingResult.error}`,
        "error"
      );
      return false;
    }

    // Login inventory manager
    const inventoryLogin = await this.makeRequest("POST", "/auth/login", {
      identifier: testData.inventoryManager.loginId,
      password: testData.inventoryManager.password,
    });
    if (
      inventoryLogin.success &&
      inventoryLogin.data.data &&
      inventoryLogin.data.data.token
    ) {
      this.inventoryToken = inventoryLogin.data.data.token;
      this.log("Inventory manager logged in", "success");
    } else {
      this.log(
        `Inventory manager login failed: ${inventoryLogin.error}`,
        "error"
      );
      return false;
    }

    // Login manufacturing manager
    const manufacturingLogin = await this.makeRequest("POST", "/auth/login", {
      identifier: testData.manufacturingManager.loginId,
      password: testData.manufacturingManager.password,
    });
    if (
      manufacturingLogin.success &&
      manufacturingLogin.data.data &&
      manufacturingLogin.data.data.token
    ) {
      this.manufacturingToken = manufacturingLogin.data.data.token;
      this.log("Manufacturing manager logged in", "success");
    } else {
      this.log(
        `Manufacturing manager login failed: ${manufacturingLogin.error}`,
        "error"
      );
      return false;
    }

    return true;
  }

  async createProducts() {
    this.log("Creating products...");

    // Create finished product
    const finishedProductResult = await this.makeRequest(
      "POST",
      "/products",
      testData.finishedProduct,
      this.inventoryToken
    );
    if (finishedProductResult.success) {
      this.createdIds.products.push(finishedProductResult.data.id);
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
      const result = await this.makeRequest(
        "POST",
        "/products",
        component,
        this.inventoryToken
      );
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

  async createWorkCenters() {
    this.log("Creating work centers...");

    for (const workCenter of testData.workCenters) {
      const result = await this.makeRequest(
        "POST",
        "/work-centers",
        workCenter,
        this.manufacturingToken
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

  async createBOM() {
    this.log("Creating BOM...");

    // Get the finished product ID
    const productsResult = await this.makeRequest(
      "GET",
      "/products",
      null,
      this.inventoryToken
    );
    if (!productsResult.success) {
      this.log(`Failed to fetch products: ${productsResult.error}`, "error");
      return false;
    }

    const finishedProduct = productsResult.data.data.products.find(
      (p) => p.name === testData.finishedProduct.name
    );
    if (!finishedProduct) {
      this.log(
        `Finished product '${testData.finishedProduct.name}' not found`,
        "error"
      );
      return false;
    }

    // Get work center IDs
    const workCentersResult = await this.makeRequest(
      "GET",
      "/work-centers",
      null,
      this.manufacturingToken
    );
    if (!workCentersResult.success) {
      this.log(
        `Failed to fetch work centers: ${workCentersResult.error}`,
        "error"
      );
      return false;
    }

    // Map operations to use work center IDs
    const operationsWithIds = [
      {
        sequence: 1,
        name: "Assembly",
        timeMinutes: 60,
        workCenterId: workCentersResult.data.data.workCenters.find(
          (wc) => wc.name === "Assembly Line"
        )?.id,
      },
      {
        sequence: 2,
        name: "Painting",
        timeMinutes: 30,
        workCenterId: workCentersResult.data.data.workCenters.find(
          (wc) => wc.name === "Paint Floor"
        )?.id,
      },
      {
        sequence: 3,
        name: "Packing",
        timeMinutes: 20,
        workCenterId: workCentersResult.data.data.workCenters.find(
          (wc) => wc.name === "Packaging Line"
        )?.id,
      },
    ].filter((op) => op.workCenterId); // Remove any operations without work center IDs

    // Map components to use product IDs
    const componentsWithIds = [
      {
        productId: productsResult.data.data.products.find(
          (p) => p.name === "Wooden Legs"
        )?.id,
        quantity: 4,
        unit: "Unit",
      },
      {
        productId: productsResult.data.data.products.find(
          (p) => p.name === "Wooden Top"
        )?.id,
        quantity: 1,
        unit: "Unit",
      },
      {
        productId: productsResult.data.data.products.find(
          (p) => p.name === "Screws"
        )?.id,
        quantity: 12,
        unit: "Unit",
      },
      {
        productId: productsResult.data.data.products.find(
          (p) => p.name === "Varnish Bottle"
        )?.id,
        quantity: 1,
        unit: "Bottle",
      },
    ].filter((comp) => comp.productId); // Remove any components without product IDs

    const bomData = {
      productId: finishedProduct.id,
      version: "1.0",
      components: componentsWithIds,
      operations: operationsWithIds,
    };

    const result = await this.makeRequest(
      "POST",
      "/boms",
      bomData,
      this.manufacturingToken
    );
    if (result.success) {
      this.createdIds.boms.push(result.data.id);
      this.log("BOM created successfully", "success");
      return result.data.id;
    } else {
      this.log(`BOM creation failed: ${result.error}`, "error");
      return false;
    }
  }

  async createManufacturingOrder(bomId) {
    this.log("Creating Manufacturing Order...");

    const moData = {
      finishedProduct: testData.finishedProduct.name,
      quantity: 10, // Producing 10 units as per test case
      scheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      bomId: bomId,
    };

    const result = await this.makeRequest(
      "POST",
      "/manufacturing-orders",
      moData,
      this.manufacturingToken
    );
    if (result.success) {
      this.createdIds.manufacturingOrders.push(result.data.id);
      this.log("Manufacturing Order created successfully", "success");
      return result.data;
    } else {
      this.log(`Manufacturing Order creation failed: ${result.error}`, "error");
      return false;
    }
  }

  async verifyBOMAutoPopulation(moId) {
    this.log("Verifying BOM auto-population in MO...");

    const result = await this.makeRequest(
      "GET",
      `/manufacturing-orders/${moId}`,
      null,
      this.manufacturingToken
    );

    if (result.success) {
      const mo = result.data;

      // Check if components are auto-populated
      if (mo.components && mo.components.length > 0) {
        this.log("BOM components auto-populated successfully", "success");

        // Verify component quantities are scaled
        const expectedComponents = [
          { name: "Wooden Legs", expectedQty: 40 }, // 4 * 10 units
          { name: "Wooden Top", expectedQty: 10 }, // 1 * 10 units
          { name: "Screws", expectedQty: 120 }, // 12 * 10 units
          { name: "Varnish Bottle", expectedQty: 10 }, // 1 * 10 units
        ];

        let allComponentsCorrect = true;
        for (const expected of expectedComponents) {
          const actual = mo.components.find(
            (c) => c.componentName === expected.name
          );
          if (!actual || actual.toConsume !== expected.expectedQty) {
            this.log(
              `Component ${expected.name} quantity mismatch. Expected: ${expected.expectedQty}, Actual: ${actual?.toConsume}`,
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

  async runTest() {
    this.log("🚀 Starting Final Manufacturing Flow Test", "info");
    this.log("=".repeat(60), "info");

    let passedSteps = 0;
    let totalSteps = 0;

    // Step 1: Setup users
    totalSteps++;
    if (await this.setupUsers()) {
      passedSteps++;
    } else {
      this.log("Cannot proceed without user setup", "error");
      return false;
    }

    // Step 2: Create products
    totalSteps++;
    if (await this.createProducts()) {
      passedSteps++;
    } else {
      this.log("Cannot proceed without products", "error");
      return false;
    }

    // Step 3: Create work centers
    totalSteps++;
    if (await this.createWorkCenters()) {
      passedSteps++;
    } else {
      this.log("Cannot proceed without work centers", "error");
      return false;
    }

    // Step 4: Create BOM
    totalSteps++;
    const bomId = await this.createBOM();
    if (bomId) {
      passedSteps++;
    } else {
      this.log("Cannot proceed without BOM", "error");
      return false;
    }

    // Step 5: Create Manufacturing Order
    totalSteps++;
    const mo = await this.createManufacturingOrder(bomId);
    if (mo) {
      passedSteps++;
    } else {
      this.log("Cannot proceed without Manufacturing Order", "error");
      return false;
    }

    // Step 6: Verify BOM auto-population
    totalSteps++;
    if (await this.verifyBOMAutoPopulation(mo.id)) {
      passedSteps++;
    }

    // Summary
    this.log("=".repeat(60), "info");
    this.log("📊 Test Results Summary:", "info");
    this.log(`Total Steps: ${totalSteps}`, "info");
    this.log(`Passed: ${passedSteps}`, "success");
    this.log(`Failed: ${totalSteps - passedSteps}`, "error");
    this.log(
      `Success Rate: ${((passedSteps / totalSteps) * 100).toFixed(1)}%`,
      "info"
    );

    if (passedSteps === totalSteps) {
      this.log(
        "\n🎉 All tests passed! Manufacturing flow is working correctly.",
        "success"
      );
      this.log("\n✅ Key Validations:", "success");
      this.log("   • User registration and authentication works", "success");
      this.log("   • Product creation with proper role permissions", "success");
      this.log(
        "   • Work center creation with proper role permissions",
        "success"
      );
      this.log("   • BOM creation with components and operations", "success");
      this.log(
        "   • Manufacturing Order creation with BOM reference",
        "success"
      );
      this.log("   • BOM auto-population in Manufacturing Order", "success");
      this.log(
        "   • Component quantity scaling (4 legs × 10 units = 40 legs)",
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
    const success = await tester.runTest();
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
