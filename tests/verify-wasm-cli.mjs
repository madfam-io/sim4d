#!/usr/bin/env node
/**
 * CLI-based WASM verification 
 * Tests what we can verify programmatically
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

console.log('\n════════════════════════════════════════════');
console.log('    WASM Implementation Final Verification');
console.log('════════════════════════════════════════════\n');

const tests = [];

// Test 1: WASM Files Physical Presence
console.log('📁 TEST 1: WASM Files Physical Check');
const wasmFiles = [
    'packages/engine-occt/wasm/occt-core.wasm',
    'packages/engine-occt/wasm/occt-core.js',
    'packages/engine-occt/wasm/occt.wasm',
    'packages/engine-occt/wasm/occt.js'
];

let wasmPresent = true;
for (const file of wasmFiles) {
    const fullPath = path.join(root, file);
    const exists = fs.existsSync(fullPath);
    const size = exists ? (fs.statSync(fullPath).size / 1024 / 1024).toFixed(2) : 0;
    console.log(`  ${exists ? '✅' : '❌'} ${path.basename(file)} (${size} MB)`);
    if (!exists) wasmPresent = false;
}
tests.push({ name: 'WASM Files Present', passed: wasmPresent });

// Test 2: Dev Server Running
console.log('\n🌐 TEST 2: Dev Server Status');
try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5174', { encoding: 'utf-8' });
    const running = response.trim() === '200';
    console.log(`  ${running ? '✅' : '❌'} Dev server responding (HTTP ${response.trim()})`);
    tests.push({ name: 'Dev Server Running', passed: running });
} catch (e) {
    console.log('  ❌ Dev server not responding');
    tests.push({ name: 'Dev Server Running', passed: false });
}

// Test 3: COOP/COEP Headers
console.log('\n🔒 TEST 3: Security Headers');
try {
    const headers = execSync('curl -sI http://localhost:5174 | grep -i "cross-origin"', { encoding: 'utf-8' });
    const hasCOOP = headers.includes('Cross-Origin-Opener-Policy: same-origin');
    const hasCOEP = headers.includes('Cross-Origin-Embedder-Policy: require-corp');
    console.log(`  ${hasCOOP ? '✅' : '❌'} COOP header present`);
    console.log(`  ${hasCOEP ? '✅' : '❌'} COEP header present`);
    tests.push({ name: 'Security Headers', passed: hasCOOP && hasCOEP });
} catch (e) {
    console.log('  ❌ Headers not accessible');
    tests.push({ name: 'Security Headers', passed: false });
}

// Test 4: Built Distribution
console.log('\n📦 TEST 4: Built Distribution');
const distFiles = [
    'packages/engine-occt/dist/index.mjs',
    'packages/engine-occt/dist/worker.mjs'
];

let distBuilt = true;
for (const file of distFiles) {
    const fullPath = path.join(root, file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${exists ? '✅' : '❌'} ${path.basename(file)}`);
    if (!exists) distBuilt = false;
}
tests.push({ name: 'Distribution Built', passed: distBuilt });

// Test 5: API Implementation
console.log('\n💻 TEST 5: API Implementation Files');
const apiFiles = [
    'packages/engine-occt/src/geometry-api.ts',
    'packages/engine-occt/src/worker-client.ts',
    'packages/engine-occt/src/occt-bindings.ts',
    'packages/engine-occt/src/mock-geometry.ts'
];

let apiComplete = true;
for (const file of apiFiles) {
    const fullPath = path.join(root, file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${exists ? '✅' : '❌'} ${path.basename(file)}`);
    if (!exists) apiComplete = false;
}
tests.push({ name: 'API Implementation', passed: apiComplete });

// Test 6: Check Studio app integration
console.log('\n🎨 TEST 6: Studio App Integration');
const studioPath = path.join(root, 'apps/studio/src');
// Use proper escaping to prevent command injection
const escapedPath = studioPath.replace(/'/g, "'\\''");
const hasEngineImports = execSync(`grep -r "@brepflow/engine" '${escapedPath}' 2>/dev/null | wc -l`, { encoding: 'utf-8' });
const integrated = parseInt(hasEngineImports.trim()) > 0;
console.log(`  ${integrated ? '✅' : '❌'} Engine integrated in Studio (${hasEngineImports.trim()} imports)`);
tests.push({ name: 'Studio Integration', passed: integrated });

// Summary
console.log('\n════════════════════════════════════════════');
console.log('📊 VERIFICATION SUMMARY');
console.log('════════════════════════════════════════════\n');

const passed = tests.filter(t => t.passed).length;
const total = tests.length;
const percentage = Math.round(passed / total * 100);

tests.forEach(t => {
    console.log(`  ${t.passed ? '✅' : '❌'} ${t.name}`);
});

console.log('\n────────────────────────────────────────────');
console.log(`  Result: ${passed}/${total} tests passed (${percentage}%)`);
console.log('────────────────────────────────────────────\n');

if (percentage === 100) {
    console.log('✅ INFRASTRUCTURE VERIFIED: All supporting systems ready');
    console.log('\n⚠️  NOTE: Real WASM execution requires browser testing');
    console.log('   The infrastructure is 100% ready, but actual WASM');
    console.log('   operations can only be verified in a browser context.\n');
    console.log('📝 To verify real WASM works:');
    console.log('   1. Open http://localhost:5174 in browser');
    console.log('   2. Open DevTools Console');
    console.log('   3. Look for WASM initialization messages');
    console.log('   4. Check for geometry operations in UI\n');
} else {
    console.log('❌ VERIFICATION FAILED: Some components missing');
    console.log('\nRequired fixes:');
    tests.filter(t => !t.passed).forEach(t => {
        console.log(`  • Fix ${t.name}`);
    });
}

process.exit(percentage === 100 ? 0 : 1);