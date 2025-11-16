async function createOCCTModule(moduleArg = {}) {
  var moduleRtn;
  var Module = moduleArg;
  var ENVIRONMENT_IS_WEB = typeof window == 'object';
  var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
  var ENVIRONMENT_IS_NODE =
    typeof process == 'object' && process.versions?.node && process.type != 'renderer';
  var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
  var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name?.startsWith('em-pthread');
  if (ENVIRONMENT_IS_PTHREAD) {
    assert(!globalThis.moduleLoaded, 'module should only be loaded once on each pthread worker');
    globalThis.moduleLoaded = true;
  }
  var arguments_ = [];
  var thisProgram = './this.program';
  var quit_ = (status, toThrow) => {
    throw toThrow;
  };
  var _scriptName = import.meta.url;
  var scriptDirectory = '';
  function locateFile(path) {
    if (Module['locateFile']) {
      return Module['locateFile'](path, scriptDirectory);
    }
    return scriptDirectory + path;
  }
  var readAsync, readBinary;
  if (ENVIRONMENT_IS_SHELL) {
    const isNode =
      typeof process == 'object' && process.versions?.node && process.type != 'renderer';
    if (isNode || typeof window == 'object' || typeof WorkerGlobalScope != 'undefined')
      throw new Error(
        'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
      );
  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    try {
      scriptDirectory = new URL('.', _scriptName).href;
    } catch {}
    if (!(typeof window == 'object' || typeof WorkerGlobalScope != 'undefined'))
      throw new Error(
        'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
      );
    {
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.responseType = 'arraybuffer';
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = async (url) => {
        assert(!isFileURI(url), 'readAsync does not work with file:// URLs');
        var response = await fetch(url, { credentials: 'same-origin' });
        if (response.ok) {
          return response.arrayBuffer();
        }
        throw new Error(response.status + ' : ' + response.url);
      };
    }
  } else {
    throw new Error('environment detection error');
  }
  var out = console.log.bind(console);
  var err = console.error.bind(console);
  assert(
    ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE,
    'Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)'
  );
  assert(
    !ENVIRONMENT_IS_NODE,
    'node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.'
  );
  assert(
    !ENVIRONMENT_IS_SHELL,
    'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.'
  );
  var wasmBinary;
  if (typeof WebAssembly != 'object') {
    err('no native wasm support detected');
  }
  var wasmModule;
  var ABORT = false;
  var EXITSTATUS;
  function assert(condition, text) {
    if (!condition) {
      abort('Assertion failed' + (text ? ': ' + text : ''));
    }
  }
  var isFileURI = (filename) => filename.startsWith('file://');
  function writeStackCookie() {
    var max = _emscripten_stack_get_end();
    assert((max & 3) == 0);
    if (max == 0) {
      max += 4;
    }
    (growMemViews(), HEAPU32)[max >> 2] = 34821223;
    (growMemViews(), HEAPU32)[(max + 4) >> 2] = 2310721022;
    (growMemViews(), HEAPU32)[0 >> 2] = 1668509029;
  }
  function checkStackCookie() {
    if (ABORT) return;
    var max = _emscripten_stack_get_end();
    if (max == 0) {
      max += 4;
    }
    var cookie1 = (growMemViews(), HEAPU32)[max >> 2];
    var cookie2 = (growMemViews(), HEAPU32)[(max + 4) >> 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
      abort(
        `Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`
      );
    }
    if ((growMemViews(), HEAPU32)[0 >> 2] != 1668509029) {
      abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
    }
  }
  class EmscriptenEH extends Error {}
  class EmscriptenSjLj extends EmscriptenEH {}
  class CppException extends EmscriptenEH {
    constructor(excPtr) {
      super(excPtr);
      this.excPtr = excPtr;
      const excInfo = getExceptionMessage(excPtr);
      this.name = excInfo[0];
      this.message = excInfo[1];
    }
  }
  var runtimeDebug = true;
  function dbg(...args) {
    if (!runtimeDebug && typeof runtimeDebug != 'undefined') return;
    console.warn(...args);
  }
  (() => {
    var h16 = new Int16Array(1);
    var h8 = new Int8Array(h16.buffer);
    h16[0] = 25459;
    if (h8[0] !== 115 || h8[1] !== 99)
      throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
  })();
  function consumedModuleProp(prop) {
    if (!Object.getOwnPropertyDescriptor(Module, prop)) {
      Object.defineProperty(Module, prop, {
        configurable: true,
        set() {
          abort(
            `Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`
          );
        },
      });
    }
  }
  function makeInvalidEarlyAccess(name) {
    return () =>
      assert(false, `call to '${name}' via reference taken before Wasm module initialization`);
  }
  function ignoredModuleProp(prop) {
    if (Object.getOwnPropertyDescriptor(Module, prop)) {
      abort(
        `\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`
      );
    }
  }
  function isExportedByForceFilesystem(name) {
    return (
      name === 'FS_createPath' ||
      name === 'FS_createDataFile' ||
      name === 'FS_createPreloadedFile' ||
      name === 'FS_preloadFile' ||
      name === 'FS_unlink' ||
      name === 'addRunDependency' ||
      name === 'FS_createLazyFile' ||
      name === 'FS_createDevice' ||
      name === 'removeRunDependency'
    );
  }
  function missingLibrarySymbol(sym) {
    unexportedRuntimeSymbol(sym);
  }
  function unexportedRuntimeSymbol(sym) {
    if (ENVIRONMENT_IS_PTHREAD) {
      return;
    }
    if (!Object.getOwnPropertyDescriptor(Module, sym)) {
      Object.defineProperty(Module, sym, {
        configurable: true,
        get() {
          var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
          if (isExportedByForceFilesystem(sym)) {
            msg +=
              '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
          }
          abort(msg);
        },
      });
    }
  }
  function initWorkerLogging() {
    function getLogPrefix() {
      var t = 0;
      if (runtimeInitialized && typeof _pthread_self != 'undefined') {
        t = _pthread_self();
      }
      return `w:${workerID},t:${ptrToString(t)}:`;
    }
    var origDbg = dbg;
    dbg = (...args) => origDbg(getLogPrefix(), ...args);
  }
  initWorkerLogging();
  function growMemViews() {
    if (wasmMemory.buffer != HEAP8.buffer) {
      updateMemoryViews();
    }
  }
  var readyPromiseResolve, readyPromiseReject;
  var workerID = 0;
  var startWorker;
  if (ENVIRONMENT_IS_PTHREAD) {
    var initializedJS = false;
    self.onunhandledrejection = (e) => {
      throw e.reason || e;
    };
    function handleMessage(e) {
      try {
        var msgData = e['data'];
        var cmd = msgData.cmd;
        if (cmd === 'load') {
          workerID = msgData.workerID;
          let messageQueue = [];
          self.onmessage = (e) => messageQueue.push(e);
          startWorker = () => {
            postMessage({ cmd: 'loaded' });
            for (let msg of messageQueue) {
              handleMessage(msg);
            }
            self.onmessage = handleMessage;
          };
          for (const handler of msgData.handlers) {
            if (!Module[handler] || Module[handler].proxy) {
              Module[handler] = (...args) => {
                postMessage({ cmd: 'callHandler', handler, args });
              };
              if (handler == 'print') out = Module[handler];
              if (handler == 'printErr') err = Module[handler];
            }
          }
          wasmMemory = msgData.wasmMemory;
          updateMemoryViews();
          wasmModule = msgData.wasmModule;
          createWasm();
          run();
        } else if (cmd === 'run') {
          assert(msgData.pthread_ptr);
          establishStackSpace(msgData.pthread_ptr);
          __emscripten_thread_init(msgData.pthread_ptr, 0, 0, 1, 0, 0);
          PThread.threadInitTLS();
          __emscripten_thread_mailbox_await(msgData.pthread_ptr);
          if (!initializedJS) {
            __embind_initialize_bindings();
            initializedJS = true;
          }
          try {
            invokeEntryPoint(msgData.start_routine, msgData.arg);
          } catch (ex) {
            if (ex != 'unwind') {
              throw ex;
            }
          }
        } else if (msgData.target === 'setimmediate') {
        } else if (cmd === 'checkMailbox') {
          if (initializedJS) {
            checkMailbox();
          }
        } else if (cmd) {
          err(`worker: received unknown command ${cmd}`);
          err(msgData);
        }
      } catch (ex) {
        err(`worker: onmessage() captured an uncaught exception: ${ex}`);
        if (ex?.stack) err(ex.stack);
        __emscripten_thread_crashed();
        throw ex;
      }
    }
    self.onmessage = handleMessage;
  }
  var wasmMemory;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  var HEAP64, HEAPU64;
  var runtimeInitialized = false;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    HEAP8 = new Int8Array(b);
    HEAP16 = new Int16Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU16 = new Uint16Array(b);
    HEAP32 = new Int32Array(b);
    HEAPU32 = new Uint32Array(b);
    HEAPF32 = new Float32Array(b);
    HEAPF64 = new Float64Array(b);
    HEAP64 = new BigInt64Array(b);
    HEAPU64 = new BigUint64Array(b);
  }
  function initMemory() {
    if (ENVIRONMENT_IS_PTHREAD) {
      return;
    }
    if (Module['wasmMemory']) {
      wasmMemory = Module['wasmMemory'];
    } else {
      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 536870912;
      assert(
        INITIAL_MEMORY >= 65536,
        'INITIAL_MEMORY should be larger than STACK_SIZE, was ' +
          INITIAL_MEMORY +
          '! (STACK_SIZE=' +
          65536 +
          ')'
      );
      wasmMemory = new WebAssembly.Memory({
        initial: INITIAL_MEMORY / 65536,
        maximum: 32768,
        shared: true,
      });
    }
    updateMemoryViews();
  }
  assert(
    typeof Int32Array != 'undefined' &&
      typeof Float64Array !== 'undefined' &&
      Int32Array.prototype.subarray != undefined &&
      Int32Array.prototype.set != undefined,
    'JS engine does not provide full typed array support'
  );
  function preRun() {
    assert(!ENVIRONMENT_IS_PTHREAD);
    if (Module['preRun']) {
      if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
      while (Module['preRun'].length) {
        addOnPreRun(Module['preRun'].shift());
      }
    }
    consumedModuleProp('preRun');
    callRuntimeCallbacks(onPreRuns);
  }
  function initRuntime() {
    assert(!runtimeInitialized);
    runtimeInitialized = true;
    if (ENVIRONMENT_IS_PTHREAD) return startWorker();
    checkStackCookie();
    wasmExports['__wasm_call_ctors']();
  }
  function postRun() {
    checkStackCookie();
    if (ENVIRONMENT_IS_PTHREAD) {
      return;
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length) {
        addOnPostRun(Module['postRun'].shift());
      }
    }
    consumedModuleProp('postRun');
    callRuntimeCallbacks(onPostRuns);
  }
  function abort(what) {
    Module['onAbort']?.(what);
    what = 'Aborted(' + what + ')';
    err(what);
    ABORT = true;
    var e = new WebAssembly.RuntimeError(what);
    readyPromiseReject?.(e);
    throw e;
  }
  function createExportWrapper(name, nargs) {
    return (...args) => {
      assert(
        runtimeInitialized,
        `native function \`${name}\` called before runtime initialization`
      );
      var f = wasmExports[name];
      assert(f, `exported native function \`${name}\` not found`);
      assert(
        args.length <= nargs,
        `native function \`${name}\` called with ${args.length} args but expects ${nargs}`
      );
      return f(...args);
    };
  }
  var wasmBinaryFile;
  function findWasmBinary() {
    if (Module['locateFile']) {
      return locateFile('occt.wasm');
    }
    return new URL('occt.wasm', import.meta.url).href;
  }
  function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw 'both async and sync fetching of the wasm failed';
  }
  async function getWasmBinary(binaryFile) {
    if (!wasmBinary) {
      try {
        var response = await readAsync(binaryFile);
        return new Uint8Array(response);
      } catch {}
    }
    return getBinarySync(binaryFile);
  }
  async function instantiateArrayBuffer(binaryFile, imports) {
    try {
      var binary = await getWasmBinary(binaryFile);
      var instance = await WebAssembly.instantiate(binary, imports);
      return instance;
    } catch (reason) {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      if (isFileURI(wasmBinaryFile)) {
        err(
          `warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`
        );
      }
      abort(reason);
    }
  }
  async function instantiateAsync(binary, binaryFile, imports) {
    if (!binary) {
      try {
        var response = fetch(binaryFile, { credentials: 'same-origin' });
        var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
        return instantiationResult;
      } catch (reason) {
        err(`wasm streaming compile failed: ${reason}`);
        err('falling back to ArrayBuffer instantiation');
      }
    }
    return instantiateArrayBuffer(binaryFile, imports);
  }
  function getWasmImports() {
    assignWasmImports();
    return { env: wasmImports, wasi_snapshot_preview1: wasmImports };
  }
  async function createWasm() {
    function receiveInstance(instance, module) {
      wasmExports = instance.exports;
      registerTLSInit(wasmExports['_emscripten_tls_init']);
      wasmTable = wasmExports['__indirect_function_table'];
      assert(wasmTable, 'table not found in wasm exports');
      wasmModule = module;
      assignWasmExports(wasmExports);
      return wasmExports;
    }
    var trueModule = Module;
    function receiveInstantiationResult(result) {
      assert(
        Module === trueModule,
        'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
      );
      trueModule = null;
      return receiveInstance(result['instance'], result['module']);
    }
    var info = getWasmImports();
    if (Module['instantiateWasm']) {
      return new Promise((resolve, reject) => {
        try {
          Module['instantiateWasm'](info, (mod, inst) => {
            resolve(receiveInstance(mod, inst));
          });
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          reject(e);
        }
      });
    }
    if (ENVIRONMENT_IS_PTHREAD) {
      assert(wasmModule, 'wasmModule should have been received via postMessage');
      var instance = new WebAssembly.Instance(wasmModule, getWasmImports());
      return receiveInstance(instance, wasmModule);
    }
    wasmBinaryFile ??= findWasmBinary();
    var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
    var exports = receiveInstantiationResult(result);
    return exports;
  }
  var handleException = (e) => {
    if (e instanceof ExitStatus || e == 'unwind') {
      return EXITSTATUS;
    }
    checkStackCookie();
    if (e instanceof WebAssembly.RuntimeError) {
      if (_emscripten_stack_get_current() <= 0) {
        err(
          'Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)'
        );
      }
    }
    quit_(1, e);
  };
  class ExitStatus {
    name = 'ExitStatus';
    constructor(status) {
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
  }
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  var stackSave = () => _emscripten_stack_get_current();
  var stackRestore = (val) => __emscripten_stack_restore(val);
  var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
  var terminateWorker = (worker) => {
    worker.terminate();
    worker.onmessage = (e) => {
      var cmd = e['data'].cmd;
      err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
    };
  };
  var cleanupThread = (pthread_ptr) => {
    assert(
      !ENVIRONMENT_IS_PTHREAD,
      'Internal Error! cleanupThread() can only ever be called from main application thread!'
    );
    assert(pthread_ptr, 'Internal Error! Null pthread_ptr in cleanupThread!');
    var worker = PThread.pthreads[pthread_ptr];
    assert(worker);
    PThread.returnWorkerToPool(worker);
  };
  var callRuntimeCallbacks = (callbacks) => {
    while (callbacks.length > 0) {
      callbacks.shift()(Module);
    }
  };
  var onPreRuns = [];
  var addOnPreRun = (cb) => onPreRuns.push(cb);
  var runDependencies = 0;
  var dependenciesFulfilled = null;
  var runDependencyTracking = {};
  var runDependencyWatcher = null;
  var removeRunDependency = (id) => {
    runDependencies--;
    Module['monitorRunDependencies']?.(runDependencies);
    assert(id, 'removeRunDependency requires an ID');
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
    if (runDependencies == 0) {
      if (runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);
        runDependencyWatcher = null;
      }
      if (dependenciesFulfilled) {
        var callback = dependenciesFulfilled;
        dependenciesFulfilled = null;
        callback();
      }
    }
  };
  var addRunDependency = (id) => {
    runDependencies++;
    Module['monitorRunDependencies']?.(runDependencies);
    assert(id, 'addRunDependency requires an ID');
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 1e4);
    }
  };
  var spawnThread = (threadParams) => {
    assert(
      !ENVIRONMENT_IS_PTHREAD,
      'Internal Error! spawnThread() can only ever be called from main application thread!'
    );
    assert(threadParams.pthread_ptr, 'Internal error, no pthread ptr!');
    var worker = PThread.getNewWorker();
    if (!worker) {
      return 6;
    }
    assert(!worker.pthread_ptr, 'Internal error!');
    PThread.runningWorkers.push(worker);
    PThread.pthreads[threadParams.pthread_ptr] = worker;
    worker.pthread_ptr = threadParams.pthread_ptr;
    var msg = {
      cmd: 'run',
      start_routine: threadParams.startRoutine,
      arg: threadParams.arg,
      pthread_ptr: threadParams.pthread_ptr,
    };
    worker.postMessage(msg, threadParams.transferList);
    return 0;
  };
  var ptrToString = (ptr) => {
    assert(typeof ptr === 'number');
    ptr >>>= 0;
    return '0x' + ptr.toString(16).padStart(8, '0');
  };
  var PThread = {
    unusedWorkers: [],
    runningWorkers: [],
    tlsInitFunctions: [],
    pthreads: {},
    nextWorkerID: 1,
    init() {
      if (!ENVIRONMENT_IS_PTHREAD) {
        PThread.initMainThread();
      }
    },
    initMainThread() {
      var pthreadPoolSize = 4;
      while (pthreadPoolSize--) {
        PThread.allocateUnusedWorker();
      }
      addOnPreRun(async () => {
        var pthreadPoolReady = PThread.loadWasmModuleToAllWorkers();
        addRunDependency('loading-workers');
        await pthreadPoolReady;
        removeRunDependency('loading-workers');
      });
    },
    terminateAllThreads: () => {
      assert(
        !ENVIRONMENT_IS_PTHREAD,
        'Internal Error! terminateAllThreads() can only ever be called from main application thread!'
      );
      for (var worker of PThread.runningWorkers) {
        terminateWorker(worker);
      }
      for (var worker of PThread.unusedWorkers) {
        terminateWorker(worker);
      }
      PThread.unusedWorkers = [];
      PThread.runningWorkers = [];
      PThread.pthreads = {};
    },
    returnWorkerToPool: (worker) => {
      var pthread_ptr = worker.pthread_ptr;
      delete PThread.pthreads[pthread_ptr];
      PThread.unusedWorkers.push(worker);
      PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
      worker.pthread_ptr = 0;
      __emscripten_thread_free_data(pthread_ptr);
    },
    threadInitTLS() {
      PThread.tlsInitFunctions.forEach((f) => f());
    },
    loadWasmModuleToWorker: (worker) =>
      new Promise((onFinishedLoading) => {
        worker.onmessage = (e) => {
          var d = e['data'];
          var cmd = d.cmd;
          if (d.targetThread && d.targetThread != _pthread_self()) {
            var targetWorker = PThread.pthreads[d.targetThread];
            if (targetWorker) {
              targetWorker.postMessage(d, d.transferList);
            } else {
              err(
                `Internal error! Worker sent a message "${cmd}" to target pthread ${d.targetThread}, but that thread no longer exists!`
              );
            }
            return;
          }
          if (cmd === 'checkMailbox') {
            checkMailbox();
          } else if (cmd === 'spawnThread') {
            spawnThread(d);
          } else if (cmd === 'cleanupThread') {
            callUserCallback(() => cleanupThread(d.thread));
          } else if (cmd === 'loaded') {
            worker.loaded = true;
            onFinishedLoading(worker);
          } else if (d.target === 'setimmediate') {
            worker.postMessage(d);
          } else if (cmd === 'callHandler') {
            Module[d.handler](...d.args);
          } else if (cmd) {
            err(`worker sent an unknown command ${cmd}`);
          }
        };
        worker.onerror = (e) => {
          var message = 'worker sent an error!';
          if (worker.pthread_ptr) {
            message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
          }
          err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
          throw e;
        };
        assert(
          wasmMemory instanceof WebAssembly.Memory,
          'WebAssembly memory should have been loaded by now!'
        );
        assert(
          wasmModule instanceof WebAssembly.Module,
          'WebAssembly Module should have been loaded by now!'
        );
        var handlers = [];
        var knownHandlers = ['onExit', 'onAbort', 'print', 'printErr'];
        for (var handler of knownHandlers) {
          if (Module.propertyIsEnumerable(handler)) {
            handlers.push(handler);
          }
        }
        worker.postMessage({
          cmd: 'load',
          handlers,
          wasmMemory,
          wasmModule,
          workerID: worker.workerID,
        });
      }),
    async loadWasmModuleToAllWorkers() {
      if (ENVIRONMENT_IS_PTHREAD) {
        return;
      }
      let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
      return pthreadPoolReady;
    },
    allocateUnusedWorker() {
      var worker;
      if (Module['mainScriptUrlOrBlob']) {
        var pthreadMainJs = Module['mainScriptUrlOrBlob'];
        if (typeof pthreadMainJs != 'string') {
          pthreadMainJs = URL.createObjectURL(pthreadMainJs);
        }
        worker = new Worker(pthreadMainJs, {
          type: 'module',
          name: 'em-pthread-' + PThread.nextWorkerID,
        });
      } else
        worker = new Worker(new URL('occt.js', import.meta.url), {
          type: 'module',
          name: 'em-pthread-' + PThread.nextWorkerID,
        });
      worker.workerID = PThread.nextWorkerID++;
      PThread.unusedWorkers.push(worker);
    },
    getNewWorker() {
      if (PThread.unusedWorkers.length == 0) {
        err(
          'Tried to spawn a new thread, but the thread pool is exhausted.\n' +
            'This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n' +
            'If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`.' +
            '\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.'
        );
        PThread.allocateUnusedWorker();
        PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
      }
      return PThread.unusedWorkers.pop();
    },
  };
  var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
    var serializedNumCallArgs = callArgs.length * 2;
    var sp = stackSave();
    var args = stackAlloc(serializedNumCallArgs * 8);
    var b = args >> 3;
    for (var i = 0; i < callArgs.length; i++) {
      var arg = callArgs[i];
      if (typeof arg == 'bigint') {
        (growMemViews(), HEAP64)[b + 2 * i] = 1n;
        (growMemViews(), HEAP64)[b + 2 * i + 1] = arg;
      } else {
        (growMemViews(), HEAP64)[b + 2 * i] = 0n;
        (growMemViews(), HEAPF64)[b + 2 * i + 1] = arg;
      }
    }
    var rtn = __emscripten_run_js_on_main_thread(
      funcIndex,
      emAsmAddr,
      serializedNumCallArgs,
      args,
      sync
    );
    stackRestore(sp);
    return rtn;
  };
  function _proc_exit(code) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
      PThread.terminateAllThreads();
      Module['onExit']?.(code);
      ABORT = true;
    }
    quit_(code, new ExitStatus(code));
  }
  function exitOnMainThread(returnCode) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
    _exit(returnCode);
  }
  var exitJS = (status, implicit) => {
    EXITSTATUS = status;
    checkUnflushedContent();
    if (ENVIRONMENT_IS_PTHREAD) {
      assert(!implicit);
      exitOnMainThread(status);
      throw 'unwind';
    }
    if (keepRuntimeAlive() && !implicit) {
      var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
      readyPromiseReject?.(msg);
      err(msg);
    }
    _proc_exit(status);
  };
  var _exit = exitJS;
  var maybeExit = () => {
    if (!keepRuntimeAlive()) {
      try {
        if (ENVIRONMENT_IS_PTHREAD) {
          if (_pthread_self()) __emscripten_thread_exit(EXITSTATUS);
          return;
        }
        _exit(EXITSTATUS);
      } catch (e) {
        handleException(e);
      }
    }
  };
  var callUserCallback = (func) => {
    if (ABORT) {
      err('user callback triggered after runtime exited or application aborted.  Ignoring.');
      return;
    }
    try {
      func();
      maybeExit();
    } catch (e) {
      handleException(e);
    }
  };
  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement ||
      document.msFullscreenElement
    );
  }
  var runtimeKeepalivePush = () => {
    runtimeKeepaliveCounter += 1;
  };
  var runtimeKeepalivePop = () => {
    assert(runtimeKeepaliveCounter > 0);
    runtimeKeepaliveCounter -= 1;
  };
  var safeSetTimeout = (func, timeout) => {
    runtimeKeepalivePush();
    return setTimeout(() => {
      runtimeKeepalivePop();
      callUserCallback(func);
    }, timeout);
  };
  var warnOnce = (text) => {
    warnOnce.shown ||= {};
    if (!warnOnce.shown[text]) {
      warnOnce.shown[text] = 1;
      err(text);
    }
  };
  var Browser = {
    useWebGL: false,
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    preloadedImages: {},
    preloadedAudios: {},
    getCanvas: () => Module['canvas'],
    init() {
      if (Browser.initted) return;
      Browser.initted = true;
      function pointerLockChange() {
        var canvas = Browser.getCanvas();
        Browser.pointerLock = document.pointerLockElement === canvas;
      }
      var canvas = Browser.getCanvas();
      if (canvas) {
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener(
            'click',
            (ev) => {
              if (!Browser.pointerLock && Browser.getCanvas().requestPointerLock) {
                Browser.getCanvas().requestPointerLock();
                ev.preventDefault();
              }
            },
            false
          );
        }
      }
    },
    createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
      if (useWebGL && Module['ctx'] && canvas == Browser.getCanvas()) return Module['ctx'];
      var ctx;
      var contextHandle;
      if (useWebGL) {
        var contextAttributes = { antialias: false, alpha: false, majorVersion: 1 };
        if (webGLContextAttributes) {
          for (var attribute in webGLContextAttributes) {
            contextAttributes[attribute] = webGLContextAttributes[attribute];
          }
        }
        if (typeof GL != 'undefined') {
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
        }
      } else {
        ctx = canvas.getContext('2d');
      }
      if (!ctx) return null;
      if (setInModule) {
        if (!useWebGL)
          assert(
            typeof GLctx == 'undefined',
            'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
          );
        Module['ctx'] = ctx;
        if (useWebGL) GL.makeContextCurrent(contextHandle);
        Browser.useWebGL = useWebGL;
        Browser.moduleContextCreatedCallbacks.forEach((callback) => callback());
        Browser.init();
      }
      return ctx;
    },
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen(lockPointer, resizeCanvas) {
      Browser.lockPointer = lockPointer;
      Browser.resizeCanvas = resizeCanvas;
      if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
      if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;
      var canvas = Browser.getCanvas();
      function fullscreenChange() {
        Browser.isFullscreen = false;
        var canvasContainer = canvas.parentNode;
        if (getFullscreenElement() === canvasContainer) {
          canvas.exitFullscreen = Browser.exitFullscreen;
          if (Browser.lockPointer) canvas.requestPointerLock();
          Browser.isFullscreen = true;
          if (Browser.resizeCanvas) {
            Browser.setFullscreenCanvasSize();
          } else {
            Browser.updateCanvasDimensions(canvas);
          }
        } else {
          canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
          canvasContainer.parentNode.removeChild(canvasContainer);
          if (Browser.resizeCanvas) {
            Browser.setWindowedCanvasSize();
          } else {
            Browser.updateCanvasDimensions(canvas);
          }
        }
        Module['onFullScreen']?.(Browser.isFullscreen);
        Module['onFullscreen']?.(Browser.isFullscreen);
      }
      if (!Browser.fullscreenHandlersInstalled) {
        Browser.fullscreenHandlersInstalled = true;
        document.addEventListener('fullscreenchange', fullscreenChange, false);
        document.addEventListener('mozfullscreenchange', fullscreenChange, false);
        document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
        document.addEventListener('MSFullscreenChange', fullscreenChange, false);
      }
      var canvasContainer = document.createElement('div');
      canvas.parentNode.insertBefore(canvasContainer, canvas);
      canvasContainer.appendChild(canvas);
      canvasContainer.requestFullscreen =
        canvasContainer['requestFullscreen'] ||
        canvasContainer['mozRequestFullScreen'] ||
        canvasContainer['msRequestFullscreen'] ||
        (canvasContainer['webkitRequestFullscreen']
          ? () => canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT'])
          : null) ||
        (canvasContainer['webkitRequestFullScreen']
          ? () => canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT'])
          : null);
      canvasContainer.requestFullscreen();
    },
    requestFullScreen() {
      abort(
        'Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)'
      );
    },
    exitFullscreen() {
      if (!Browser.isFullscreen) {
        return false;
      }
      var CFS =
        document['exitFullscreen'] ||
        document['cancelFullScreen'] ||
        document['mozCancelFullScreen'] ||
        document['msExitFullscreen'] ||
        document['webkitCancelFullScreen'] ||
        (() => {});
      CFS.apply(document, []);
      return true;
    },
    safeSetTimeout(func, timeout) {
      return safeSetTimeout(func, timeout);
    },
    getMimetype(name) {
      return {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        bmp: 'image/bmp',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
      }[name.slice(name.lastIndexOf('.') + 1)];
    },
    getUserMedia(func) {
      window.getUserMedia ||= navigator['getUserMedia'] || navigator['mozGetUserMedia'];
      window.getUserMedia(func);
    },
    getMovementX(event) {
      return event['movementX'] || event['mozMovementX'] || event['webkitMovementX'] || 0;
    },
    getMovementY(event) {
      return event['movementY'] || event['mozMovementY'] || event['webkitMovementY'] || 0;
    },
    getMouseWheelDelta(event) {
      var delta = 0;
      switch (event.type) {
        case 'DOMMouseScroll':
          delta = event.detail / 3;
          break;
        case 'mousewheel':
          delta = event.wheelDelta / 120;
          break;
        case 'wheel':
          delta = event.deltaY;
          switch (event.deltaMode) {
            case 0:
              delta /= 100;
              break;
            case 1:
              delta /= 3;
              break;
            case 2:
              delta *= 80;
              break;
            default:
              throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
          }
          break;
        default:
          throw 'unrecognized mouse wheel event: ' + event.type;
      }
      return delta;
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseCoords(pageX, pageY) {
      var canvas = Browser.getCanvas();
      var rect = canvas.getBoundingClientRect();
      var scrollX = typeof window.scrollX != 'undefined' ? window.scrollX : window.pageXOffset;
      var scrollY = typeof window.scrollY != 'undefined' ? window.scrollY : window.pageYOffset;
      assert(
        typeof scrollX != 'undefined' && typeof scrollY != 'undefined',
        'Unable to retrieve scroll position, mouse positions likely broken.'
      );
      var adjustedX = pageX - (scrollX + rect.left);
      var adjustedY = pageY - (scrollY + rect.top);
      adjustedX = adjustedX * (canvas.width / rect.width);
      adjustedY = adjustedY * (canvas.height / rect.height);
      return { x: adjustedX, y: adjustedY };
    },
    setMouseCoords(pageX, pageY) {
      const { x, y } = Browser.calculateMouseCoords(pageX, pageY);
      Browser.mouseMovementX = x - Browser.mouseX;
      Browser.mouseMovementY = y - Browser.mouseY;
      Browser.mouseX = x;
      Browser.mouseY = y;
    },
    calculateMouseEvent(event) {
      if (Browser.pointerLock) {
        if (event.type != 'mousemove' && 'mozMovementX' in event) {
          Browser.mouseMovementX = Browser.mouseMovementY = 0;
        } else {
          Browser.mouseMovementX = Browser.getMovementX(event);
          Browser.mouseMovementY = Browser.getMovementY(event);
        }
        Browser.mouseX += Browser.mouseMovementX;
        Browser.mouseY += Browser.mouseMovementY;
      } else {
        if (
          event.type === 'touchstart' ||
          event.type === 'touchend' ||
          event.type === 'touchmove'
        ) {
          var touch = event.touch;
          if (touch === undefined) {
            return;
          }
          var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
          if (event.type === 'touchstart') {
            Browser.lastTouches[touch.identifier] = coords;
            Browser.touches[touch.identifier] = coords;
          } else if (event.type === 'touchend' || event.type === 'touchmove') {
            var last = Browser.touches[touch.identifier];
            last ||= coords;
            Browser.lastTouches[touch.identifier] = last;
            Browser.touches[touch.identifier] = coords;
          }
          return;
        }
        Browser.setMouseCoords(event.pageX, event.pageY);
      }
    },
    resizeListeners: [],
    updateResizeListeners() {
      var canvas = Browser.getCanvas();
      Browser.resizeListeners.forEach((listener) => listener(canvas.width, canvas.height));
    },
    setCanvasSize(width, height, noUpdates) {
      var canvas = Browser.getCanvas();
      Browser.updateCanvasDimensions(canvas, width, height);
      if (!noUpdates) Browser.updateResizeListeners();
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize() {
      if (typeof SDL != 'undefined') {
        var flags = (growMemViews(), HEAPU32)[SDL.screen >> 2];
        flags = flags | 8388608;
        (growMemViews(), HEAP32)[SDL.screen >> 2] = flags;
      }
      Browser.updateCanvasDimensions(Browser.getCanvas());
      Browser.updateResizeListeners();
    },
    setWindowedCanvasSize() {
      if (typeof SDL != 'undefined') {
        var flags = (growMemViews(), HEAPU32)[SDL.screen >> 2];
        flags = flags & ~8388608;
        (growMemViews(), HEAP32)[SDL.screen >> 2] = flags;
      }
      Browser.updateCanvasDimensions(Browser.getCanvas());
      Browser.updateResizeListeners();
    },
    updateCanvasDimensions(canvas, wNative, hNative) {
      if (wNative && hNative) {
        canvas.widthNative = wNative;
        canvas.heightNative = hNative;
      } else {
        wNative = canvas.widthNative;
        hNative = canvas.heightNative;
      }
      var w = wNative;
      var h = hNative;
      if (Module['forcedAspectRatio'] > 0) {
        if (w / h < Module['forcedAspectRatio']) {
          w = Math.round(h * Module['forcedAspectRatio']);
        } else {
          h = Math.round(w / Module['forcedAspectRatio']);
        }
      }
      if (getFullscreenElement() === canvas.parentNode && typeof screen != 'undefined') {
        var factor = Math.min(screen.width / w, screen.height / h);
        w = Math.round(w * factor);
        h = Math.round(h * factor);
      }
      if (Browser.resizeCanvas) {
        if (canvas.width != w) canvas.width = w;
        if (canvas.height != h) canvas.height = h;
        if (typeof canvas.style != 'undefined') {
          canvas.style.removeProperty('width');
          canvas.style.removeProperty('height');
        }
      } else {
        if (canvas.width != wNative) canvas.width = wNative;
        if (canvas.height != hNative) canvas.height = hNative;
        if (typeof canvas.style != 'undefined') {
          if (w != wNative || h != hNative) {
            canvas.style.setProperty('width', w + 'px', 'important');
            canvas.style.setProperty('height', h + 'px', 'important');
          } else {
            canvas.style.removeProperty('width');
            canvas.style.removeProperty('height');
          }
        }
      }
    },
  };
  function FS() {
    abort('missing function: $FS');
  }
  FS.stub = true;
  var GLctx;
  var webgl_enable_ANGLE_instanced_arrays = (ctx) => {
    var ext = ctx.getExtension('ANGLE_instanced_arrays');
    if (ext) {
      ctx['vertexAttribDivisor'] = (index, divisor) =>
        ext['vertexAttribDivisorANGLE'](index, divisor);
      ctx['drawArraysInstanced'] = (mode, first, count, primcount) =>
        ext['drawArraysInstancedANGLE'](mode, first, count, primcount);
      ctx['drawElementsInstanced'] = (mode, count, type, indices, primcount) =>
        ext['drawElementsInstancedANGLE'](mode, count, type, indices, primcount);
      return 1;
    }
  };
  var webgl_enable_OES_vertex_array_object = (ctx) => {
    var ext = ctx.getExtension('OES_vertex_array_object');
    if (ext) {
      ctx['createVertexArray'] = () => ext['createVertexArrayOES']();
      ctx['deleteVertexArray'] = (vao) => ext['deleteVertexArrayOES'](vao);
      ctx['bindVertexArray'] = (vao) => ext['bindVertexArrayOES'](vao);
      ctx['isVertexArray'] = (vao) => ext['isVertexArrayOES'](vao);
      return 1;
    }
  };
  var webgl_enable_WEBGL_draw_buffers = (ctx) => {
    var ext = ctx.getExtension('WEBGL_draw_buffers');
    if (ext) {
      ctx['drawBuffers'] = (n, bufs) => ext['drawBuffersWEBGL'](n, bufs);
      return 1;
    }
  };
  var webgl_enable_EXT_polygon_offset_clamp = (ctx) =>
    !!(ctx.extPolygonOffsetClamp = ctx.getExtension('EXT_polygon_offset_clamp'));
  var webgl_enable_EXT_clip_control = (ctx) =>
    !!(ctx.extClipControl = ctx.getExtension('EXT_clip_control'));
  var webgl_enable_WEBGL_polygon_mode = (ctx) =>
    !!(ctx.webglPolygonMode = ctx.getExtension('WEBGL_polygon_mode'));
  var webgl_enable_WEBGL_multi_draw = (ctx) =>
    !!(ctx.multiDrawWebgl = ctx.getExtension('WEBGL_multi_draw'));
  var getEmscriptenSupportedExtensions = (ctx) => {
    var supportedExtensions = [
      'ANGLE_instanced_arrays',
      'EXT_blend_minmax',
      'EXT_disjoint_timer_query',
      'EXT_frag_depth',
      'EXT_shader_texture_lod',
      'EXT_sRGB',
      'OES_element_index_uint',
      'OES_fbo_render_mipmap',
      'OES_standard_derivatives',
      'OES_texture_float',
      'OES_texture_half_float',
      'OES_texture_half_float_linear',
      'OES_vertex_array_object',
      'WEBGL_color_buffer_float',
      'WEBGL_depth_texture',
      'WEBGL_draw_buffers',
      'EXT_clip_control',
      'EXT_color_buffer_half_float',
      'EXT_depth_clamp',
      'EXT_float_blend',
      'EXT_polygon_offset_clamp',
      'EXT_texture_compression_bptc',
      'EXT_texture_compression_rgtc',
      'EXT_texture_filter_anisotropic',
      'KHR_parallel_shader_compile',
      'OES_texture_float_linear',
      'WEBGL_blend_func_extended',
      'WEBGL_compressed_texture_astc',
      'WEBGL_compressed_texture_etc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_s3tc_srgb',
      'WEBGL_debug_renderer_info',
      'WEBGL_debug_shaders',
      'WEBGL_lose_context',
      'WEBGL_multi_draw',
      'WEBGL_polygon_mode',
    ];
    return (ctx.getSupportedExtensions() || []).filter((ext) => supportedExtensions.includes(ext));
  };
  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;
  var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
    var maxIdx = idx + maxBytesToRead;
    if (ignoreNul) return maxIdx;
    while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
    return idx;
  };
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
    var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
      return UTF8Decoder.decode(
        heapOrArray.buffer instanceof ArrayBuffer
          ? heapOrArray.subarray(idx, endPtr)
          : heapOrArray.slice(idx, endPtr)
      );
    }
    var str = '';
    while (idx < endPtr) {
      var u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 248) != 240)
          warnOnce(
            'Invalid UTF-8 leading byte ' +
              ptrToString(u0) +
              ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
          );
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
    return str;
  };
  var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
    assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
    return ptr ? UTF8ArrayToString((growMemViews(), HEAPU8), ptr, maxBytesToRead, ignoreNul) : '';
  };
  var GL = {
    counter: 1,
    buffers: [],
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    shaders: [],
    vaos: [],
    contexts: {},
    offscreenCanvases: {},
    queries: [],
    stringCache: {},
    unpackAlignment: 4,
    unpackRowLength: 0,
    recordError: (errorCode) => {
      if (!GL.lastError) {
        GL.lastError = errorCode;
      }
    },
    getNewId: (table) => {
      var ret = GL.counter++;
      for (var i = table.length; i < ret; i++) {
        table[i] = null;
      }
      return ret;
    },
    genObject: (n, buffers, createFunction, objectTable) => {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx[createFunction]();
        var id = buffer && GL.getNewId(objectTable);
        if (buffer) {
          buffer.name = id;
          objectTable[id] = buffer;
        } else {
          GL.recordError(1282);
        }
        (growMemViews(), HEAP32)[(buffers + i * 4) >> 2] = id;
      }
    },
    getSource: (shader, count, string, length) => {
      var source = '';
      for (var i = 0; i < count; ++i) {
        var len = length ? (growMemViews(), HEAPU32)[(length + i * 4) >> 2] : undefined;
        source += UTF8ToString((growMemViews(), HEAPU32)[(string + i * 4) >> 2], len);
      }
      return source;
    },
    createContext: (canvas, webGLContextAttributes) => {
      if (!canvas.getContextSafariWebGL2Fixed) {
        canvas.getContextSafariWebGL2Fixed = canvas.getContext;
        function fixedGetContext(ver, attrs) {
          var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
          return (ver == 'webgl') == gl instanceof WebGLRenderingContext ? gl : null;
        }
        canvas.getContext = fixedGetContext;
      }
      var ctx = canvas.getContext('webgl', webGLContextAttributes);
      if (!ctx) return 0;
      var handle = GL.registerContext(ctx, webGLContextAttributes);
      return handle;
    },
    registerContext: (ctx, webGLContextAttributes) => {
      var handle = _malloc(8);
      (growMemViews(), HEAPU32)[(handle + 4) >> 2] = _pthread_self();
      var context = {
        handle,
        attributes: webGLContextAttributes,
        version: webGLContextAttributes.majorVersion,
        GLctx: ctx,
      };
      if (ctx.canvas) ctx.canvas.GLctxObject = context;
      GL.contexts[handle] = context;
      if (
        typeof webGLContextAttributes.enableExtensionsByDefault == 'undefined' ||
        webGLContextAttributes.enableExtensionsByDefault
      ) {
        GL.initExtensions(context);
      }
      return handle;
    },
    makeContextCurrent: (contextHandle) => {
      GL.currentContext = GL.contexts[contextHandle];
      Module['ctx'] = GLctx = GL.currentContext?.GLctx;
      return !(contextHandle && !GLctx);
    },
    getContext: (contextHandle) => GL.contexts[contextHandle],
    deleteContext: (contextHandle) => {
      if (GL.currentContext === GL.contexts[contextHandle]) {
        GL.currentContext = null;
      }
      if (typeof JSEvents == 'object') {
        JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
      }
      if (GL.contexts[contextHandle]?.GLctx.canvas) {
        GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
      }
      _free(GL.contexts[contextHandle].handle);
      GL.contexts[contextHandle] = null;
    },
    initExtensions: (context) => {
      context ||= GL.currentContext;
      if (context.initExtensionsDone) return;
      context.initExtensionsDone = true;
      var GLctx = context.GLctx;
      webgl_enable_WEBGL_multi_draw(GLctx);
      webgl_enable_EXT_polygon_offset_clamp(GLctx);
      webgl_enable_EXT_clip_control(GLctx);
      webgl_enable_WEBGL_polygon_mode(GLctx);
      webgl_enable_ANGLE_instanced_arrays(GLctx);
      webgl_enable_OES_vertex_array_object(GLctx);
      webgl_enable_WEBGL_draw_buffers(GLctx);
      {
        GLctx.disjointTimerQueryExt = GLctx.getExtension('EXT_disjoint_timer_query');
      }
      getEmscriptenSupportedExtensions(GLctx).forEach((ext) => {
        if (!ext.includes('lose_context') && !ext.includes('debug')) {
          GLctx.getExtension(ext);
        }
      });
    },
  };
  var onPostRuns = [];
  var addOnPostRun = (cb) => onPostRuns.push(cb);
  function establishStackSpace(pthread_ptr) {
    var stackHigh = (growMemViews(), HEAPU32)[(pthread_ptr + 52) >> 2];
    var stackSize = (growMemViews(), HEAPU32)[(pthread_ptr + 56) >> 2];
    var stackLow = stackHigh - stackSize;
    assert(stackHigh != 0);
    assert(stackLow != 0);
    assert(stackHigh > stackLow, 'stackHigh must be higher then stackLow');
    _emscripten_stack_set_limits(stackHigh, stackLow);
    stackRestore(stackHigh);
    writeStackCookie();
  }
  var wasmTableMirror = [];
  var wasmTable;
  var getWasmTableEntry = (funcPtr) => {
    var func = wasmTableMirror[funcPtr];
    if (!func) {
      wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    assert(
      wasmTable.get(funcPtr) == func,
      'JavaScript-side Wasm function table mirror is out of date!'
    );
    return func;
  };
  var invokeEntryPoint = (ptr, arg) => {
    runtimeKeepaliveCounter = 0;
    noExitRuntime = 0;
    var result = getWasmTableEntry(ptr)(arg);
    checkStackCookie();
    function finish(result) {
      if (keepRuntimeAlive()) {
        EXITSTATUS = result;
        return;
      }
      __emscripten_thread_exit(result);
    }
    finish(result);
  };
  var noExitRuntime = true;
  var registerTLSInit = (tlsInitFunc) => PThread.tlsInitFunctions.push(tlsInitFunc);
  var ___assert_fail = (condition, filename, line, func) =>
    abort(
      `Assertion failed: ${UTF8ToString(condition)}, at: ` +
        [
          filename ? UTF8ToString(filename) : 'unknown filename',
          line,
          func ? UTF8ToString(func) : 'unknown function',
        ]
    );
  var exceptionCaught = [];
  var uncaughtExceptionCount = 0;
  var ___cxa_begin_catch = (ptr) => {
    var info = new ExceptionInfo(ptr);
    if (!info.get_caught()) {
      info.set_caught(true);
      uncaughtExceptionCount--;
    }
    info.set_rethrown(false);
    exceptionCaught.push(info);
    ___cxa_increment_exception_refcount(ptr);
    return ___cxa_get_exception_ptr(ptr);
  };
  var exceptionLast = 0;
  var ___cxa_end_catch = () => {
    _setThrew(0, 0);
    assert(exceptionCaught.length > 0);
    var info = exceptionCaught.pop();
    ___cxa_decrement_exception_refcount(info.excPtr);
    exceptionLast = 0;
  };
  class ExceptionInfo {
    constructor(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
    }
    set_type(type) {
      (growMemViews(), HEAPU32)[(this.ptr + 4) >> 2] = type;
    }
    get_type() {
      return (growMemViews(), HEAPU32)[(this.ptr + 4) >> 2];
    }
    set_destructor(destructor) {
      (growMemViews(), HEAPU32)[(this.ptr + 8) >> 2] = destructor;
    }
    get_destructor() {
      return (growMemViews(), HEAPU32)[(this.ptr + 8) >> 2];
    }
    set_caught(caught) {
      caught = caught ? 1 : 0;
      (growMemViews(), HEAP8)[this.ptr + 12] = caught;
    }
    get_caught() {
      return (growMemViews(), HEAP8)[this.ptr + 12] != 0;
    }
    set_rethrown(rethrown) {
      rethrown = rethrown ? 1 : 0;
      (growMemViews(), HEAP8)[this.ptr + 13] = rethrown;
    }
    get_rethrown() {
      return (growMemViews(), HEAP8)[this.ptr + 13] != 0;
    }
    init(type, destructor) {
      this.set_adjusted_ptr(0);
      this.set_type(type);
      this.set_destructor(destructor);
    }
    set_adjusted_ptr(adjustedPtr) {
      (growMemViews(), HEAPU32)[(this.ptr + 16) >> 2] = adjustedPtr;
    }
    get_adjusted_ptr() {
      return (growMemViews(), HEAPU32)[(this.ptr + 16) >> 2];
    }
  }
  var setTempRet0 = (val) => __emscripten_tempret_set(val);
  var findMatchingCatch = (args) => {
    var thrown = exceptionLast?.excPtr;
    if (!thrown) {
      setTempRet0(0);
      return 0;
    }
    var info = new ExceptionInfo(thrown);
    info.set_adjusted_ptr(thrown);
    var thrownType = info.get_type();
    if (!thrownType) {
      setTempRet0(0);
      return thrown;
    }
    for (var caughtType of args) {
      if (caughtType === 0 || caughtType === thrownType) {
        break;
      }
      var adjusted_ptr_addr = info.ptr + 16;
      if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
        setTempRet0(caughtType);
        return thrown;
      }
    }
    setTempRet0(thrownType);
    return thrown;
  };
  var ___cxa_find_matching_catch_2 = () => findMatchingCatch([]);
  var ___cxa_find_matching_catch_3 = (arg0) => findMatchingCatch([arg0]);
  var ___cxa_find_matching_catch_4 = (arg0, arg1) => findMatchingCatch([arg0, arg1]);
  var ___cxa_find_matching_catch_5 = (arg0, arg1, arg2) => findMatchingCatch([arg0, arg1, arg2]);
  var ___cxa_rethrow = () => {
    var info = exceptionCaught.pop();
    if (!info) {
      abort('no exception to throw');
    }
    var ptr = info.excPtr;
    if (!info.get_rethrown()) {
      exceptionCaught.push(info);
      info.set_rethrown(true);
      info.set_caught(false);
      uncaughtExceptionCount++;
    }
    exceptionLast = new CppException(ptr);
    throw exceptionLast;
  };
  var ___cxa_throw = (ptr, type, destructor) => {
    var info = new ExceptionInfo(ptr);
    info.init(type, destructor);
    exceptionLast = new CppException(ptr);
    uncaughtExceptionCount++;
    throw exceptionLast;
  };
  var ___cxa_uncaught_exceptions = () => uncaughtExceptionCount;
  function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
    if (ENVIRONMENT_IS_PTHREAD)
      return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
    return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
  }
  var _emscripten_has_threading_support = () => typeof SharedArrayBuffer != 'undefined';
  var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
    if (!_emscripten_has_threading_support()) {
      dbg(
        'pthread_create: environment does not support SharedArrayBuffer, pthreads are not available'
      );
      return 6;
    }
    var transferList = [];
    var error = 0;
    if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
      return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
    }
    if (error) return error;
    var threadParams = { startRoutine, pthread_ptr, arg, transferList };
    if (ENVIRONMENT_IS_PTHREAD) {
      threadParams.cmd = 'spawnThread';
      postMessage(threadParams, transferList);
      return 0;
    }
    return spawnThread(threadParams);
  };
  var ___resumeException = (ptr) => {
    if (!exceptionLast) {
      exceptionLast = new CppException(ptr);
    }
    throw exceptionLast;
  };
  var SYSCALLS = {
    varargs: undefined,
    getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    },
  };
  function ___syscall_chmod(path, mode) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, path, mode);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_faccessat(dirfd, path, amode, flags) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, dirfd, path, amode, flags);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_fcntl64(fd, cmd, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, fd, cmd, varargs);
    SYSCALLS.varargs = varargs;
    return 0;
  }
  function ___syscall_fstat64(fd, buf) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, fd, buf);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_ioctl(fd, op, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 0, 1, fd, op, varargs);
    SYSCALLS.varargs = varargs;
    return 0;
  }
  function ___syscall_lstat64(path, buf) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, path, buf);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_newfstatat(dirfd, path, buf, flags) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 1, dirfd, path, buf, flags);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_openat(dirfd, path, flags, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, dirfd, path, flags, varargs);
    SYSCALLS.varargs = varargs;
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function ___syscall_stat64(path, buf) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, path, buf);
    abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
  }
  var __abort_js = () => abort('native code called abort()');
  var structRegistrations = {};
  var runDestructors = (destructors) => {
    while (destructors.length) {
      var ptr = destructors.pop();
      var del = destructors.pop();
      del(ptr);
    }
  };
  function readPointer(pointer) {
    return this.fromWireType((growMemViews(), HEAPU32)[pointer >> 2]);
  }
  var awaitingDependencies = {};
  var registeredTypes = {};
  var typeDependencies = {};
  var InternalError = class InternalError extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalError';
    }
  };
  var throwInternalError = (message) => {
    throw new InternalError(message);
  };
  var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
    myTypes.forEach((type) => (typeDependencies[type] = dependentTypes));
    function onComplete(typeConverters) {
      var myTypeConverters = getTypeConverters(typeConverters);
      if (myTypeConverters.length !== myTypes.length) {
        throwInternalError('Mismatched type converter count');
      }
      for (var i = 0; i < myTypes.length; ++i) {
        registerType(myTypes[i], myTypeConverters[i]);
      }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach((dt, i) => {
      if (registeredTypes.hasOwnProperty(dt)) {
        typeConverters[i] = registeredTypes[dt];
      } else {
        unregisteredTypes.push(dt);
        if (!awaitingDependencies.hasOwnProperty(dt)) {
          awaitingDependencies[dt] = [];
        }
        awaitingDependencies[dt].push(() => {
          typeConverters[i] = registeredTypes[dt];
          ++registered;
          if (registered === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        });
      }
    });
    if (0 === unregisteredTypes.length) {
      onComplete(typeConverters);
    }
  };
  var __embind_finalize_value_object = (structType) => {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords
      .map((field) => field.getterReturnType)
      .concat(fieldRecords.map((field) => field.setterArgumentType));
    whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes) => {
      var fields = {};
      fieldRecords.forEach((field, i) => {
        var fieldName = field.fieldName;
        var getterReturnType = fieldTypes[i];
        var optional = fieldTypes[i].optional;
        var getter = field.getter;
        var getterContext = field.getterContext;
        var setterArgumentType = fieldTypes[i + fieldRecords.length];
        var setter = field.setter;
        var setterContext = field.setterContext;
        fields[fieldName] = {
          read: (ptr) => getterReturnType.fromWireType(getter(getterContext, ptr)),
          write: (ptr, o) => {
            var destructors = [];
            setter(setterContext, ptr, setterArgumentType.toWireType(destructors, o));
            runDestructors(destructors);
          },
          optional,
        };
      });
      return [
        {
          name: reg.name,
          fromWireType: (ptr) => {
            var rv = {};
            for (var i in fields) {
              rv[i] = fields[i].read(ptr);
            }
            rawDestructor(ptr);
            return rv;
          },
          toWireType: (destructors, o) => {
            for (var fieldName in fields) {
              if (!(fieldName in o) && !fields[fieldName].optional) {
                throw new TypeError(`Missing field: "${fieldName}"`);
              }
            }
            var ptr = rawConstructor();
            for (fieldName in fields) {
              fields[fieldName].write(ptr, o[fieldName]);
            }
            if (destructors !== null) {
              destructors.push(rawDestructor, ptr);
            }
            return ptr;
          },
          readValueFromPointer: readPointer,
          destructorFunction: rawDestructor,
        },
      ];
    });
  };
  var AsciiToString = (ptr) => {
    var str = '';
    while (1) {
      var ch = (growMemViews(), HEAPU8)[ptr++];
      if (!ch) return str;
      str += String.fromCharCode(ch);
    }
  };
  var BindingError = class BindingError extends Error {
    constructor(message) {
      super(message);
      this.name = 'BindingError';
    }
  };
  var throwBindingError = (message) => {
    throw new BindingError(message);
  };
  function sharedRegisterType(rawType, registeredInstance, options = {}) {
    var name = registeredInstance.name;
    if (!rawType) {
      throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
      if (options.ignoreDuplicateRegistrations) {
        return;
      } else {
        throwBindingError(`Cannot register type '${name}' twice`);
      }
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
      var callbacks = awaitingDependencies[rawType];
      delete awaitingDependencies[rawType];
      callbacks.forEach((cb) => cb());
    }
  }
  function registerType(rawType, registeredInstance, options = {}) {
    return sharedRegisterType(rawType, registeredInstance, options);
  }
  var integerReadValueFromPointer = (name, width, signed) => {
    switch (width) {
      case 1:
        return signed
          ? (pointer) => (growMemViews(), HEAP8)[pointer]
          : (pointer) => (growMemViews(), HEAPU8)[pointer];
      case 2:
        return signed
          ? (pointer) => (growMemViews(), HEAP16)[pointer >> 1]
          : (pointer) => (growMemViews(), HEAPU16)[pointer >> 1];
      case 4:
        return signed
          ? (pointer) => (growMemViews(), HEAP32)[pointer >> 2]
          : (pointer) => (growMemViews(), HEAPU32)[pointer >> 2];
      case 8:
        return signed
          ? (pointer) => (growMemViews(), HEAP64)[pointer >> 3]
          : (pointer) => (growMemViews(), HEAPU64)[pointer >> 3];
      default:
        throw new TypeError(`invalid integer width (${width}): ${name}`);
    }
  };
  var embindRepr = (v) => {
    if (v === null) {
      return 'null';
    }
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
      return v.toString();
    } else {
      return '' + v;
    }
  };
  var assertIntegerRange = (typeName, value, minRange, maxRange) => {
    if (value < minRange || value > maxRange) {
      throw new TypeError(
        `Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${typeName}", which is outside the valid range [${minRange}, ${maxRange}]!`
      );
    }
  };
  var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
    name = AsciiToString(name);
    const isUnsignedType = minRange === 0n;
    let fromWireType = (value) => value;
    if (isUnsignedType) {
      const bitSize = size * 8;
      fromWireType = (value) => BigInt.asUintN(bitSize, value);
      maxRange = fromWireType(maxRange);
    }
    registerType(primitiveType, {
      name,
      fromWireType,
      toWireType: (destructors, value) => {
        if (typeof value == 'number') {
          value = BigInt(value);
        } else if (typeof value != 'bigint') {
          throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${this.name}`);
        }
        assertIntegerRange(name, value, minRange, maxRange);
        return value;
      },
      readValueFromPointer: integerReadValueFromPointer(name, size, !isUnsignedType),
      destructorFunction: null,
    });
  };
  var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
    name = AsciiToString(name);
    registerType(rawType, {
      name,
      fromWireType: function (wt) {
        return !!wt;
      },
      toWireType: function (destructors, o) {
        return o ? trueValue : falseValue;
      },
      readValueFromPointer: function (pointer) {
        return this.fromWireType((growMemViews(), HEAPU8)[pointer]);
      },
      destructorFunction: null,
    });
  };
  var shallowCopyInternalPointer = (o) => ({
    count: o.count,
    deleteScheduled: o.deleteScheduled,
    preservePointerOnDelete: o.preservePointerOnDelete,
    ptr: o.ptr,
    ptrType: o.ptrType,
    smartPtr: o.smartPtr,
    smartPtrType: o.smartPtrType,
  });
  var throwInstanceAlreadyDeleted = (obj) => {
    function getInstanceTypeName(handle) {
      return handle.$$.ptrType.registeredClass.name;
    }
    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
  };
  var finalizationRegistry = false;
  var detachFinalizer = (handle) => {};
  var runDestructor = ($$) => {
    if ($$.smartPtr) {
      $$.smartPtrType.rawDestructor($$.smartPtr);
    } else {
      $$.ptrType.registeredClass.rawDestructor($$.ptr);
    }
  };
  var releaseClassHandle = ($$) => {
    $$.count.value -= 1;
    var toDelete = 0 === $$.count.value;
    if (toDelete) {
      runDestructor($$);
    }
  };
  var downcastPointer = (ptr, ptrClass, desiredClass) => {
    if (ptrClass === desiredClass) {
      return ptr;
    }
    if (undefined === desiredClass.baseClass) {
      return null;
    }
    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
    if (rv === null) {
      return null;
    }
    return desiredClass.downcast(rv);
  };
  var registeredPointers = {};
  var registeredInstances = {};
  var getBasestPointer = (class_, ptr) => {
    if (ptr === undefined) {
      throwBindingError('ptr should not be undefined');
    }
    while (class_.baseClass) {
      ptr = class_.upcast(ptr);
      class_ = class_.baseClass;
    }
    return ptr;
  };
  var getInheritedInstance = (class_, ptr) => {
    ptr = getBasestPointer(class_, ptr);
    return registeredInstances[ptr];
  };
  var makeClassHandle = (prototype, record) => {
    if (!record.ptrType || !record.ptr) {
      throwInternalError('makeClassHandle requires ptr and ptrType');
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
      throwInternalError('Both smartPtrType and smartPtr must be specified');
    }
    record.count = { value: 1 };
    return attachFinalizer(Object.create(prototype, { $$: { value: record, writable: true } }));
  };
  function RegisteredPointer_fromWireType(ptr) {
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
      this.destructor(ptr);
      return null;
    }
    var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
    if (undefined !== registeredInstance) {
      if (0 === registeredInstance.$$.count.value) {
        registeredInstance.$$.ptr = rawPointer;
        registeredInstance.$$.smartPtr = ptr;
        return registeredInstance['clone']();
      } else {
        var rv = registeredInstance['clone']();
        this.destructor(ptr);
        return rv;
      }
    }
    function makeDefaultHandle() {
      if (this.isSmartPointer) {
        return makeClassHandle(this.registeredClass.instancePrototype, {
          ptrType: this.pointeeType,
          ptr: rawPointer,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
      }
    }
    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
      return makeDefaultHandle.call(this);
    }
    var toType;
    if (this.isConst) {
      toType = registeredPointerRecord.constPointerType;
    } else {
      toType = registeredPointerRecord.pointerType;
    }
    var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
    if (dp === null) {
      return makeDefaultHandle.call(this);
    }
    if (this.isSmartPointer) {
      return makeClassHandle(toType.registeredClass.instancePrototype, {
        ptrType: toType,
        ptr: dp,
        smartPtrType: this,
        smartPtr: ptr,
      });
    } else {
      return makeClassHandle(toType.registeredClass.instancePrototype, {
        ptrType: toType,
        ptr: dp,
      });
    }
  }
  var attachFinalizer = (handle) => {
    if ('undefined' === typeof FinalizationRegistry) {
      attachFinalizer = (handle) => handle;
      return handle;
    }
    finalizationRegistry = new FinalizationRegistry((info) => {
      console.warn(info.leakWarning);
      releaseClassHandle(info.$$);
    });
    attachFinalizer = (handle) => {
      var $$ = handle.$$;
      var hasSmartPtr = !!$$.smartPtr;
      if (hasSmartPtr) {
        var info = { $$ };
        var cls = $$.ptrType.registeredClass;
        var err = new Error(
          `Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.\n` +
            "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" +
            "Make sure to invoke .delete() manually once you're done with the instance instead.\n" +
            'Originally allocated'
        );
        if ('captureStackTrace' in Error) {
          Error.captureStackTrace(err, RegisteredPointer_fromWireType);
        }
        info.leakWarning = err.stack.replace(/^Error: /, '');
        finalizationRegistry.register(handle, info, handle);
      }
      return handle;
    };
    detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
    return attachFinalizer(handle);
  };
  var deletionQueue = [];
  var flushPendingDeletes = () => {
    while (deletionQueue.length) {
      var obj = deletionQueue.pop();
      obj.$$.deleteScheduled = false;
      obj['delete']();
    }
  };
  var delayFunction;
  var init_ClassHandle = () => {
    let proto = ClassHandle.prototype;
    Object.assign(proto, {
      isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
          return false;
        }
        if (!(other instanceof ClassHandle)) {
          return false;
        }
        var leftClass = this.$$.ptrType.registeredClass;
        var left = this.$$.ptr;
        other.$$ = other.$$;
        var rightClass = other.$$.ptrType.registeredClass;
        var right = other.$$.ptr;
        while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
        }
        while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
        }
        return leftClass === rightClass && left === right;
      },
      clone() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
        } else {
          var clone = attachFinalizer(
            Object.create(Object.getPrototypeOf(this), {
              $$: { value: shallowCopyInternalPointer(this.$$) },
            })
          );
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
        }
      },
      delete() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        detachFinalizer(this);
        releaseClassHandle(this.$$);
        if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined;
        }
      },
      isDeleted() {
        return !this.$$.ptr;
      },
      deleteLater() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        deletionQueue.push(this);
        if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
        this.$$.deleteScheduled = true;
        return this;
      },
    });
    const symbolDispose = Symbol.dispose;
    if (symbolDispose) {
      proto[symbolDispose] = proto['delete'];
    }
  };
  function ClassHandle() {}
  var createNamedFunction = (name, func) => Object.defineProperty(func, 'name', { value: name });
  var ensureOverloadTable = (proto, methodName, humanName) => {
    if (undefined === proto[methodName].overloadTable) {
      var prevFunc = proto[methodName];
      proto[methodName] = function (...args) {
        if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
          throwBindingError(
            `Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`
          );
        }
        return proto[methodName].overloadTable[args.length].apply(this, args);
      };
      proto[methodName].overloadTable = [];
      proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }
  };
  var exposePublicSymbol = (name, value, numArguments) => {
    if (Module.hasOwnProperty(name)) {
      if (
        undefined === numArguments ||
        (undefined !== Module[name].overloadTable &&
          undefined !== Module[name].overloadTable[numArguments])
      ) {
        throwBindingError(`Cannot register public name '${name}' twice`);
      }
      ensureOverloadTable(Module, name, name);
      if (Module[name].overloadTable.hasOwnProperty(numArguments)) {
        throwBindingError(
          `Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`
        );
      }
      Module[name].overloadTable[numArguments] = value;
    } else {
      Module[name] = value;
      Module[name].argCount = numArguments;
    }
  };
  var char_0 = 48;
  var char_9 = 57;
  var makeLegalFunctionName = (name) => {
    assert(typeof name === 'string');
    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
      return `_${name}`;
    }
    return name;
  };
  function RegisteredClass(
    name,
    constructor,
    instancePrototype,
    rawDestructor,
    baseClass,
    getActualType,
    upcast,
    downcast
  ) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
    this.pureVirtualFunctions = [];
  }
  var upcastPointer = (ptr, ptrClass, desiredClass) => {
    while (ptrClass !== desiredClass) {
      if (!ptrClass.upcast) {
        throwBindingError(
          `Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`
        );
      }
      ptr = ptrClass.upcast(ptr);
      ptrClass = ptrClass.baseClass;
    }
    return ptr;
  };
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
      if (this.isReference) {
        throwBindingError(`null is not a valid ${this.name}`);
      }
      return 0;
    }
    if (!handle.$$) {
      throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
    }
    if (!handle.$$.ptr) {
      throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
  }
  function genericPointerToWireType(destructors, handle) {
    var ptr;
    if (handle === null) {
      if (this.isReference) {
        throwBindingError(`null is not a valid ${this.name}`);
      }
      if (this.isSmartPointer) {
        ptr = this.rawConstructor();
        if (destructors !== null) {
          destructors.push(this.rawDestructor, ptr);
        }
        return ptr;
      } else {
        return 0;
      }
    }
    if (!handle || !handle.$$) {
      throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
    }
    if (!handle.$$.ptr) {
      throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
      throwBindingError(
        `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`
      );
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
      if (undefined === handle.$$.smartPtr) {
        throwBindingError('Passing raw pointer to smart pointer is illegal');
      }
      switch (this.sharingPolicy) {
        case 0:
          if (handle.$$.smartPtrType === this) {
            ptr = handle.$$.smartPtr;
          } else {
            throwBindingError(
              `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`
            );
          }
          break;
        case 1:
          ptr = handle.$$.smartPtr;
          break;
        case 2:
          if (handle.$$.smartPtrType === this) {
            ptr = handle.$$.smartPtr;
          } else {
            var clonedHandle = handle['clone']();
            ptr = this.rawShare(
              ptr,
              Emval.toHandle(() => clonedHandle['delete']())
            );
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
          }
          break;
        default:
          throwBindingError('Unsupporting sharing policy');
      }
    }
    return ptr;
  }
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
      if (this.isReference) {
        throwBindingError(`null is not a valid ${this.name}`);
      }
      return 0;
    }
    if (!handle.$$) {
      throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
    }
    if (!handle.$$.ptr) {
      throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
    }
    if (handle.$$.ptrType.isConst) {
      throwBindingError(
        `Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`
      );
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
  }
  var init_RegisteredPointer = () => {
    Object.assign(RegisteredPointer.prototype, {
      getPointee(ptr) {
        if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
        }
        return ptr;
      },
      destructor(ptr) {
        this.rawDestructor?.(ptr);
      },
      readValueFromPointer: readPointer,
      fromWireType: RegisteredPointer_fromWireType,
    });
  };
  function RegisteredPointer(
    name,
    registeredClass,
    isReference,
    isConst,
    isSmartPointer,
    pointeeType,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
  ) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
      if (isConst) {
        this.toWireType = constNoSmartPtrRawPointerToWireType;
        this.destructorFunction = null;
      } else {
        this.toWireType = nonConstNoSmartPtrRawPointerToWireType;
        this.destructorFunction = null;
      }
    } else {
      this.toWireType = genericPointerToWireType;
    }
  }
  var replacePublicSymbol = (name, value, numArguments) => {
    if (!Module.hasOwnProperty(name)) {
      throwInternalError('Replacing nonexistent public symbol');
    }
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
      Module[name].overloadTable[numArguments] = value;
    } else {
      Module[name] = value;
      Module[name].argCount = numArguments;
    }
  };
  var embind__requireFunction = (signature, rawFunction, isAsync = false) => {
    assert(!isAsync, 'Async bindings are only supported with JSPI.');
    signature = AsciiToString(signature);
    function makeDynCaller() {
      var rtn = getWasmTableEntry(rawFunction);
      return rtn;
    }
    var fp = makeDynCaller();
    if (typeof fp != 'function') {
      throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
    }
    return fp;
  };
  class UnboundTypeError extends Error {}
  var getTypeName = (type) => {
    var ptr = ___getTypeName(type);
    var rv = AsciiToString(ptr);
    _free(ptr);
    return rv;
  };
  var throwUnboundTypeError = (message, types) => {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
      if (seen[type]) {
        return;
      }
      if (registeredTypes[type]) {
        return;
      }
      if (typeDependencies[type]) {
        typeDependencies[type].forEach(visit);
        return;
      }
      unboundTypes.push(type);
      seen[type] = true;
    }
    types.forEach(visit);
    throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
  };
  var __embind_register_class = (
    rawType,
    rawPointerType,
    rawConstPointerType,
    baseClassRawType,
    getActualTypeSignature,
    getActualType,
    upcastSignature,
    upcast,
    downcastSignature,
    downcast,
    name,
    destructorSignature,
    rawDestructor
  ) => {
    name = AsciiToString(name);
    getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
    upcast &&= embind__requireFunction(upcastSignature, upcast);
    downcast &&= embind__requireFunction(downcastSignature, downcast);
    rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function () {
      throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
    });
    whenDependentTypesAreResolved(
      [rawType, rawPointerType, rawConstPointerType],
      baseClassRawType ? [baseClassRawType] : [],
      (base) => {
        base = base[0];
        var baseClass;
        var basePrototype;
        if (baseClassRawType) {
          baseClass = base.registeredClass;
          basePrototype = baseClass.instancePrototype;
        } else {
          basePrototype = ClassHandle.prototype;
        }
        var constructor = createNamedFunction(name, function (...args) {
          if (Object.getPrototypeOf(this) !== instancePrototype) {
            throw new BindingError(`Use 'new' to construct ${name}`);
          }
          if (undefined === registeredClass.constructor_body) {
            throw new BindingError(`${name} has no accessible constructor`);
          }
          var body = registeredClass.constructor_body[args.length];
          if (undefined === body) {
            throw new BindingError(
              `Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`
            );
          }
          return body.apply(this, args);
        });
        var instancePrototype = Object.create(basePrototype, {
          constructor: { value: constructor },
        });
        constructor.prototype = instancePrototype;
        var registeredClass = new RegisteredClass(
          name,
          constructor,
          instancePrototype,
          rawDestructor,
          baseClass,
          getActualType,
          upcast,
          downcast
        );
        if (registeredClass.baseClass) {
          registeredClass.baseClass.__derivedClasses ??= [];
          registeredClass.baseClass.__derivedClasses.push(registeredClass);
        }
        var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
        var pointerConverter = new RegisteredPointer(
          name + '*',
          registeredClass,
          false,
          false,
          false
        );
        var constPointerConverter = new RegisteredPointer(
          name + ' const*',
          registeredClass,
          false,
          true,
          false
        );
        registeredPointers[rawType] = {
          pointerType: pointerConverter,
          constPointerType: constPointerConverter,
        };
        replacePublicSymbol(legalFunctionName, constructor);
        return [referenceConverter, pointerConverter, constPointerConverter];
      }
    );
  };
  var heap32VectorToArray = (count, firstElement) => {
    var array = [];
    for (var i = 0; i < count; i++) {
      array.push((growMemViews(), HEAPU32)[(firstElement + i * 4) >> 2]);
    }
    return array;
  };
  function usesDestructorStack(argTypes) {
    for (var i = 1; i < argTypes.length; ++i) {
      if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
        return true;
      }
    }
    return false;
  }
  function checkArgCount(numArgs, minArgs, maxArgs, humanName, throwBindingError) {
    if (numArgs < minArgs || numArgs > maxArgs) {
      var argCountMessage = minArgs == maxArgs ? minArgs : `${minArgs} to ${maxArgs}`;
      throwBindingError(
        `function ${humanName} called with ${numArgs} arguments, expected ${argCountMessage}`
      );
    }
  }
  function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
    var needsDestructorStack = usesDestructorStack(argTypes);
    var argCount = argTypes.length - 2;
    var argsList = [];
    var argsListWired = ['fn'];
    if (isClassMethodFunc) {
      argsListWired.push('thisWired');
    }
    for (var i = 0; i < argCount; ++i) {
      argsList.push(`arg${i}`);
      argsListWired.push(`arg${i}Wired`);
    }
    argsList = argsList.join(',');
    argsListWired = argsListWired.join(',');
    var invokerFnBody = `return function (${argsList}) {\n`;
    invokerFnBody +=
      'checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n';
    if (needsDestructorStack) {
      invokerFnBody += 'var destructors = [];\n';
    }
    var dtorStack = needsDestructorStack ? 'destructors' : 'null';
    var args1 = [
      'humanName',
      'throwBindingError',
      'invoker',
      'fn',
      'runDestructors',
      'fromRetWire',
      'toClassParamWire',
    ];
    if (isClassMethodFunc) {
      invokerFnBody += `var thisWired = toClassParamWire(${dtorStack}, this);\n`;
    }
    for (var i = 0; i < argCount; ++i) {
      var argName = `toArg${i}Wire`;
      invokerFnBody += `var arg${i}Wired = ${argName}(${dtorStack}, arg${i});\n`;
      args1.push(argName);
    }
    invokerFnBody += (returns || isAsync ? 'var rv = ' : '') + `invoker(${argsListWired});\n`;
    if (needsDestructorStack) {
      invokerFnBody += 'runDestructors(destructors);\n';
    } else {
      for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
        var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
        if (argTypes[i].destructorFunction !== null) {
          invokerFnBody += `${paramName}_dtor(${paramName});\n`;
          args1.push(`${paramName}_dtor`);
        }
      }
    }
    if (returns) {
      invokerFnBody += 'var ret = fromRetWire(rv);\n' + 'return ret;\n';
    } else {
    }
    invokerFnBody += '}\n';
    args1.push('checkArgCount', 'minArgs', 'maxArgs');
    invokerFnBody = `if (arguments.length !== ${args1.length}){ throw new Error(humanName + "Expected ${args1.length} closure arguments " + arguments.length + " given."); }\n${invokerFnBody}`;
    return new Function(args1, invokerFnBody);
  }
  function getRequiredArgCount(argTypes) {
    var requiredArgCount = argTypes.length - 2;
    for (var i = argTypes.length - 1; i >= 2; --i) {
      if (!argTypes[i].optional) {
        break;
      }
      requiredArgCount--;
    }
    return requiredArgCount;
  }
  function craftInvokerFunction(
    humanName,
    argTypes,
    classType,
    cppInvokerFunc,
    cppTargetFunc,
    isAsync
  ) {
    var argCount = argTypes.length;
    if (argCount < 2) {
      throwBindingError(
        "argTypes array size mismatch! Must at least get return value and 'this' types!"
      );
    }
    assert(!isAsync, 'Async bindings are only supported with JSPI.');
    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
    var needsDestructorStack = usesDestructorStack(argTypes);
    var returns = !argTypes[0].isVoid;
    var expectedArgCount = argCount - 2;
    var minArgs = getRequiredArgCount(argTypes);
    var retType = argTypes[0];
    var instType = argTypes[1];
    var closureArgs = [
      humanName,
      throwBindingError,
      cppInvokerFunc,
      cppTargetFunc,
      runDestructors,
      retType.fromWireType.bind(retType),
      instType?.toWireType.bind(instType),
    ];
    for (var i = 2; i < argCount; ++i) {
      var argType = argTypes[i];
      closureArgs.push(argType.toWireType.bind(argType));
    }
    if (!needsDestructorStack) {
      for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
        if (argTypes[i].destructorFunction !== null) {
          closureArgs.push(argTypes[i].destructorFunction);
        }
      }
    }
    closureArgs.push(checkArgCount, minArgs, expectedArgCount);
    let invokerFactory = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
    var invokerFn = invokerFactory(...closureArgs);
    return createNamedFunction(humanName, invokerFn);
  }
  var __embind_register_class_constructor = (
    rawClassType,
    argCount,
    rawArgTypesAddr,
    invokerSignature,
    invoker,
    rawConstructor
  ) => {
    assert(argCount > 0);
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = embind__requireFunction(invokerSignature, invoker);
    whenDependentTypesAreResolved([], [rawClassType], (classType) => {
      classType = classType[0];
      var humanName = `constructor ${classType.name}`;
      if (undefined === classType.registeredClass.constructor_body) {
        classType.registeredClass.constructor_body = [];
      }
      if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
        throw new BindingError(
          `Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`
        );
      }
      classType.registeredClass.constructor_body[argCount - 1] = () => {
        throwUnboundTypeError(
          `Cannot construct ${classType.name} due to unbound types`,
          rawArgTypes
        );
      };
      whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
        argTypes.splice(1, 0, null);
        classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(
          humanName,
          argTypes,
          null,
          invoker,
          rawConstructor
        );
        return [];
      });
      return [];
    });
  };
  var getFunctionName = (signature) => {
    signature = signature.trim();
    const argsIndex = signature.indexOf('(');
    if (argsIndex === -1) return signature;
    assert(signature.endsWith(')'), 'Parentheses for argument names should match.');
    return signature.slice(0, argsIndex);
  };
  var __embind_register_class_function = (
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr,
    invokerSignature,
    rawInvoker,
    context,
    isPureVirtual,
    isAsync,
    isNonnullReturn
  ) => {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = AsciiToString(methodName);
    methodName = getFunctionName(methodName);
    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker, isAsync);
    whenDependentTypesAreResolved([], [rawClassType], (classType) => {
      classType = classType[0];
      var humanName = `${classType.name}.${methodName}`;
      if (methodName.startsWith('@@')) {
        methodName = Symbol[methodName.substring(2)];
      }
      if (isPureVirtual) {
        classType.registeredClass.pureVirtualFunctions.push(methodName);
      }
      function unboundTypesHandler() {
        throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
      }
      var proto = classType.registeredClass.instancePrototype;
      var method = proto[methodName];
      if (
        undefined === method ||
        (undefined === method.overloadTable &&
          method.className !== classType.name &&
          method.argCount === argCount - 2)
      ) {
        unboundTypesHandler.argCount = argCount - 2;
        unboundTypesHandler.className = classType.name;
        proto[methodName] = unboundTypesHandler;
      } else {
        ensureOverloadTable(proto, methodName, humanName);
        proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
      }
      whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
        var memberFunction = craftInvokerFunction(
          humanName,
          argTypes,
          classType,
          rawInvoker,
          context,
          isAsync
        );
        if (undefined === proto[methodName].overloadTable) {
          memberFunction.argCount = argCount - 2;
          proto[methodName] = memberFunction;
        } else {
          proto[methodName].overloadTable[argCount - 2] = memberFunction;
        }
        return [];
      });
      return [];
    });
  };
  var emval_freelist = [];
  var emval_handles = [0, 1, , 1, null, 1, true, 1, false, 1];
  var __emval_decref = (handle) => {
    if (handle > 9 && 0 === --emval_handles[handle + 1]) {
      assert(emval_handles[handle] !== undefined, `Decref for unallocated handle.`);
      emval_handles[handle] = undefined;
      emval_freelist.push(handle);
    }
  };
  var Emval = {
    toValue: (handle) => {
      if (!handle) {
        throwBindingError(`Cannot use deleted val. handle = ${handle}`);
      }
      assert(
        handle === 2 || (emval_handles[handle] !== undefined && handle % 2 === 0),
        `invalid handle: ${handle}`
      );
      return emval_handles[handle];
    },
    toHandle: (value) => {
      switch (value) {
        case undefined:
          return 2;
        case null:
          return 4;
        case true:
          return 6;
        case false:
          return 8;
        default: {
          const handle = emval_freelist.pop() || emval_handles.length;
          emval_handles[handle] = value;
          emval_handles[handle + 1] = 1;
          return handle;
        }
      }
    },
  };
  var EmValType = {
    name: 'emscripten::val',
    fromWireType: (handle) => {
      var rv = Emval.toValue(handle);
      __emval_decref(handle);
      return rv;
    },
    toWireType: (destructors, value) => Emval.toHandle(value),
    readValueFromPointer: readPointer,
    destructorFunction: null,
  };
  var __embind_register_emval = (rawType) => registerType(rawType, EmValType);
  var floatReadValueFromPointer = (name, width) => {
    switch (width) {
      case 4:
        return function (pointer) {
          return this.fromWireType((growMemViews(), HEAPF32)[pointer >> 2]);
        };
      case 8:
        return function (pointer) {
          return this.fromWireType((growMemViews(), HEAPF64)[pointer >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${width}): ${name}`);
    }
  };
  var __embind_register_float = (rawType, name, size) => {
    name = AsciiToString(name);
    registerType(rawType, {
      name,
      fromWireType: (value) => value,
      toWireType: (destructors, value) => {
        if (typeof value != 'number' && typeof value != 'boolean') {
          throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
        }
        return value;
      },
      readValueFromPointer: floatReadValueFromPointer(name, size),
      destructorFunction: null,
    });
  };
  var __embind_register_function = (
    name,
    argCount,
    rawArgTypesAddr,
    signature,
    rawInvoker,
    fn,
    isAsync,
    isNonnullReturn
  ) => {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = AsciiToString(name);
    name = getFunctionName(name);
    rawInvoker = embind__requireFunction(signature, rawInvoker, isAsync);
    exposePublicSymbol(
      name,
      function () {
        throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
      },
      argCount - 1
    );
    whenDependentTypesAreResolved([], argTypes, (argTypes) => {
      var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
      replacePublicSymbol(
        name,
        craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn, isAsync),
        argCount - 1
      );
      return [];
    });
  };
  var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
    name = AsciiToString(name);
    const isUnsignedType = minRange === 0;
    let fromWireType = (value) => value;
    if (isUnsignedType) {
      var bitshift = 32 - 8 * size;
      fromWireType = (value) => (value << bitshift) >>> bitshift;
      maxRange = fromWireType(maxRange);
    }
    registerType(primitiveType, {
      name,
      fromWireType,
      toWireType: (destructors, value) => {
        if (typeof value != 'number' && typeof value != 'boolean') {
          throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${name}`);
        }
        assertIntegerRange(name, value, minRange, maxRange);
        return value;
      },
      readValueFromPointer: integerReadValueFromPointer(name, size, minRange !== 0),
      destructorFunction: null,
    });
  };
  var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
    var typeMapping = [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      BigInt64Array,
      BigUint64Array,
    ];
    var TA = typeMapping[dataTypeIndex];
    function decodeMemoryView(handle) {
      var size = (growMemViews(), HEAPU32)[handle >> 2];
      var data = (growMemViews(), HEAPU32)[(handle + 4) >> 2];
      return new TA((growMemViews(), HEAP8).buffer, data, size);
    }
    name = AsciiToString(name);
    registerType(
      rawType,
      { name, fromWireType: decodeMemoryView, readValueFromPointer: decodeMemoryView },
      { ignoreDuplicateRegistrations: true }
    );
  };
  var EmValOptionalType = Object.assign({ optional: true }, EmValType);
  var __embind_register_optional = (rawOptionalType, rawType) => {
    registerType(rawOptionalType, EmValOptionalType);
  };
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
      var u = str.codePointAt(i);
      if (u <= 127) {
        if (outIdx >= endIdx) break;
        heap[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break;
        heap[outIdx++] = 192 | (u >> 6);
        heap[outIdx++] = 128 | (u & 63);
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break;
        heap[outIdx++] = 224 | (u >> 12);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      } else {
        if (outIdx + 3 >= endIdx) break;
        if (u > 1114111)
          warnOnce(
            'Invalid Unicode code point ' +
              ptrToString(u) +
              ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
          );
        heap[outIdx++] = 240 | (u >> 18);
        heap[outIdx++] = 128 | ((u >> 12) & 63);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
        i++;
      }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
  };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
    assert(
      typeof maxBytesToWrite == 'number',
      'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
    );
    return stringToUTF8Array(str, (growMemViews(), HEAPU8), outPtr, maxBytesToWrite);
  };
  var lengthBytesUTF8 = (str) => {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      var c = str.charCodeAt(i);
      if (c <= 127) {
        len++;
      } else if (c <= 2047) {
        len += 2;
      } else if (c >= 55296 && c <= 57343) {
        len += 4;
        ++i;
      } else {
        len += 3;
      }
    }
    return len;
  };
  var __embind_register_std_string = (rawType, name) => {
    name = AsciiToString(name);
    var stdStringIsUTF8 = true;
    registerType(rawType, {
      name,
      fromWireType(value) {
        var length = (growMemViews(), HEAPU32)[value >> 2];
        var payload = value + 4;
        var str;
        if (stdStringIsUTF8) {
          str = UTF8ToString(payload, length, true);
        } else {
          str = '';
          for (var i = 0; i < length; ++i) {
            str += String.fromCharCode((growMemViews(), HEAPU8)[payload + i]);
          }
        }
        _free(value);
        return str;
      },
      toWireType(destructors, value) {
        if (value instanceof ArrayBuffer) {
          value = new Uint8Array(value);
        }
        var length;
        var valueIsOfTypeString = typeof value == 'string';
        if (!(valueIsOfTypeString || (ArrayBuffer.isView(value) && value.BYTES_PER_ELEMENT == 1))) {
          throwBindingError('Cannot pass non-string to std::string');
        }
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          length = lengthBytesUTF8(value);
        } else {
          length = value.length;
        }
        var base = _malloc(4 + length + 1);
        var ptr = base + 4;
        (growMemViews(), HEAPU32)[base >> 2] = length;
        if (valueIsOfTypeString) {
          if (stdStringIsUTF8) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            for (var i = 0; i < length; ++i) {
              var charCode = value.charCodeAt(i);
              if (charCode > 255) {
                _free(base);
                throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
              }
              (growMemViews(), HEAPU8)[ptr + i] = charCode;
            }
          }
        } else {
          (growMemViews(), HEAPU8).set(value, ptr);
        }
        if (destructors !== null) {
          destructors.push(_free, base);
        }
        return base;
      },
      readValueFromPointer: readPointer,
      destructorFunction(ptr) {
        _free(ptr);
      },
    });
  };
  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
  var UTF16ToString = (ptr, maxBytesToRead, ignoreNul) => {
    assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
    var idx = ptr >> 1;
    var endIdx = findStringEnd((growMemViews(), HEAPU16), idx, maxBytesToRead / 2, ignoreNul);
    if (endIdx - idx > 16 && UTF16Decoder)
      return UTF16Decoder.decode(
        (growMemViews(), HEAPU16).buffer instanceof ArrayBuffer
          ? (growMemViews(), HEAPU16).subarray(idx, endIdx)
          : (growMemViews(), HEAPU16).slice(idx, endIdx)
      );
    var str = '';
    for (var i = idx; i < endIdx; ++i) {
      var codeUnit = (growMemViews(), HEAPU16)[i];
      str += String.fromCharCode(codeUnit);
    }
    return str;
  };
  var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
    assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
    assert(
      typeof maxBytesToWrite == 'number',
      'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
    );
    maxBytesToWrite ??= 2147483647;
    if (maxBytesToWrite < 2) return 0;
    maxBytesToWrite -= 2;
    var startPtr = outPtr;
    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
    for (var i = 0; i < numCharsToWrite; ++i) {
      var codeUnit = str.charCodeAt(i);
      (growMemViews(), HEAP16)[outPtr >> 1] = codeUnit;
      outPtr += 2;
    }
    (growMemViews(), HEAP16)[outPtr >> 1] = 0;
    return outPtr - startPtr;
  };
  var lengthBytesUTF16 = (str) => str.length * 2;
  var UTF32ToString = (ptr, maxBytesToRead, ignoreNul) => {
    assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
    var str = '';
    var startIdx = ptr >> 2;
    for (var i = 0; !(i >= maxBytesToRead / 4); i++) {
      var utf32 = (growMemViews(), HEAPU32)[startIdx + i];
      if (!utf32 && !ignoreNul) break;
      str += String.fromCodePoint(utf32);
    }
    return str;
  };
  var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
    assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
    assert(
      typeof maxBytesToWrite == 'number',
      'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
    );
    maxBytesToWrite ??= 2147483647;
    if (maxBytesToWrite < 4) return 0;
    var startPtr = outPtr;
    var endPtr = startPtr + maxBytesToWrite - 4;
    for (var i = 0; i < str.length; ++i) {
      var codePoint = str.codePointAt(i);
      if (codePoint > 65535) {
        i++;
      }
      (growMemViews(), HEAP32)[outPtr >> 2] = codePoint;
      outPtr += 4;
      if (outPtr + 4 > endPtr) break;
    }
    (growMemViews(), HEAP32)[outPtr >> 2] = 0;
    return outPtr - startPtr;
  };
  var lengthBytesUTF32 = (str) => {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      var codePoint = str.codePointAt(i);
      if (codePoint > 65535) {
        i++;
      }
      len += 4;
    }
    return len;
  };
  var __embind_register_std_wstring = (rawType, charSize, name) => {
    name = AsciiToString(name);
    var decodeString, encodeString, lengthBytesUTF;
    if (charSize === 2) {
      decodeString = UTF16ToString;
      encodeString = stringToUTF16;
      lengthBytesUTF = lengthBytesUTF16;
    } else {
      assert(charSize === 4, 'only 2-byte and 4-byte strings are currently supported');
      decodeString = UTF32ToString;
      encodeString = stringToUTF32;
      lengthBytesUTF = lengthBytesUTF32;
    }
    registerType(rawType, {
      name,
      fromWireType: (value) => {
        var length = (growMemViews(), HEAPU32)[value >> 2];
        var str = decodeString(value + 4, length * charSize, true);
        _free(value);
        return str;
      },
      toWireType: (destructors, value) => {
        if (!(typeof value == 'string')) {
          throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
        }
        var length = lengthBytesUTF(value);
        var ptr = _malloc(4 + length + charSize);
        (growMemViews(), HEAPU32)[ptr >> 2] = length / charSize;
        encodeString(value, ptr + 4, length + charSize);
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      },
      readValueFromPointer: readPointer,
      destructorFunction(ptr) {
        _free(ptr);
      },
    });
  };
  var __embind_register_value_object = (
    rawType,
    name,
    constructorSignature,
    rawConstructor,
    destructorSignature,
    rawDestructor
  ) => {
    structRegistrations[rawType] = {
      name: AsciiToString(name),
      rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
      rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
      fields: [],
    };
  };
  var __embind_register_value_object_field = (
    structType,
    fieldName,
    getterReturnType,
    getterSignature,
    getter,
    getterContext,
    setterArgumentType,
    setterSignature,
    setter,
    setterContext
  ) => {
    structRegistrations[structType].fields.push({
      fieldName: AsciiToString(fieldName),
      getterReturnType,
      getter: embind__requireFunction(getterSignature, getter),
      getterContext,
      setterArgumentType,
      setter: embind__requireFunction(setterSignature, setter),
      setterContext,
    });
  };
  var __embind_register_void = (rawType, name) => {
    name = AsciiToString(name);
    registerType(rawType, {
      isVoid: true,
      name,
      fromWireType: () => undefined,
      toWireType: (destructors, o) => undefined,
    });
  };
  var __emscripten_init_main_thread_js = (tb) => {
    __emscripten_thread_init(tb, !ENVIRONMENT_IS_WORKER, 1, !ENVIRONMENT_IS_WEB, 65536, false);
    PThread.threadInitTLS();
  };
  var __emscripten_thread_mailbox_await = (pthread_ptr) => {
    if (typeof Atomics.waitAsync === 'function') {
      var wait = Atomics.waitAsync((growMemViews(), HEAP32), pthread_ptr >> 2, pthread_ptr);
      assert(wait.async);
      wait.value.then(checkMailbox);
      var waitingAsync = pthread_ptr + 128;
      Atomics.store((growMemViews(), HEAP32), waitingAsync >> 2, 1);
    }
  };
  var checkMailbox = () =>
    callUserCallback(() => {
      var pthread_ptr = _pthread_self();
      if (pthread_ptr) {
        __emscripten_thread_mailbox_await(pthread_ptr);
        __emscripten_check_mailbox();
      }
    });
  var __emscripten_notify_mailbox_postmessage = (targetThread, currThreadId) => {
    if (targetThread == currThreadId) {
      setTimeout(checkMailbox);
    } else if (ENVIRONMENT_IS_PTHREAD) {
      postMessage({ targetThread, cmd: 'checkMailbox' });
    } else {
      var worker = PThread.pthreads[targetThread];
      if (!worker) {
        err(`Cannot send message to thread with ID ${targetThread}, unknown thread ID!`);
        return;
      }
      worker.postMessage({ cmd: 'checkMailbox' });
    }
  };
  var proxiedJSCallArgs = [];
  var __emscripten_receive_on_main_thread_js = (
    funcIndex,
    emAsmAddr,
    callingThread,
    numCallArgs,
    args
  ) => {
    numCallArgs /= 2;
    proxiedJSCallArgs.length = numCallArgs;
    var b = args >> 3;
    for (var i = 0; i < numCallArgs; i++) {
      if ((growMemViews(), HEAP64)[b + 2 * i]) {
        proxiedJSCallArgs[i] = (growMemViews(), HEAP64)[b + 2 * i + 1];
      } else {
        proxiedJSCallArgs[i] = (growMemViews(), HEAPF64)[b + 2 * i + 1];
      }
    }
    assert(!emAsmAddr);
    var func = proxiedFunctionTable[funcIndex];
    assert(!(funcIndex && emAsmAddr));
    assert(
      func.length == numCallArgs,
      'Call args mismatch in _emscripten_receive_on_main_thread_js'
    );
    PThread.currentProxiedOperationCallerThread = callingThread;
    var rtn = func(...proxiedJSCallArgs);
    PThread.currentProxiedOperationCallerThread = 0;
    assert(typeof rtn != 'bigint');
    return rtn;
  };
  var __emscripten_thread_cleanup = (thread) => {
    if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
    else postMessage({ cmd: 'cleanupThread', thread });
  };
  var __emscripten_thread_set_strongref = (thread) => {};
  var __emscripten_throw_longjmp = () => {
    throw new EmscriptenSjLj();
  };
  var emval_methodCallers = [];
  var emval_addMethodCaller = (caller) => {
    var id = emval_methodCallers.length;
    emval_methodCallers.push(caller);
    return id;
  };
  var requireRegisteredType = (rawType, humanName) => {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
      throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
    }
    return impl;
  };
  var emval_lookupTypes = (argCount, argTypes) => {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
      a[i] = requireRegisteredType(
        (growMemViews(), HEAPU32)[(argTypes + i * 4) >> 2],
        `parameter ${i}`
      );
    }
    return a;
  };
  var emval_returnValue = (toReturnWire, destructorsRef, handle) => {
    var destructors = [];
    var result = toReturnWire(destructors, handle);
    if (destructors.length) {
      (growMemViews(), HEAPU32)[destructorsRef >> 2] = Emval.toHandle(destructors);
    }
    return result;
  };
  var emval_symbols = {};
  var getStringOrSymbol = (address) => {
    var symbol = emval_symbols[address];
    if (symbol === undefined) {
      return AsciiToString(address);
    }
    return symbol;
  };
  var __emval_create_invoker = (argCount, argTypesPtr, kind) => {
    var GenericWireTypeSize = 8;
    var [retType, ...argTypes] = emval_lookupTypes(argCount, argTypesPtr);
    var toReturnWire = retType.toWireType.bind(retType);
    var argFromPtr = argTypes.map((type) => type.readValueFromPointer.bind(type));
    argCount--;
    var captures = { toValue: Emval.toValue };
    var args = argFromPtr.map((argFromPtr, i) => {
      var captureName = `argFromPtr${i}`;
      captures[captureName] = argFromPtr;
      return `${captureName}(args${i ? '+' + i * GenericWireTypeSize : ''})`;
    });
    var functionBody;
    switch (kind) {
      case 0:
        functionBody = 'toValue(handle)';
        break;
      case 2:
        functionBody = 'new (toValue(handle))';
        break;
      case 3:
        functionBody = '';
        break;
      case 1:
        captures['getStringOrSymbol'] = getStringOrSymbol;
        functionBody = 'toValue(handle)[getStringOrSymbol(methodName)]';
        break;
    }
    functionBody += `(${args})`;
    if (!retType.isVoid) {
      captures['toReturnWire'] = toReturnWire;
      captures['emval_returnValue'] = emval_returnValue;
      functionBody = `return emval_returnValue(toReturnWire, destructorsRef, ${functionBody})`;
    }
    functionBody = `return function (handle, methodName, destructorsRef, args) {\n  ${functionBody}\n  }`;
    var invokerFunction = new Function(Object.keys(captures), functionBody)(
      ...Object.values(captures)
    );
    var functionName = `methodCaller<(${argTypes.map((t) => t.name)}) => ${retType.name}>`;
    return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction));
  };
  var __emval_invoke = (caller, handle, methodName, destructorsRef, args) =>
    emval_methodCallers[caller](handle, methodName, destructorsRef, args);
  var __emval_run_destructors = (handle) => {
    var destructors = Emval.toValue(handle);
    runDestructors(destructors);
    __emval_decref(handle);
  };
  var __tzset_js = (timezone, daylight, std_name, dst_name) => {
    var currentYear = new Date().getFullYear();
    var winter = new Date(currentYear, 0, 1);
    var summer = new Date(currentYear, 6, 1);
    var winterOffset = winter.getTimezoneOffset();
    var summerOffset = summer.getTimezoneOffset();
    var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
    (growMemViews(), HEAPU32)[timezone >> 2] = stdTimezoneOffset * 60;
    (growMemViews(), HEAP32)[daylight >> 2] = Number(winterOffset != summerOffset);
    var extractZone = (timezoneOffset) => {
      var sign = timezoneOffset >= 0 ? '-' : '+';
      var absOffset = Math.abs(timezoneOffset);
      var hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
      var minutes = String(absOffset % 60).padStart(2, '0');
      return `UTC${sign}${hours}${minutes}`;
    };
    var winterName = extractZone(winterOffset);
    var summerName = extractZone(summerOffset);
    assert(winterName);
    assert(summerName);
    assert(
      lengthBytesUTF8(winterName) <= 16,
      `timezone name truncated to fit in TZNAME_MAX (${winterName})`
    );
    assert(
      lengthBytesUTF8(summerName) <= 16,
      `timezone name truncated to fit in TZNAME_MAX (${summerName})`
    );
    if (summerOffset < winterOffset) {
      stringToUTF8(winterName, std_name, 17);
      stringToUTF8(summerName, dst_name, 17);
    } else {
      stringToUTF8(winterName, dst_name, 17);
      stringToUTF8(summerName, std_name, 17);
    }
  };
  var _emscripten_get_now = () => performance.timeOrigin + performance.now();
  var _emscripten_date_now = () => Date.now();
  var nowIsMonotonic = 1;
  var checkWasiClock = (clock_id) => clock_id >= 0 && clock_id <= 3;
  var INT53_MAX = 9007199254740992;
  var INT53_MIN = -9007199254740992;
  var bigintToI53Checked = (num) => (num < INT53_MIN || num > INT53_MAX ? NaN : Number(num));
  function _clock_time_get(clk_id, ignored_precision, ptime) {
    ignored_precision = bigintToI53Checked(ignored_precision);
    if (!checkWasiClock(clk_id)) {
      return 28;
    }
    var now;
    if (clk_id === 0) {
      now = _emscripten_date_now();
    } else if (nowIsMonotonic) {
      now = _emscripten_get_now();
    } else {
      return 52;
    }
    var nsec = Math.round(now * 1e3 * 1e3);
    (growMemViews(), HEAP64)[ptime >> 3] = BigInt(nsec);
    return 0;
  }
  var _emscripten_check_blocking_allowed = () => {
    if (ENVIRONMENT_IS_WORKER) return;
    warnOnce(
      'Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread'
    );
  };
  var _emscripten_exit_with_live_runtime = () => {
    runtimeKeepalivePush();
    throw 'unwind';
  };
  var jsStackTrace = () => new Error().stack.toString();
  var getCallstack = (flags) => {
    var callstack = jsStackTrace();
    if (flags & 8) {
      warnOnce('emscripten_log with EM_LOG_C_STACK no longer has any effect');
    }
    var lines = callstack.split('\n');
    callstack = '';
    var firefoxRe = new RegExp('\\s*(.*?)@(.*?):([0-9]+):([0-9]+)');
    var chromeRe = new RegExp('\\s*at (.*?) \\((.*):(.*):(.*)\\)');
    for (var line of lines) {
      var symbolName = '';
      var file = '';
      var lineno = 0;
      var column = 0;
      var parts = chromeRe.exec(line);
      if (parts?.length == 5) {
        symbolName = parts[1];
        file = parts[2];
        lineno = parts[3];
        column = parts[4];
      } else {
        parts = firefoxRe.exec(line);
        if (parts?.length >= 4) {
          symbolName = parts[1];
          file = parts[2];
          lineno = parts[3];
          column = parts[4] | 0;
        } else {
          callstack += line + '\n';
          continue;
        }
      }
      if (symbolName == '_emscripten_log' || symbolName == '_emscripten_get_callstack') {
        callstack = '';
        continue;
      }
      if (flags & 24) {
        if (flags & 64) {
          file = file.substring(file.replace(/\\/g, '/').lastIndexOf('/') + 1);
        }
        callstack += `    at ${symbolName} (${file}:${lineno}:${column})\n`;
      }
    }
    callstack = callstack.replace(/\s+$/, '');
    return callstack;
  };
  var _emscripten_get_callstack = (flags, str, maxbytes) => {
    var callstack = getCallstack(flags);
    if (!str || maxbytes <= 0) {
      return lengthBytesUTF8(callstack) + 1;
    }
    var bytesWrittenExcludingNull = stringToUTF8(callstack, str, maxbytes);
    return bytesWrittenExcludingNull + 1;
  };
  var getHeapMax = () => 2147483648;
  var _emscripten_get_heap_max = () => getHeapMax();
  var _emscripten_num_logical_cores = () => navigator['hardwareConcurrency'];
  var alignMemory = (size, alignment) => {
    assert(alignment, 'alignment argument is required');
    return Math.ceil(size / alignment) * alignment;
  };
  var growMemory = (size) => {
    var oldHeapSize = wasmMemory.buffer.byteLength;
    var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {
      err(
        `growMemory: Attempted to grow heap from ${oldHeapSize} bytes to ${size} bytes, but got error: ${e}`
      );
    }
  };
  var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = (growMemViews(), HEAPU8).length;
    requestedSize >>>= 0;
    if (requestedSize <= oldSize) {
      return false;
    }
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      err(
        `Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`
      );
      return false;
    }
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
      var newSize = Math.min(
        maxHeapSize,
        alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536)
      );
      var replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
    return false;
  };
  var ENV = {};
  var getExecutableName = () => thisProgram || './this.program';
  var getEnvStrings = () => {
    if (!getEnvStrings.strings) {
      var lang =
        ((typeof navigator == 'object' && navigator.language) || 'C').replace('-', '_') + '.UTF-8';
      var env = {
        USER: 'web_user',
        LOGNAME: 'web_user',
        PATH: '/',
        PWD: '/',
        HOME: '/home/web_user',
        LANG: lang,
        _: getExecutableName(),
      };
      for (var x in ENV) {
        if (ENV[x] === undefined) delete env[x];
        else env[x] = ENV[x];
      }
      var strings = [];
      for (var x in env) {
        strings.push(`${x}=${env[x]}`);
      }
      getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
  };
  function _environ_get(__environ, environ_buf) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, __environ, environ_buf);
    var bufSize = 0;
    var envp = 0;
    for (var string of getEnvStrings()) {
      var ptr = environ_buf + bufSize;
      (growMemViews(), HEAPU32)[(__environ + envp) >> 2] = ptr;
      bufSize += stringToUTF8(string, ptr, Infinity) + 1;
      envp += 4;
    }
    return 0;
  }
  function _environ_sizes_get(penviron_count, penviron_buf_size) {
    if (ENVIRONMENT_IS_PTHREAD)
      return proxyToMainThread(13, 0, 1, penviron_count, penviron_buf_size);
    var strings = getEnvStrings();
    (growMemViews(), HEAPU32)[penviron_count >> 2] = strings.length;
    var bufSize = 0;
    for (var string of strings) {
      bufSize += lengthBytesUTF8(string) + 1;
    }
    (growMemViews(), HEAPU32)[penviron_buf_size >> 2] = bufSize;
    return 0;
  }
  function _fd_close(fd) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, fd);
    abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function _fd_read(fd, iov, iovcnt, pnum) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, fd, iov, iovcnt, pnum);
    abort('fd_read called without SYSCALLS_REQUIRE_FILESYSTEM');
  }
  function _fd_seek(fd, offset, whence, newOffset) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 0, 1, fd, offset, whence, newOffset);
    offset = bigintToI53Checked(offset);
    return 70;
  }
  var printCharBuffers = [null, [], []];
  var printChar = (stream, curr) => {
    var buffer = printCharBuffers[stream];
    assert(buffer);
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  };
  var flush_NO_FILESYSTEM = () => {
    _fflush(0);
    if (printCharBuffers[1].length) printChar(1, 10);
    if (printCharBuffers[2].length) printChar(2, 10);
  };
  function _fd_write(fd, iov, iovcnt, pnum) {
    if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 0, 1, fd, iov, iovcnt, pnum);
    var num = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = (growMemViews(), HEAPU32)[iov >> 2];
      var len = (growMemViews(), HEAPU32)[(iov + 4) >> 2];
      iov += 8;
      for (var j = 0; j < len; j++) {
        printChar(fd, (growMemViews(), HEAPU8)[ptr + j]);
      }
      num += len;
    }
    (growMemViews(), HEAPU32)[pnum >> 2] = num;
    return 0;
  }
  var _llvm_eh_typeid_for = (type) => type;
  var uleb128EncodeWithLen = (arr) => {
    const n = arr.length;
    assert(n < 16384);
    return [n % 128 | 128, n >> 7, ...arr];
  };
  var wasmTypeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
  var generateTypePack = (types) =>
    uleb128EncodeWithLen(
      Array.from(types, (type) => {
        var code = wasmTypeCodes[type];
        assert(code, `invalid signature char: ${type}`);
        return code;
      })
    );
  var convertJsFunctionToWasm = (func, sig) => {
    var bytes = Uint8Array.of(
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      ...uleb128EncodeWithLen([
        1,
        96,
        ...generateTypePack(sig.slice(1)),
        ...generateTypePack(sig[0] === 'v' ? '' : sig[0]),
      ]),
      2,
      7,
      1,
      1,
      101,
      1,
      102,
      0,
      0,
      7,
      5,
      1,
      1,
      102,
      0,
      0
    );
    var module = new WebAssembly.Module(bytes);
    var instance = new WebAssembly.Instance(module, { e: { f: func } });
    var wrappedFunc = instance.exports['f'];
    return wrappedFunc;
  };
  var updateTableMap = (offset, count) => {
    if (functionsInTableMap) {
      for (var i = offset; i < offset + count; i++) {
        var item = getWasmTableEntry(i);
        if (item) {
          functionsInTableMap.set(item, i);
        }
      }
    }
  };
  var functionsInTableMap;
  var getFunctionAddress = (func) => {
    if (!functionsInTableMap) {
      functionsInTableMap = new WeakMap();
      updateTableMap(0, wasmTable.length);
    }
    return functionsInTableMap.get(func) || 0;
  };
  var freeTableIndexes = [];
  var getEmptyTableSlot = () => {
    if (freeTableIndexes.length) {
      return freeTableIndexes.pop();
    }
    try {
      return wasmTable['grow'](1);
    } catch (err) {
      if (!(err instanceof RangeError)) {
        throw err;
      }
      throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
    }
  };
  var setWasmTableEntry = (idx, func) => {
    wasmTable.set(idx, func);
    wasmTableMirror[idx] = wasmTable.get(idx);
  };
  var addFunction = (func, sig) => {
    assert(typeof func != 'undefined');
    var rtn = getFunctionAddress(func);
    if (rtn) {
      return rtn;
    }
    var ret = getEmptyTableSlot();
    try {
      setWasmTableEntry(ret, func);
    } catch (err) {
      if (!(err instanceof TypeError)) {
        throw err;
      }
      assert(typeof sig != 'undefined', 'Missing signature argument to addFunction: ' + func);
      var wrapped = convertJsFunctionToWasm(func, sig);
      setWasmTableEntry(ret, wrapped);
    }
    functionsInTableMap.set(func, ret);
    return ret;
  };
  var removeFunction = (index) => {
    functionsInTableMap.delete(getWasmTableEntry(index));
    setWasmTableEntry(index, null);
    freeTableIndexes.push(index);
  };
  var incrementExceptionRefcount = (ptr) => ___cxa_increment_exception_refcount(ptr);
  var decrementExceptionRefcount = (ptr) => ___cxa_decrement_exception_refcount(ptr);
  var getExceptionMessageCommon = (ptr) => {
    var sp = stackSave();
    var type_addr_addr = stackAlloc(4);
    var message_addr_addr = stackAlloc(4);
    ___get_exception_message(ptr, type_addr_addr, message_addr_addr);
    var type_addr = (growMemViews(), HEAPU32)[type_addr_addr >> 2];
    var message_addr = (growMemViews(), HEAPU32)[message_addr_addr >> 2];
    var type = UTF8ToString(type_addr);
    _free(type_addr);
    var message;
    if (message_addr) {
      message = UTF8ToString(message_addr);
      _free(message_addr);
    }
    stackRestore(sp);
    return [type, message];
  };
  var getExceptionMessage = (ptr) => getExceptionMessageCommon(ptr);
  PThread.init();
  init_ClassHandle();
  init_RegisteredPointer();
  assert(emval_handles.length === 5 * 2);
  {
    initMemory();
    if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
    if (Module['print']) out = Module['print'];
    if (Module['printErr']) err = Module['printErr'];
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    checkIncomingModuleAPI();
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    assert(
      typeof Module['memoryInitializerPrefixURL'] == 'undefined',
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['pthreadMainPrefixURL'] == 'undefined',
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['cdInitializerPrefixURL'] == 'undefined',
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['filePackagePrefixURL'] == 'undefined',
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');
    assert(
      typeof Module['readAsync'] == 'undefined',
      'Module.readAsync option was removed (modify readAsync in JS)'
    );
    assert(
      typeof Module['readBinary'] == 'undefined',
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    assert(
      typeof Module['setWindowTitle'] == 'undefined',
      'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)'
    );
    assert(
      typeof Module['TOTAL_MEMORY'] == 'undefined',
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    );
    assert(
      typeof Module['ENVIRONMENT'] == 'undefined',
      'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
    );
    assert(
      typeof Module['STACK_SIZE'] == 'undefined',
      'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time'
    );
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].shift()();
      }
    }
    consumedModuleProp('preInit');
  }
  Module['addFunction'] = addFunction;
  Module['removeFunction'] = removeFunction;
  Module['UTF8ToString'] = UTF8ToString;
  Module['stringToUTF8'] = stringToUTF8;
  Module['lengthBytesUTF8'] = lengthBytesUTF8;
  var missingLibrarySymbols = [
    'writeI53ToI64',
    'writeI53ToI64Clamped',
    'writeI53ToI64Signaling',
    'writeI53ToU64Clamped',
    'writeI53ToU64Signaling',
    'readI53FromI64',
    'readI53FromU64',
    'convertI32PairToI53',
    'convertI32PairToI53Checked',
    'convertU32PairToI53',
    'getTempRet0',
    'zeroMemory',
    'withStackSave',
    'strError',
    'inetPton4',
    'inetNtop4',
    'inetPton6',
    'inetNtop6',
    'readSockaddr',
    'writeSockaddr',
    'readEmAsmArgs',
    'jstoi_q',
    'autoResumeAudioContext',
    'getDynCaller',
    'dynCall',
    'asyncLoad',
    'asmjsMangle',
    'mmapAlloc',
    'HandleAllocator',
    'getNativeTypeSize',
    'getUniqueRunDependency',
    'addOnInit',
    'addOnPostCtor',
    'addOnPreMain',
    'addOnExit',
    'STACK_SIZE',
    'STACK_ALIGN',
    'POINTER_SIZE',
    'ASSERTIONS',
    'ccall',
    'cwrap',
    'intArrayFromString',
    'intArrayToString',
    'stringToAscii',
    'stringToNewUTF8',
    'stringToUTF8OnStack',
    'writeArrayToMemory',
    'registerKeyEventCallback',
    'maybeCStringToJsString',
    'findEventTarget',
    'getBoundingClientRect',
    'fillMouseEventData',
    'registerMouseEventCallback',
    'registerWheelEventCallback',
    'registerUiEventCallback',
    'registerFocusEventCallback',
    'fillDeviceOrientationEventData',
    'registerDeviceOrientationEventCallback',
    'fillDeviceMotionEventData',
    'registerDeviceMotionEventCallback',
    'screenOrientation',
    'fillOrientationChangeEventData',
    'registerOrientationChangeEventCallback',
    'fillFullscreenChangeEventData',
    'registerFullscreenChangeEventCallback',
    'JSEvents_requestFullscreen',
    'JSEvents_resizeCanvasForFullscreen',
    'registerRestoreOldStyle',
    'hideEverythingExceptGivenElement',
    'restoreHiddenElements',
    'setLetterbox',
    'softFullscreenResizeWebGLRenderTarget',
    'doRequestFullscreen',
    'fillPointerlockChangeEventData',
    'registerPointerlockChangeEventCallback',
    'registerPointerlockErrorEventCallback',
    'requestPointerLock',
    'fillVisibilityChangeEventData',
    'registerVisibilityChangeEventCallback',
    'registerTouchEventCallback',
    'fillGamepadEventData',
    'registerGamepadEventCallback',
    'registerBeforeUnloadEventCallback',
    'fillBatteryEventData',
    'registerBatteryEventCallback',
    'setCanvasElementSizeCallingThread',
    'setCanvasElementSizeMainThread',
    'setCanvasElementSize',
    'getCanvasSizeCallingThread',
    'getCanvasSizeMainThread',
    'getCanvasElementSize',
    'convertPCtoSourceLocation',
    'wasiRightsToMuslOFlags',
    'wasiOFlagsToMuslOFlags',
    'initRandomFill',
    'randomFill',
    'setImmediateWrapped',
    'safeRequestAnimationFrame',
    'clearImmediateWrapped',
    'registerPostMainLoop',
    'registerPreMainLoop',
    'getPromise',
    'makePromise',
    'idsToPromises',
    'makePromiseCallback',
    'Browser_asyncPrepareDataCounter',
    'isLeapYear',
    'ydayFromDate',
    'arraySum',
    'addDays',
    'getSocketFromFD',
    'getSocketAddress',
    'heapObjectForWebGLType',
    'toTypedArrayIndex',
    'emscriptenWebGLGet',
    'computeUnpackAlignedImageSize',
    'colorChannelsInGlTextureFormat',
    'emscriptenWebGLGetTexPixelData',
    'emscriptenWebGLGetUniform',
    'webglGetUniformLocation',
    'webglPrepareUniformLocationsBeforeFirstUse',
    'webglGetLeftBracePos',
    'emscriptenWebGLGetVertexAttrib',
    '__glGetActiveAttribOrUniform',
    'writeGLArray',
    'emscripten_webgl_destroy_context_before_on_calling_thread',
    'registerWebGlEventCallback',
    'runAndAbortIfError',
    'ALLOC_NORMAL',
    'ALLOC_STACK',
    'allocate',
    'writeStringToMemory',
    'writeAsciiToMemory',
    'demangle',
    'stackTrace',
    'getFunctionArgsName',
    'createJsInvokerSignature',
    'PureVirtualError',
    'registerInheritedInstance',
    'unregisterInheritedInstance',
    'getInheritedInstanceCount',
    'getLiveInheritedInstances',
    'enumReadValueFromPointer',
    'setDelayFunction',
    'validateThis',
    'count_emval_handles',
    'emval_get_global',
  ];
  missingLibrarySymbols.forEach(missingLibrarySymbol);
  var unexportedSymbols = [
    'run',
    'out',
    'err',
    'callMain',
    'abort',
    'wasmMemory',
    'wasmExports',
    'HEAPF32',
    'HEAPF64',
    'HEAP8',
    'HEAPU8',
    'HEAP16',
    'HEAPU16',
    'HEAP32',
    'HEAPU32',
    'HEAP64',
    'HEAPU64',
    'writeStackCookie',
    'checkStackCookie',
    'INT53_MAX',
    'INT53_MIN',
    'bigintToI53Checked',
    'stackSave',
    'stackRestore',
    'stackAlloc',
    'setTempRet0',
    'ptrToString',
    'exitJS',
    'getHeapMax',
    'growMemory',
    'ENV',
    'ERRNO_CODES',
    'DNS',
    'Protocols',
    'Sockets',
    'timers',
    'warnOnce',
    'readEmAsmArgsArray',
    'getExecutableName',
    'handleException',
    'keepRuntimeAlive',
    'runtimeKeepalivePush',
    'runtimeKeepalivePop',
    'callUserCallback',
    'maybeExit',
    'alignMemory',
    'wasmTable',
    'noExitRuntime',
    'addRunDependency',
    'removeRunDependency',
    'addOnPreRun',
    'addOnPostRun',
    'convertJsFunctionToWasm',
    'freeTableIndexes',
    'functionsInTableMap',
    'getEmptyTableSlot',
    'updateTableMap',
    'getFunctionAddress',
    'setValue',
    'getValue',
    'PATH',
    'PATH_FS',
    'UTF8Decoder',
    'UTF8ArrayToString',
    'stringToUTF8Array',
    'AsciiToString',
    'UTF16Decoder',
    'UTF16ToString',
    'stringToUTF16',
    'lengthBytesUTF16',
    'UTF32ToString',
    'stringToUTF32',
    'lengthBytesUTF32',
    'JSEvents',
    'specialHTMLTargets',
    'findCanvasEventTarget',
    'currentFullscreenStrategy',
    'restoreOldWindowedStyle',
    'jsStackTrace',
    'getCallstack',
    'UNWIND_CACHE',
    'ExitStatus',
    'getEnvStrings',
    'checkWasiClock',
    'flush_NO_FILESYSTEM',
    'safeSetTimeout',
    'emSetImmediate',
    'emClearImmediate_deps',
    'emClearImmediate',
    'promiseMap',
    'uncaughtExceptionCount',
    'exceptionLast',
    'exceptionCaught',
    'ExceptionInfo',
    'findMatchingCatch',
    'getExceptionMessageCommon',
    'Browser',
    'requestFullscreen',
    'requestFullScreen',
    'setCanvasSize',
    'getUserMedia',
    'createContext',
    'getPreloadedImageData__data',
    'wget',
    'MONTH_DAYS_REGULAR',
    'MONTH_DAYS_LEAP',
    'MONTH_DAYS_REGULAR_CUMULATIVE',
    'MONTH_DAYS_LEAP_CUMULATIVE',
    'SYSCALLS',
    'tempFixedLengthArray',
    'miniTempWebGLFloatBuffers',
    'miniTempWebGLIntBuffers',
    'webgl_enable_ANGLE_instanced_arrays',
    'webgl_enable_OES_vertex_array_object',
    'webgl_enable_WEBGL_draw_buffers',
    'webgl_enable_WEBGL_multi_draw',
    'webgl_enable_EXT_polygon_offset_clamp',
    'webgl_enable_EXT_clip_control',
    'webgl_enable_WEBGL_polygon_mode',
    'GL',
    'AL',
    'GLUT',
    'EGL',
    'GLEW',
    'IDBStore',
    'SDL',
    'SDL_gfx',
    'allocateUTF8',
    'allocateUTF8OnStack',
    'print',
    'printErr',
    'jstoi_s',
    'PThread',
    'terminateWorker',
    'cleanupThread',
    'registerTLSInit',
    'spawnThread',
    'exitOnMainThread',
    'proxyToMainThread',
    'proxiedJSCallArgs',
    'invokeEntryPoint',
    'checkMailbox',
    'InternalError',
    'BindingError',
    'throwInternalError',
    'throwBindingError',
    'registeredTypes',
    'awaitingDependencies',
    'typeDependencies',
    'tupleRegistrations',
    'structRegistrations',
    'sharedRegisterType',
    'whenDependentTypesAreResolved',
    'getTypeName',
    'getFunctionName',
    'heap32VectorToArray',
    'requireRegisteredType',
    'usesDestructorStack',
    'checkArgCount',
    'getRequiredArgCount',
    'createJsInvoker',
    'UnboundTypeError',
    'EmValType',
    'EmValOptionalType',
    'throwUnboundTypeError',
    'ensureOverloadTable',
    'exposePublicSymbol',
    'replacePublicSymbol',
    'createNamedFunction',
    'embindRepr',
    'registeredInstances',
    'getBasestPointer',
    'getInheritedInstance',
    'registeredPointers',
    'registerType',
    'integerReadValueFromPointer',
    'floatReadValueFromPointer',
    'assertIntegerRange',
    'readPointer',
    'runDestructors',
    'craftInvokerFunction',
    'embind__requireFunction',
    'genericPointerToWireType',
    'constNoSmartPtrRawPointerToWireType',
    'nonConstNoSmartPtrRawPointerToWireType',
    'init_RegisteredPointer',
    'RegisteredPointer',
    'RegisteredPointer_fromWireType',
    'runDestructor',
    'releaseClassHandle',
    'finalizationRegistry',
    'detachFinalizer_deps',
    'detachFinalizer',
    'attachFinalizer',
    'makeClassHandle',
    'init_ClassHandle',
    'ClassHandle',
    'throwInstanceAlreadyDeleted',
    'deletionQueue',
    'flushPendingDeletes',
    'delayFunction',
    'RegisteredClass',
    'shallowCopyInternalPointer',
    'downcastPointer',
    'upcastPointer',
    'char_0',
    'char_9',
    'makeLegalFunctionName',
    'emval_freelist',
    'emval_handles',
    'emval_symbols',
    'getStringOrSymbol',
    'Emval',
    'emval_returnValue',
    'emval_lookupTypes',
    'emval_methodCallers',
    'emval_addMethodCaller',
    'FS',
  ];
  unexportedSymbols.forEach(unexportedRuntimeSymbol);
  Module['incrementExceptionRefcount'] = incrementExceptionRefcount;
  Module['decrementExceptionRefcount'] = decrementExceptionRefcount;
  Module['getExceptionMessage'] = getExceptionMessage;
  var proxiedFunctionTable = [
    _proc_exit,
    exitOnMainThread,
    pthreadCreateProxied,
    ___syscall_chmod,
    ___syscall_faccessat,
    ___syscall_fcntl64,
    ___syscall_fstat64,
    ___syscall_ioctl,
    ___syscall_lstat64,
    ___syscall_newfstatat,
    ___syscall_openat,
    ___syscall_stat64,
    _environ_get,
    _environ_sizes_get,
    _fd_close,
    _fd_read,
    _fd_seek,
    _fd_write,
  ];
  function checkIncomingModuleAPI() {
    ignoredModuleProp('fetchSettings');
  }
  function OSD_MemInfo_getModuleHeapLength() {
    return Module.HEAP8.length;
  }
  var ___cxa_free_exception = makeInvalidEarlyAccess('___cxa_free_exception');
  var _malloc = makeInvalidEarlyAccess('_malloc');
  var _pthread_self = makeInvalidEarlyAccess('_pthread_self');
  var _free = makeInvalidEarlyAccess('_free');
  var _fflush = makeInvalidEarlyAccess('_fflush');
  var ___getTypeName = makeInvalidEarlyAccess('___getTypeName');
  var __embind_initialize_bindings = makeInvalidEarlyAccess('__embind_initialize_bindings');
  var __emscripten_tls_init = makeInvalidEarlyAccess('__emscripten_tls_init');
  var __emscripten_thread_init = makeInvalidEarlyAccess('__emscripten_thread_init');
  var __emscripten_thread_crashed = makeInvalidEarlyAccess('__emscripten_thread_crashed');
  var _emscripten_stack_get_end = makeInvalidEarlyAccess('_emscripten_stack_get_end');
  var _emscripten_stack_get_base = makeInvalidEarlyAccess('_emscripten_stack_get_base');
  var __emscripten_run_js_on_main_thread = makeInvalidEarlyAccess(
    '__emscripten_run_js_on_main_thread'
  );
  var __emscripten_thread_free_data = makeInvalidEarlyAccess('__emscripten_thread_free_data');
  var __emscripten_thread_exit = makeInvalidEarlyAccess('__emscripten_thread_exit');
  var __emscripten_check_mailbox = makeInvalidEarlyAccess('__emscripten_check_mailbox');
  var _setThrew = makeInvalidEarlyAccess('_setThrew');
  var __emscripten_tempret_set = makeInvalidEarlyAccess('__emscripten_tempret_set');
  var _emscripten_stack_init = makeInvalidEarlyAccess('_emscripten_stack_init');
  var _emscripten_stack_set_limits = makeInvalidEarlyAccess('_emscripten_stack_set_limits');
  var _emscripten_stack_get_free = makeInvalidEarlyAccess('_emscripten_stack_get_free');
  var __emscripten_stack_restore = makeInvalidEarlyAccess('__emscripten_stack_restore');
  var __emscripten_stack_alloc = makeInvalidEarlyAccess('__emscripten_stack_alloc');
  var _emscripten_stack_get_current = makeInvalidEarlyAccess('_emscripten_stack_get_current');
  var ___cxa_decrement_exception_refcount = makeInvalidEarlyAccess(
    '___cxa_decrement_exception_refcount'
  );
  var ___cxa_increment_exception_refcount = makeInvalidEarlyAccess(
    '___cxa_increment_exception_refcount'
  );
  var ___get_exception_message = makeInvalidEarlyAccess('___get_exception_message');
  var ___cxa_can_catch = makeInvalidEarlyAccess('___cxa_can_catch');
  var ___cxa_get_exception_ptr = makeInvalidEarlyAccess('___cxa_get_exception_ptr');
  function assignWasmExports(wasmExports) {
    ___cxa_free_exception = createExportWrapper('__cxa_free_exception', 1);
    _malloc = createExportWrapper('malloc', 1);
    _pthread_self = createExportWrapper('pthread_self', 0);
    _free = createExportWrapper('free', 1);
    _fflush = createExportWrapper('fflush', 1);
    ___getTypeName = createExportWrapper('__getTypeName', 1);
    __embind_initialize_bindings = createExportWrapper('_embind_initialize_bindings', 0);
    __emscripten_tls_init = createExportWrapper('_emscripten_tls_init', 0);
    __emscripten_thread_init = createExportWrapper('_emscripten_thread_init', 6);
    __emscripten_thread_crashed = createExportWrapper('_emscripten_thread_crashed', 0);
    _emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'];
    _emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'];
    __emscripten_run_js_on_main_thread = createExportWrapper(
      '_emscripten_run_js_on_main_thread',
      5
    );
    __emscripten_thread_free_data = createExportWrapper('_emscripten_thread_free_data', 1);
    __emscripten_thread_exit = createExportWrapper('_emscripten_thread_exit', 1);
    __emscripten_check_mailbox = createExportWrapper('_emscripten_check_mailbox', 0);
    _setThrew = createExportWrapper('setThrew', 2);
    __emscripten_tempret_set = createExportWrapper('_emscripten_tempret_set', 1);
    _emscripten_stack_init = wasmExports['emscripten_stack_init'];
    _emscripten_stack_set_limits = wasmExports['emscripten_stack_set_limits'];
    _emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'];
    __emscripten_stack_restore = wasmExports['_emscripten_stack_restore'];
    __emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'];
    _emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'];
    ___cxa_decrement_exception_refcount = createExportWrapper(
      '__cxa_decrement_exception_refcount',
      1
    );
    ___cxa_increment_exception_refcount = createExportWrapper(
      '__cxa_increment_exception_refcount',
      1
    );
    ___get_exception_message = createExportWrapper('__get_exception_message', 3);
    ___cxa_can_catch = createExportWrapper('__cxa_can_catch', 3);
    ___cxa_get_exception_ptr = createExportWrapper('__cxa_get_exception_ptr', 1);
  }
  var wasmImports;
  function assignWasmImports() {
    wasmImports = {
      OSD_MemInfo_getModuleHeapLength,
      __assert_fail: ___assert_fail,
      __cxa_begin_catch: ___cxa_begin_catch,
      __cxa_end_catch: ___cxa_end_catch,
      __cxa_find_matching_catch_2: ___cxa_find_matching_catch_2,
      __cxa_find_matching_catch_3: ___cxa_find_matching_catch_3,
      __cxa_find_matching_catch_4: ___cxa_find_matching_catch_4,
      __cxa_find_matching_catch_5: ___cxa_find_matching_catch_5,
      __cxa_rethrow: ___cxa_rethrow,
      __cxa_throw: ___cxa_throw,
      __cxa_uncaught_exceptions: ___cxa_uncaught_exceptions,
      __pthread_create_js: ___pthread_create_js,
      __resumeException: ___resumeException,
      __syscall_chmod: ___syscall_chmod,
      __syscall_faccessat: ___syscall_faccessat,
      __syscall_fcntl64: ___syscall_fcntl64,
      __syscall_fstat64: ___syscall_fstat64,
      __syscall_ioctl: ___syscall_ioctl,
      __syscall_lstat64: ___syscall_lstat64,
      __syscall_newfstatat: ___syscall_newfstatat,
      __syscall_openat: ___syscall_openat,
      __syscall_stat64: ___syscall_stat64,
      _abort_js: __abort_js,
      _embind_finalize_value_object: __embind_finalize_value_object,
      _embind_register_bigint: __embind_register_bigint,
      _embind_register_bool: __embind_register_bool,
      _embind_register_class: __embind_register_class,
      _embind_register_class_constructor: __embind_register_class_constructor,
      _embind_register_class_function: __embind_register_class_function,
      _embind_register_emval: __embind_register_emval,
      _embind_register_float: __embind_register_float,
      _embind_register_function: __embind_register_function,
      _embind_register_integer: __embind_register_integer,
      _embind_register_memory_view: __embind_register_memory_view,
      _embind_register_optional: __embind_register_optional,
      _embind_register_std_string: __embind_register_std_string,
      _embind_register_std_wstring: __embind_register_std_wstring,
      _embind_register_value_object: __embind_register_value_object,
      _embind_register_value_object_field: __embind_register_value_object_field,
      _embind_register_void: __embind_register_void,
      _emscripten_init_main_thread_js: __emscripten_init_main_thread_js,
      _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
      _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
      _emscripten_thread_cleanup: __emscripten_thread_cleanup,
      _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
      _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
      _emscripten_throw_longjmp: __emscripten_throw_longjmp,
      _emval_create_invoker: __emval_create_invoker,
      _emval_decref: __emval_decref,
      _emval_invoke: __emval_invoke,
      _emval_run_destructors: __emval_run_destructors,
      _tzset_js: __tzset_js,
      clock_time_get: _clock_time_get,
      emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
      emscripten_date_now: _emscripten_date_now,
      emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
      emscripten_get_callstack: _emscripten_get_callstack,
      emscripten_get_heap_max: _emscripten_get_heap_max,
      emscripten_get_now: _emscripten_get_now,
      emscripten_num_logical_cores: _emscripten_num_logical_cores,
      emscripten_resize_heap: _emscripten_resize_heap,
      environ_get: _environ_get,
      environ_sizes_get: _environ_sizes_get,
      exit: _exit,
      fd_close: _fd_close,
      fd_read: _fd_read,
      fd_seek: _fd_seek,
      fd_write: _fd_write,
      invoke_d,
      invoke_dd,
      invoke_ddd,
      invoke_dddd,
      invoke_ddddd,
      invoke_di,
      invoke_did,
      invoke_didd,
      invoke_diddd,
      invoke_didddddidi,
      invoke_didddidi,
      invoke_diddi,
      invoke_didi,
      invoke_didii,
      invoke_didiidii,
      invoke_didiidiiddi,
      invoke_didiiiiidi,
      invoke_dii,
      invoke_diid,
      invoke_diidd,
      invoke_diiddd,
      invoke_diiddi,
      invoke_diidi,
      invoke_diidii,
      invoke_diii,
      invoke_diiid,
      invoke_diiidii,
      invoke_diiidiiddi,
      invoke_diiidiii,
      invoke_diiii,
      invoke_diiiii,
      invoke_diiiiii,
      invoke_diiiiiii,
      invoke_fiii,
      invoke_i,
      invoke_iddddiid,
      invoke_idddii,
      invoke_iddid,
      invoke_iddiddddi,
      invoke_iddiddiiiii,
      invoke_iddiii,
      invoke_iddiiiiii,
      invoke_iddiiiiiii,
      invoke_idi,
      invoke_idid,
      invoke_idii,
      invoke_idiiididii,
      invoke_idiiiiii,
      invoke_ii,
      invoke_iid,
      invoke_iidd,
      invoke_iiddd,
      invoke_iiddddd,
      invoke_iiddddddd,
      invoke_iiddddddddiii,
      invoke_iiddddddiiii,
      invoke_iiddddi,
      invoke_iiddddii,
      invoke_iidddi,
      invoke_iidddidd,
      invoke_iidddiiiiii,
      invoke_iidddiiiiiiiii,
      invoke_iiddi,
      invoke_iiddid,
      invoke_iiddiddidii,
      invoke_iiddii,
      invoke_iiddiid,
      invoke_iiddiiid,
      invoke_iiddiiiii,
      invoke_iiddiiiiiiiiii,
      invoke_iidi,
      invoke_iidid,
      invoke_iididdii,
      invoke_iididi,
      invoke_iidii,
      invoke_iidiiddiid,
      invoke_iidiii,
      invoke_iidiiid,
      invoke_iidiiii,
      invoke_iidiiiidiiiiii,
      invoke_iif,
      invoke_iii,
      invoke_iiid,
      invoke_iiidd,
      invoke_iiiddd,
      invoke_iiidddd,
      invoke_iiidddddd,
      invoke_iiidddddiii,
      invoke_iiiddddi,
      invoke_iiiddddid,
      invoke_iiiddddii,
      invoke_iiiddddiii,
      invoke_iiidddi,
      invoke_iiidddid,
      invoke_iiidddiid,
      invoke_iiidddiiiii,
      invoke_iiiddi,
      invoke_iiiddid,
      invoke_iiiddidd,
      invoke_iiiddidddd,
      invoke_iiiddidi,
      invoke_iiiddii,
      invoke_iiiddiidd,
      invoke_iiiddiii,
      invoke_iiiddiiii,
      invoke_iiidi,
      invoke_iiidid,
      invoke_iiididdii,
      invoke_iiididi,
      invoke_iiidii,
      invoke_iiidiid,
      invoke_iiidiidiid,
      invoke_iiidiii,
      invoke_iiidiiiii,
      invoke_iiidiiiiii,
      invoke_iiii,
      invoke_iiiid,
      invoke_iiiidd,
      invoke_iiiiddd,
      invoke_iiiidddd,
      invoke_iiiidddddd,
      invoke_iiiidddddddddd,
      invoke_iiiiddddddi,
      invoke_iiiiddddddii,
      invoke_iiiiddddi,
      invoke_iiiiddddidd,
      invoke_iiiidddi,
      invoke_iiiiddi,
      invoke_iiiiddiddiiii,
      invoke_iiiiddii,
      invoke_iiiiddiidi,
      invoke_iiiiddiii,
      invoke_iiiiddiiii,
      invoke_iiiidi,
      invoke_iiiidid,
      invoke_iiiidii,
      invoke_iiiidiii,
      invoke_iiiidiiid,
      invoke_iiiidiiiddddddd,
      invoke_iiiidiiiii,
      invoke_iiiii,
      invoke_iiiiid,
      invoke_iiiiidd,
      invoke_iiiiiddd,
      invoke_iiiiidddd,
      invoke_iiiiiddddi,
      invoke_iiiiiddi,
      invoke_iiiiiddiiddidiii,
      invoke_iiiiiddiididii,
      invoke_iiiiidi,
      invoke_iiiiidii,
      invoke_iiiiidiidd,
      invoke_iiiiidiiiiii,
      invoke_iiiiii,
      invoke_iiiiiid,
      invoke_iiiiiidd,
      invoke_iiiiiiddidddiiiii,
      invoke_iiiiiiddiddiii,
      invoke_iiiiiiddiiddidii,
      invoke_iiiiiiddiiiii,
      invoke_iiiiiidiii,
      invoke_iiiiiidiiidd,
      invoke_iiiiiii,
      invoke_iiiiiiid,
      invoke_iiiiiiiddi,
      invoke_iiiiiiiddiddiiiiii,
      invoke_iiiiiiiddidii,
      invoke_iiiiiiididi,
      invoke_iiiiiiii,
      invoke_iiiiiiiidd,
      invoke_iiiiiiiidddddddddiiddii,
      invoke_iiiiiiiidddddddiii,
      invoke_iiiiiiiiddi,
      invoke_iiiiiiiiddidi,
      invoke_iiiiiiiiddii,
      invoke_iiiiiiiiddiiii,
      invoke_iiiiiiiiddiiiii,
      invoke_iiiiiiiididd,
      invoke_iiiiiiiidii,
      invoke_iiiiiiiii,
      invoke_iiiiiiiiid,
      invoke_iiiiiiiiiddddii,
      invoke_iiiiiiiiiddiiii,
      invoke_iiiiiiiiidi,
      invoke_iiiiiiiiidiii,
      invoke_iiiiiiiiidiiii,
      invoke_iiiiiiiiii,
      invoke_iiiiiiiiiid,
      invoke_iiiiiiiiiidddiiiiiiiiii,
      invoke_iiiiiiiiiiddidd,
      invoke_iiiiiiiiiidiiiiiiiiii,
      invoke_iiiiiiiiiii,
      invoke_iiiiiiiiiiiddddiiiiiiiiii,
      invoke_iiiiiiiiiiiddddiiiiiiiiiii,
      invoke_iiiiiiiiiiidi,
      invoke_iiiiiiiiiiii,
      invoke_iiiiiiiiiiiid,
      invoke_iiiiiiiiiiiiddddiiiiiiiii,
      invoke_iiiiiiiiiiiiddddiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiddiiiiii,
      invoke_iiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiid,
      invoke_iiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiddi,
      invoke_iiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiddddiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiddddiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiidddiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiiiddddiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiiiddddiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiiiiiiiiii,
      invoke_iiiiiiiiiiiiiiiiiiiiiiiiiii,
      invoke_iiji,
      invoke_jiiii,
      invoke_v,
      invoke_vddddddiiii,
      invoke_vddddiiiiiiiiiiii,
      invoke_vdddii,
      invoke_vdddiii,
      invoke_vdddiiii,
      invoke_vdddiiiiiiiii,
      invoke_vddi,
      invoke_vddiddi,
      invoke_vddiddiii,
      invoke_vddidiii,
      invoke_vddii,
      invoke_vddiii,
      invoke_vddiiii,
      invoke_vddiiiiiii,
      invoke_vddiiiiiiiiiiiiiii,
      invoke_vddiiiiiiiiiiiiiiiii,
      invoke_vddiiiiiiiiiiiiiiiiiiii,
      invoke_vddiiiiiiiiiiiiiiiiiiiiiiii,
      invoke_vdi,
      invoke_vdiddddi,
      invoke_vdiddii,
      invoke_vdiddiiii,
      invoke_vdiddiiiiii,
      invoke_vdidii,
      invoke_vdiii,
      invoke_vdiiii,
      invoke_vdiiiii,
      invoke_vdiiiiiiii,
      invoke_vdiiiiiiiii,
      invoke_vdiiiiiiiiii,
      invoke_vdiiiiiiiiiii,
      invoke_vi,
      invoke_vid,
      invoke_vidd,
      invoke_viddd,
      invoke_vidddd,
      invoke_vidddddd,
      invoke_viddddddd,
      invoke_vidddddddddddd,
      invoke_vidddddddii,
      invoke_viddddddiii,
      invoke_vidddddi,
      invoke_vidddddiii,
      invoke_viddddi,
      invoke_viddddii,
      invoke_viddddiii,
      invoke_viddddiiii,
      invoke_vidddi,
      invoke_vidddidddddd,
      invoke_vidddii,
      invoke_vidddiii,
      invoke_vidddiiidi,
      invoke_viddi,
      invoke_viddid,
      invoke_viddidd,
      invoke_viddidddiiii,
      invoke_viddii,
      invoke_viddiiddi,
      invoke_viddiii,
      invoke_viddiiiiii,
      invoke_viddiiiiiiiiii,
      invoke_vidi,
      invoke_vidid,
      invoke_vididd,
      invoke_vididdi,
      invoke_vididi,
      invoke_vidii,
      invoke_vidiiddddii,
      invoke_vidiidii,
      invoke_vidiii,
      invoke_vidiiiddii,
      invoke_vidiiidi,
      invoke_vidiiii,
      invoke_vidiiiiidd,
      invoke_vidiiiiii,
      invoke_vidiiiiiiiiiii,
      invoke_vii,
      invoke_viid,
      invoke_viidd,
      invoke_viiddd,
      invoke_viidddd,
      invoke_viiddddd,
      invoke_viidddddd,
      invoke_viidddddddd,
      invoke_viidddddddiiii,
      invoke_viidddddi,
      invoke_viiddddi,
      invoke_viiddddidd,
      invoke_viiddddiddd,
      invoke_viiddddiii,
      invoke_viidddi,
      invoke_viidddii,
      invoke_viiddi,
      invoke_viiddidd,
      invoke_viiddii,
      invoke_viiddiidi,
      invoke_viiddiii,
      invoke_viiddiiii,
      invoke_viiddiiiiii,
      invoke_viiddiiiiiiii,
      invoke_viidi,
      invoke_viidid,
      invoke_viididd,
      invoke_viididdi,
      invoke_viididi,
      invoke_viidii,
      invoke_viidiii,
      invoke_viidiiid,
      invoke_viidiiiii,
      invoke_viidiiiiii,
      invoke_viii,
      invoke_viiid,
      invoke_viiidd,
      invoke_viiiddd,
      invoke_viiidddd,
      invoke_viiiddddd,
      invoke_viiidddddidi,
      invoke_viiiddddi,
      invoke_viiidddidi,
      invoke_viiiddi,
      invoke_viiiddidiiiii,
      invoke_viiiddii,
      invoke_viiiddiiii,
      invoke_viiiddiiiiii,
      invoke_viiiddiiiiiiiiiiiiii,
      invoke_viiidi,
      invoke_viiidid,
      invoke_viiidii,
      invoke_viiidiii,
      invoke_viiidiiii,
      invoke_viiidiiiii,
      invoke_viiidiiiiiid,
      invoke_viiii,
      invoke_viiiid,
      invoke_viiiidd,
      invoke_viiiidddd,
      invoke_viiiiddddd,
      invoke_viiiidddddd,
      invoke_viiiidddiiiii,
      invoke_viiiiddi,
      invoke_viiiidi,
      invoke_viiiidii,
      invoke_viiiidiidi,
      invoke_viiiidiii,
      invoke_viiiidiiiiiidiiiiiiiiiii,
      invoke_viiiii,
      invoke_viiiiid,
      invoke_viiiiidd,
      invoke_viiiiiddd,
      invoke_viiiiidddd,
      invoke_viiiiidddddd,
      invoke_viiiiidddddddd,
      invoke_viiiiiddddddidi,
      invoke_viiiiiddddi,
      invoke_viiiiidddii,
      invoke_viiiiidddiii,
      invoke_viiiiiddi,
      invoke_viiiiiddidd,
      invoke_viiiiiddiii,
      invoke_viiiiiddiiii,
      invoke_viiiiiddiiiiii,
      invoke_viiiiidi,
      invoke_viiiiidii,
      invoke_viiiiii,
      invoke_viiiiiid,
      invoke_viiiiiidddddidi,
      invoke_viiiiiidddi,
      invoke_viiiiiiddi,
      invoke_viiiiiiddiii,
      invoke_viiiiiiddiiii,
      invoke_viiiiiidii,
      invoke_viiiiiidiidid,
      invoke_viiiiiidiii,
      invoke_viiiiiii,
      invoke_viiiiiiid,
      invoke_viiiiiiiddd,
      invoke_viiiiiiiddii,
      invoke_viiiiiiiddiiii,
      invoke_viiiiiiii,
      invoke_viiiiiiiid,
      invoke_viiiiiiiiddi,
      invoke_viiiiiiiii,
      invoke_viiiiiiiiid,
      invoke_viiiiiiiiidd,
      invoke_viiiiiiiiiddi,
      invoke_viiiiiiiiiddii,
      invoke_viiiiiiiiii,
      invoke_viiiiiiiiiid,
      invoke_viiiiiiiiiidddiii,
      invoke_viiiiiiiiiidddiiiiii,
      invoke_viiiiiiiiiii,
      invoke_viiiiiiiiiiidd,
      invoke_viiiiiiiiiiidi,
      invoke_viiiiiiiiiiii,
      invoke_viiiiiiiiiiiidi,
      invoke_viiiiiiiiiiiidii,
      invoke_viiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiidi,
      invoke_viiiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiiidddiiiiiiiii,
      invoke_viiiiiiiiiiiiiiddiiiiiiiii,
      invoke_viiiiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiiiiiidddiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiiiiiiiidddiiiiiiiiii,
      invoke_viiiiiiiiiiiiiiiiiiiddiiiiiiiiii,
      invoke_viiiiji,
      invoke_viijii,
      llvm_eh_typeid_for: _llvm_eh_typeid_for,
      memory: wasmMemory,
    };
  }
  function invoke_iiddd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vii(index, a1, a2) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_ii(index, a1) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iii(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vi(index, a1) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_v(index) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)();
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iid(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidd(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidi(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiididi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_i(index) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)();
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viid(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_di(index, a1) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddddii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_dii(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiid(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_ddd(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vid(index, a1, a2) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_dd(index, a1) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddi(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiidi(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiidi(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddddiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiiiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiiiiiiiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiidii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidi(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddddddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddidddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddddddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddiid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_did(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didi(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidiiid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_dddd(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiddddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidd(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didd(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diddd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diddi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vididd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdddii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddddidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddidd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiddiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdddiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiddddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidddidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddiidd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vididi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiddddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddddd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddidd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddid(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didddddidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddddid(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddiid(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidiiddiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdddiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdddiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiddd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didddidi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddddddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iif(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viijii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiji(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiji(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiddi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddddidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddddd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidddddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddidd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiidd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiddiddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diid(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiddd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddidddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_d(index) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)();
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diidi(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidddd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viididd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiddddii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidd(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddddiid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidiiid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiid(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diidii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiidii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idddii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diidd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddiddiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddiddidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiidiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viidddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidddd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidddidd(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiidddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiddiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidiid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiidi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdidii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiddii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiidiidid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vididdi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiidddddddddiiddii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddddddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidddi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiidii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddiidi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddddddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiidddddddiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiddidd(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdi(index, a1, a2) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vdiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiiiii(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iddiddddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idiiididii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idid(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddiiid(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viididdi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidid(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viididi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iididdii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iididi(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiidiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddddddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidiiiddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidiiiddddddd(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiddddiddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddidiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiddiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidiiiidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiddi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiidddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiidiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiidddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiidiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiiiiiiiddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29,
    a30,
    a31
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29,
        a30,
        a31
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiiiiiiidddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29,
    a30,
    a31,
    a32
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29,
        a30,
        a31,
        a32
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiiddiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiidddiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiiiiidddiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29,
    a30,
    a31,
    a32
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29,
        a30,
        a31,
        a32
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_ddddd(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiddidddiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiddddddidi(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiddiddiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiidddddidi(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiddiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiidddddidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_idi(index, a1, a2) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidiiiiiidiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiddddiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidiidiid(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiddddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiididd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiddidi(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiidiiid(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiididi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiddiididii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiddidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiddiiddidii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiddidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiddiiddidiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vddiddi(index, a1, a2, a3, a4, a5, a6) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidddiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iidddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiidddiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiidddiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiddddiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiididdii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiddddiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiddi(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiddiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiidddiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiidddiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiidiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiddiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiidddiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiddddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viddddiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiiiddddiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29,
    a30,
    a31,
    a32
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29,
        a30,
        a31,
        a32
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_vidddiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiddddiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiiiiiiiiiiddddiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    a16,
    a17,
    a18,
    a19,
    a20,
    a21,
    a22,
    a23,
    a24,
    a25,
    a26,
    a27,
    a28,
    a29,
    a30,
    a31
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        a16,
        a17,
        a18,
        a19,
        a20,
        a21,
        a22,
        a23,
        a24,
        a25,
        a26,
        a27,
        a28,
        a29,
        a30,
        a31
      );
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_iiiiiiiiiddiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14
  ) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiid(index, a1, a2, a3, a4, a5, a6, a7, a8) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didiidii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_diiidiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiddidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_didiidiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_jiiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3, a4);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
      return 0n;
    }
  }
  function invoke_fiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
      return getWasmTableEntry(index)(a1, a2, a3);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  function invoke_viiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15
  ) {
    var sp = stackSave();
    try {
      getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
    } catch (e) {
      stackRestore(sp);
      if (!(e instanceof EmscriptenEH)) throw e;
      _setThrew(1, 0);
    }
  }
  var calledRun;
  function stackCheckInit() {
    assert(!ENVIRONMENT_IS_PTHREAD);
    _emscripten_stack_init();
    writeStackCookie();
  }
  function run() {
    if (runDependencies > 0) {
      dependenciesFulfilled = run;
      return;
    }
    if (ENVIRONMENT_IS_PTHREAD) {
      readyPromiseResolve?.(Module);
      initRuntime();
      return;
    }
    stackCheckInit();
    preRun();
    if (runDependencies > 0) {
      dependenciesFulfilled = run;
      return;
    }
    function doRun() {
      assert(!calledRun);
      calledRun = true;
      Module['calledRun'] = true;
      if (ABORT) return;
      initRuntime();
      readyPromiseResolve?.(Module);
      Module['onRuntimeInitialized']?.();
      consumedModuleProp('onRuntimeInitialized');
      assert(
        !Module['_main'],
        'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
      );
      postRun();
    }
    if (Module['setStatus']) {
      Module['setStatus']('Running...');
      setTimeout(() => {
        setTimeout(() => Module['setStatus'](''), 1);
        doRun();
      }, 1);
    } else {
      doRun();
    }
    checkStackCookie();
  }
  function checkUnflushedContent() {
    var oldOut = out;
    var oldErr = err;
    var has = false;
    out = err = (x) => {
      has = true;
    };
    try {
      flush_NO_FILESYSTEM();
    } catch (e) {}
    out = oldOut;
    err = oldErr;
    if (has) {
      warnOnce(
        'stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.'
      );
      warnOnce(
        '(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)'
      );
    }
  }
  var wasmExports;
  if (!ENVIRONMENT_IS_PTHREAD) {
    wasmExports = await createWasm();
    run();
  }
  if (runtimeInitialized) {
    moduleRtn = Module;
  } else {
    moduleRtn = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
  }
  for (const prop of Object.keys(Module)) {
    if (!(prop in moduleArg)) {
      Object.defineProperty(moduleArg, prop, {
        configurable: true,
        get() {
          abort(
            `Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`
          );
        },
      });
    }
  }
  return moduleRtn;
}
export default createOCCTModule;
var isPthread = globalThis.self?.name?.startsWith('em-pthread');
isPthread && createOCCTModule();
