import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilletNode, ChamferNode, ShellNode, DraftNode } from './features';

describe('Feature Nodes', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      worker: {
        invoke: vi.fn(),
      },
    };
  });

  describe('Fillet Node', () => {
    it('should apply fillet to specific edges', async () => {
      const inputs = {
        shape: { type: 'Shape', id: 'base-shape' },
        edges: [
          { type: 'Curve', id: 'edge1' },
          { type: 'Curve', id: 'edge2' },
        ],
      };
      const params = { radius: 10, selectAll: false };
      const expectedResult = { type: 'Shape', id: 'filleted-shape' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await FilletNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_FILLET', {
        shape: inputs.shape,
        edges: inputs.edges,
        radius: params.radius,
        selectAll: params.selectAll,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should apply fillet to all edges when selectAll is true', async () => {
      const inputs = {
        shape: { type: 'Shape', id: 'base-shape' },
      };
      const params = { radius: 5, selectAll: true };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await FilletNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_FILLET', {
        shape: inputs.shape,
        edges: undefined,
        radius: 5,
        selectAll: true,
      });
    });

    it('should use default parameters', async () => {
      const inputs = { shape: { type: 'Shape', id: 'base-shape' } };
      const params = {};

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await FilletNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_FILLET', {
        shape: inputs.shape,
        edges: undefined,
        radius: undefined,
        selectAll: undefined,
      });
    });

    it('should validate node definition structure', () => {
      expect(FilletNode.id).toBe('Features::Fillet');
      expect(FilletNode.category).toBe('Features');
      expect(FilletNode.label).toBe('Fillet');
      expect(FilletNode.inputs.shape.type).toBe('Shape');
      expect(FilletNode.inputs.edges.optional).toBe(true);
      expect(FilletNode.params.radius.default).toBe(5);
      expect(FilletNode.params.radius.min).toBe(0.001);
    });
  });

  describe('Chamfer Node', () => {
    it('should apply chamfer to specific edges', async () => {
      const inputs = {
        shape: { type: 'Shape', id: 'base-shape' },
        edges: [{ type: 'Curve', id: 'edge1' }],
      };
      const params = { distance: 2, selectAll: false };
      const expectedResult = { type: 'Shape', id: 'chamfered-shape' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await ChamferNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_CHAMFER', {
        shape: inputs.shape,
        edges: inputs.edges,
        distance: params.distance,
        selectAll: params.selectAll,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should apply chamfer to all edges when selectAll is true', async () => {
      const inputs = { shape: { type: 'Shape', id: 'base-shape' } };
      const params = { distance: 1.5, selectAll: true };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await ChamferNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_CHAMFER', {
        shape: inputs.shape,
        edges: undefined,
        distance: 1.5,
        selectAll: true,
      });
    });

    it('should validate node definition structure', () => {
      expect(ChamferNode.id).toBe('Features::Chamfer');
      expect(ChamferNode.category).toBe('Features');
      expect(ChamferNode.label).toBe('Chamfer');
      expect(ChamferNode.params.distance.default).toBe(3);
      expect(ChamferNode.params.distance.min).toBe(0.001);
    });
  });

  describe('Shell Node', () => {
    it('should create shell with specific faces removed', async () => {
      const inputs = {
        shape: { type: 'Shape', id: 'solid-shape' },
        faces: [
          { type: 'Surface', id: 'face1' },
          { type: 'Surface', id: 'face2' },
        ],
      };
      const params = { thickness: 5, inside: false };
      const expectedResult = { type: 'Shape', id: 'shelled-shape' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await ShellNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_SHELL', {
        shape: inputs.shape,
        faces: inputs.faces,
        thickness: params.thickness,
        inside: params.inside,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should create shell with default inside direction', async () => {
      const inputs = { shape: { type: 'Shape', id: 'solid-shape' } };
      const params = { thickness: 3 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await ShellNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_SHELL', {
        shape: inputs.shape,
        faces: undefined,
        thickness: 3,
        inside: undefined,
      });
    });

    it('should validate node definition structure', () => {
      expect(ShellNode.id).toBe('Features::Shell');
      expect(ShellNode.category).toBe('Features');
      expect(ShellNode.label).toBe('Shell');
      expect(ShellNode.inputs.faces.optional).toBe(true);
      expect(ShellNode.params.thickness.default).toBe(2);
      expect(ShellNode.params.inside.default).toBe(true);
    });
  });

  describe('Draft Node', () => {
    it('should apply draft angle with neutral plane', async () => {
      const inputs = {
        shape: { type: 'Shape', id: 'base-shape' },
        neutralPlane: { type: 'Surface', id: 'neutral-plane' },
      };
      const params = {
        angle: 5,
        pullDirection: { x: 0, y: 1, z: 0 },
      };
      const expectedResult = { type: 'Shape', id: 'drafted-shape' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await DraftNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_DRAFT', {
        shape: inputs.shape,
        neutralPlane: inputs.neutralPlane,
        angle: params.angle,
        pullDirection: params.pullDirection,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should apply draft without neutral plane', async () => {
      const inputs = { shape: { type: 'Shape', id: 'base-shape' } };
      const params = { angle: 2 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await DraftNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_DRAFT', {
        shape: inputs.shape,
        neutralPlane: undefined,
        angle: 2,
        pullDirection: undefined,
      });
    });

    it('should use default parameters', async () => {
      const inputs = { shape: { type: 'Shape', id: 'base-shape' } };
      const params = {};

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await DraftNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MAKE_DRAFT', {
        shape: inputs.shape,
        neutralPlane: undefined,
        angle: undefined,
        pullDirection: undefined,
      });
    });

    it('should validate node definition structure', () => {
      expect(DraftNode.id).toBe('Features::Draft');
      expect(DraftNode.category).toBe('Features');
      expect(DraftNode.label).toBe('Draft');
      expect(DraftNode.params.angle.default).toBe(3);
      expect(DraftNode.params.angle.min).toBe(0);
      expect(DraftNode.params.angle.max).toBe(45);
      expect(DraftNode.params.pullDirection.default).toEqual({ x: 0, y: 0, z: 1 });
    });
  });
});
