/* eslint-disable jsdoc/require-returns */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { command } from '../../lib/command.js';
import { ICO } from '../../lib/generate-favicon.js';

/**
 * @param {Set<import('../../lib/generate-favicon.js').FaviconTarget>} targets
 * @returns {Array<{ type: string, size?: number, name?: string | undefined, padding?: number | undefined, suffix?: string | undefined }>}
 */
function serializeTargets (targets) {
  return [...targets]
    .map(target => {
      if (target === ICO) {
        return { type: 'ico' };
      }

      if (typeof target === 'object') {
        return {
          name: target.name,
          padding: target.padding,
          size: target.size,
          suffix: target.suffix,
          type: 'object',
        };
      }

      return { size: target, type: 'size' };
    })
    .toSorted((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

describe('command()', () => {
  it('parses explicit flags successfully', async () => {
    const result = await command([
      '--background', 'rgba(17, 34, 51, 0.5)',
      '--dry-run',
      '--no-default',
      '--ico',
      '--size', '64:custom-icon.png:4',
      'source.svg',
    ]);

    assert.deepStrictEqual(result.backgroundColor, { alpha: 0.5, b: 51, g: 34, r: 17 });
    assert.strictEqual(result.dryRun, true);
    assert.strictEqual(result.name, 'favicon');
    assert.deepStrictEqual(result.sources, ['source.svg']);
    assert.deepStrictEqual(serializeTargets(result.targets), [
      { name: 'custom-icon.png', padding: 4, size: 64, suffix: undefined, type: 'object' },
      { type: 'ico' },
    ]);
  });

  it('includes default targets for a single source', async () => {
    const result = await command(['source.svg']);

    assert.strictEqual(result.name, 'favicon');
    assert.deepStrictEqual(serializeTargets(result.targets), [
      { name: 'apple-touch-icon.png', padding: 20, size: 180, suffix: undefined, type: 'object' },
      { name: undefined, padding: 51, size: 512, suffix: 'mask', type: 'object' },
      { size: 192, type: 'size' },
      { size: 512, type: 'size' },
      { type: 'ico' },
    ]);
  });

  it('silences debug output when requested', async () => {
    const result = await command(['--silent', 'source.svg']);

    assert.strictEqual(typeof result.debug, 'function');
    assert.strictEqual(result.debug('hello from the quiet zone'), undefined);
  });

  it('rejects non-svg sources', async () => {
    await assert.rejects(
      () => command(['source.png']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /Expected files to have \.svg file extension/.test(err.message);
      }
    );
  });

  it('rejects --name with multiple sources', async () => {
    await assert.rejects(
      () => command(['--name', 'favicon', 'first.svg', 'second.svg']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /Can't use --name/.test(err.message);
      }
    );
  });

  it('rejects invalid background colors', async () => {
    await assert.rejects(
      () => command(['--background', 'not-a-color', 'source.svg']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /Unable to parse color/.test(err.message);
      }
    );
  });

  it('rejects invalid size values', async () => {
    await assert.rejects(
      () => command(['--no-default', '--size', 'huge', 'source.svg']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /Could not parse number: huge/.test(err.message);
      }
    );
  });

  it('rejects invalid padding values', async () => {
    await assert.rejects(
      () => command(['--no-default', '--size', '64:name:nope', 'source.svg']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /Could not parse number: nope/.test(err.message);
      }
    );
  });

  it('rejects runs with no output targets', async () => {
    await assert.rejects(
      () => command(['--no-default', 'source.svg']),
      /** @param {unknown} err */ (err) => {
        if (!(err instanceof Error)) {
          return false;
        }

        return /No output sizes defined/.test(err.message);
      }
    );
  });
});
