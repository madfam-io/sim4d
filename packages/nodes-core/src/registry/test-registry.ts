/**
 * Test the enhanced node registry system
 */

import { initializeNodeRegistry, getRegistryStatus, validateNodeDiscovery } from './node-discovery';

export async function testNodeRegistry(): Promise<void> {
  console.log('🧪 Testing Enhanced Node Registry System...\n');

  try {
    // Initialize the registry
    const registry = await initializeNodeRegistry();

    // Get status
    const status = getRegistryStatus();
    console.log('📊 Registry Status:');
    console.log(`   Initialized: ${status.isInitialized}`);
    console.log(`   Total Nodes: ${status.nodeCount}`);
    console.log(`   Categories: ${status.categoryCount}`);
    console.log(`   Tags: ${status.tagCount}`);
    console.log(`   Last Update: ${status.lastUpdate}\n`);

    // Get statistics
    const stats = registry.getStatistics();
    console.log('📈 Detailed Statistics:');
    console.log(`   Total Nodes: ${stats.totalNodes}`);
    console.log(`   Total Categories: ${stats.totalCategories}`);
    console.log(`   Total Subcategories: ${stats.totalSubcategories}`);
    console.log(`   Total Tags: ${stats.totalTags}\n`);

    // Show nodes by category
    console.log('📂 Nodes by Category:');
    stats.nodesByCategory.forEach((cat) => {
      console.log(`   ${cat.category}: ${cat.count} nodes`);
      if (cat.subcategories.length > 0) {
        cat.subcategories.forEach((subcat) => {
          console.log(`     ├─ ${subcat.subcategory}: ${subcat.count} nodes`);
        });
      }
    });
    console.log();

    // Test search functionality
    console.log('🔍 Testing Search Functionality:');

    const gearNodes = registry.searchNodes('gear');
    console.log(`   Search "gear": ${gearNodes.length} results`);

    const holeNodes = registry.searchNodes('hole');
    console.log(`   Search "hole": ${holeNodes.length} results`);

    const archNodes = registry.searchNodes('architecture');
    console.log(`   Search "architecture": ${archNodes.length} results`);

    const allNodes = registry.searchNodes('');
    console.log(`   Search "" (all): ${allNodes.length} results\n`);

    // Test category access
    console.log('📋 Testing Category Access:');
    const categories = registry.getCategories();
    console.log(`   Available categories: ${categories.join(', ')}\n`);

    // Test specific category
    if (categories.includes('Architecture')) {
      const archNodes = registry.getNodesByCategory('Architecture');
      console.log(`   Architecture nodes: ${archNodes.length}`);

      const archSubcategories = registry.getSubcategories('Architecture');
      console.log(`   Architecture subcategories: ${archSubcategories.join(', ')}`);
    }

    if (categories.includes('MechanicalEngineering')) {
      const mechNodes = registry.getNodesByCategory('MechanicalEngineering');
      console.log(`   MechanicalEngineering nodes: ${mechNodes.length}`);

      const mechSubcategories = registry.getSubcategories('MechanicalEngineering');
      console.log(`   MechanicalEngineering subcategories: ${mechSubcategories.join(', ')}`);
    }

    // Validate discovery
    console.log('\n✅ Validation Results:');
    const validation = validateNodeDiscovery();
    console.log(`   Discovery Valid: ${validation.isValid}`);
    if (validation.missingCategories.length > 0) {
      console.log(`   Missing Categories: ${validation.missingCategories.join(', ')}`);
    }

    console.log('\n🎉 Registry test completed successfully!');
    console.log(`🚀 Ready to expose ${status.nodeCount} nodes to Studio UI!`);
  } catch (error) {
    console.error('❌ Registry test failed:', error);
    throw error;
  }
}

// Run test if executed directly
if (require.main === module) {
  testNodeRegistry().catch(console.error);
}
