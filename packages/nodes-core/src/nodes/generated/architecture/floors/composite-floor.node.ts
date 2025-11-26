import type { NodeDefinition } from '@sim4d/types';

interface CompositeFloorParams {
  deckType: string;
  concreteThickness: number;
}

interface CompositeFloorInputs {
  floorOutline: unknown;
  beams: unknown;
}

interface CompositeFloorOutputs {
  compositeFloor: unknown;
  deck: unknown;
}

export const ArchitectureFloorsCompositeFloorNode: NodeDefinition<
  CompositeFloorInputs,
  CompositeFloorOutputs,
  CompositeFloorParams
> = {
  id: 'Architecture::CompositeFloor',
  category: 'Architecture',
  label: 'CompositeFloor',
  description: 'Steel deck composite floor',
  inputs: {
    floorOutline: {
      type: 'Wire',
      label: 'Floor Outline',
      required: true,
    },
    beams: {
      type: 'Wire[]',
      label: 'Beams',
      required: true,
    },
  },
  outputs: {
    compositeFloor: {
      type: 'Shape',
      label: 'Composite Floor',
    },
    deck: {
      type: 'Shape',
      label: 'Deck',
    },
  },
  params: {
    deckType: {
      type: 'enum',
      label: 'Deck Type',
      default: '3-inch',
      options: ['2-inch', '3-inch', 'cellular'],
    },
    concreteThickness: {
      type: 'number',
      label: 'Concrete Thickness',
      default: 100,
      min: 75,
      max: 200,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'compositeFloor',
      params: {
        floorOutline: inputs.floorOutline,
        beams: inputs.beams,
        deckType: params.deckType,
        concreteThickness: params.concreteThickness,
      },
    });

    return {
      compositeFloor: results.compositeFloor,
      deck: results.deck,
    };
  },
};
