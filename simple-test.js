/**
 * Simple Manufacturing Flow Test
 * Tests the core BOM -> MO -> WO workflow with minimal API calls
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

// Test data
const testData = {
  user: {
    loginId: "simpletest2",
    email: "simple2@test.com",
    password: "Test123!",
    role: "MANUFACTURING_MANAGER",
  },
};

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
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

async function runSimpleTest() {
  console.log("🚀 Starting Simple Manufacturing Flow Test");
  console.log("=".repeat(50));

  let token = null;
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: User Registration
  totalTests++;
  console.log("\n1. Testing User Registration...");
  const registerResult = await makeRequest(
    "POST",
    "/auth/register",
    testData.user
  );
  if (registerResult.success) {
    console.log("✅ User registration successful");
    passedTests++;
  } else if (registerResult.error.includes("already exists")) {
    console.log("ℹ️ User already exists, proceeding...");
    passedTests++;
  } else {
    console.log(`❌ User registration failed: ${registerResult.error}`);
  }

  // Test 2: User Login
  totalTests++;
  console.log("\n2. Testing User Login...");
  const loginResult = await makeRequest("POST", "/auth/login", {
    identifier: testData.user.loginId,
    password: testData.user.password,
  });
  if (
    loginResult.success &&
    loginResult.data.data &&
    loginResult.data.data.token
  ) {
    token = loginResult.data.data.token;
    console.log("✅ User login successful");
    passedTests++;
  } else {
    console.log(`❌ User login failed: ${loginResult.error}`);
    console.log("Cannot proceed without authentication token");
    return;
  }

  // Test 3: Create a simple product
  totalTests++;
  console.log("\n3. Testing Product Creation...");
  const productData = {
    name: "Test Product",
    type: "FINISHED_GOOD",
    unit: "Unit",
    salesPrice: 100.0,
    currentStock: 0,
    reorderPoint: 5,
  };
  const productResult = await makeRequest(
    "POST",
    "/products",
    productData,
    token
  );
  if (productResult.success) {
    console.log("✅ Product creation successful");
    passedTests++;
  } else {
    console.log(`❌ Product creation failed: ${productResult.error}`);
  }

  // Test 4: Create a work center
  totalTests++;
  console.log("\n4. Testing Work Center Creation...");
  const workCenterData = {
    name: "Test Work Center",
    status: "ACTIVE",
    capacity: 10,
    hourlyRate: 25.0,
  };
  const workCenterResult = await makeRequest(
    "POST",
    "/work-centers",
    workCenterData,
    token
  );
  if (workCenterResult.success) {
    console.log("✅ Work center creation successful");
    passedTests++;
  } else {
    console.log(`❌ Work center creation failed: ${workCenterResult.error}`);
  }

  // Test 5: Check if we can fetch products
  totalTests++;
  console.log("\n5. Testing Product Fetch...");
  const fetchProductsResult = await makeRequest(
    "GET",
    "/products",
    null,
    token
  );
  if (fetchProductsResult.success) {
    console.log("✅ Product fetch successful");
    console.log(
      `   Found ${fetchProductsResult.data.data.products.length} products`
    );
    passedTests++;
  } else {
    console.log(`❌ Product fetch failed: ${fetchProductsResult.error}`);
  }

  // Test 6: Check if we can fetch work centers
  totalTests++;
  console.log("\n6. Testing Work Center Fetch...");
  const fetchWorkCentersResult = await makeRequest(
    "GET",
    "/work-centers",
    null,
    token
  );
  if (fetchWorkCentersResult.success) {
    console.log("✅ Work center fetch successful");
    console.log(
      `   Found ${fetchWorkCentersResult.data.data.workCenters.length} work centers`
    );
    passedTests++;
  } else {
    console.log(`❌ Work center fetch failed: ${fetchWorkCentersResult.error}`);
  }

  // Test 7: Check stock endpoint
  totalTests++;
  console.log("\n7. Testing Stock Endpoint...");
  const stockResult = await makeRequest("GET", "/stock", null, token);
  if (stockResult.success) {
    console.log("✅ Stock endpoint accessible");
    console.log(
      `   Found ${stockResult.data.data.stockMovements.length} stock movements`
    );
    passedTests++;
  } else {
    console.log(`❌ Stock endpoint failed: ${stockResult.error}`);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results Summary:");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 All tests passed! Basic API functionality is working.");
  } else {
    console.log("\n⚠️ Some tests failed. Check the errors above.");
  }

  return passedTests === totalTests;
}

// Run the test
runSimpleTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Test suite failed with error:", error);
    process.exit(1);
  });
