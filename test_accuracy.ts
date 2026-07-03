import { AnalyticsEngine } from './src/utils/analyticsEngine';

console.log("Running Accuracy Tests...");

// Test 1: 100 correct, 0 incorrect
const res1 = AnalyticsEngine.calculateMetrics(100, 0, 60, 0, 0);
console.assert(res1.accuracy === 100, `Test 1 Failed: Expected 100, got ${res1.accuracy}`);

// Test 2: 95 correct, 5 incorrect
const res2 = AnalyticsEngine.calculateMetrics(95, 5, 60, 0, 0);
console.assert(res2.accuracy === 95, `Test 2 Failed: Expected 95, got ${res2.accuracy}`);

// Test 3: 80 correct, 20 incorrect
const res3 = AnalyticsEngine.calculateMetrics(80, 20, 60, 0, 0);
console.assert(res3.accuracy === 80, `Test 3 Failed: Expected 80, got ${res3.accuracy}`);

// Test 4: 0 correct, 0 incorrect (empty session edge case)
const res4 = AnalyticsEngine.calculateMetrics(0, 0, 60, 0, 0);
console.assert(res4.accuracy === 100, `Test 4 Failed: Expected 100, got ${res4.accuracy}`);

// Test 5: Extra characters
const res5 = AnalyticsEngine.calculateMetrics(10, 0, 60, 10, 0);
console.assert(res5.accuracy === 50, `Test 5 Failed: Expected 50, got ${res5.accuracy}`);

console.log("All tests passed!");
