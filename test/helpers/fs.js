import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @param {import('node:test').TestContext} t
 * @param {string} [prefix]
 * @returns {Promise<string>}
 */
export async function createTempDir (t, prefix = 'generate-favicon-') {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));

  t.after(async () => {
    await rm(dir, { force: true, recursive: true });
  });

  return dir;
}

/**
 * @param {string} name
 * @returns {string}
 */
export function fixturePath (name) {
  return fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url));
}

/**
 * @param {string} name
 * @param {string} destinationDir
 * @returns {Promise<string>}
 */
export async function copyFixture (name, destinationDir) {
  const destinationPath = path.join(destinationDir, name);

  await copyFile(fixturePath(name), destinationPath);

  return destinationPath;
}
