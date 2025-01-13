import { generate } from './generate-favicon.js';

/**
 * @param {import('./command.js').CommandInput} input
 * @returns {Promise<void>}
 */
export async function action (input) {
  const {
    debug,
    dryRun,
    name,
    sources,
    targets,
  } = input;

  for (const source of sources) {
    await generate(source, targets, {
      debug,
      dryRun,
      name,
    });
  }
}
