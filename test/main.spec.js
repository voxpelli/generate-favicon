import chai from 'chai';

import { command } from '../lib/command.js';

const should = chai.should();

describe('something', () => {
  it('should work', async () => {
    const result = await command(['test']);

    should.exist(result);

    result.should.be.an('object');
  });
});
