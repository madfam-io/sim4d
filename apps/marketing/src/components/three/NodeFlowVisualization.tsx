import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Node {
  id: string;
  position: [number, number, number];
  type: 'input' | 'process' | 'output';
  connections: string[];
}

export function NodeFlowVisualization() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate a simple node graph for visualization
  const nodes: Node[] = useMemo(
    () => [
      { id: 'input1', position: [-4, 2, 0], type: 'input', connections: ['process1'] },
      { id: 'input2', position: [-4, 0, 0], type: 'input', connections: ['process1'] },
      { id: 'input3', position: [-4, -2, 0], type: 'input', connections: ['process2'] },
      { id: 'process1', position: [-1, 1, 0], type: 'process', connections: ['process3'] },
      { id: 'process2', position: [-1, -1, 0], type: 'process', connections: ['process3'] },
      { id: 'process3', position: [2, 0, 0], type: 'process', connections: ['output1'] },
      { id: 'output1', position: [5, 0, 0], type: 'output', connections: [] },
    ],
    []
  );

  // Colors for different node types
  const nodeColors = {
    input: '#3b82f6', // Blue
    process: '#8b5cf6', // Purple
    output: '#10b981', // Green
  };

  // Animate the entire group
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // Generate connection lines
  const connections = useMemo(() => {
    const lines: Array<{ from: [number, number, number]; to: [number, number, number] }> = [];

    nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = nodes.find((n) => n.id === connectionId);
        if (targetNode) {
          lines.push({
            from: node.position,
            to: targetNode.position,
          });
        }
      });
    });

    return lines;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {/* Render nodes */}
      {nodes.map((node) => (
        <group key={node.id} position={node.position}>
          {node.type === 'input' && (
            <Sphere args={[0.2]} position={[0, 0, 0]}>
              <meshStandardMaterial color={nodeColors[node.type]} />
            </Sphere>
          )}
          {node.type === 'process' && (
            <Box args={[0.4, 0.4, 0.4]} position={[0, 0, 0]}>
              <meshStandardMaterial color={nodeColors[node.type]} />
            </Box>
          )}
          {node.type === 'output' && (
            <Box args={[0.3, 0.6, 0.3]} position={[0, 0, 0]}>
              <meshStandardMaterial color={nodeColors[node.type]} />
            </Box>
          )}

          {/* Add a subtle glow effect */}
          <pointLight color={nodeColors[node.type]} intensity={0.5} distance={2} decay={2} />
        </group>
      ))}

      {/* Render connections */}
      {connections.map((connection, index) => (
        <Line
          key={index}
          points={[connection.from, connection.to]}
          color="#666666"
          lineWidth={2}
          dashed={false}
        />
      ))}

      {/* Add ambient lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </group>
  );
}
