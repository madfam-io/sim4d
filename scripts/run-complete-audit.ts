#!/usr/bin/env tsx
/**
 * Complete Functionality Audit Runner
 *
 * This script executes all audit tests and generates a comprehensive report
 * to verify that 100% of BrepFlow's capabilities are accessible to all users.
 */

import { chromium, Browser, Page } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface AuditResults {
  timestamp: string;
  functionality: FunctionalityResults;
  accessibility: AccessibilityResults;
  performance: PerformanceResults;
  coverage: CoverageResults;
}

interface FunctionalityResults {
  totalNodes: number;
  testedNodes: number;
  passedNodes: number;
  failedNodes: number;
  errors: string[];
}

interface AccessibilityResults {
  wcagCompliance: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  violations: any[];
  warnings: any[];
}

interface PerformanceResults {
  pageLoadTime: number;
  nodeCreationTime: number;
  evaluationTime: number;
  memoryUsage: number;
}

interface CoverageResults {
  nodes: number;
  accessibility: number;
  keyboard: number;
  overall: number;
}

class AuditRunner {
  private browser: Browser | null = null;
  private results: AuditResults = {
    timestamp: new Date().toISOString(),
    functionality: {
      totalNodes: 0,
      testedNodes: 0,
      passedNodes: 0,
      failedNodes: 0,
      errors: [],
    },
    accessibility: {
      wcagCompliance: false,
      keyboardNavigation: false,
      screenReaderSupport: false,
      violations: [],
      warnings: [],
    },
    performance: {
      pageLoadTime: 0,
      nodeCreationTime: 0,
      evaluationTime: 0,
      memoryUsage: 0,
    },
    coverage: {
      nodes: 0,
      accessibility: 0,
      keyboard: 0,
      overall: 0,
    },
  };

