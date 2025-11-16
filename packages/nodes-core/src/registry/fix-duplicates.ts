#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

const indexPath = path.join(process.cwd(), 'src/nodes/generated/index.generated.ts');

async function fixDuplicateExports() {
  console.log('🔧 Fixing duplicate exports in generated index...');

  const content = await fs.readFile(indexPath, 'utf-8');
  const lines = content.split('\n');

  const seenExports = new Set<string>();
  const filteredLines: string[] = [];

  for (const line of lines) {
    // Check if this is an export line (includes node name in exports)
    const exportMatch = line.match(/^\s*(\w+Node),?\s*$/);

    if (exportMatch) {
      const nodeName = exportMatch[1];
      if (!seenExports.has(nodeName)) {
        seenExports.add(nodeName);
        filteredLines.push(line);
        console.log(`✅ Keeping first occurrence of ${nodeName}`);
      } else {
        console.log(`❌ Removing duplicate export of ${nodeName}`);
        // Skip this line (don't add to filtered)
      }
    } else {
      // For non-export lines, check if it's a registry entry
      const registryMatch = line.match(/^\s*'(\w+)':\s*(\w+Node),?\s*$/);

      if (registryMatch) {
        const nodeName = registryMatch[2];
        if (!seenExports.has(nodeName)) {
          seenExports.add(nodeName);
          filteredLines.push(line);
          console.log(`✅ Keeping first registry entry for ${nodeName}`);
        } else {
          console.log(`❌ Removing duplicate registry entry for ${nodeName}`);
          // Skip this line
        }
      } else {
        // Keep all other lines as-is
        filteredLines.push(line);
      }
    }
  }

  // Also need to rebuild the registry object at the end
  const uniqueExports = Array.from(seenExports);
  const registryEntries = uniqueExports.map((name) => `  '${name}': ${name},`).join('\n');

  // Find the registry section and replace it
  const registryStartIndex = filteredLines.findIndex((line) =>
    line.includes('export const nodeRegistry = {')
  );
  if (registryStartIndex !== -1) {
    // Find the end of the registry object
    let registryEndIndex = registryStartIndex + 1;
    let braceCount = 1;
    while (registryEndIndex < filteredLines.length && braceCount > 0) {
      const line = filteredLines[registryEndIndex];
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      registryEndIndex++;
    }

    // Replace the registry section
    const newRegistrySection = ['export const nodeRegistry = {', registryEntries, '};'];

    filteredLines.splice(
      registryStartIndex,
      registryEndIndex - registryStartIndex,
      ...newRegistrySection
    );
    console.log(`🔧 Rebuilt registry with ${uniqueExports.length} entries`);
  }

  const fixedContent = filteredLines.join('\n');
  await fs.writeFile(indexPath, fixedContent, 'utf-8');

  console.log(`🎉 Fixed generated index file, removed duplicates`);
  console.log(`📊 Total unique exports: ${seenExports.size}`);
}

fixDuplicateExports().catch(console.error);
