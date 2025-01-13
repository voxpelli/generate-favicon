import chai from 'chai';

import { command } from '../lib/command.js';

const should = chai.should();

describe('command', () => {
  it('should parse arguments successfully', async () => {
    const result = await command(['test.svg']);

    should.exist(result);

    result.should.be.an('object');
  });
});
