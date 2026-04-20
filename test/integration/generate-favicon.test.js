import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

import sharp from 'sharp';

import { createTempDir, copyFixture } from '../helpers/fs.js';
import { generate, ICO } from '../../lib/generate-favicon.js';

/**
 * @param {string} value
 * @returns {string}
 */
function stripAnsi (value) {
  return stripVTControlCharacters(value);
}

describe('generate()', () => {
  it('skips writes in dry-run mode and reports intended outputs', async (t) => {
    const tempDir = await createTempDir(t);
    const sourcePath = await copyFixture('source.svg', tempDir);
    const outputPng = path.join(tempDir, 'favicon-32x32.png');
    const outputIco = path.join(tempDir, 'favicon.ico');
    /** @type {string[]} */
    const logs = [];

    await generate(sourcePath, new Set([32, ICO]), {
      backgroundColor: undefined,
      debug: /** @param {string} message */ message => {
        logs.push(message);
      },
      dryRun: true,
      name: 'favicon',
    });

    assert.strictEqual(logs.length, 2);
    assert.ok(logs[0]);
    assert.match(logs[0], /would be written as/);
    await assert.rejects(access(outputPng));
    await assert.rejects(access(outputIco));
  });

  it('writes png files for padded targets', async (t) => {
    const tempDir = await createTempDir(t);
    const sourcePath = await copyFixture('source.svg', tempDir);
    const outputPath = path.join(tempDir, 'favicon-padded.png');
    /** @type {string[]} */
    const logs = [];

    await generate(sourcePath, new Set([{ padding: 4, size: 64, suffix: 'padded' }]), {
      backgroundColor: { alpha: 1, b: 255, g: 255, r: 255 },
      debug: /** @param {string} message */ message => {
        logs.push(message);
      },
      dryRun: false,
      name: 'favicon',
    });

    await access(outputPath);

    const metadata = await sharp(outputPath).metadata();

    assert.ok((metadata.width ?? 0) > 0);
    assert.ok((metadata.height ?? 0) > 0);
    assert.ok(logs[0]);
    assert.match(stripAnsi(logs[0]), /padded with 4px/);
  });

  it('writes ico files when requested', async (t) => {
    const tempDir = await createTempDir(t);
    const sourcePath = await copyFixture('source.svg', tempDir);
    const outputPath = path.join(tempDir, 'favicon.ico');

    await generate(sourcePath, new Set([ICO]), {
      backgroundColor: undefined,
      debug: () => {},
      dryRun: false,
      name: 'favicon',
    });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const result = await readFile(outputPath);

    assert.deepStrictEqual([...result.subarray(0, 4)], [0, 0, 1, 0]);
  });
});
