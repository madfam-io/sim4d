#!/usr/bin/env node

/**
 * Security Vulnerability Checker for CI/CD
 *
 * Analyzes npm audit results and enforces security policies
 *
 * Usage:
 *   node scripts/check-security-vulnerabilities.js
 *   node scripts/check-security-vulnerabilities.js --strict
 *   node scripts/check-security-vulnerabilities.js --allow-high 2
 *
 * Exit Codes:
 *   0 = No critical/high vulnerabilities
 *   1 = Critical vulnerabilities found
 *   2 = High vulnerabilities above threshold
 *   3 = Configuration or execution error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const THRESHOLDS = {
  critical: 0, // Zero tolerance for critical
  high: 0, // Zero tolerance for high
  moderate: 5, // Allow up to 5 moderate (with warnings)
  low: 20, // Allow up to 20 low severity
};

const SEVERITY_COLORS = {
  critical: '\x1b[41m\x1b[37m', // Red background, white text
  high: '\x1b[31m', // Red text
  moderate: '\x1b[33m', // Yellow text
  low: '\x1b[36m', // Cyan text
  info: '\x1b[34m', // Blue text
  success: '\x1b[32m', // Green text
  reset: '\x1b[0m',
};

// ═══════════════════════════════════════════════════════════════════════════
// Parse Command Line Arguments
// ═══════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
let strictMode = false;
let customThresholds = { ...THRESHOLDS };

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--strict') {
    strictMode = true;
  } else if (args[i] === '--allow-high' && args[i + 1]) {
    customThresholds.high = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--allow-moderate' && args[i + 1]) {
    customThresholds.moderate = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Security Vulnerability Checker

Usage:
  node scripts/check-security-vulnerabilities.js [OPTIONS]

Options:
  --strict              Zero tolerance mode (fail on any vulnerability)
  --allow-high N        Allow up to N high severity vulnerabilities
  --allow-moderate N    Allow up to N moderate severity vulnerabilities
  --help, -h            Show this help message

Exit Codes:
  0 = No critical/high vulnerabilities (or within thresholds)
  1 = Critical vulnerabilities found
  2 = High vulnerabilities above threshold
  3 = Configuration or execution error

Examples:
  node scripts/check-security-vulnerabilities.js
  node scripts/check-security-vulnerabilities.js --strict
  node scripts/check-security-vulnerabilities.js --allow-high 2
`);
    process.exit(0);
  }
}

if (strictMode) {
  customThresholds.critical = 0;
  customThresholds.high = 0;
  customThresholds.moderate = 0;
  customThresholds.low = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function log(message, color = 'reset') {
  console.log(`${SEVERITY_COLORS[color]}${message}${SEVERITY_COLORS.reset}`);
}

function logSection(title) {
  console.log('');
  log('═══════════════════════════════════════════════════════════════', 'info');
  log(`  ${title}`, 'info');
  log('═══════════════════════════════════════════════════════════════', 'info');
  console.log('');
}

function formatVulnerability(vuln) {
  return {
    name: vuln.name || 'unknown',
    severity: vuln.severity || 'unknown',
    via: Array.isArray(vuln.via)
      ? vuln.via.map((v) => (typeof v === 'string' ? v : v.name)).join(', ')
      : vuln.via,
    range: vuln.range || 'unknown',
    fixAvailable: vuln.fixAvailable !== undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  logSection('BrepFlow Security Vulnerability Check');

  log(`Running npm audit...`, 'info');
  log(
    `Thresholds: Critical=${customThresholds.critical}, High=${customThresholds.high}, Moderate=${customThresholds.moderate}`,
    'info'
  );
  console.log('');

  let auditData;

  try {
    // Run npm audit and capture JSON output
    // npm audit exits with code 1 if vulnerabilities found, so we catch that
    const auditOutput = execSync('npm audit --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    auditData = JSON.parse(auditOutput);
  } catch (error) {
    // npm audit exits with non-zero if vulnerabilities found
    if (error.stdout) {
      try {
        auditData = JSON.parse(error.stdout);
      } catch (parseError) {
        log('Error: Failed to parse npm audit output', 'critical');
        console.error(error.stdout);
        process.exit(3);
      }
    } else {
      log('Error: Failed to run npm audit', 'critical');
      console.error(error.message);
      process.exit(3);
    }
  }

  // Extract vulnerability counts
  const metadata = auditData.metadata || {};
  const vulnerabilities = metadata.vulnerabilities || {};

  const counts = {
    critical: vulnerabilities.critical || 0,
    high: vulnerabilities.high || 0,
    moderate: vulnerabilities.moderate || 0,
    low: vulnerabilities.low || 0,
    info: vulnerabilities.info || 0,
    total: vulnerabilities.total || 0,
  };

  // Display summary
  logSection('Vulnerability Summary');

  console.log('Found vulnerabilities:');
  log(`  Critical: ${counts.critical}`, counts.critical > 0 ? 'critical' : 'success');
  log(`  High:     ${counts.high}`, counts.high > 0 ? 'high' : 'success');
  log(`  Moderate: ${counts.moderate}`, counts.moderate > 0 ? 'moderate' : 'success');
  log(`  Low:      ${counts.low}`, counts.low > 0 ? 'low' : 'success');
  log(`  Info:     ${counts.info}`, 'info');
  log(`  Total:    ${counts.total}`, counts.total > 0 ? 'moderate' : 'success');
  console.log('');

  // Check against thresholds
  let exitCode = 0;
  const violations = [];

  if (counts.critical > customThresholds.critical) {
    violations.push({
      severity: 'critical',
      count: counts.critical,
      threshold: customThresholds.critical,
      exitCode: 1,
    });
    exitCode = Math.max(exitCode, 1);
  }

  if (counts.high > customThresholds.high) {
    violations.push({
      severity: 'high',
      count: counts.high,
      threshold: customThresholds.high,
      exitCode: 2,
    });
    exitCode = Math.max(exitCode, 2);
  }

  if (counts.moderate > customThresholds.moderate) {
    violations.push({
      severity: 'moderate',
      count: counts.moderate,
      threshold: customThresholds.moderate,
      exitCode: 0, // Don't fail on moderate, just warn
    });
  }

  // Display violations
  if (violations.length > 0) {
    logSection('Policy Violations');

    violations.forEach((v) => {
      log(`${v.severity.toUpperCase()}: ${v.count} found (threshold: ${v.threshold})`, v.severity);
    });
    console.log('');
  }

  // Display detailed vulnerability information
  if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
    logSection('Detailed Vulnerability Information');

    const vulnEntries = Object.entries(auditData.vulnerabilities);
    const criticalAndHigh = vulnEntries.filter(
      ([, vuln]) => vuln.severity === 'critical' || vuln.severity === 'high'
    );

    if (criticalAndHigh.length > 0) {
      log('Critical and High Severity Vulnerabilities:', 'high');
      console.log('');

      criticalAndHigh.slice(0, 10).forEach(([name, vuln]) => {
        const formatted = formatVulnerability(vuln);
        log(`📦 ${formatted.name}`, formatted.severity);
        console.log(`   Severity: ${formatted.severity.toUpperCase()}`);
        console.log(`   Affected: ${formatted.range}`);
        console.log(`   Via: ${formatted.via}`);
        console.log(`   Fix available: ${formatted.fixAvailable ? 'Yes' : 'No'}`);
        console.log('');
      });

      if (criticalAndHigh.length > 10) {
        log(`... and ${criticalAndHigh.length - 10} more`, 'moderate');
        console.log('');
      }
    }
  }

  // Provide remediation guidance
  logSection('Remediation Steps');

  if (exitCode > 0) {
    log('⚠️  Action Required:', 'high');
    console.log('');
    console.log('1. Run automated fix:');
    console.log('   npm audit fix');
    console.log('');
    console.log('2. For breaking changes, run:');
    console.log('   npm audit fix --force');
    console.log('');
    console.log('3. Review detailed audit:');
    console.log('   npm audit');
    console.log('');
    console.log('4. Manual fixes may be required for some vulnerabilities');
    console.log('');
  } else if (counts.total > 0) {
    log('ℹ️  Recommendations:', 'info');
    console.log('');
    console.log('• Vulnerabilities within acceptable thresholds');
    console.log('• Consider running: npm audit fix');
    console.log('• Monitor for updates: npm outdated');
    console.log('');
  } else {
    log('✅ No vulnerabilities found', 'success');
    console.log('');
  }

  // Save report for CI artifacts
  const reportDir = path.join(process.cwd(), 'security-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportDir, `vulnerability-check_${timestamp}.json`);

  fs.writeFileSync(
    reportFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        counts,
        thresholds: customThresholds,
        violations,
        exitCode,
        auditData,
      },
      null,
      2
    )
  );

  log(`Report saved: ${reportFile}`, 'info');
  console.log('');

  // Final status
  logSection('Final Status');

  if (exitCode === 0) {
    log('✅ Security check PASSED', 'success');
  } else if (exitCode === 1) {
    log('❌ Security check FAILED: Critical vulnerabilities detected', 'critical');
  } else if (exitCode === 2) {
    log('❌ Security check FAILED: High vulnerabilities above threshold', 'high');
  }

  console.log('');
  process.exit(exitCode);
}

// Run main function
main().catch((error) => {
  log('Unexpected error:', 'critical');
  console.error(error);
  process.exit(3);
});
