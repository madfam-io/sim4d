// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..', '..');
const wasmDir = path.join(repoRoot, 'packages', 'engine-occt', 'wasm');
const requiredNodeArtifacts = ['occt-core.node.mjs', 'occt-core.node.wasm'];
const cliGraph = path.join(repoRoot, 'packages', 'examples', 'graphs', 'simple-box.bflow.json');

function ensureArtifacts(): void {
  const missing = requiredNodeArtifacts.filter((file) => !fs.existsSync(path.join(wasmDir, file)));
  if (missing.length > 0) {
    throw new Error(
      `Missing OCCT node artifacts: ${missing.join(', ')}. Run "pnpm run build:wasm" before executing CLI smoke tests.`
    );
  }

  if (!fs.existsSync(cliGraph)) {
    throw new Error(`Required CLI graph missing: ${cliGraph}`);
  }
}

function runCommand(command: string, args: string[], cwd: string): void {
  execFileSync(command, args, { stdio: 'inherit', cwd });
}

describe('Headless CLI smoke', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brepflow-cli-smoke-'));

  beforeAll(() => {
    ensureArtifacts();
    runCommand('pnpm', ['--filter', '@brepflow/cli', 'run', 'build'], repoRoot);
  }, 120_000);

  afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('renders simple graph with real OCCT geometry', () => {
    const outputDir = path.join(tempRoot, 'simple-box');
    fs.mkdirSync(outputDir, { recursive: true });

    runCommand(
      'pnpm',
      [
        '--filter',
        '@brepflow/cli',
        'exec',
        '--',
        'node',
        '-r',
        '../../scripts/node-worker-polyfill.cjs',
        'dist/index.mjs',
        'render',
        cliGraph,
        '--out',
        outputDir,
        '--export',
        'step,stl',
        '--manifest',
      ],
      repoRoot
    );

    const manifestPath = path.join(outputDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      mockGeometry?: boolean;
      exports?: Array<{ filename: string; format: string }>;
      graph?: string;
    };

    expect(manifest.mockGeometry).toBeFalsy();
    expect(manifest.exports?.length ?? 0).toBeGreaterThan(0);
    expect(manifest.graph).toBe('simple-box.bflow.json');

    const formats = new Set((manifest.exports ?? []).map((entry) => entry.format));
    expect(formats.has('step')).toBe(true);
    expect(formats.has('stl')).toBe(true);

    for (const entry of manifest.exports ?? []) {
      const filePath = path.join(outputDir, entry.filename);
      expect(fs.existsSync(filePath)).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  }, 180_000);
});
