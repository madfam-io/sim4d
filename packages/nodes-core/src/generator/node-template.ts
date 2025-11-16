/**
 * Node Template System for BrepFlow
 * Generates consistent node implementations from templates
 */

export interface Parameter {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'vector3' | 'enum';
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

export interface NodeTemplate {
  // Metadata
  category:
    | 'Sketch'
    | 'Solid'
    | 'Boolean'
    | 'Features'
    | 'Transform'
    | 'Analysis'
    | 'Manufacturing'
    | 'Assembly'
    | 'IO';
  subcategory?: string;
  name: string;
  description: string;
  icon?: string;
  tags?: string[];

  // Functionality
  operation: string;
  occtBinding?: string; // Direct OCCT function to call
  parameters: Parameter[];

  // Inputs/Outputs
  inputs: {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
  }[];
  outputs: {
    name: string;
    type: string;
    description?: string;
  }[];

  // Validation
  validation?: {
    rule: string;
    message: string;
  }[];

  // Examples
  examples?: {
    title: string;
    parameters: Record<string, any>;
    description?: string;
  }[];
}

const SOCKET_TS_TYPE_MAP: Record<string, string> = {
  Number: 'number',
  Boolean: 'boolean',
  String: 'string',
  Vector: '[number, number, number]',
  Point: '[number, number, number]',
  'Point[]': 'Array<[number, number, number]>',
  'Vector[]': 'Array<[number, number, number]>',
  'Number[]': 'number[]',
  'Boolean[]': 'boolean[]',
};

export function toPascalCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "\\'");
}

function indentBlock(block: string, spaces = 2): string {
  const indent = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length > 0 ? indent + line : indent))
    .join('\n');
}

export function getExportIdentifier(template: NodeTemplate): string {
  const parts = [template.category];
  if (template.subcategory) {
    parts.push(template.subcategory);
  }
  parts.push(template.name);
  return parts.map(toPascalCase).join('');
}

function mapSocketTsType(type: string): string {
  return SOCKET_TS_TYPE_MAP[type] ?? 'unknown';
}

function mapParamTsType(type: Parameter['type']): string {
  switch (type) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'vector3':
      return '[number, number, number]';
    case 'enum':
      return 'string';
    default:
      return 'unknown';
  }
}

function mapParamSpecType(type: Parameter['type']): string {
  switch (type) {
    case 'vector3':
      return 'vec3';
    default:
      return type;
  }
}

function titleFromName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Generate TypeScript node implementation from template
 */
export function generateNodeImplementation(template: NodeTemplate): string {
  const pascalName = toPascalCase(template.name);
  const paramsTypeName = `${pascalName}Params`;
  const inputTypeName = `${pascalName}Inputs`;
  const outputTypeName = `${pascalName}Outputs`;
  const exportIdentifier = getExportIdentifier(template);
  const constantName = `${exportIdentifier}Node`;

  const sections = [
    `import type { NodeDefinition } from '@brepflow/types';`,
    '',
    renderParamInterface(paramsTypeName, template.parameters),
    '',
    renderSocketInterface(inputTypeName, template.inputs, true),
    '',
    renderSocketInterface(outputTypeName, template.outputs, false),
    '',
    `export const ${constantName}: NodeDefinition<${inputTypeName}, ${outputTypeName}, ${paramsTypeName}> = {`,
    `  id: '${template.category}::${template.name}',`,
    `  type: '${template.category}::${template.name}',`,
    `  category: '${template.category}',`,
    `  label: '${escapeSingleQuotes(template.name)}',`,
    `  description: '${escapeSingleQuotes(template.description)}',`,
    `  inputs: ${renderInputSpec(template.inputs)},`,
    `  outputs: ${renderOutputSpec(template.outputs)},`,
    `  params: ${renderParamSpec(template.parameters)},`,
    '  async evaluate(context, inputs, params) {',
    indentBlock(renderEvaluationLogic(template), 4),
    '  },',
    '};',
    '',
  ];

  return sections.join('\n');
}

