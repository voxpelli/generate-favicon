import { readFile, writeFile } from 'node:fs/promises';
import pathModule from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

// @ts-ignore
import icoEndec from 'ico-endec';
import sharp from 'sharp';

export const ICO = Symbol('ico');

/**
 * @param {string} cwd
 * @param {URL} file
 * @returns {string}
 */
function relativePath (cwd, file) {
  return pathModule.relative(cwd, fileURLToPath(file));
}

/**
 * @typedef FaviconNamedTarget
 * @property {string} name
 * @property {number} size
 */

/** @typedef {(typeof ICO) | number | FaviconNamedTarget} FaviconTarget */

/**
 * @typedef GenerateOptions
 * @property {typeof console.log} debug
 * @property {boolean} dryRun
 * @property {string|undefined} name
 */

/**
 * @param {string | URL} source
 * @param {Set<FaviconTarget>} targets
 * @param {GenerateOptions} options
 * @returns {Promise<void>}
 */
export async function generate (source, targets, options) {
  const {
    debug,
    dryRun,
    name: nameOption,
  } = options;

  const cwd = process.cwd() + '/';
  const sourceFile = new URL(source, pathToFileURL(cwd));
  const name = nameOption ? nameOption + '.svg' : sourceFile.toString();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const data = await readFile(sourceFile);

  for (const target of targets) {
    const size = target === ICO ? 32 : (typeof target === 'object' ? target.size : target);

    let result = await sharp(data)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toBuffer();

    const targetFile = typeof target === 'object'
      ? new URL(target.name, sourceFile)
      : new URL(name.replace(/\.svg$/, target === ICO ? '.ico' : `-${size}x${size}.png`), sourceFile);

    if (target === ICO) {
      result = icoEndec.encode([result]);
    }

    if (!dryRun) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await writeFile(targetFile, result);
    }

    debug(
      relativePath(cwd, sourceFile),
      styleText('dim', 'transformed to'),
      `${size}px`,
      styleText('dim', `and ${dryRun ? 'would be' : 'is'} written as`),
      relativePath(cwd, targetFile)
    );
  }
}