  async initialize() {
    console.log('🚀 Initializing audit runner...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--enable-unsafe-webgpu', '--use-gl=swiftshader', '--disable-dev-shm-usage'],
    });
  }

  async runFunctionalityTests() {
    console.log('📋 Running functionality tests...');

    try {
      const { stdout } = await execAsync(
        'pnpm test tests/audit/functionality/all-nodes.test.ts --reporter=json'
      );
      const results = JSON.parse(stdout);

      // Parse test results
      this.results.functionality.totalNodes = 868; // Expected total
      this.results.functionality.testedNodes = results.numTotalTests || 0;
      this.results.functionality.passedNodes = results.numPassedTests || 0;
      this.results.functionality.failedNodes = results.numFailedTests || 0;

      if (results.testResults) {
        results.testResults.forEach((test: any) => {
          if (test.status === 'failed') {
            this.results.functionality.errors.push(test.message);
          }
        });
      }
    } catch (error: any) {
      console.error('Functionality tests failed:', error.message);
      this.results.functionality.errors.push(error.message);
    }
  }

  async runAccessibilityTests() {
    console.log('♿ Running accessibility tests...');

    try {
      // Run WCAG compliance tests
      const { stdout: wcagOutput } = await execAsync(
        'pnpm test tests/audit/accessibility/wcag-compliance.test.ts --reporter=json'
      );
      const wcagResults = JSON.parse(wcagOutput);

      this.results.accessibility.wcagCompliance = wcagResults.numFailedTests === 0;

      // Run keyboard navigation tests
      const { stdout: keyboardOutput } = await execAsync(
        'pnpm test tests/audit/accessibility/keyboard-navigation.test.ts --reporter=json'
      );
      const keyboardResults = JSON.parse(keyboardOutput);

      this.results.accessibility.keyboardNavigation = keyboardResults.numFailedTests === 0;

      // Extract violations
      if (wcagResults.testResults) {
        wcagResults.testResults.forEach((test: any) => {
          if (test.status === 'failed' && test.message) {
            this.results.accessibility.violations.push({
              test: test.title,
              message: test.message,
            });
          }
        });
      }
    } catch (error: any) {
      console.error('Accessibility tests failed:', error.message);
      this.results.accessibility.violations.push({
        test: 'general',
        message: error.message,
      });
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');

    const page = await this.browser!.newPage();

    try {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      this.results.performance.pageLoadTime = Date.now() - startTime;

      // Measure node creation time
      const nodeCreationStart = Date.now();
      await page.evaluate(() => {
        if ((window as any).studio?.createNode) {
          (window as any).studio.createNode('Geometry::Box', { x: 100, y: 100 });
        }
      });
      this.results.performance.nodeCreationTime = Date.now() - nodeCreationStart;

      // Measure evaluation time
      const evaluationStart = Date.now();
      await page.evaluate(() => {
        if ((window as any).studio?.evaluateGraph) {
          (window as any).studio.evaluateGraph();
        }
      });
      this.results.performance.evaluationTime = Date.now() - evaluationStart;

      // Get memory usage
      const metrics = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      });

      this.results.performance.memoryUsage = metrics.usedJSHeapSize / 1024 / 1024; // Convert to MB
    } catch (error: any) {
      console.error('Performance tests failed:', error.message);
    } finally {
      await page.close();
    }
  }

  calculateCoverage() {
    console.log('📊 Calculating coverage...');

    // Node coverage
    this.results.coverage.nodes =
      (this.results.functionality.passedNodes / this.results.functionality.totalNodes) * 100;

    // Accessibility coverage
    const accessibilityScore =
      (this.results.accessibility.wcagCompliance ? 50 : 0) +
      (this.results.accessibility.keyboardNavigation ? 25 : 0) +
      (this.results.accessibility.screenReaderSupport ? 25 : 0);
    this.results.coverage.accessibility = accessibilityScore;

    // Keyboard coverage
    this.results.coverage.keyboard = this.results.accessibility.keyboardNavigation ? 100 : 0;

    // Overall coverage
    this.results.coverage.overall =
      this.results.coverage.nodes * 0.4 +
      this.results.coverage.accessibility * 0.3 +
      this.results.coverage.keyboard * 0.3;
  }

  generateReport() {
    console.log('📝 Generating report...');

    const report = `
# BrepFlow Functionality Audit Report
Generated: ${this.results.timestamp}

## 📊 Overall Coverage: ${this.results.coverage.overall.toFixed(1)}%

### ✅ Functionality Coverage: ${this.results.coverage.nodes.toFixed(1)}%
- Total Nodes: ${this.results.functionality.totalNodes}
- Tested Nodes: ${this.results.functionality.testedNodes}
- Passed: ${this.results.functionality.passedNodes}
- Failed: ${this.results.functionality.failedNodes}
${
  this.results.functionality.errors.length > 0
    ? `
#### Errors:
${this.results.functionality.errors.map((e) => `- ${e}`).join('\n')}
`
    : ''
}

### ♿ Accessibility Coverage: ${this.results.coverage.accessibility.toFixed(1)}%
- WCAG Compliance: ${this.results.accessibility.wcagCompliance ? '✅ Passed' : '❌ Failed'}
- Keyboard Navigation: ${this.results.accessibility.keyboardNavigation ? '✅ Passed' : '❌ Failed'}
- Screen Reader Support: ${this.results.accessibility.screenReaderSupport ? '✅ Passed' : '❌ Failed'}
${
  this.results.accessibility.violations.length > 0
    ? `
#### Violations:
${this.results.accessibility.violations.map((v) => `- ${v.test}: ${v.message}`).join('\n')}
`
    : ''
}

### ⚡ Performance Metrics
- Page Load Time: ${this.results.performance.pageLoadTime}ms
- Node Creation Time: ${this.results.performance.nodeCreationTime}ms
- Graph Evaluation Time: ${this.results.performance.evaluationTime}ms
- Memory Usage: ${this.results.performance.memoryUsage.toFixed(2)}MB

## Summary

${
  this.results.coverage.overall >= 95
    ? `
🎉 **EXCELLENT**: Platform achieves ${this.results.coverage.overall.toFixed(1)}% coverage!
All major functionality is accessible to all users.
`
    : this.results.coverage.overall >= 80
      ? `
✅ **GOOD**: Platform achieves ${this.results.coverage.overall.toFixed(1)}% coverage.
Most functionality is accessible, with some areas for improvement.
`
      : `
⚠️ **NEEDS IMPROVEMENT**: Platform achieves only ${this.results.coverage.overall.toFixed(1)}% coverage.
Significant work needed to ensure accessibility for all users.
`
}

### Recommendations
${this.getRecommendations()
  .map((r) => `- ${r}`)
  .join('\n')}

### Next Steps
1. Address critical accessibility violations
2. Implement missing keyboard navigation features
3. Add screen reader announcements for dynamic content
4. Complete testing for remaining ${this.results.functionality.totalNodes - this.results.functionality.testedNodes} nodes
5. Set up continuous monitoring with this audit suite

---
*This report was generated automatically by the BrepFlow Audit Runner*
    `;

    // Save report
    const reportDir = join(process.cwd(), 'reports', 'audit');
    mkdirSync(reportDir, { recursive: true });

    const reportPath = join(reportDir, `audit-${Date.now()}.md`);
    writeFileSync(reportPath, report);

    // Save JSON results
    const jsonPath = join(reportDir, `audit-${Date.now()}.json`);
    writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));

    console.log(`✅ Report saved to: ${reportPath}`);
    console.log(`📄 JSON results saved to: ${jsonPath}`);

    return report;
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.results.accessibility.wcagCompliance) {
      recommendations.push('Fix WCAG 2.1 AA compliance issues');
    }

    if (!this.results.accessibility.keyboardNavigation) {
      recommendations.push('Improve keyboard navigation support');
    }

    if (this.results.functionality.failedNodes > 0) {
      recommendations.push(`Fix ${this.results.functionality.failedNodes} failing node tests`);
    }

    if (this.results.performance.pageLoadTime > 3000) {
      recommendations.push('Optimize page load performance (target < 3s)');
    }

    if (this.results.performance.memoryUsage > 2000) {
      recommendations.push('Reduce memory usage (target < 2GB)');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current high standards');
      recommendations.push('Consider adding more comprehensive E2E tests');
    }

    return recommendations;
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.runFunctionalityTests();
      await this.runAccessibilityTests();
      await this.runPerformanceTests();
      this.calculateCoverage();
      const report = this.generateReport();

      console.log('\n' + report);

      // Exit with appropriate code
      process.exit(this.results.coverage.overall >= 80 ? 0 : 1);
    } catch (error) {
      console.error('Audit failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the audit
if (require.main === module) {
  const runner = new AuditRunner();
  runner.run();
}

export { AuditRunner };