function renderParamInterface(typeName: string, parameters: Parameter[]): string {
  if (parameters.length === 0) {
    return `type ${typeName} = Record<string, never>;`;
  }

  const fields = parameters.map((param) => `  ${param.name}: ${mapParamTsType(param.type)};`);
  return [`interface ${typeName} {`, ...fields, '}'].join('\n');
}

function renderSocketInterface(
  typeName: string,
  sockets: NodeTemplate['inputs'] | NodeTemplate['outputs'],
  isInput: boolean
): string {
  if (sockets.length === 0) {
    return `type ${typeName} = ${isInput ? 'Record<string, never>' : 'Record<string, never>'};`;
  }

  const fields = sockets.map((socket) => {
    const optional = isInput && !socket.required ? '?' : '';
    return `  ${socket.name}${optional}: ${mapSocketTsType(socket.type)};`;
  });

  return [`interface ${typeName} {`, ...fields, '}'].join('\n');
}

function renderParamSpec(parameters: Parameter[], indent = 2): string {
  if (parameters.length === 0) {
    return '{}';
  }

  const indentStr = ' '.repeat(indent);
  const innerIndent = ' '.repeat(indent + 2);
  const lines: string[] = ['{'];

  parameters.forEach((param, index) => {
    const entries = [
      `type: '${mapParamSpecType(param.type)}'`,
      `label: '${escapeSingleQuotes(titleFromName(param.name))}'`,
    ];

    if (param.default !== undefined) entries.push(`default: ${JSON.stringify(param.default)}`);
    if (param.min !== undefined) entries.push(`min: ${param.min}`);
    if (param.max !== undefined) entries.push(`max: ${param.max}`);
    if (param.step !== undefined) entries.push(`step: ${param.step}`);
    if (param.options) entries.push(`options: ${JSON.stringify(param.options)}`);

    lines.push(
      `${innerIndent}${param.name}: {
${entries.map((entry) => `${innerIndent}  ${entry}`).join(',\n')}
${innerIndent}}${index < parameters.length - 1 ? ',' : ''}`
    );
  });

  lines.push(`${indentStr}}`);
  return lines.join('\n');
}

function renderInputSpec(inputs: NodeTemplate['inputs'], indent = 2): string {
  if (inputs.length === 0) {
    return '{}';
  }

  const indentStr = ' '.repeat(indent);
  const innerIndent = ' '.repeat(indent + 2);
  const lines: string[] = ['{'];

  inputs.forEach((input, index) => {
    const entries = [
      `type: '${input.type}'`,
      `label: '${escapeSingleQuotes(titleFromName(input.name))}'`,
    ];

    if (input.required) {
      entries.push('required: true');
    } else {
      entries.push('optional: true');
    }

    lines.push(
      `${innerIndent}${input.name}: {
${entries.map((entry) => `${innerIndent}  ${entry}`).join(',\n')}
${innerIndent}}${index < inputs.length - 1 ? ',' : ''}`
    );
  });

  lines.push(`${indentStr}}`);
  return lines.join('\n');
}

function renderOutputSpec(outputs: NodeTemplate['outputs'], indent = 2): string {
  if (outputs.length === 0) {
    return '{}';
  }

  const indentStr = ' '.repeat(indent);
  const innerIndent = ' '.repeat(indent + 2);
  const lines: string[] = ['{'];

  outputs.forEach((output, index) => {
    const entries = [
      `type: '${output.type}'`,
      `label: '${escapeSingleQuotes(titleFromName(output.name))}'`,
    ];

    lines.push(
      `${innerIndent}${output.name}: {
${entries.map((entry) => `${innerIndent}  ${entry}`).join(',\n')}
${innerIndent}}${index < outputs.length - 1 ? ',' : ''}`
    );
  });

  lines.push(`${indentStr}}`);
  return lines.join('\n');
}

