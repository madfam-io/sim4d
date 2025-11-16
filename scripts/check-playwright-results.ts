#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { resolve } from 'path';

const target = resolve(process.cwd(), process.argv[2] ?? 'audit-results.xml');
let xml: string;
try {
  xml = readFileSync(target, 'utf8');
} catch (error) {
  console.error(`Unable to read Playwright results at ${target}`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const skippedMatch = xml.match(/skipped="(\d+)"/i);
const failureMatch = xml.match(/failures="(\d+)"/i);
const testsMatch = xml.match(/tests="(\d+)"/i);

const skipped = skippedMatch ? Number(skippedMatch[1]) : 0;
const failures = failureMatch ? Number(failureMatch[1]) : 0;
const total = testsMatch ? Number(testsMatch[1]) : 0;

if (!testsMatch) {
  console.error('No Playwright tests were detected in the JUnit report.');
  process.exit(1);
}

if (failures > 0) {
  console.error(`Playwright reported ${failures} failing test${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}

if (skipped > 0) {
  console.error(`Playwright reported ${skipped} skipped test${skipped === 1 ? '' : 's'}.`);
  console.error('All audit suites must execute fully—investigate skips before proceeding.');
  process.exit(1);
}

console.log(
  `✅ Playwright audit results verified (tests: ${total}, skipped: ${skipped}, failures: ${failures}).`
);
