import * as THREE from 'three';

export interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'radius' | 'area' | 'volume';
  value: number;
  unit: string;
  label: string;
  visible: boolean;
}

export interface MeasurementToolsProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  onMeasurementCreate: (measurement: Measurement) => void;
  onMeasurementUpdate: (measurement: Measurement) => void;
  onMeasurementDelete: (measurementId: string) => void;
}

export class MeasurementToolsManager {
  private measurements: Map<string, Measurement> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getMeasurements(): Measurement[] {
    return Array.from(this.measurements.values());
  }

  addMeasurement(measurement: Measurement): void {
    this.measurements.set(measurement.id, measurement);
  }

  removeMeasurement(id: string): boolean {
    return this.measurements.delete(id);
  }

  clearAll(): void {
    this.measurements.clear();
  }
}
