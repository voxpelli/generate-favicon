import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { action } from '../../lib/action.js';

describe('action()', () => {
  it('does nothing when there are no sources', async () => {
    const input = {
      backgroundColor: undefined,
      debug: () => {},
      dryRun: false,
      name: 'favicon',
      sources: [],
      targets: new Set([32]),
    };

    await assert.doesNotReject(action(input));
  });
});
