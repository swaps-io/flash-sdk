#!/usr/bin/env node

/**
 * Replace
 *
 * Simple script that replaces old string with new one in specified file.
 *
 * Usage: ./tools/replace.mjs ./some/file.txt 'old string' new-string
 */

import fs from 'fs/promises';

async function main() {
  if (process.argv.length !== 5) {
    throw new Error('Usage: replace.mjs [file-path] [old-string] [new-string]');
  }

  const [ , , filePath, oldString, newString] = process.argv;
  console.log(`Replace "${oldString}" with "${newString}" in "${filePath}"`);

  const oldContent = await fs.readFile(filePath, { encoding: 'utf8' });
  const newContent = oldContent.replaceAll(oldString, newString);
  if (newContent === oldContent) {
    throw new Error('Nothing to replace');
  }

  await fs.writeFile(filePath, newContent);
  console.log('Replaced successfully');
}

await main();
