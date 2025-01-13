import { peowly } from 'peowly';

import { ICO } from './generate-favicon.js';
import { readPkg } from './utils/pkg.js';
import { InputError } from './utils/errors.js';
import { noopExpectTypeIsKeyLess } from './utils/misc.js';

const options = /** @satisfies {import('peowly').AnyFlags} */ ({
  'default': {
    description: 'Use default best practice favicon output',
    listGroup: 'Output options',
    type: 'boolean',
    'default': false,
  },
  'dry-run': {
    description: 'Runs without saving anything',
    type: 'boolean',
    'default': false,
  },
  ico: {
    description: 'Whether to output a .ico file (in a standard size)',
    listGroup: 'Output options',
    type: 'boolean',
    'default': false,
    'short': 'i',
  },
  name: {
    description: 'Custom name to use for output',
    type: 'string',
    'short': 'n',
  },
  silent: {
    description: 'Use to silent any text output',
    type: 'boolean',
    'default': false,
  },
  size: {
    description: 'The sizes to output PNG files for with optional custom name set with a suffix using a ":" as a separator',
    listGroup: 'Output options',
    multiple: true,
    type: 'string',
    'short': 's',
  },
});

const defaultTargets = /** @type {const} */ ([
  { size: 180, name: 'apple-touch-icon.png' },
  192,
  512,
  ICO,
]);

/**
 * @typedef CommandInput
 * @property {typeof console.log} debug
 * @property {boolean} dryRun
 * @property {string|undefined} name
 * @property {string[]} sources
 * @property {Set<import('./generate-favicon.js').FaviconTarget>} targets
 */

/**
 * @param {string[]} args
 * @returns {Promise<CommandInput>}
 */
export async function command (args) {
  const pkg = await readPkg();

  const {
    flags: {
      'default': useDefaultTargets,
      'dry-run': dryRun,
      ico,
      name,
      silent,
      size: sizes = [],
      ...remainingFlags
    },
    input: sources,
    showHelp,
  } = peowly({
    args,
    examples: [
      '--size 120 --size 240 --ico favicon.svg',
      '--name favicon example.svg',
    ],
    options,
    name: 'generate-favicon',
    pkg,
    usage: 'example.svg',
  });

  // *** Validate ***

  noopExpectTypeIsKeyLess(remainingFlags, true);

  if (sources.length === 0) {
    showHelp();
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  }

  for (const source of sources) {
    if (!source.endsWith('.svg')) {
      throw new InputError(`Expected files to have .svg file extension, but got: ${source}`);
    }
  }

  // *** Build targets ***

  /** @type {Set<import('./generate-favicon.js').FaviconTarget>} */
  const explicitTargets = new Set();

  if (ico) {
    explicitTargets.add(ICO);
  }

  for (const item of sizes) {
    const [rawSize = '', name] = item.split(':');

    const size = Number.parseInt(rawSize);

    if (Number.isNaN(size)) {
      throw new InputError(`Could not parse number: ${rawSize}`);
    }

    explicitTargets.add(name ? { name, size } : size);
  }

  /** @type {Set<import('./generate-favicon.js').FaviconTarget>} */
  const targets = new Set([
    ...explicitTargets,
    ...(useDefaultTargets || explicitTargets.size === 0) ? defaultTargets : [],
  ]);

  // *** Assemble result ***

  /** @type {CommandInput} */
  const result = {
    // eslint-disable-next-line no-console
    debug: silent ? () => {} : console.log.bind(console),
    dryRun,
    name,
    sources,
    targets,
  };

  return result;
}
