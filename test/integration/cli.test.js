import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { copyFixture, createTempDir } from '../helpers/fs.js';

const cliPath = fileURLToPath(new URL('../../cli.js', import.meta.url));

/**
 * @param {string[]} args
 * @param {{ cwd: string }} options
 * @returns {Promise<{ status: number | null, stdout: string, stderr: string }>}
 */
async function runCli (args, { cwd }) {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', /** @param {Buffer|string} data */ data => {
      stdout += data.toString();
    });

    child.stderr.on('data', /** @param {Buffer|string} data */ data => {
      stderr += data.toString();
    });

    child.on('error', reject);
    child.on('close', status => {
      resolve({ status, stderr, stdout });
    });
  });
}

describe('cli.js', () => {
  it('prints help and exits cleanly with no arguments', async (t) => {
    const tempDir = await createTempDir(t);
    const result = await runCli([], { cwd: tempDir });

    assert.strictEqual(result.status, 2, result.stderr);
    assert.match(result.stdout + result.stderr, /Usage/);
  });

  it('generates favicon files successfully', async (t) => {
    const tempDir = await createTempDir(t);
    await copyFixture('source.svg', tempDir);
    const pngPath = path.join(tempDir, 'favicon-32x32.png');
    const icoPath = path.join(tempDir, 'favicon.ico');

    const result = await runCli([
      '--no-default',
      '--size', '32',
      '--ico',
      'source.svg',
    ], { cwd: tempDir });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /transformed to/);
    await access(pngPath);
    await access(icoPath);
  });

  it('reports input errors and exits with status 1', async (t) => {
    const tempDir = await createTempDir(t);

    const result = await runCli(['source.png'], { cwd: tempDir });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Invalid input:/);
    assert.match(result.stderr, /Expected files to have \.svg file extension/);
  });
});
