# @brepflow/cli

Command-line interface for BrepFlow - headless graph execution and batch processing.

## Overview

The BrepFlow CLI enables automation and batch processing of parametric CAD models. It provides:

- **Headless execution**: Run graphs without UI
- **Parameter overrides**: Set values at runtime
- **Batch processing**: Process multiple variants
- **Export formats**: STEP, IGES, STL output
- **CI/CD integration**: Deterministic builds
- **Validation**: Graph integrity checking

## Installation

### Global Installation

```bash
npm install -g @brepflow/cli
```

### Local Installation

```bash
pnpm add @brepflow/cli
```

### From Source

```bash
cd packages/cli
pnpm build
node dist/index.js --help
```

## Commands

### render

Render a graph and export to various formats.

```bash
brepflow render <graph.bflow.json> [options]
```

**Options:**

- `--export <formats>` - Export formats (step,iges,stl,obj)
- `--out <directory>` - Output directory
- `--set <param=value>` - Override parameters
- `--quality <level>` - Mesh quality (0.001-1.0)
- `--timeout <ms>` - Execution timeout
- `--verbose` - Detailed logging
- `--dry-run` - Validate without executing

**Examples:**

```bash
# Basic rendering
brepflow render enclosure.bflow.json --export step --out dist/

# Parameter overrides
brepflow render parametric-box.bflow.json \
  --set width=120 \
  --set height=80 \
  --set depth=40 \
  --export step,stl

# High quality mesh
brepflow render complex-part.bflow.json \
  --export stl \
  --quality 0.001 \
  --out high-quality/

# Multiple formats
brepflow render assembly.bflow.json \
  --export step,iges,stl,obj \
  --out exports/
```

### sweep

Generate multiple variants using parameter matrices.

```bash
brepflow sweep --graph <graph.bflow.json> --matrix <params.csv> [options]
```

**Options:**

- `--matrix <file>` - CSV parameter matrix
- `--export <formats>` - Export formats
- `--out <directory>` - Output directory
- `--parallel <count>` - Parallel execution count
- `--naming <pattern>` - Output naming pattern
- `--filter <expression>` - Variant filtering

**Matrix Format (CSV):**

```csv
width,height,depth,material
100,50,25,aluminum
120,60,30,steel
80,40,20,plastic
```

**Examples:**

```bash
# Basic sweep
brepflow sweep \
  --graph parametric-bracket.bflow.json \
  --matrix variants.csv \
  --export step \
  --out variants/

# Parallel processing
brepflow sweep \
  --graph complex-assembly.bflow.json \
  --matrix large-matrix.csv \
  --parallel 4 \
  --export step,stl

# Custom naming
brepflow sweep \
  --graph part.bflow.json \
  --matrix params.csv \
  --naming "part_{width}x{height}x{depth}" \
  --export step
```

### validate

Validate graph integrity and parameter consistency.

```bash
brepflow validate <graph.bflow.json> [options]
```

**Options:**

- `--strict` - Strict validation mode
- `--check-types` - Validate parameter types
- `--check-connections` - Validate edge connections
- `--check-cycles` - Detect circular dependencies
- `--format <json|text>` - Output format

**Examples:**

```bash
# Basic validation
brepflow validate my-graph.bflow.json

# Strict mode with detailed output
brepflow validate complex-graph.bflow.json \
  --strict \
  --format json \
  > validation-report.json

# Connection checking
brepflow validate assembly.bflow.json \
  --check-connections \
  --check-cycles
```

### info

Display graph information and statistics.

```bash
brepflow info <graph.bflow.json> [options]
```

**Options:**

- `--format <json|yaml|text>` - Output format
- `--stats` - Include statistics
- `--dependencies` - Show dependency tree
- `--parameters` - List all parameters

**Examples:**

```bash
# Basic info
brepflow info my-model.bflow.json

# Detailed statistics
brepflow info complex-assembly.bflow.json \
  --stats \
  --dependencies \
  --format json

# Parameter listing
brepflow info parametric-part.bflow.json \
  --parameters \
  --format yaml
```

