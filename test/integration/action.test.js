import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';

import { action } from '../../lib/action.js';
import { ICO } from '../../lib/generate-favicon.js';
import { copyFixture, createTempDir } from '../helpers/fs.js';

describe('action()', () => {
  it('iterates all sources and delegates to generate()', async (t) => {
    const tempDir = await createTempDir(t);
    const sourcePath = await copyFixture('source.svg', tempDir);
    const outputPng = path.join(tempDir, 'favicon-32x32.png');
    const outputIco = path.join(tempDir, 'favicon.ico');
    /** @type {string[]} */
    const logs = [];

    await action({
      backgroundColor: undefined,
      debug: /** @param {string} message */ message => {
        logs.push(message);
      },
      dryRun: true,
      name: 'favicon',
      sources: [sourcePath, sourcePath],
      targets: new Set([32, ICO]),
    });

    assert.strictEqual(logs.length, 4);

    for (const log of logs) {
      assert.match(log, /would be written as/);
    }

    await assert.rejects(access(outputPng));
    await assert.rejects(access(outputIco));
  });
});
