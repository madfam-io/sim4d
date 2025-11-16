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
  Vec3Input,
} from '../ui';
import { usePerformanceMonitor, getPerformanceMonitor } from '../../utils/performance-monitor';
import './ComponentShowcase.css';

/**
 * Interactive Component Showcase
 * Demonstrates all enhanced UI components with real-time performance monitoring
 */
export const ComponentShowcase: React.FC = () => {
  const performanceMetrics = usePerformanceMonitor();
  const [activeDemo, setActiveDemo] = useState<string>('buttons');

  // Button demo states
  const [buttonLoading, setButtonLoading] = useState(false);

  // Input demo states
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [numberValue, setNumberValue] = useState(100);
  const [coordinateValue, setCoordinateValue] = useState({ x: 10, y: 20, z: 30 });

  // Panel demo states
  const [panelWidth, setPanelWidth] = useState<number | undefined>();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Validation states
  const [showError, setShowError] = useState(false);

  const handleButtonClick = async () => {
    setButtonLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setButtonLoading(false);
  };

  const demoSections = [
    { id: 'buttons', label: 'Buttons', icon: 'mouse-pointer' },
    { id: 'inputs', label: 'Inputs', icon: 'edit' },
    { id: 'panels', label: 'Panels', icon: 'layout' },
    { id: 'viewport', label: '3D Viewport', icon: 'box' },
    { id: 'integration', label: 'Integration', icon: 'layers' },
  ];

  return (
    <div className="component-showcase">
      {/* Header with Navigation */}
      <div className="showcase-header">
        <h1 className="showcase-title">BrepFlow UI Component Showcase</h1>
        <div className="showcase-nav">
          {demoSections.map((section) => (
            <Button
              key={section.id}
              variant={activeDemo === section.id ? 'primary' : 'secondary'}
              size="sm"
              icon={section.icon as any}
              onClick={() => setActiveDemo(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Performance Monitor */}
      {performanceMetrics && (
        <div className="performance-banner">
          <span className="perf-item">
            FPS:{' '}
            <strong className={performanceMetrics.fps < 30 ? 'perf-bad' : 'perf-good'}>
              {performanceMetrics.fps}
            </strong>
          </span>
          <span className="perf-item">
            Frame Time: <strong>{performanceMetrics.frameTime.toFixed(2)}ms</strong>
          </span>
          <span className="perf-item">
            Memory: <strong>{(performanceMetrics.memory.percentage * 100).toFixed(1)}%</strong>
          </span>
          <span className="perf-item">
            Components:{' '}
            <strong>
              {performanceMetrics.componentMetrics.panelCount} panels,
              {performanceMetrics.componentMetrics.inputCount} inputs
            </strong>
          </span>
        </div>
      )}

      {/* Demo Content */}
      <div className="showcase-content">
        {/* Button Showcase */}
        {activeDemo === 'buttons' && (
          <Panel
            title="Button Components"
            subtitle="Professional button system with variants and states"
          >
            <PanelSection title="Button Variants">
              <div className="demo-grid">
                <Button variant="primary" icon="save">
                  Primary Action
                </Button>
                <Button variant="secondary" icon="folder">
                  Secondary
                </Button>
                <Button variant="tertiary">Tertiary</Button>
                <Button variant="ghost" icon="settings">
                  Ghost
                </Button>
                <Button variant="danger" icon="trash-2">
                  Danger
                </Button>
              </div>
            </PanelSection>

            <PanelSection title="Button Sizes">
              <div className="demo-grid">
                <Button size="sm" icon="download">
                  Small
                </Button>
                <Button size="md" icon="download">
                  Medium
                </Button>
                <Button size="lg" icon="download">
                  Large
                </Button>
              </div>
            </PanelSection>

            <PanelSection title="Button States">
              <div className="demo-grid">
                <Button disabled>Disabled</Button>
                <Button loading={buttonLoading} onClick={handleButtonClick}>
                  {buttonLoading ? 'Processing...' : 'Click to Load'}
                </Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </PanelSection>

            <PanelSection title="Icon Buttons">
              <div className="demo-grid icon-grid">
                <IconButton icon="play" aria-label="Play" variant="primary" />
                <IconButton icon="pause" aria-label="Pause" variant="secondary" />
                <IconButton icon="stop-circle" aria-label="Stop" variant="danger" />
                <IconButton icon="settings" aria-label="Settings" size="lg" />
                <IconButton icon="help-circle" aria-label="Help" variant="ghost" />
              </div>
            </PanelSection>
          </Panel>
        )}

        {/* Input Showcase */}
        {activeDemo === 'inputs' && (
          <Panel title="Input Components" subtitle="Professional form controls for CAD workflows">
            <PanelSection title="Basic Inputs">
              <Input
                label="Project Name"
                placeholder="Enter project name"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                helpText="Choose a descriptive name for your project"
                clearable
                onClear={() => setTextValue('')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                leftIcon="mail"
                required
                errorText={
                  showError && !emailValue.includes('@') ? 'Invalid email format' : undefined
                }
              />
            </PanelSection>

            <PanelSection title="Number Inputs">
              <NumberInput
                label="Width"
                value={numberValue}
                onValueChange={(val) => setNumberValue(val ?? 0)}
                min={0}
                max={1000}
                step={10}
                precision={2}
                unit="mm"
                variant="measurement"
                showSteppers
              />

              <NumberInput
                label="Angle"
                value={45}
                min={0}
                max={360}
                step={15}
                precision={1}
                unit="°"
                variant="technical"
              />
            </PanelSection>

            <PanelSection title="Coordinate Input">
              <CoordinateInput
                value={coordinateValue}
                onChange={(value) =>
                  setCoordinateValue({ x: value.x ?? 0, y: value.y ?? 0, z: value.z ?? 0 })
                }
                unit="mm"
                precision={2}
              />
            </PanelSection>

            <PanelSection title="Input States">
              <Input label="Disabled" disabled value="Cannot edit" />
              <Input label="Loading" loading value="Loading data..." />
              <Button onClick={() => setShowError(!showError)}>
                Toggle Validation ({showError ? 'ON' : 'OFF'})
              </Button>
            </PanelSection>
          </Panel>
        )}

        {/* Panel Showcase */}
        {activeDemo === 'panels' && (
          <div className="panel-demo">
            <Panel
              title="Resizable Panel"
              subtitle="Drag the right edge to resize"
              resizable
              minWidth={300}
              maxWidth={600}
              onResize={setPanelWidth}
              headerActions={
                <div style={{ display: 'flex', gap: '4px' }}>
                  <IconButton icon="settings" size="sm" aria-label="Settings" />
                  <IconButton icon="more-vertical" size="sm" aria-label="More" />
                </div>
              }
            >
              <div style={{ padding: '16px' }}>
                <p>Current width: {panelWidth || 'auto'}px</p>
                <p>This panel can be resized between 300px and 600px.</p>
              </div>
            </Panel>

            <Panel
              title="Collapsible Panel"
              subtitle="Click the chevron to collapse"
              collapsible
              defaultCollapsed={isPanelCollapsed}
              onCollapse={setIsPanelCollapsed}
              variant="primary"
            >
              <PanelSection title="Section 1" collapsible>
                <p>This section can be independently collapsed.</p>
              </PanelSection>
              <PanelSection title="Section 2" collapsible defaultCollapsed>
                <p>This section starts collapsed.</p>
              </PanelSection>
            </Panel>

            <Panel
              variant="floating"
              title="Floating Panel"
              style={{ position: 'relative', left: '20px', top: '20px', width: '320px' }}
            >
              <p>This panel has a floating appearance with backdrop blur.</p>
            </Panel>
          </div>
        )}

        {/* Viewport Showcase */}
        {activeDemo === 'viewport' && (
          <Panel title="Enhanced 3D Viewport" subtitle="Professional CAD navigation and tools">
            <div style={{ height: '600px' }}>
              <Enhanced3DViewport
                onToolChange={(tool) => console.log('Tool changed:', tool)}
                onViewChange={(view) => console.log('View changed:', view)}
                onMeasurement={(type, data) => console.log('Measurement:', type, data)}
              />
            </div>
          </Panel>
        )}

        {/* Integration Example */}
        {activeDemo === 'integration' && (
          <div className="integration-demo">
            <div className="integration-layout">
              {/* Sidebar */}
              <Panel
                title="Node Library"
                variant="secondary"
                collapsible
                className="integration-sidebar"
              >
                <PanelSection title="Geometry" collapsible>
                  <div className="node-grid">
                    {['Box', 'Cylinder', 'Sphere', 'Torus'].map((node) => (
                      <Button key={node} variant="secondary" size="sm" fullWidth>
                        {node}
                      </Button>
                    ))}
                  </div>
                </PanelSection>
                <PanelSection title="Operations" collapsible defaultCollapsed>
                  <div className="node-grid">
                    {['Union', 'Subtract', 'Intersect'].map((node) => (
                      <Button key={node} variant="secondary" size="sm" fullWidth>
                        {node}
                      </Button>
                    ))}
                  </div>
                </PanelSection>
              </Panel>

              {/* Main Content */}
              <Panel title="Node Editor" className="integration-main">
                <div className="mock-node-editor">
                  <div className="mock-node">
                    <div className="mock-node-header">Box Node</div>
                    <div className="mock-node-content">
                      <NumberInput
                        label="Width"
                        value={100}
                        unit="mm"
                        size="sm"
                        variant="measurement"
                      />
                      <NumberInput
                        label="Height"
                        value={50}
                        unit="mm"
                        size="sm"
                        variant="measurement"
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Inspector */}
              <Panel
                title="Properties"
                resizable
                minWidth={280}
                maxWidth={400}
                className="integration-inspector"
              >
                <PanelSection title="Transform">
                  <CoordinateInput value={{ x: 0, y: 0, z: 0 }} unit="mm" size="sm" />
                </PanelSection>
                <PanelSection title="Material">
                  <Input label="Name" value="Aluminum" size="sm" />
                  <Input label="Density" value="2.7" unit="g/cm³" size="sm" />
                </PanelSection>
                <PanelSection title="Actions">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="primary" size="sm" icon="play">
                      Evaluate
                    </Button>
                    <Button variant="secondary" size="sm" icon="save">
                      Save
                    </Button>
                  </div>
                </PanelSection>
              </Panel>
            </div>
          </div>
        )}
      </div>

      {/* Performance Test Actions */}
      <div className="showcase-actions">
        <Button
          variant="secondary"
          icon="activity"
          onClick={() => {
            const monitor = getPerformanceMonitor();
            console.log(monitor.getPerformanceReport());
          }}
        >
          Log Performance Report
        </Button>

        <Button
          variant="secondary"
          icon="download"
          onClick={async () => {
            const monitor = getPerformanceMonitor();
            const recording = await monitor.startRecording(5000);
            console.log('Performance recording:', recording);
          }}
        >
          Record 5s Performance
        </Button>

        <Button
          variant="secondary"
          icon="zap"
          onClick={() => {
            // Stress test with many components
            const stressTest = document.createElement('div');
            for (let i = 0; i < 50; i++) {
              const panel = document.createElement('div');
              panel.className = 'panel';

              // Safe DOM manipulation instead of innerHTML
              const header = document.createElement('div');
              header.className = 'panel-header';
              header.textContent = `Panel ${i}`;
              panel.appendChild(header);

              stressTest.appendChild(panel);
            }
            document.body.appendChild(stressTest);
            setTimeout(() => document.body.removeChild(stressTest), 3000);
          }}
        >
          Stress Test (50 Panels)
        </Button>
      </div>
    </div>
  );
};