## Configuration

### Global Config

Create `~/.brepflow/config.json`:

```json
{
  "defaultExportFormat": "step",
  "outputDirectory": "./dist",
  "meshQuality": 0.01,
  "parallelJobs": 4,
  "timeout": 300000,
  "logging": {
    "level": "info",
    "file": "~/.brepflow/logs/cli.log"
  },
  "cache": {
    "enabled": true,
    "directory": "~/.brepflow/cache",
    "maxSize": "1GB"
  }
}
```

### Project Config

Create `.brepflow.json` in project root:

```json
{
  "version": "0.1",
  "defaults": {
    "units": "mm",
    "tolerance": 0.001,
    "quality": 0.01
  },
  "builds": {
    "production": {
      "export": ["step", "stl"],
      "quality": 0.001,
      "out": "dist/production"
    },
    "preview": {
      "export": ["stl"],
      "quality": 0.1,
      "out": "dist/preview"
    }
  },
  "parameters": {
    "width": {
      "default": 100,
      "min": 10,
      "max": 1000
    },
    "height": {
      "default": 50,
      "min": 5,
      "max": 500
    }
  }
}
```

### Environment Variables

```bash
# Output directory
export BREPFLOW_OUT_DIR="./builds"

# Default format
export BREPFLOW_EXPORT="step,stl"

# Parallel jobs
export BREPFLOW_PARALLEL=8

# Logging level
export BREPFLOW_LOG_LEVEL="debug"

# Cache directory
export BREPFLOW_CACHE_DIR="~/.cache/brepflow"

# Disable telemetry
export BREPFLOW_TELEMETRY=false
```

## Batch Processing

### CI/CD Integration

**GitHub Actions:**

```yaml
name: Build Models

on:
  push:
    paths: ['models/**/*.bflow.json']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm install -g @brepflow/cli

      - name: Build all models
        run: |
          for model in models/*.bflow.json; do
            brepflow render "$model" \
              --export step,stl \
              --out "dist/$(basename "$model" .bflow.json)"
          done

      - uses: actions/upload-artifact@v3
        with:
          name: built-models
          path: dist/
```

**Makefile:**

```makefile
MODELS := $(wildcard models/*.bflow.json)
BUILDS := $(MODELS:models/%.bflow.json=dist/%)

.PHONY: all clean validate

all: $(BUILDS)

dist/%: models/%.bflow.json
	@mkdir -p $@
	brepflow render $< --export step,stl --out $@

validate:
	@for model in $(MODELS); do \
		brepflow validate $$model || exit 1; \
	done

clean:
	rm -rf dist/

# Parameter sweep
sweep:
	brepflow sweep \
		--graph models/parametric-part.bflow.json \
		--matrix configs/variants.csv \
		--export step \
		--out dist/variants/
```

### Scripting Examples

**Bash script for batch processing:**

```bash
#!/bin/bash
# build-all.sh

set -e

MODELS_DIR="models"
OUTPUT_DIR="dist"
FORMATS="step,stl"

echo "Building all models..."

for model in "$MODELS_DIR"/*.bflow.json; do
    name=$(basename "$model" .bflow.json)
    echo "Building $name..."

    brepflow render "$model" \
        --export "$FORMATS" \
        --out "$OUTPUT_DIR/$name" \
        --verbose

    echo "✓ Built $name"
done

echo "All models built successfully!"
```

**Python script for parameter exploration:**

