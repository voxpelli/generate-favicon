import colorString from 'color-string';
import { peowly } from 'peowly';

import { ICO } from './generate-favicon.js';
import { readPkg } from './utils/pkg.js';
import { InputError } from './utils/errors.js';
import { noopExpectTypeIsKeyLess } from './utils/misc.js';

/** @import { FaviconTarget, RGBA } from './generate-favicon.js' */

const options = /** @satisfies {import('peowly').AnyFlags} */ ({
  background: {
    description: 'A background color to use when extending (parsed using "color-string")',
    listGroup: 'Output options',
    type: 'string',
    'default': '#0000', // Black with 0% opacity
    'short': 'b',
  },
  'no-default': {
    description: 'Skips default favicon output',
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
    listGroup: 'Output options',
    type: 'string',
    'short': 'n',
  },
  silent: {
    description: 'Use to silent any text output',
    type: 'boolean',
    'default': false,
  },
  size: {
    description: 'The size to output PNG file for with optional values using a ":" as a separator: size:name:padding:suffix',
    listGroup: 'Output options',
    multiple: true,
    type: 'string',
    'short': 's',
  },
});

/**
 * @typedef CommandInput
 * @property {RGBA|undefined} backgroundColor
 * @property {typeof console.log} debug
 * @property {boolean} dryRun
 * @property {string|undefined} name
 * @property {string[]} sources
 * @property {Set<FaviconTarget>} targets
 */

/**
 * @param {string[]} args
 * @returns {Promise<CommandInput>}
 */
export async function command (args) {
  const pkg = await readPkg();

  const {
    flags: {
      background,
      'dry-run': dryRun,
      ico,
      name,
      'no-default': skipDefaultTargets,
      silent,
      size: sizes = [],
      ...remainingFlags
    },
    input: sources,
    showHelp,
  } = peowly({
    args,
    examples: [
      '--name something --background #000 --no-default --size 120 --size 240 --ico example.svg',
      '--background #000 example.svg example-2.svg',
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

  if (name && sources.length > 1) {
    throw new InputError('Can\'t use --name awithd multiple sources as they would overwrite each other.');
  }

  for (const source of sources) {
    if (!source.endsWith('.svg')) {
      throw new InputError(`Expected files to have .svg file extension, but got: ${source}`);
    }
  }

  /** @type {RGBA|undefined} */
  let backgroundColor;

  if (background !== undefined) {
    const parsedColor = colorString.get.rgb(background);

    if (!parsedColor) {
      throw new InputError(`Unable to parse color from: ${background}`);
    }

    const [r, g, b, alpha] = parsedColor;

    backgroundColor = { r, g, b, alpha };
  }

  // *** Build targets ***

  /** @type {Set<FaviconTarget>} */
  const explicitTargets = new Set();

  if (ico) {
    explicitTargets.add(ICO);
  }

  for (const item of sizes) {
    const [rawSize = '', name, rawPadding, suffix] = item.split(':');

    const size = Number.parseInt(rawSize);
    const padding = rawPadding ? Number.parseInt(rawPadding) : undefined;

    if (Number.isNaN(size)) {
      throw new InputError(`Could not parse number: ${rawSize}`);
    }

    if (Number.isNaN(padding)) {
      throw new InputError(`Could not parse number: ${rawPadding}`);
    }

    explicitTargets.add((name || padding || suffix)
      ? {
          name: suffix ? undefined : name,
          padding,
          size,
          suffix,
        }
      : size
    );
  }

  const useAppleTouchNonSuffix = sources.length === 1 && !name;

  /** @type {Set<import('./generate-favicon.js').FaviconTarget>} */
  const targets = new Set([
    ...explicitTargets,
    ...skipDefaultTargets
      ? []
      : /** @type {const} */ ([
          // Follows https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
          {
            name: useAppleTouchNonSuffix ? 'apple-touch-icon.png' : undefined,
            padding: 20,
            size: 180,
            suffix: useAppleTouchNonSuffix ? undefined : 'apple-touch-icon',
          },
          { padding: 51, size: 512, suffix: 'mask' },
          192,
          512,
          ICO,
        ]),
  ]);

  if (targets.size === 0) {
    throw new InputError('No output sizes defined');
  }

  // *** Assemble result ***

  /** @type {CommandInput} */
  const result = {
    backgroundColor,
    // eslint-disable-next-line no-console
    debug: silent ? () => {} : console.log.bind(console),
    dryRun,
    name: name || (sources.length === 1 ? 'favicon' : undefined),
    sources,
    targets,
  };

  return result;
}