function renderEvaluationLogic(template: NodeTemplate): string {
  const binding = template.occtBinding ?? template.operation;
  const paramEntries: string[] = [];

  template.inputs.forEach((input) => {
    paramEntries.push(`${input.name}: inputs.${input.name}`);
  });

  template.parameters.forEach((param) => {
    paramEntries.push(`${param.name}: params.${param.name}`);
  });

  const paramsBlock =
    paramEntries.length === 0
      ? '{}'
      : `{
    ${paramEntries.join(',\n    ')}
  }`;

  const resultIdentifier = template.outputs.length > 1 ? 'results' : 'result';

  const returnLines = (() => {
    if (template.outputs.length === 0) {
      return ['return {};'];
    }

    if (template.outputs.length === 1) {
      return ['return {', `  ${template.outputs[0].name}: ${resultIdentifier}`, '};'];
    }

    const mapped = template.outputs.map((output, index) => {
      const suffix = index < template.outputs.length - 1 ? ',' : '';
      return `  ${output.name}: ${resultIdentifier}.${output.name}${suffix}`;
    });
    return ['return {', ...mapped, '};'];
  })();

  return [
    `const ${resultIdentifier} = await context.geometry.execute({`,
    `  type: '${binding}',`,
    `  params: ${paramsBlock}`,
    '});',
    '',
    ...returnLines,
  ].join('\n');
}

/**
 * Generate test file for node
 */
export function generateNodeTest(template: NodeTemplate): string {
  const pascalName = toPascalCase(template.name);
  const importPath = `./${toKebabCase(template.name)}.node`;
  const exportIdentifier = getExportIdentifier(template);
  const constantName = `${exportIdentifier}Node`;

  return `
import { describe, it, expect } from 'vitest';
import { ${constantName} } from '${importPath}';
import { createTestContext } from '../test-utils';

describe('${constantName}', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
${template.inputs
  .filter((i) => i.required)
  .map((i) => `      ${i.name}: undefined`)
  .join(',\n')}
    } as any;
    const params = {
${template.parameters.map((p) => `      ${p.name}: ${p.default !== undefined ? JSON.stringify(p.default) : 'undefined'}`).join(',\n')}
    } as any;

    const result = await ${constantName}.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
`;
}

/**
 * Generate documentation for node
 */
export function generateNodeDocumentation(template: NodeTemplate): string {
  return `
# ${template.name} Node

**Category:** ${template.category}${template.subcategory ? ` / ${template.subcategory}` : ''}

${template.description}

## Parameters

${
  template.parameters.length > 0
    ? template.parameters
        .map(
          (p) => `
### ${titleFromName(p.name)}
- **Type:** ${p.type}
- **Default:** ${p.default !== undefined ? JSON.stringify(p.default) : 'None'}
${p.min !== undefined ? `- **Min:** ${p.min}` : ''}
${p.max !== undefined ? `- **Max:** ${p.max}` : ''}
${p.description ? `- **Description:** ${p.description}` : ''}
`
        )
        .join('\n')
    : 'This node has no parameters.'
}

## Inputs

${
  template.inputs.length > 0
    ? template.inputs
        .map(
          (i) => `
### ${titleFromName(i.name)}
- **Type:** ${i.type}
- **Required:** ${i.required ? 'Yes' : 'No'}
${i.description ? `- **Description:** ${i.description}` : ''}
`
        )
        .join('\n')
    : 'This node has no inputs.'
}

## Outputs

${template.outputs
  .map(
    (o) => `
### ${titleFromName(o.name)}
- **Type:** ${o.type}
${o.description ? `- **Description:** ${o.description}` : ''}
`
  )
  .join('\n')}

${
  template.examples && template.examples.length > 0
    ? `
## Examples

${template.examples
  .map(
    (ex) => `
### ${ex.title}
${ex.description || ''}

Parameters:
\`\`\`json
${JSON.stringify(ex.parameters, null, 2)}
\`\`\`
`
  )
  .join('\n')}`
    : ''
}
`;
}
