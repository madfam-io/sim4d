import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X, Minus } from 'lucide-react';

const competitors = [
  {
    name: 'BrepFlow',
    logo: '🌊',
    highlight: true,
    features: {
      platform: 'Web Browser',
      installation: 'None',
      collaboration: 'Real-time',
      geometry: 'OCCT B-Rep/NURBS',
      nodes: '78+ (Growing)',
      price: 'Free & Open Source',
      cloudReady: true,
      mobileAccess: true,
      versionControl: true,
      extensibility: 'Web Standards',
    },
  },
  {
    name: 'Grasshopper',
    logo: '🦗',
    features: {
      platform: 'Windows/Mac',
      installation: 'Rhino Required',
      collaboration: 'File-based',
      geometry: 'OpenNURBS',
      nodes: '1000+',
      price: '$995',
      cloudReady: false,
      mobileAccess: false,
      versionControl: false,
      extensibility: 'C#/.NET',
    },
  },
  {
    name: 'Dynamo',
    logo: '⚡',
    features: {
      platform: 'Windows',
      installation: 'Revit/Civil3D',
      collaboration: 'BIM 360',
      geometry: 'ASM/Parasolid',
      nodes: '500+',
      price: 'With Autodesk',
      cloudReady: 'partial',
      mobileAccess: false,
      versionControl: false,
      extensibility: 'Python/C#',
    },
  },
  {
    name: 'Sverchok',
    logo: '🔷',
    features: {
      platform: 'Desktop',
      installation: 'Blender',
      collaboration: 'None',
      geometry: 'Mesh-based',
      nodes: '300+',
      price: 'Free',
      cloudReady: false,
      mobileAccess: false,
      versionControl: false,
      extensibility: 'Python',
    },
  },
];

const featureLabels = {
  platform: 'Platform',
  installation: 'Installation',
  collaboration: 'Collaboration',
  geometry: 'Geometry Kernel',
  nodes: 'Node Count',
  price: 'Price',
  cloudReady: 'Cloud-Ready',
  mobileAccess: 'Mobile Access',
  versionControl: 'Version Control',
  extensibility: 'Extensibility',
};

export function Comparison() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const renderFeatureValue = (value: any, isHighlight: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-5 h-5 ${isHighlight ? 'text-green-400' : 'text-green-500'}`} />
      ) : (
        <X className={`w-5 h-5 ${isHighlight ? 'text-red-400' : 'text-red-500'}`} />
      );
    }
    if (value === 'partial') {
      return <Minus className={`w-5 h-5 ${isHighlight ? 'text-yellow-400' : 'text-yellow-500'}`} />;
    }
    return <span className={isHighlight ? 'font-semibold' : ''}>{value}</span>;
  };

  return (
    <section id="comparison" className="relative py-32 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              How We Compare
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how BrepFlow stacks up against traditional desktop-based parametric CAD solutions
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <div className="min-w-[800px]">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 mb-2">
              <div className="col-span-1" />
              {competitors.map((comp, idx) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`text-center p-4 rounded-xl ${
                    comp.highlight
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-purple-500/50'
                      : 'bg-gray-800/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{comp.logo}</div>
                  <div
                    className={`font-semibold ${comp.highlight ? 'text-purple-400' : 'text-gray-300'}`}
                  >
                    {comp.name}
                  </div>
                  {comp.highlight && (
                    <div className="text-xs text-purple-400 mt-1">✨ That&apos;s us!</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Table rows */}
            {Object.entries(featureLabels).map(([key, label], idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                className={`grid grid-cols-5 gap-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors cursor-pointer ${
                  selectedFeature === key ? 'bg-purple-900/10' : ''
                }`}
                onMouseEnter={() => setSelectedFeature(key)}
                onMouseLeave={() => setSelectedFeature(null)}
              >
                <div className="font-medium text-gray-400">{label}</div>
                {competitors.map((comp) => (
                  <div
                    key={`${comp.name}-${key}`}
                    className={`p-4 text-center transition-colors ${
                      comp.features[key as keyof typeof comp.features] !== undefined
                        ? comp.features[key as keyof typeof comp.features]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {renderFeatureValue(
                      comp.features[key as keyof typeof comp.features],
                      comp.highlight ?? false
                    )}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key advantages callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-purple-500/30">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2 text-white">No Installation</h3>
            <p className="text-gray-400">
              Start modeling instantly in your browser. No downloads, no setup, no compatibility
              issues.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Future-Ready</h3>
            <p className="text-gray-400">
              Built for the cloud era with real-time collaboration and cross-platform access.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/30">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Open Source</h3>
            <p className="text-gray-400">
              Free forever. Extend, customize, and contribute to the future of CAD.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
