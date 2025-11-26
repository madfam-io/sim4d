import type { NodeDefinition } from '@sim4d/types';

interface FloorFinishParams {
  material: string;
  pattern: string;
}

interface FloorFinishInputs {
  floorArea: unknown;
}

interface FloorFinishOutputs {
  finishedFloor: unknown;
  pattern: unknown;
}

export const ArchitectureFloorsFloorFinishNode: NodeDefinition<
  FloorFinishInputs,
  FloorFinishOutputs,
  FloorFinishParams
> = {
  id: 'Architecture::FloorFinish',
  category: 'Architecture',
  label: 'FloorFinish',
  description: 'Floor finish materials',
  inputs: {
    floorArea: {
      type: 'Face',
      label: 'Floor Area',
      required: true,
    },
  },
  outputs: {
    finishedFloor: {
      type: 'Face',
      label: 'Finished Floor',
    },
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'tile',
      options: ['tile', 'wood', 'carpet', 'vinyl', 'polished-concrete'],
    },
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'straight',
      options: ['straight', 'diagonal', 'herringbone', 'random'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'floorFinish',
      params: {
        floorArea: inputs.floorArea,
        material: params.material,
        pattern: params.pattern,
      },
    });

    return {
      finishedFloor: results.finishedFloor,
      pattern: results.pattern,
    };
  },
};
