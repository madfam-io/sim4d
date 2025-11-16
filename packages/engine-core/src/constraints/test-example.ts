/**
 * Simple test example for the 2D constraint solver
 * This demonstrates basic constraint solving capabilities
 */

import { ConstraintManager, ConstraintType } from './index';

async function testConstraintSolver() {
  console.log('🔧 Testing 2D Constraint Solver...');

  // Create constraint manager
  const manager = new ConstraintManager({
    maxIterations: 50,
    tolerance: 1e-6,
    enableDebug: true,
  });

  try {
    // Create points
    const p1 = manager.createPoint('p1', 0, 0, true); // Fixed origin
    const p2 = manager.createPoint('p2', 10, 0); // Variable point
    const p3 = manager.createPoint('p3', 10, 10); // Variable point

    console.log('📍 Created points:', { p1, p2, p3 });

    // Create line
    const line1 = manager.createLine('line1', 'p1', 'p2');
    const line2 = manager.createLine('line2', 'p2', 'p3');

    console.log('📏 Created lines:', { line1, line2 });

    // Add distance constraint: distance between p1 and p2 = 15
    const distanceConstraintId = manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], {
      distance: 15,
    });

    // Add perpendicular constraint: line1 ⊥ line2
    const perpendicularConstraintId = manager.addConstraint(ConstraintType.PERPENDICULAR, [
      'line1',
      'line2',
    ]);

    // Add distance constraint: distance between p2 and p3 = 8
    const distance2ConstraintId = manager.addConstraint(ConstraintType.DISTANCE, ['p2', 'p3'], {
      distance: 8,
    });

    console.log('🔗 Added constraints:', {
      distance: distanceConstraintId,
      perpendicular: perpendicularConstraintId,
      distance2: distance2ConstraintId,
    });

    // Get system state before solving
    const systemBefore = manager.getSystem();
    console.log('📊 System before solving:');
    console.log('  Geometry count:', systemBefore.geometry.size);
    console.log('  Constraint count:', systemBefore.constraints.size);
    console.log('  Variable count:', systemBefore.variables.size);
    console.log('  Variables:', Array.from(systemBefore.variables.entries()));

    // Solve constraints
    console.log('🧮 Solving constraints...');
    const result = await manager.solve();

    console.log('✅ Solve result:', {
      success: result.success,
      iterations: result.iterations,
      residual: result.residual,
      time: `${result.time.toFixed(2)}ms`,
      error: result.error,
    });

    if (result.success) {
      // Get final positions
      const finalP1 = manager.getGeometryById('p1') as any;
      const finalP2 = manager.getGeometryById('p2') as any;
      const finalP3 = manager.getGeometryById('p3') as any;

      console.log('📍 Final positions:');
      console.log('  P1:', finalP1.position);
      console.log('  P2:', finalP2.position);
      console.log('  P3:', finalP3.position);

      // Verify constraints
      const d12 = Math.sqrt(
        Math.pow(finalP2.position.x - finalP1.position.x, 2) +
          Math.pow(finalP2.position.y - finalP1.position.y, 2)
      );
      const d23 = Math.sqrt(
        Math.pow(finalP3.position.x - finalP2.position.x, 2) +
          Math.pow(finalP3.position.y - finalP2.position.y, 2)
      );

      console.log('🔍 Constraint verification:');
      console.log(`  Distance P1-P2: ${d12.toFixed(3)} (target: 15)`);
      console.log(`  Distance P2-P3: ${d23.toFixed(3)} (target: 8)`);

      // Check perpendicularity
      const v1 = {
        x: finalP2.position.x - finalP1.position.x,
        y: finalP2.position.y - finalP1.position.y,
      };
      const v2 = {
        x: finalP3.position.x - finalP2.position.x,
        y: finalP3.position.y - finalP2.position.y,
      };
      const dotProduct = v1.x * v2.x + v1.y * v2.y;
      console.log(`  Perpendicular check (dot product): ${dotProduct.toFixed(6)} (target: 0)`);

      console.log('🎉 Constraint solver test completed successfully!');
    } else {
      console.log('❌ Constraint solving failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Export for potential use in tests
export { testConstraintSolver };
