import type { NodeDefinition } from '@sim4d/types';

interface TabsAndSlotsParams {
  tabWidth: number;
  tabDepth: number;
  clearance: number;
}

interface TabsAndSlotsInputs {
  edges: unknown;
}

interface TabsAndSlotsOutputs {
  tabbedEdges: unknown;
}

export const FabricationLaserTabsAndSlotsNode: NodeDefinition<
  TabsAndSlotsInputs,
  TabsAndSlotsOutputs,
  TabsAndSlotsParams
> = {
  id: 'Fabrication::TabsAndSlots',
  type: 'Fabrication::TabsAndSlots',
  category: 'Fabrication',
  label: 'TabsAndSlots',
  description: 'Add tabs for assembly',
  inputs: {
    edges: {
      type: 'Edge[]',
      label: 'Edges',
      required: true,
    },
  },
  outputs: {
    tabbedEdges: {
      type: 'Wire[]',
      label: 'Tabbed Edges',
    },
  },
  params: {
    tabWidth: {
      type: 'number',
      label: 'Tab Width',
      default: 10,
      min: 1,
      max: 50,
    },
    tabDepth: {
      type: 'number',
      label: 'Tab Depth',
      default: 5,
      min: 1,
      max: 20,
    },
    clearance: {
      type: 'number',
      label: 'Clearance',
      default: 0.1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'tabsAndSlots',
      params: {
        edges: inputs.edges,
        tabWidth: params.tabWidth,
        tabDepth: params.tabDepth,
        clearance: params.clearance,
      },
    });

    return {
      tabbedEdges: result,
    };
  },
};
