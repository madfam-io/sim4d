/**
 * @brepflow
 * (c) 2025 BrepFlow - Mozilla Public License 2.0
 */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/occt-bindings.ts
var occtModule = null;
var wasmModule = null;
var wasmLoaded = false;
var wasmLoadAttempted = false;
var wasmLoadError = null;
var OCCTMemoryManager = class {
  static {
    __name(this, "OCCTMemoryManager");
  }
  static trackedShapes = /* @__PURE__ */ new Set();
  static trackShape(shapeId) {
    this.trackedShapes.add(shapeId);
  }
  static untrackShape(shapeId) {
    this.trackedShapes.delete(shapeId);
  }
  static getTrackedShapes() {
    return Array.from(this.trackedShapes);
  }
  static getShapeCount() {
    return this.trackedShapes.size;
  }
  static cleanup() {
    if (occtModule && wasmLoaded) {
      for (const shapeId of this.trackedShapes) {
        try {
          occtModule.deleteShape(shapeId);
        } catch (error) {
          console.warn(`Failed to delete shape ${shapeId}:`, error);
        }
      }
    }
    this.trackedShapes.clear();
  }
};
function createErrorBoundaryWrapper(operation, fn) {
  return ((...args) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          console.error(`[OCCT] Operation '${operation}' failed:`, error);
          throw new Error(`OCCT operation '${operation}' failed: ${error.message || error}`);
        });
      }
      return result;
    } catch (error) {
      console.error(`[OCCT] Operation '${operation}' failed:`, error);
      throw new Error(`OCCT operation '${operation}' failed: ${error.message || error}`);
    }
  });
}
__name(createErrorBoundaryWrapper, "createErrorBoundaryWrapper");
async function attemptWASMLoad() {
  try {
    const globalScope = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : null;
    if (!globalScope) {
      console.log("[OCCT] Non-browser/worker environment detected, WASM loading deferred");
      return null;
    }
    if (!globalScope.SharedArrayBuffer) {
      console.warn("[OCCT] SharedArrayBuffer not available. Real geometry requires COOP/COEP headers.");
      console.warn("[OCCT] Add these headers to your server:");
      console.warn("[OCCT]   Cross-Origin-Opener-Policy: same-origin");
      console.warn("[OCCT]   Cross-Origin-Embedder-Policy: require-corp");
      return null;
    }
    const wasmPath = "/wasm/occt-core.js";
    console.log("[OCCT] Attempting to load from path:", wasmPath);
    const checkResponse = await fetch(wasmPath, { method: "HEAD" }).catch(() => null);
    if (!checkResponse || !checkResponse.ok) {
      console.log("[OCCT] WASM files not found at:", wasmPath);
      console.log('[OCCT] Run "pnpm run build:wasm" to compile OCCT.');
      return null;
    }
    console.log("[OCCT] Loading WASM module from:", wasmPath);
    const module = await import(
      /* @vite-ignore */
      wasmPath
    );
    const wasmModuleFactory = module.default || module;
    const wasmInstance = await wasmModuleFactory({
      locateFile: /* @__PURE__ */ __name((file) => {
        return `/wasm/${file}`;
      }, "locateFile"),
      print: /* @__PURE__ */ __name((text) => console.log("[OCCT WASM]", text), "print"),
      printErr: /* @__PURE__ */ __name((text) => console.error("[OCCT WASM Error]", text), "printErr")
    });
    console.log("[OCCT] WASM module loaded successfully");
    return wasmInstance;
  } catch (error) {
    if (error.message?.includes("Failed to resolve import")) {
      console.log('[OCCT] WASM not yet compiled. Run "pnpm run build:wasm" to enable real geometry.');
    } else {
      console.log("[OCCT] WASM loading error:", error.message);
      console.log("[OCCT] Falling back to mock geometry.");
    }
    return null;
  }
}
__name(attemptWASMLoad, "attemptWASMLoad");
function createRealOCCTModule(wasm) {
  return {
    makeBox: createErrorBoundaryWrapper("makeBox", (dx, dy, dz) => {
      console.log(`[OCCT] Creating box: ${dx} x ${dy} x ${dz}`);
      const shape = wasm.makeBox(dx, dy, dz);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    makeBoxWithOrigin: createErrorBoundaryWrapper(
      "makeBoxWithOrigin",
      (x, y, z, dx, dy, dz) => {
        console.log(`[OCCT] Creating box with origin: (${x},${y},${z}) size ${dx}x${dy}x${dz}`);
        const shape = wasm.makeBoxWithOrigin(x, y, z, dx, dy, dz);
        if (!shape || !shape.id) {
          throw new Error("Invalid shape returned from WASM");
        }
        OCCTMemoryManager.trackShape(shape.id);
        return shape;
      }
    ),
    makeSphere: createErrorBoundaryWrapper("makeSphere", (radius) => {
      console.log(`[OCCT] Creating sphere: radius ${radius}`);
      const shape = wasm.makeSphere(radius);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    makeSphereWithCenter: createErrorBoundaryWrapper(
      "makeSphereWithCenter",
      (cx, cy, cz, radius) => {
        console.log(`[OCCT] Creating sphere with center: (${cx},${cy},${cz}) radius ${radius}`);
        const shape = wasm.makeSphereWithCenter(cx, cy, cz, radius);
        if (!shape || !shape.id) {
          throw new Error("Invalid shape returned from WASM");
        }
        OCCTMemoryManager.trackShape(shape.id);
        return shape;
      }
    ),
    makeCylinder: createErrorBoundaryWrapper("makeCylinder", (radius, height) => {
      console.log(`[OCCT] Creating cylinder: radius ${radius}, height ${height}`);
      const shape = wasm.makeCylinder(radius, height);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    makeCone: createErrorBoundaryWrapper("makeCone", (radius1, radius2, height) => {
      console.log(`[OCCT] Creating cone: r1=${radius1}, r2=${radius2}, h=${height}`);
      const shape = wasm.makeCone(radius1, radius2, height);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    makeTorus: createErrorBoundaryWrapper("makeTorus", (majorRadius, minorRadius) => {
      console.log(`[OCCT] Creating torus: major=${majorRadius}, minor=${minorRadius}`);
      const shape = wasm.makeTorus(majorRadius, minorRadius);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    // Advanced operations
    extrude: createErrorBoundaryWrapper(
      "extrude",
      (profileId, dx, dy, dz) => {
        console.log(`[OCCT] Extruding profile ${profileId}: (${dx}, ${dy}, ${dz})`);
        const shape = wasm.extrude(profileId, dx, dy, dz);
        if (!shape || !shape.id) {
          throw new Error("Invalid shape returned from WASM");
        }
        OCCTMemoryManager.trackShape(shape.id);
        return shape;
      }
    ),
    revolve: createErrorBoundaryWrapper(
      "revolve",
      (profileId, angle, axisX, axisY, axisZ, originX, originY, originZ) => {
        console.log(`[OCCT] Revolving profile ${profileId}: angle=${angle}`);
        const shape = wasm.revolve(profileId, angle, axisX, axisY, axisZ, originX, originY, originZ);
        if (!shape || !shape.id) {
          throw new Error("Invalid shape returned from WASM");
        }
        OCCTMemoryManager.trackShape(shape.id);
        return shape;
      }
    ),
    // Boolean operations
    booleanUnion: createErrorBoundaryWrapper("booleanUnion", (shape1Id, shape2Id) => {
      console.log(`[OCCT] Boolean union: ${shape1Id} + ${shape2Id}`);
      const shape = wasm.booleanUnion(shape1Id, shape2Id);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shape1Id);
      OCCTMemoryManager.untrackShape(shape2Id);
      return shape;
    }),
    booleanSubtract: createErrorBoundaryWrapper("booleanSubtract", (shape1Id, shape2Id) => {
      console.log(`[OCCT] Boolean subtract: ${shape1Id} - ${shape2Id}`);
      const shape = wasm.booleanSubtract(shape1Id, shape2Id);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shape1Id);
      OCCTMemoryManager.untrackShape(shape2Id);
      return shape;
    }),
    booleanIntersect: createErrorBoundaryWrapper("booleanIntersect", (shape1Id, shape2Id) => {
      console.log(`[OCCT] Boolean intersect: ${shape1Id} \u2229 ${shape2Id}`);
      const shape = wasm.booleanIntersect(shape1Id, shape2Id);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shape1Id);
      OCCTMemoryManager.untrackShape(shape2Id);
      return shape;
    }),
    // Feature operations
    makeFillet: createErrorBoundaryWrapper("makeFillet", (shapeId, radius) => {
      console.log(`[OCCT] Creating fillet on ${shapeId}: radius=${radius}`);
      const shape = wasm.makeFillet(shapeId, radius);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return shape;
    }),
    makeChamfer: createErrorBoundaryWrapper("makeChamfer", (shapeId, distance) => {
      console.log(`[OCCT] Creating chamfer on ${shapeId}: distance=${distance}`);
      const shape = wasm.makeChamfer(shapeId, distance);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return shape;
    }),
    makeShell: createErrorBoundaryWrapper("makeShell", (shapeId, thickness) => {
      console.log(`[OCCT] Creating shell from ${shapeId}: thickness=${thickness}`);
      const shape = wasm.makeShell(shapeId, thickness);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return shape;
    }),
    // Transformation operations
    transform: createErrorBoundaryWrapper(
      "transform",
      (shapeId, tx, ty, tz, rx, ry, rz, sx, sy, sz) => {
        console.log(`[OCCT] Transforming ${shapeId}`);
        const shape = wasm.transform(shapeId, tx, ty, tz, rx, ry, rz, sx, sy, sz);
        if (!shape || !shape.id) {
          throw new Error("Invalid shape returned from WASM");
        }
        OCCTMemoryManager.trackShape(shape.id);
        OCCTMemoryManager.untrackShape(shapeId);
        return shape;
      }
    ),
    copyShape: createErrorBoundaryWrapper("copyShape", (shapeId) => {
      console.log(`[OCCT] Copying shape ${shapeId}`);
      const shape = wasm.copyShape(shapeId);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    // Tessellation
    tessellate: createErrorBoundaryWrapper(
      "tessellate",
      (shapeId, precision, angle) => {
        console.log(`[OCCT] Tessellating ${shapeId}: precision=${precision}, angle=${angle}`);
        return wasm.tessellate(shapeId, precision || 0.01, angle || 0.5);
      }
    ),
    tessellateWithParams: createErrorBoundaryWrapper(
      "tessellateWithParams",
      (shapeId, precision, angle) => {
        console.log(`[OCCT] Tessellating ${shapeId}: precision=${precision}, angle=${angle}`);
        return wasm.tessellateWithParams(shapeId, precision, angle);
      }
    ),
    // File I/O
    importSTEP: createErrorBoundaryWrapper("importSTEP", (fileData) => {
      console.log(`[OCCT] Importing STEP file: ${fileData.length} bytes`);
      const shape = wasm.importSTEP(fileData);
      if (!shape || !shape.id) {
        throw new Error("Invalid shape returned from WASM");
      }
      OCCTMemoryManager.trackShape(shape.id);
      return shape;
    }),
    exportSTEP: createErrorBoundaryWrapper("exportSTEP", (shapeId) => {
      console.log(`[OCCT] Exporting ${shapeId} to STEP`);
      return wasm.exportSTEP(shapeId);
    }),
    exportSTL: createErrorBoundaryWrapper("exportSTL", (shapeId, binary) => {
      console.log(`[OCCT] Exporting ${shapeId} to STL (${binary ? "binary" : "ASCII"})`);
      return wasm.exportSTL(shapeId, binary);
    }),
    // Memory management
    deleteShape: createErrorBoundaryWrapper("deleteShape", (shapeId) => {
      console.log(`[OCCT] Deleting shape ${shapeId}`);
      wasm.deleteShape(shapeId);
      OCCTMemoryManager.untrackShape(shapeId);
    }),
    getShapeCount: createErrorBoundaryWrapper("getShapeCount", () => {
      return wasm.getShapeCount();
    }),
    clearAllShapes: createErrorBoundaryWrapper("clearAllShapes", () => {
      console.log("[OCCT] Clearing all shapes");
      wasm.clearAllShapes();
      OCCTMemoryManager.cleanup();
    }),
    // Status and version
    getStatus: createErrorBoundaryWrapper("getStatus", () => {
      return wasm.getStatus();
    }),
    getOCCTVersion: createErrorBoundaryWrapper("getOCCTVersion", () => {
      return wasm.getOCCTVersion();
    }),
    // Vector types
    VectorFloat: wasm.VectorFloat,
    VectorUint: wasm.VectorUint
  };
}
__name(createRealOCCTModule, "createRealOCCTModule");
async function loadOCCT() {
  if (occtModule) {
    return occtModule;
  }
  if (wasmLoadAttempted) {
    if (wasmLoadError) {
      console.log("[OCCT] Previous WASM load failed, using mock geometry");
      return null;
    }
    return occtModule;
  }
  wasmLoadAttempted = true;
  try {
    console.log("[OCCT] Attempting to load real OCCT WASM module...");
    wasmModule = await attemptWASMLoad();
    if (wasmModule) {
      console.log("[OCCT] \u2705 Real OCCT WASM loaded successfully!");
      occtModule = createRealOCCTModule(wasmModule);
      wasmLoaded = true;
      try {
        const version = occtModule.getOCCTVersion();
        console.log(`[OCCT] Running OCCT version: ${version}`);
      } catch (e) {
        console.log("[OCCT] OCCT module loaded (version check not available)");
      }
      return occtModule;
    } else {
      console.log("[OCCT] Real WASM not available. Using mock geometry.");
      console.log("[OCCT] To enable real geometry:");
      console.log("[OCCT]   1. Run: pnpm run build:wasm");
      console.log("[OCCT]   2. Ensure server has COOP/COEP headers for SharedArrayBuffer");
      return null;
    }
  } catch (error) {
    wasmLoadError = error;
    console.log("[OCCT] Could not load WASM module, using mock geometry");
    console.log("[OCCT] This is expected if WASM hasn't been compiled yet");
    return null;
  }
}
__name(loadOCCT, "loadOCCT");

// ../../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
__name(rng, "rng");

// ../../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
__name(unsafeStringify, "unsafeStringify");

// ../../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// ../../node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
__name(v4, "v4");
var v4_default = v4;

// src/mock-geometry.ts
var MockGeometry = class {
  static {
    __name(this, "MockGeometry");
  }
  shapes = /* @__PURE__ */ new Map();
  /**
   * Initialize the mock geometry system
   */
  async init() {
    console.log("[MockGeometry] Initialized");
  }
  /**
   * Create a mock shape handle
   */
  createHandle(type, bbox) {
    const id = v4_default();
    const handle = {
      id,
      type,
      bbox: bbox || this.defaultBBox(),
      hash: id.substring(0, 16)
    };
    this.shapes.set(id, {
      handle,
      mesh: this.generateMockMesh(type)
    });
    return handle;
  }
  /**
   * Default bounding box
   */
  defaultBBox() {
    return {
      min: { x: -50, y: -50, z: -50 },
      max: { x: 50, y: 50, z: 50 }
    };
  }
  /**
   * Generate mock mesh data
   */
  generateMockMesh(type) {
    switch (type) {
      case "solid":
        return this.generateBoxMesh();
      case "surface":
        return this.generatePlaneMesh();
      case "curve":
        return this.generateLineMesh();
      default:
        return this.generateBoxMesh();
    }
  }
  /**
   * Generate box mesh
   */
  generateBoxMesh() {
    const size = 50;
    const vertices = [
      // Front face
      -size,
      -size,
      size,
      size,
      -size,
      size,
      size,
      size,
      size,
      -size,
      size,
      size,
      // Back face
      -size,
      -size,
      -size,
      -size,
      size,
      -size,
      size,
      size,
      -size,
      size,
      -size,
      -size
    ];
    const normals = [
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1
    ];
    const indices = [
      0,
      1,
      2,
      2,
      3,
      0,
      // front
      4,
      5,
      6,
      6,
      7,
      4
      // back
    ];
    return {
      positions: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: new Uint32Array(indices)
    };
  }
  /**
   * Generate plane mesh
   */
  generatePlaneMesh() {
    const size = 50;
    const vertices = [
      -size,
      -size,
      0,
      size,
      -size,
      0,
      size,
      size,
      0,
      -size,
      size,
      0
    ];
    const normals = [
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1
    ];
    const indices = [0, 1, 2, 2, 3, 0];
    return {
      positions: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: new Uint32Array(indices)
    };
  }
  /**
   * Generate line mesh
   */
  generateLineMesh() {
    const vertices = [-50, 0, 0, 50, 0, 0];
    const normals = [0, 1, 0, 0, 1, 0];
    const indices = [0, 1];
    return {
      positions: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: new Uint32Array(indices)
    };
  }
  // Geometry creation methods
  createLine(start, end) {
    const bbox = {
      min: {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        z: Math.min(start.z, end.z)
      },
      max: {
        x: Math.max(start.x, end.x),
        y: Math.max(start.y, end.y),
        z: Math.max(start.z, end.z)
      }
    };
    return this.createHandle("curve", bbox);
  }
  createCircle(center, radius, _normal) {
    const bbox = {
      min: {
        x: center.x - radius,
        y: center.y - radius,
        z: center.z - radius
      },
      max: {
        x: center.x + radius,
        y: center.y + radius,
        z: center.z + radius
      }
    };
    return this.createHandle("curve", bbox);
  }
  createBox(center, width, height, depth) {
    const bbox = {
      min: {
        x: center.x - width / 2,
        y: center.y - height / 2,
        z: center.z - depth / 2
      },
      max: {
        x: center.x + width / 2,
        y: center.y + height / 2,
        z: center.z + depth / 2
      }
    };
    return this.createHandle("box", bbox);
  }
  createCylinder(center, axis, radius, height) {
    const bbox = {
      min: {
        x: center.x - radius,
        y: center.y - radius,
        z: center.z
      },
      max: {
        x: center.x + radius,
        y: center.y + radius,
        z: center.z + height
      }
    };
    return this.createHandle("cylinder", bbox);
  }
  createSphere(center, radius) {
    const bbox = {
      min: {
        x: center.x - radius,
        y: center.y - radius,
        z: center.z - radius
      },
      max: {
        x: center.x + radius,
        y: center.y + radius,
        z: center.z + radius
      }
    };
    return this.createHandle("sphere", bbox);
  }
  // Operations
  extrude(profile, direction, distance) {
    const bbox = profile.bbox || this.defaultBBox();
    const newBbox = {
      min: { ...bbox.min },
      max: {
        x: bbox.max.x + direction.x * distance,
        y: bbox.max.y + direction.y * distance,
        z: bbox.max.z + direction.z * distance
      }
    };
    return this.createHandle("solid", newBbox);
  }
  booleanUnion(shapes) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const shape of shapes) {
      const bbox2 = shape.bbox || this.defaultBBox();
      minX = Math.min(minX, bbox2.min.x);
      minY = Math.min(minY, bbox2.min.y);
      minZ = Math.min(minZ, bbox2.min.z);
      maxX = Math.max(maxX, bbox2.max.x);
      maxY = Math.max(maxY, bbox2.max.y);
      maxZ = Math.max(maxZ, bbox2.max.z);
    }
    const bbox = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
    return this.createHandle("solid", bbox);
  }
  booleanSubtract(base, tools) {
    return this.createHandle("solid", base.bbox);
  }
  booleanIntersect(shapes) {
    let bbox = shapes[0]?.bbox || this.defaultBBox();
    for (const shape of shapes.slice(1)) {
      if (shape.bbox) {
        bbox = {
          min: {
            x: Math.max(bbox.min.x, shape.bbox.min.x),
            y: Math.max(bbox.min.y, shape.bbox.min.y),
            z: Math.max(bbox.min.z, shape.bbox.min.z)
          },
          max: {
            x: Math.min(bbox.max.x, shape.bbox.max.x),
            y: Math.min(bbox.max.y, shape.bbox.max.y),
            z: Math.min(bbox.max.z, shape.bbox.max.z)
          }
        };
      }
    }
    return this.createHandle("solid", bbox);
  }
  // Legacy tessellation method removed - using async version below
  // WorkerAPI interface implementation
  async invoke(operation, params) {
    switch (operation) {
      case "createBox":
        return this.createBox(params.center, params.width, params.height, params.depth);
      case "createSphere":
        return this.createSphere(params.center, params.radius);
      case "createCylinder":
        return this.createCylinder(params.center, params.axis, params.radius, params.height);
      case "createLine":
        return this.createLine(params.start, params.end);
      case "createCircle":
        return this.createCircle(params.center, params.radius, params.normal);
      case "extrude":
        return this.extrude(params.profile, params.direction, params.distance);
      case "booleanUnion":
        return this.booleanUnion(params.shapes);
      case "booleanSubtract":
        return this.booleanSubtract(params.base, params.tools);
      case "booleanIntersect":
        return this.booleanIntersect(params.shapes);
      case "tessellate": {
        const meshData = await this.tessellate(params.shape, params.deflection);
        return meshData;
      }
      case "MAKE_BOX":
        return this.createBox(params.center, params.width, params.height, params.depth);
      case "MAKE_SPHERE":
        return this.createSphere(params.center, params.radius);
      case "MAKE_CYLINDER":
        return this.createCylinder(params.center, params.axis, params.radius, params.height);
      case "MAKE_FILLET":
        return this.createHandle("solid", params.shape?.bbox);
      case "MAKE_CHAMFER":
        return this.createHandle("solid", params.shape?.bbox);
      case "MAKE_SHELL":
        return this.createHandle("solid", params.shape?.bbox);
      case "MAKE_DRAFT":
        return this.createHandle("solid", params.shape?.bbox);
      case "MAKE_OFFSET":
        return this.createHandle("solid", params.shape?.bbox);
      case "BOOLEAN_UNION":
        return this.booleanUnion(params.shapes);
      case "BOOLEAN_SUBTRACT":
        return this.booleanSubtract(params.base, params.tools);
      case "BOOLEAN_INTERSECT":
        return this.booleanIntersect(params.shapes);
      case "TESSELLATE": {
        const meshData = await this.tessellate(params.shape, params.deflection || params.tolerance);
        return meshData;
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  // Updated tessellate method for WorkerAPI compatibility
  async tessellate(shapeId, deflection) {
    if (typeof shapeId === "string") {
      const shape = this.shapes.get(shapeId);
      return shape ? shape.mesh : this.generateBoxMesh();
    } else {
      const shape = this.shapes.get(shapeId.id);
      return shape ? shape.mesh : this.generateBoxMesh();
    }
  }
  // Updated dispose method for WorkerAPI compatibility
  async dispose(handleId) {
    this.shapes.delete(handleId);
  }
  // Legacy synchronous methods for backward compatibility
  tessellateSync(shape, deflection) {
    const mockShape = this.shapes.get(shape.id);
    if (mockShape) {
      return mockShape.mesh;
    }
    return this.generateBoxMesh();
  }
  disposeSync(handleId) {
    this.shapes.delete(handleId);
  }
};

// src/occt-production.ts
var occtModule2 = null;
var initializationPromise = null;
async function loadOCCTProduction() {
  if (occtModule2) {
    return occtModule2;
  }
  if (initializationPromise) {
    return initializationPromise;
  }
  initializationPromise = initializeOCCT();
  return initializationPromise;
}
__name(loadOCCTProduction, "loadOCCTProduction");
async function initializeOCCT() {
  try {
    console.log("[OCCT Production] Loading WASM module...");
    let wasmModuleUrl;
    if (typeof self !== "undefined" && typeof window === "undefined") {
      const origin = self.location?.origin || "http://localhost:5173";
      wasmModuleUrl = `${origin}/wasm/occt.js`;
      console.log("[OCCT Production] Worker context - using URL:", wasmModuleUrl);
    } else if (typeof window !== "undefined") {
      wasmModuleUrl = "/wasm/occt.js";
      console.log("[OCCT Production] Main thread context - using path:", wasmModuleUrl);
    } else {
      wasmModuleUrl = "/wasm/occt.js";
      console.log("[OCCT Production] Unknown context - using fallback path:", wasmModuleUrl);
    }
    let createModule;
    try {
      if (typeof self !== "undefined" && typeof window === "undefined") {
        console.log("[OCCT Production] Fetching module from:", wasmModuleUrl);
        const response = await fetch(wasmModuleUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM module: ${response.status} ${response.statusText}`);
        }
        const moduleText = await response.text();
        const blob = new Blob([moduleText], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        createModule = await import(
          /* @vite-ignore */
          blobUrl
        );
        URL.revokeObjectURL(blobUrl);
      } else {
        createModule = await import(
          /* @vite-ignore */
          wasmModuleUrl
        );
      }
    } catch (error) {
      console.error("[OCCT Production] Failed to load module:", error);
      throw new Error(`WASM module loading failed: ${error instanceof Error ? error.message : error}`);
    }
    const moduleConfig = {
      locateFile: /* @__PURE__ */ __name((path) => {
        if (path.endsWith(".wasm")) {
          if (typeof self !== "undefined" && typeof window === "undefined") {
            const origin = self.location?.origin || "http://localhost:5173";
            return `${origin}/wasm/${path}`;
          } else {
            return `/wasm/${path}`;
          }
        }
        return path;
      }, "locateFile"),
      // Configure for web worker environment
      environment: "web,worker",
      // Memory configuration
      INITIAL_MEMORY: 256 * 1024 * 1024,
      // 256MB initial
      MAXIMUM_MEMORY: 2 * 1024 * 1024 * 1024,
      // 2GB max
      ALLOW_MEMORY_GROWTH: true,
      // Threading configuration (if supported)
      USE_PTHREADS: typeof SharedArrayBuffer !== "undefined",
      PTHREAD_POOL_SIZE: 4,
      // Error handling
      onAbort: /* @__PURE__ */ __name((what) => {
        console.error("[OCCT Production] WASM abort:", what);
        throw new Error(`OCCT WASM aborted: ${what}`);
      }, "onAbort"),
      // Progress tracking
      onRuntimeInitialized: /* @__PURE__ */ __name(() => {
        console.log("[OCCT Production] Runtime initialized");
      }, "onRuntimeInitialized"),
      print: /* @__PURE__ */ __name((text) => {
        console.log("[OCCT]", text);
      }, "print"),
      printErr: /* @__PURE__ */ __name((text) => {
        console.error("[OCCT Error]", text);
      }, "printErr")
    };
    occtModule2 = await createModule.default(moduleConfig);
    if (!occtModule2) {
      throw new Error("Failed to create OCCT module instance");
    }
    const version = occtModule2.getOCCTVersion();
    const status = occtModule2.getStatus();
    console.log("[OCCT Production] Module loaded successfully");
    console.log("[OCCT Production] Version:", version);
    console.log("[OCCT Production] Status:", status);
    try {
      const testBox = occtModule2.makeBox(10, 10, 10);
      if (testBox && testBox.id) {
        console.log("[OCCT Production] Test box created:", testBox.id);
        occtModule2.deleteShape(testBox.id);
        console.log("[OCCT Production] Geometry operations verified \u2705");
      } else {
        console.warn("[OCCT Production] Test box creation returned invalid result");
      }
    } catch (testError) {
      console.error("[OCCT Production] Test failed:", testError);
    }
    return occtModule2;
  } catch (error) {
    console.error("[OCCT Production] Failed to load module:", error);
    occtModule2 = null;
    initializationPromise = null;
    throw new Error(`OCCT module loading failed: ${error instanceof Error ? error.message : error}`);
  }
}
__name(initializeOCCT, "initializeOCCT");
var OCCTProductionAPI = class {
  static {
    __name(this, "OCCTProductionAPI");
  }
  module = null;
  initPromise;
  constructor() {
    this.initPromise = this.initialize();
  }
  async initialize() {
    try {
      this.module = await loadOCCTProduction();
    } catch (error) {
      console.error("[OCCTProductionAPI] Initialization failed:", error);
      throw error;
    }
  }
  async ensureInitialized() {
    await this.initPromise;
    if (!this.module) {
      throw new Error("OCCT module not initialized");
    }
  }
  /**
   * Execute a geometry command
   */
  async execute(command) {
    await this.ensureInitialized();
    if (!this.module) {
      throw new Error("OCCT module not available");
    }
    try {
      let result;
      switch (command.type) {
        // Primitive creation
        case "MAKE_BOX": {
          const { width, height, depth, center } = command.params;
          if (center) {
            result = this.module.makeBoxWithOrigin(
              center[0] - width / 2,
              center[1] - height / 2,
              center[2] - depth / 2,
              width,
              height,
              depth
            );
          } else {
            result = this.module.makeBox(width, height, depth);
          }
          break;
        }
        case "MAKE_SPHERE": {
          const { radius, center } = command.params;
          if (center) {
            result = this.module.makeSphereWithCenter(
              center[0],
              center[1],
              center[2],
              radius
            );
          } else {
            result = this.module.makeSphere(radius);
          }
          break;
        }
        case "MAKE_CYLINDER": {
          const { radius, height } = command.params;
          result = this.module.makeCylinder(radius, height);
          break;
        }
        case "MAKE_CONE": {
          const { radius1, radius2, height } = command.params;
          result = this.module.makeCone(radius1, radius2, height);
          break;
        }
        case "MAKE_TORUS": {
          const { majorRadius, minorRadius } = command.params;
          result = this.module.makeTorus(majorRadius, minorRadius);
          break;
        }
        // Advanced operations
        case "EXTRUDE": {
          const { profile, direction } = command.params;
          result = this.module.extrude(
            profile,
            direction[0],
            direction[1],
            direction[2]
          );
          break;
        }
        case "REVOLVE": {
          const { profile, angle, axis, origin } = command.params;
          result = this.module.revolve(
            profile,
            angle,
            axis[0],
            axis[1],
            axis[2],
            origin[0],
            origin[1],
            origin[2]
          );
          break;
        }
        // Boolean operations
        case "BOOLEAN_UNION": {
          const { shape1, shape2 } = command.params;
          result = this.module.booleanUnion(shape1, shape2);
          break;
        }
        case "BOOLEAN_SUBTRACT": {
          const { shape1, shape2 } = command.params;
          result = this.module.booleanSubtract(shape1, shape2);
          break;
        }
        case "BOOLEAN_INTERSECT": {
          const { shape1, shape2 } = command.params;
          result = this.module.booleanIntersect(shape1, shape2);
          break;
        }
        // Feature operations
        case "MAKE_FILLET": {
          const { shape, radius } = command.params;
          result = this.module.makeFillet(shape, radius);
          break;
        }
        case "MAKE_CHAMFER": {
          const { shape, distance } = command.params;
          result = this.module.makeChamfer(shape, distance);
          break;
        }
        case "MAKE_SHELL": {
          const { shape, thickness } = command.params;
          result = this.module.makeShell(shape, thickness);
          break;
        }
        // Transformation
        case "TRANSFORM": {
          const { shape, translation, rotation, scale } = command.params;
          result = this.module.transform(
            shape,
            translation[0],
            translation[1],
            translation[2],
            rotation[0],
            rotation[1],
            rotation[2],
            scale[0],
            scale[1],
            scale[2]
          );
          break;
        }
        case "COPY_SHAPE": {
          const { shape } = command.params;
          result = this.module.copyShape(shape);
          break;
        }
        // Tessellation
        case "TESSELLATE": {
          const { shape, precision = 0.1, angle = 0.5 } = command.params;
          result = this.module.tessellate(shape, precision, angle);
          break;
        }
        // File I/O
        case "IMPORT_STEP": {
          const { fileData } = command.params;
          result = this.module.importSTEP(fileData);
          break;
        }
        case "EXPORT_STEP": {
          const { shape } = command.params;
          result = this.module.exportSTEP(shape);
          break;
        }
        case "EXPORT_STL": {
          const { shape, binary = true } = command.params;
          result = this.module.exportSTL(shape, binary);
          break;
        }
        // Memory management
        case "DELETE_SHAPE": {
          const { shape } = command.params;
          this.module.deleteShape(shape);
          result = { success: true };
          break;
        }
        case "CLEAR_ALL": {
          this.module.clearAllShapes();
          result = { success: true };
          break;
        }
        case "GET_STATUS": {
          result = {
            status: this.module.getStatus(),
            version: this.module.getOCCTVersion(),
            shapeCount: this.module.getShapeCount()
          };
          break;
        }
        default:
          throw new Error(`Unknown command: ${command.type}`);
      }
      return {
        id: command.id,
        type: command.type,
        result,
        success: true
      };
    } catch (error) {
      console.error("[OCCTProductionAPI] Command failed:", command.type, error);
      return {
        id: command.id,
        type: command.type,
        error: error instanceof Error ? error.message : String(error),
        success: false
      };
    }
  }
  /**
   * Get module status
   */
  getStatus() {
    if (!this.module) {
      return { initialized: false };
    }
    try {
      return {
        initialized: true,
        version: this.module.getOCCTVersion(),
        shapeCount: this.module.getShapeCount()
      };
    } catch (error) {
      return { initialized: false };
    }
  }
  /**
   * Clean up resources
   */
  dispose() {
    if (this.module) {
      try {
        this.module.clearAllShapes();
      } catch (error) {
        console.error("[OCCTProductionAPI] Disposal error:", error);
      }
    }
    this.module = null;
  }
};
var occtProductionAPI = new OCCTProductionAPI();

// src/worker.ts
var isTestMode = typeof process !== "undefined" && false;
var occtModule3 = null;
var isInitialized = false;
var useProduction = false;
var useMockForTesting = false;
var mockGeometry = new MockGeometry();
self.addEventListener("message", async (event) => {
  // Verify message structure for security
  if (!event.data || typeof event.data !== "object") {
    console.warn("[OCCT Worker] Invalid message format received");
    return;
  }

  const request = event.data;

  // Validate required message fields to ensure it's from a trusted source
  if (!request.type || typeof request.type !== "string") {
    console.warn("[OCCT Worker] Message missing required type field");
    return;
  }

  // Validate request ID if present
  if (request.id !== undefined && typeof request.id !== "string" && typeof request.id !== "number") {
    console.warn("[OCCT Worker] Invalid request ID format");
    return;
  }

  try {
    let result;
    switch (request.type) {
      case "INIT":
        if (!isInitialized) {
          try {
            console.log("[OCCT Worker] Attempting production API initialization...");
            await occtProductionAPI.ensureInitialized();
            useProduction = true;
            isInitialized = true;
            console.log("\u2705 OCCT worker initialized with production API (real geometry)");
          } catch (prodError) {
            console.warn("[OCCT Worker] Production API failed:", prodError);
            try {
              console.log("[OCCT Worker] Attempting fallback bindings...");
              occtModule3 = await loadOCCT();
              isInitialized = true;
              useProduction = false;
              console.log("\u2705 OCCT worker initialized with fallback bindings (real geometry)");
            } catch (bindError) {
              console.error("[OCCT Worker] Fallback bindings also failed:", bindError);
              if (isTestMode) {
                console.warn("[OCCT Worker] In test mode - using mock geometry");
                await mockGeometry.init();
                isInitialized = true;
                useMockForTesting = true;
              } else {
                const errorMsg = "CRITICAL: Failed to initialize real OCCT geometry. Mock fallback is not allowed in production/development.";
                console.error(errorMsg);
                throw new Error(errorMsg);
              }
            }
          }
        }
        result = {
          initialized: isInitialized,
          production: useProduction,
          mockMode: useMockForTesting,
          testMode: isTestMode
        };
        break;
      case "CREATE_LINE":
        if (useMockForTesting) {
          result = mockGeometry.createLine(
            request.params.start,
            request.params.end
          );
        } else {
          throw new Error("CREATE_LINE not yet implemented in real OCCT");
        }
        break;
      case "CREATE_CIRCLE":
        if (useMockForTesting) {
          result = mockGeometry.createCircle(
            request.params.center,
            request.params.radius,
            request.params.normal
          );
        } else {
          throw new Error("CREATE_CIRCLE not yet implemented in real OCCT");
        }
        break;
      case "CREATE_RECTANGLE":
        if (useMockForTesting) {
          result = mockGeometry.createBox(
            request.params.center,
            request.params.width,
            request.params.height,
            1
          );
        } else {
          throw new Error("CREATE_RECTANGLE not yet implemented in real OCCT");
        }
        break;
      case "MAKE_BOX":
        if (useProduction && isInitialized) {
          const response2 = await occtProductionAPI.execute({
            id: request.id || "box",
            type: "MAKE_BOX",
            params: request.params
          });
          result = response2.result;
        } else if (isInitialized && occtModule3) {
          const occtShape = occtModule3.makeBox(
            request.params.width,
            request.params.height,
            request.params.depth
          );
          result = {
            id: occtShape.id,
            type: occtShape.type,
            bbox: {
              min: {
                x: occtShape.bbox_min_x,
                y: occtShape.bbox_min_y,
                z: occtShape.bbox_min_z
              },
              max: {
                x: occtShape.bbox_max_x,
                y: occtShape.bbox_max_y,
                z: occtShape.bbox_max_z
              }
            }
          };
        } else if (useMockForTesting) {
          result = mockGeometry.createBox(
            request.params.center,
            request.params.width,
            request.params.height,
            request.params.depth
          );
        } else {
          throw new Error("Real OCCT not initialized - cannot create box");
        }
        break;
      case "MAKE_CYLINDER":
        if (isInitialized && occtModule3) {
          const occtShape = occtModule3.makeCylinder(
            request.params.radius,
            request.params.height
          );
          result = {
            id: occtShape.id,
            type: occtShape.type,
            bbox: {
              min: {
                x: occtShape.bbox_min_x,
                y: occtShape.bbox_min_y,
                z: occtShape.bbox_min_z
              },
              max: {
                x: occtShape.bbox_max_x,
                y: occtShape.bbox_max_y,
                z: occtShape.bbox_max_z
              }
            }
          };
        } else {
          result = mockGeometry.createCylinder(
            request.params.center,
            request.params.axis,
            request.params.radius,
            request.params.height
          );
        }
        break;
      case "MAKE_SPHERE":
        if (isInitialized && occtModule3) {
          const occtShape = occtModule3.makeSphere(request.params.radius);
          result = {
            id: occtShape.id,
            type: occtShape.type,
            bbox: {
              min: {
                x: occtShape.bbox_min_x,
                y: occtShape.bbox_min_y,
                z: occtShape.bbox_min_z
              },
              max: {
                x: occtShape.bbox_max_x,
                y: occtShape.bbox_max_y,
                z: occtShape.bbox_max_z
              }
            }
          };
        } else {
          result = mockGeometry.createSphere(
            request.params.center,
            request.params.radius
          );
        }
        break;
      case "MAKE_EXTRUDE":
        result = mockGeometry.extrude(
          request.params.profile,
          request.params.direction,
          request.params.distance
        );
        break;
      case "BOOLEAN_UNION":
        if (isInitialized && occtModule3 && request.params.shapes.length >= 2) {
          let unionResult = request.params.shapes[0];
          for (let i = 1; i < request.params.shapes.length; i++) {
            const occtShape = occtModule3.booleanUnion(unionResult.id, request.params.shapes[i].id);
            unionResult = {
              id: occtShape.id,
              type: occtShape.type,
              bbox: {
                min: {
                  x: occtShape.bbox_min_x,
                  y: occtShape.bbox_min_y,
                  z: occtShape.bbox_min_z
                },
                max: {
                  x: occtShape.bbox_max_x,
                  y: occtShape.bbox_max_y,
                  z: occtShape.bbox_max_z
                }
              }
            };
          }
          result = unionResult;
        } else {
          result = mockGeometry.booleanUnion(request.params.shapes);
        }
        break;
      case "BOOLEAN_SUBTRACT":
        if (isInitialized && occtModule3) {
          let subtractResult = request.params.base;
          for (const tool of request.params.tools) {
            const occtShape = occtModule3.booleanSubtract(subtractResult.id, tool.id);
            subtractResult = {
              id: occtShape.id,
              type: occtShape.type,
              bbox: {
                min: {
                  x: occtShape.bbox_min_x,
                  y: occtShape.bbox_min_y,
                  z: occtShape.bbox_min_z
                },
                max: {
                  x: occtShape.bbox_max_x,
                  y: occtShape.bbox_max_y,
                  z: occtShape.bbox_max_z
                }
              }
            };
          }
          result = subtractResult;
        } else {
          result = mockGeometry.booleanSubtract(
            request.params.base,
            request.params.tools
          );
        }
        break;
      case "BOOLEAN_INTERSECT":
        if (isInitialized && occtModule3 && request.params.shapes.length >= 2) {
          let intersectResult = request.params.shapes[0];
          for (let i = 1; i < request.params.shapes.length; i++) {
            const occtShape = occtModule3.booleanIntersect(intersectResult.id, request.params.shapes[i].id);
            intersectResult = {
              id: occtShape.id,
              type: occtShape.type,
              bbox: {
                min: {
                  x: occtShape.bbox_min_x,
                  y: occtShape.bbox_min_y,
                  z: occtShape.bbox_min_z
                },
                max: {
                  x: occtShape.bbox_max_x,
                  y: occtShape.bbox_max_y,
                  z: occtShape.bbox_max_z
                }
              }
            };
          }
          result = intersectResult;
        } else {
          result = mockGeometry.booleanIntersect(request.params.shapes);
        }
        break;
      case "TESSELLATE":
        if (isInitialized && occtModule3) {
          const mesh = occtModule3.tessellate(
            request.params.shape.id,
            request.params.deflection
          );
          result = {
            mesh,
            bbox: request.params.shape.bbox
          };
        } else {
          const mesh = mockGeometry.tessellate(
            request.params.shape,
            request.params.deflection
          );
          result = {
            mesh,
            bbox: request.params.shape.bbox
          };
        }
        break;
      case "DISPOSE":
        if (isInitialized && occtModule3) {
          occtModule3.deleteShape(request.params.handle);
        } else {
          mockGeometry.dispose(request.params.handle);
        }
        result = { disposed: true };
        break;
      default:
        throw new Error(`Unknown operation: ${request.type}`);
    }
    const response = {
      id: request.id,
      success: true,
      result
    };
    self.postMessage(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const response = {
      id: request.id,
      success: false,
      error: {
        code: "WORKER_ERROR",
        message: errorMessage,
        details: error
      }
    };
    self.postMessage(response);
  }
});
//# sourceMappingURL=worker.mjs.map
