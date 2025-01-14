import { readFile, writeFile } from 'node:fs/promises';
import pathModule from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

// @ts-ignore
import icoEndec from 'ico-endec';
import sharp from 'sharp';

export const ICO = Symbol('ico');

/** @typedef {import('sharp').RGBA} RGBA */

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
 * @property {string|undefined} [name]
 * @property {number|undefined} [padding]
 * @property {number} size
 * @property {string|undefined} [suffix]
 */

/** @typedef {(typeof ICO) | number | FaviconNamedTarget} FaviconTarget */

/**
 * @typedef GenerateOptions
 * @property {RGBA|undefined} backgroundColor
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
    backgroundColor,
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
    const padding = (typeof target === 'object' && target.padding) || 0;
    const size = target === ICO ? 32 : (typeof target === 'object' ? target.size : target);
    const suffix = (typeof target === 'object' && target.suffix) || `${size}x${size}`;

    let modified = sharp(data)
      .resize(size - padding, size - padding, { fit: 'contain' });

    if (padding > 0) {
      modified = modified.extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: backgroundColor,
      });
    }

    let result = await modified.png().toBuffer();

    const targetFile = (typeof target === 'object' && target.name)
      ? new URL(target.name, sourceFile)
      : new URL(name.replace(/\.svg$/, target === ICO ? '.ico' : `-${suffix}.png`), sourceFile);

    if (target === ICO) {
      result = icoEndec.encode([result]);
    }

    if (!dryRun) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await writeFile(targetFile, result);
    }

    debug([
      relativePath(cwd, sourceFile),
      styleText('dim', 'transformed to'),
      `${size}px`,
      ...(padding ? [styleText('dim', '(resized to'), `${size - padding * 2}px`, styleText('dim', 'and padded with'), `${padding}px` + styleText('dim', ')')] : []),
      styleText('dim', `and ${dryRun ? 'would be ' : ''}written as`),
      relativePath(cwd, targetFile),
    ].join(' '));
  }
}