```python
#!/usr/bin/env python3
import subprocess
import itertools
import json
import os

def generate_variants():
    """Generate parameter combinations"""
    widths = [80, 100, 120]
    heights = [40, 50, 60]
    depths = [20, 25, 30]

    for w, h, d in itertools.product(widths, heights, depths):
        yield {
            'width': w,
            'height': h,
            'depth': d,
            'name': f'variant_{w}x{h}x{d}'
        }

def build_variant(graph_file, params):
    """Build single variant"""
    cmd = [
        'brepflow', 'render', graph_file,
        '--set', f'width={params["width"]}',
        '--set', f'height={params["height"]}',
        '--set', f'depth={params["depth"]}',
        '--export', 'step,stl',
        '--out', f'dist/{params["name"]}'
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Built {params['name']}")
            return True
        else:
            print(f"✗ Failed {params['name']}: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error {params['name']}: {e}")
        return False

def main():
    graph_file = 'models/parametric-box.bflow.json'

    if not os.path.exists(graph_file):
        print(f"Graph file not found: {graph_file}")
        return

    print("Generating variants...")

    success_count = 0
    total_count = 0

    for params in generate_variants():
        total_count += 1
        if build_variant(graph_file, params):
            success_count += 1

    print(f"Built {success_count}/{total_count} variants")

if __name__ == '__main__':
    main()
```

## Output Formats

### File Naming

Generated files follow this pattern:

```
{model-name}_{hash}.{format}
```

Where:

- `model-name`: Original graph filename (without .bflow.json)
- `hash`: Content-addressed hash for deterministic builds
- `format`: Export format (step, iges, stl, obj)

### Manifest File

Each output directory contains a `manifest.json`:

```json
{
  "version": "0.1",
  "timestamp": "2025-09-14T12:34:56Z",
  "graph": {
    "file": "models/enclosure.bflow.json",
    "hash": "abc123...",
    "parameters": {
      "width": 120,
      "height": 80,
      "depth": 40
    }
  },
  "outputs": [
    {
      "format": "step",
      "file": "enclosure_abc123.step",
      "size": 1048576,
      "hash": "def456..."
    },
    {
      "format": "stl",
      "file": "enclosure_abc123.stl",
      "size": 524288,
      "hash": "ghi789..."
    }
  ],
  "stats": {
    "nodes": 15,
    "edges": 18,
    "evaluationTime": 2.3,
    "exportTime": 0.8
  }
}
```

## Performance Optimization

### Parallel Processing

```bash
# Use all CPU cores
brepflow sweep \
  --graph model.bflow.json \
  --matrix variants.csv \
  --parallel $(nproc)

# Limit concurrent jobs
brepflow sweep \
  --graph model.bflow.json \
  --matrix variants.csv \
  --parallel 4
```

### Caching

```bash
# Enable persistent cache
export BREPFLOW_CACHE_DIR="~/.cache/brepflow"

# Cache size limit
export BREPFLOW_CACHE_SIZE="5GB"

# Clear cache
brepflow cache clear
```

### Memory Management

```bash
# Increase Node.js memory limit
node --max-old-space-size=8192 \
  $(which brepflow) render large-model.bflow.json

# Monitor memory usage
brepflow render model.bflow.json --verbose --stats
```

## Error Handling

### Common Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: File not found
- `4`: Graph validation failed
- `5`: Evaluation error
- `6`: Export error
- `7`: Timeout
- `8`: Out of memory

### Error Recovery

```bash
# Retry with increased timeout
brepflow render model.bflow.json \
  --timeout 600000 \
  --verbose

# Skip failed variants in sweep
brepflow sweep \
  --graph model.bflow.json \
  --matrix variants.csv \
  --continue-on-error

# Validate before rendering
brepflow validate model.bflow.json && \
brepflow render model.bflow.json --export step
```

### Debugging

```bash
# Enable debug logging
DEBUG=* brepflow render model.bflow.json

# Dry run mode
brepflow render model.bflow.json --dry-run

# Detailed error output
brepflow render model.bflow.json \
  --verbose \
  --format json 2> error.json
```

## API Reference

The CLI can also be used programmatically:

```typescript
import { CLI, RenderCommand, SweepCommand } from '@brepflow/cli';

// Programmatic rendering
const cli = new CLI();

const result = await cli.render({
  graph: 'model.bflow.json',
  export: ['step', 'stl'],
  out: 'dist/',
  parameters: {
    width: 100,
    height: 50,
  },
});

// Batch processing
const sweepResult = await cli.sweep({
  graph: 'model.bflow.json',
  matrix: 'variants.csv',
  export: ['step'],
  parallel: 4,
});
```

## License

MPL-2.0 - See LICENSE in repository root
