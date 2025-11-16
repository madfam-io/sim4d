#!/usr/bin/env node
/**
 * Script to automatically generate BooleanParam aliases for generated nodes compatibility
 * This provides a stable, long-term solution to the parameter compatibility issue
 */

const fs = require('fs');
const path = require('path');

const PARAM_UTILS_PATH = path.join(__dirname, '../packages/nodes-core/src/utils/param-utils.ts');
const PARAMS_EXPORT_PATH = path.join(
  __dirname,
  '../packages/nodes-core/src/nodes/generated/params.ts'
);

// Generate up to BooleanParam200 for future-proofing
const MAX_PARAM_NUMBER = 200;

function generateParamUtils() {
  // Read the current file
  let content = fs.readFileSync(PARAM_UTILS_PATH, 'utf8');

  // Find the insertion point (after BooleanParam100)
  const insertionPoint = content.indexOf('export const BooleanParam100 = BoolParam;');
  if (insertionPoint === -1) {
    console.error('Could not find BooleanParam100 in param-utils.ts');
    process.exit(1);
  }

  // Find the end of the BooleanParam100 line
  const lineEnd = content.indexOf('\n', insertionPoint) + 1;

  // Generate new aliases from 101 to MAX_PARAM_NUMBER
  let newAliases = '';
  for (let i = 101; i <= MAX_PARAM_NUMBER; i++) {
    newAliases += `
/**
 * Create a boolean parameter (additional alias for generated nodes compatibility)
 */
export const BooleanParam${i} = BoolParam;
`;
  }

  // Check if BooleanParam101 already exists
  if (content.includes('export const BooleanParam101 = BoolParam;')) {
    console.log('BooleanParam aliases already exist, skipping param-utils.ts update');
    return;
  }

  // Insert the new aliases
  const newContent = content.slice(0, lineEnd) + newAliases + content.slice(lineEnd);
  fs.writeFileSync(PARAM_UTILS_PATH, newContent);
  console.log(`Generated BooleanParam aliases 101-${MAX_PARAM_NUMBER} in param-utils.ts`);
}

function generateParamsExport() {
  // Read the current file
  let content = fs.readFileSync(PARAMS_EXPORT_PATH, 'utf8');

  // Find the insertion point (after BooleanParam100)
  const insertionPoint = content.indexOf('  BooleanParam100,');
  if (insertionPoint === -1) {
    console.error('Could not find BooleanParam100 in params.ts');
    process.exit(1);
  }

  // Find the end of the BooleanParam100 line
  const lineEnd = content.indexOf('\n', insertionPoint) + 1;

  // Generate new exports from 101 to MAX_PARAM_NUMBER
  let newExports = '';
  for (let i = 101; i <= MAX_PARAM_NUMBER; i++) {
    newExports += `  BooleanParam${i},\n`;
  }

  // Check if BooleanParam101 already exists
  if (content.includes('BooleanParam101,')) {
    console.log('BooleanParam exports already exist, skipping params.ts update');
    return;
  }

  // Insert the new exports
  const newContent = content.slice(0, lineEnd) + newExports + content.slice(lineEnd);
  fs.writeFileSync(PARAMS_EXPORT_PATH, newContent);
  console.log(`Generated BooleanParam exports 101-${MAX_PARAM_NUMBER} in params.ts`);
}

function main() {
  console.log('Generating BooleanParam aliases for generated nodes compatibility...');

  try {
    generateParamUtils();
    generateParamsExport();
    console.log('✅ Successfully generated all BooleanParam aliases');
    console.log(`   Range: BooleanParam2 - BooleanParam${MAX_PARAM_NUMBER}`);
    console.log('   This provides a stable, long-term solution for generated node compatibility');
  } catch (error) {
    console.error('❌ Error generating BooleanParam aliases:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateParamUtils, generateParamsExport };
