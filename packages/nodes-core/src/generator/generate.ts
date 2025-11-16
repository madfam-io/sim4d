#!/usr/bin/env node

/**
 * Node Generator CLI
 * Processes templates to generate TypeScript node implementations
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  generateNodeImplementation,
  generateNodeTest,
  generateNodeDocumentation,
  NodeTemplate,
  toKebabCase,
  getExportIdentifier,
} from './node-template';

// Phase 1 - Manufacturing & Analysis
import {
  holeTemplates,
  pocketTemplates,
  patternTemplates,
  ribBossTemplates,
} from './templates/manufacturing-features';
import {
  advancedPrimitiveTemplates,
  sketchPrimitiveTemplates,
} from './templates/primitives-advanced';
// Measurement and analysis templates imported but not yet used in generation
// import { measurementTemplates, analysisTemplates } from './templates/measurement-analysis';

// Phase 2 - Core Geometry
import { basicPrimitivesTemplates } from './templates/core-primitives';
import { sketch2DTemplates } from './templates/sketch-2d';
import { booleanOperationTemplates } from './templates/boolean-operations';
import { transformOperationTemplates } from './templates/transform-operations';

// Phase 3 - Assembly & Constraints
import {
  constraintTemplates,
  mateTemplates,
  jointTemplates,
  assemblyPatternTemplates,
} from './templates/assembly-constraints';

// Phase 4 - Sheet Metal
import { allSheetMetalTemplates } from './templates/sheet-metal';

// Phase 5 - Advanced Operations
import { allAdvancedOperationTemplates } from './templates/advanced-operations';

// Phase 6 - Surface Modeling
import { allSurfaceModelingTemplates } from './templates/surface-modeling';

// Phase 7 - Mesh Operations
import { allMeshOperationTemplates } from './templates/mesh-operations';

// Phase 8 - Import/Export
import { allImportExportTemplates } from './templates/import-export';

// Phase 9 - Specialized Features
import { allSpecializedFeatureTemplates } from './templates/specialized-features';

// Phase 10 - Simulation Prep
import { allSimulationPrepTemplates } from './templates/simulation-prep';

// Phase 11 - Mathematical Operations (High Priority)
import { allMathematicalTemplates } from './templates/mathematical-operations';

// Phase 12 - Data Management (High Priority)
import { allDataManagementTemplates } from './templates/data-management';

// Phase 13 - Field & Attractor Systems (High Priority)
import { allFieldAttractorTemplates } from './templates/field-attractors';

// Phase 14 - Pattern Generation (High Priority)
import { allPatternGenerationTemplates } from './templates/pattern-generation';

// Phase 15 - Fabrication-Specific (High Priority)
import { allFabricationTemplates } from './templates/fabrication-specific';

// Phase 16-20 - New High-Priority Categories for 1000+ Nodes
import { allArchitectureTemplates } from './templates/architecture-specific';
import { mechanicalEngineeringNodes } from './templates/mechanical-engineering';
import { curveSurfaceAnalysisNodes } from './templates/curve-surface-analysis';
import { interoperabilityNodes } from './templates/interoperability';
import { additionalAlgorithmicNodes } from './templates/additional-algorithmic';

// Collect all templates
const allTemplates: NodeTemplate[] = [
  // Phase 1 - Manufacturing features (highest priority)
  ...holeTemplates,
  ...pocketTemplates,
  ...patternTemplates,
  ...ribBossTemplates,

  // Phase 1 - Advanced primitives
  ...advancedPrimitiveTemplates,
  ...sketchPrimitiveTemplates,

  // Phase 1 - Measurement and analysis (DISABLED - replaced by curve-surface-analysis template)
  // ...measurementTemplates,
  // ...analysisTemplates,

  // Phase 2 - Core Geometry
  ...basicPrimitivesTemplates,
  ...sketch2DTemplates,
  ...booleanOperationTemplates,
  ...transformOperationTemplates,

  // Phase 3 - Assembly & Constraints
  ...constraintTemplates,
  ...mateTemplates,
  ...jointTemplates,
  ...assemblyPatternTemplates,

  // Phase 4 - Sheet Metal
  ...allSheetMetalTemplates,

  // Phase 5 - Advanced Operations
  ...allAdvancedOperationTemplates,

  // Phase 6 - Surface Modeling
  ...allSurfaceModelingTemplates,

  // Phase 7 - Mesh Operations
  ...allMeshOperationTemplates,

  // Phase 8 - Import/Export
  ...allImportExportTemplates,

  // Phase 9 - Specialized Features
  ...allSpecializedFeatureTemplates,

  // Phase 10 - Simulation Prep
  ...allSimulationPrepTemplates,

  // Phase 11 - Mathematical Operations (High Priority)
  ...allMathematicalTemplates,

  // Phase 12 - Data Management (High Priority)
  ...allDataManagementTemplates,

  // Phase 13 - Field & Attractor Systems (High Priority)
  ...allFieldAttractorTemplates,

  // Phase 14 - Pattern Generation (High Priority)
  ...allPatternGenerationTemplates,

  // Phase 15 - Fabrication-Specific (High Priority)
  ...allFabricationTemplates,

  // Phase 16-20 - New Categories for 1000+ Nodes (340 nodes total)
  ...allArchitectureTemplates, // 80 nodes
  ...mechanicalEngineeringNodes, // 100 nodes
  ...curveSurfaceAnalysisNodes, // 60 nodes
  ...interoperabilityNodes, // 50 nodes
  ...additionalAlgorithmicNodes, // 50 nodes
];

async function ensureDirectory(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

async function generateNode(template: NodeTemplate, outputDir: string): Promise<void> {
  const nodeDir = path.join(outputDir, template.category.toLowerCase());
  if (template.subcategory) {
    const subcatDir = path.join(nodeDir, toKebabCase(template.subcategory));
    await ensureDirectory(subcatDir);
  } else {
    await ensureDirectory(nodeDir);
  }

  // Generate file names
  const fileBaseName = toKebabCase(template.name);
  const targetDir = template.subcategory
    ? path.join(nodeDir, toKebabCase(template.subcategory))
    : nodeDir;

  const implementationPath = path.join(targetDir, `${fileBaseName}.ts`);
  const testPath = path.join(targetDir, `${fileBaseName}.test.ts`);
  const docPath = path.join(targetDir, `${fileBaseName}.md`);

  // Generate content
  const implementation = generateNodeImplementation(template);
  const test = generateNodeTest(template);
  const documentation = generateNodeDocumentation(template);

  // Write files
  await fs.writeFile(implementationPath, implementation);
  await fs.writeFile(testPath, test);
  await fs.writeFile(docPath, documentation);

  console.log(`✅ Generated ${template.category}::${template.name}`);
  console.log(`   📁 ${implementationPath}`);
  console.log(`   🧪 ${testPath}`);
  console.log(`   📚 ${docPath}`);
}

async function generateIndex(templates: NodeTemplate[], outputDir: string): Promise<void> {
  const imports: string[] = [];
  const exports: string[] = [];
  const registryEntries: string[] = [];

  // Group by category
  const byCategory = templates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, NodeTemplate[]>
  );

  Object.entries(byCategory).forEach(([category, categoryTemplates]) => {
    categoryTemplates.forEach((template) => {
      const exportIdentifier = getExportIdentifier(template);
      const constantName = `${exportIdentifier}Node`;
      const kebabName = toKebabCase(template.name);
      const importPath = template.subcategory
        ? `./${category.toLowerCase()}/${toKebabCase(template.subcategory)}/${kebabName}`
        : `./${category.toLowerCase()}/${kebabName}`;

      imports.push(`import { ${constantName} } from '${importPath}';`);
      exports.push(`  ${constantName},`);
      registryEntries.push(`  '${template.category}::${template.name}': ${constantName},`);
    });
  });

  const indexContent = `/**
 * Auto-generated Node Index
 * Generated from templates on ${new Date().toISOString()}
 */

${imports.join('\n')}

// Re-export all nodes
export {
${exports.join('\n')}
};

// Registry for dynamic loading
export const nodeRegistry = {
${registryEntries.join('\n')}
};
`;

  await fs.writeFile(path.join(outputDir, 'index.generated.ts'), indexContent);
  console.log(`\n📚 Generated index with ${templates.length} nodes`);
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'nodes', 'generated');

  console.log(`🚀 Generating ${allTemplates.length} nodes from templates...\n`);

  await ensureDirectory(outputDir);

  // Generate all nodes
  for (const template of allTemplates) {
    await generateNode(template, outputDir);
  }

  // Generate index file
  await generateIndex(allTemplates, outputDir);

  console.log(`\n✨ Successfully generated ${allTemplates.length} nodes!`);
  console.log(`📁 Output directory: ${outputDir}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Generation failed:', err);
    process.exit(1);
  });
}

export { main as generate };
