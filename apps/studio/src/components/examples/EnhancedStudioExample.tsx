import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Panel,
  PanelSection,
  Input,
  NumberInput,
  CoordinateInput,
  Enhanced3DViewport,
  DESIGN_TOKENS,
} from '../ui';

/**
 * Example implementation showcasing the enhanced UI/UX design system
 * This demonstrates professional CAD-grade components in action
 */
export const EnhancedStudioExample: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('orbit');
  const [nodeParameters, setNodeParameters] = useState({
    width: 100,
    height: 50,
    depth: 25,
    position: { x: 0, y: 0, z: 0 },
    material: 'aluminum',
    units: 'mm',
  });

  const [measurements, setMeasurements] = useState<
    Array<{
      id: string;
      type: string;
      value: number;
      unit: string;
    }>
  >([
    { id: '1', type: 'Distance', value: 125.4, unit: 'mm' },
    { id: '2', type: 'Angle', value: 45.0, unit: '°' },
    { id: '3', type: 'Radius', value: 12.7, unit: 'mm' },
  ]);

  return (
    <div
      className="enhanced-studio-example"
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gridTemplateRows: '60px 1fr 150px',
        gridTemplateAreas: `
        "toolbar toolbar toolbar"
        "sidebar viewport inspector"
        "sidebar console inspector"
      `,
        height: '100vh',
        gap: '1px',
        background: DESIGN_TOKENS.colors.technical[200],
      }}
    >
      {/* Professional Toolbar */}
      <div
        style={{
          gridArea: 'toolbar',
          background: DESIGN_TOKENS.colors.engineering[50],
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.technical[200]}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconButton icon="menu" aria-label="Menu" />
          <h1
            style={{
              fontSize: DESIGN_TOKENS.fontSize.base,
              fontWeight: 600,
              color: DESIGN_TOKENS.colors.engineering[700],
              margin: 0,
            }}
          >
            BrepFlow Studio
          </h1>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="primary" size="sm" icon="play">
            Evaluate
          </Button>
          <Button variant="secondary" size="sm" icon="save">
            Save
          </Button>
          <IconButton icon="settings" aria-label="Settings" />
        </div>
      </div>

      {/* Enhanced Sidebar with Node Library */}
      <div style={{ gridArea: 'sidebar', background: 'white' }}>
        <Panel title="Node Library" subtitle="Drag to add to canvas">
          <PanelSection title="Geometry" collapsible defaultCollapsed={false}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              {['Box', 'Cylinder', 'Sphere', 'Extrude'].map((nodeName) => (
                <Button
                  key={nodeName}
                  variant="secondary"
                  size="sm"
                  style={{
                    aspectRatio: '1',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                  }}
                >
                  {nodeName}
                </Button>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Operations" collapsible defaultCollapsed={true}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {['Union', 'Subtract', 'Intersect', 'Fillet'].map((nodeName) => (
                <Button
                  key={nodeName}
                  variant="secondary"
                  size="sm"
                  style={{
                    aspectRatio: '1',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                  }}
                >
                  {nodeName}
                </Button>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Transform" collapsible defaultCollapsed={true}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {['Move', 'Rotate', 'Scale', 'Mirror'].map((nodeName) => (
                <Button
                  key={nodeName}
                  variant="secondary"
                  size="sm"
                  style={{
                    aspectRatio: '1',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                  }}
                >
                  {nodeName}
                </Button>
              ))}
            </div>
          </PanelSection>
        </Panel>
      </div>

      {/* Enhanced 3D Viewport */}
      <div style={{ gridArea: 'viewport', background: 'white' }}>
        <Enhanced3DViewport
          onToolChange={setSelectedTool}
          onViewChange={(view) => console.log('View changed to:', view)}
          onMeasurement={(type, data) => {
            console.log('Measurement added:', type, data);
            setMeasurements((prev) => [...prev, data]);
          }}
        />
      </div>

      {/* Professional Inspector Panel */}
      <div style={{ gridArea: 'inspector', background: 'white' }}>
        <Panel title="Properties" subtitle="Selected node parameters">
          <PanelSection title="Geometry">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <NumberInput
                label="Width"
                value={nodeParameters.width}
                onValueChange={(value) =>
                  setNodeParameters((prev) => ({ ...prev, width: value || 0 }))
                }
                unit="mm"
                precision={1}
                variant="measurement"
                size="sm"
              />

              <NumberInput
                label="Height"
                value={nodeParameters.height}
                onValueChange={(value) =>
                  setNodeParameters((prev) => ({ ...prev, height: value || 0 }))
                }
                unit="mm"
                precision={1}
                variant="measurement"
                size="sm"
              />

              <NumberInput
                label="Depth"
                value={nodeParameters.depth}
                onValueChange={(value) =>
                  setNodeParameters((prev) => ({ ...prev, depth: value || 0 }))
                }
                unit="mm"
                precision={1}
                variant="measurement"
                size="sm"
              />
            </div>
          </PanelSection>

          <PanelSection title="Position">
            <CoordinateInput
              value={nodeParameters.position}
              onChange={(value) =>
                setNodeParameters((prev) => ({
                  ...prev,
                  position: { x: value.x ?? 0, y: value.y ?? 0, z: value.z ?? 0 },
                }))
              }
              unit="mm"
              precision={1}
              size="sm"
            />
          </PanelSection>

          <PanelSection title="Material">
            <Input
              label="Material"
              value={nodeParameters.material}
              onChange={(e) => setNodeParameters((prev) => ({ ...prev, material: e.target.value }))}
              placeholder="Enter material name"
              size="sm"
            />
          </PanelSection>

          <PanelSection title="Measurements" collapsible>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    background: DESIGN_TOKENS.colors.technical[50],
                    borderRadius: DESIGN_TOKENS.borderRadius.sm,
                    fontSize: DESIGN_TOKENS.fontSize.xs,
                  }}
                >
                  <div>
                    <div style={{ color: DESIGN_TOKENS.colors.technical[600] }}>
                      {measurement.type}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-family-mono)',
                        color: DESIGN_TOKENS.colors.technical[900],
                        fontWeight: 600,
                      }}
                    >
                      {measurement.value.toFixed(1)}
                      {measurement.unit}
                    </div>
                  </div>
                  <IconButton
                    icon="trash-2"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setMeasurements((prev) => prev.filter((m) => m.id !== measurement.id))
                    }
                    aria-label="Delete measurement"
                  />
                </div>
              ))}

              {measurements.length === 0 && (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: DESIGN_TOKENS.colors.technical[500],
                    fontSize: DESIGN_TOKENS.fontSize.xs,
                  }}
                >
                  No measurements
                </div>
              )}
            </div>
          </PanelSection>
        </Panel>
      </div>

      {/* Enhanced Console */}
      <div style={{ gridArea: 'console', background: 'white' }}>
        <Panel title="Console" subtitle="System messages and logs" variant="compact">
          <div
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: DESIGN_TOKENS.fontSize.xs,
              lineHeight: '1.4',
              color: DESIGN_TOKENS.colors.technical[700],
            }}
          >
            <div style={{ color: DESIGN_TOKENS.colors.engineering[600] }}>
              [INFO] BrepFlow Studio initialized
            </div>
            <div style={{ color: DESIGN_TOKENS.colors.technical[600] }}>
              [DEBUG] Node editor ready
            </div>
            <div style={{ color: DESIGN_TOKENS.colors.precision[600] }}>
              [WASM] Geometry engine loaded
            </div>
            <div style={{ color: DESIGN_TOKENS.colors.engineering[600] }}>
              [INFO] Viewport initialized (WebGL 2.0)
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// CSS for the example (in a real app, this would be in a separate file)
const exampleStyles = `
  .enhanced-studio-example * {
    box-sizing: border-box;
  }

  .enhanced-studio-example {
    font-family: var(--font-family-ui);
    color: var(--color-text-primary);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = exampleStyles;
  document.head.appendChild(styleSheet);
}
