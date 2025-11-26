#!/usr/bin/env node
/**
 * Comprehensive BooleanParam generator for complete node integration
 * This script ensures all generated nodes can import their required BooleanParam variants
 */

const fs = require('fs');
const path = require('path');

const PARAM_UTILS_PATH = path.join(__dirname, '../packages/nodes-core/src/utils/param-utils.ts');
const PARAMS_EXPORT_PATH = path.join(
  __dirname,
  '../packages/nodes-core/src/nodes/generated/params.ts'
);

// Generate comprehensive range - up to 300 for maximum future-proofing
const MAX_PARAM_NUMBER = 300;

function generateComprehensiveParamUtils() {
  console.log('🔧 Generating comprehensive BooleanParam aliases...');

  // Read the current file
  let content = fs.readFileSync(PARAM_UTILS_PATH, 'utf8');

  // Remove all existing BooleanParam aliases beyond 100
  content = content.replace(
    /\/\*\*\s*\n \* Create a boolean parameter \(additional alias for generated nodes compatibility\)\s*\n \*\/\s*\nexport const BooleanParam(10[1-9]|1[1-9]\d|[2-9]\d\d) = BoolParam;\s*/g,
    ''
  );
  content = content.replace(
    /\/\/ Generate remaining BooleanParam aliases for comprehensive coverage\s*\nexport const BooleanParam(10[1-9]|1[1-9]\d|[2-9]\d\d) = BoolParam;\s*/g,
    ''
  );

  // Find insertion point after BooleanParam100
  const insertionPoint = content.indexOf('export const BooleanParam100 = BoolParam;');
  if (insertionPoint === -1) {
    console.error('❌ Could not find BooleanParam100 in param-utils.ts');
    process.exit(1);
  }

  const lineEnd = content.indexOf('\n', insertionPoint) + 1;

  // Generate comprehensive aliases
  let comprehensiveAliases =
    '\n// Comprehensive BooleanParam aliases for complete generated nodes compatibility\n';
  for (let i = 101; i <= MAX_PARAM_NUMBER; i++) {
    comprehensiveAliases += `export const BooleanParam${i} = BoolParam;\n`;
  }

  // Insert the comprehensive aliases
  const newContent = content.slice(0, lineEnd) + comprehensiveAliases + content.slice(lineEnd);
  fs.writeFileSync(PARAM_UTILS_PATH, newContent);

  console.log(`✅ Generated BooleanParam101-${MAX_PARAM_NUMBER} in param-utils.ts`);
}

function generateComprehensiveParamsExport() {
  console.log('📦 Generating comprehensive params export...');

  // Read the current file
  let content = fs.readFileSync(PARAMS_EXPORT_PATH, 'utf8');

  // Remove existing BooleanParam exports beyond 100
  content = content.replace(/  BooleanParam(10[1-9]|1[1-9]\d|[2-9]\d\d),\s*/g, '');

  // Find insertion point after BooleanParam100
  const insertionPoint = content.indexOf('  BooleanParam100,');
  if (insertionPoint === -1) {
    console.error('❌ Could not find BooleanParam100 in params.ts');
    process.exit(1);
  }

  const lineEnd = content.indexOf('\n', insertionPoint) + 1;

  // Generate comprehensive exports
  let comprehensiveExports = '';
  for (let i = 101; i <= MAX_PARAM_NUMBER; i++) {
    comprehensiveExports += `  BooleanParam${i},\n`;
  }

  // Insert the comprehensive exports
  const newContent = content.slice(0, lineEnd) + comprehensiveExports + content.slice(lineEnd);
  fs.writeFileSync(PARAMS_EXPORT_PATH, newContent);

  console.log(`✅ Generated BooleanParam101-${MAX_PARAM_NUMBER} exports in params.ts`);
}

function main() {
  console.log('🚀 Implementing comprehensive BooleanParam solution...');
  console.log(`📊 Target range: BooleanParam2 - BooleanParam${MAX_PARAM_NUMBER}`);

  try {
    generateComprehensiveParamUtils();
    generateComprehensiveParamsExport();

    console.log('\n🎉 SUCCESS: Comprehensive BooleanParam solution implemented!');
    console.log('   ✓ All generated nodes will now have access to required parameter types');
    console.log('   ✓ Future-proofed for node generation expansion');
    console.log('   ✓ Stable, long-term solution for Sim4D Studio');
    console.log('\n🔄 Next: Run `pnpm run build` to rebuild with new parameters');
  } catch (error) {
    console.error('❌ Error implementing comprehensive solution:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateComprehensiveParamUtils, generateComprehensiveParamsExport };
