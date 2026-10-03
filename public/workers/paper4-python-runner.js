/* global importScripts, loadPyodide */

let runtimePromise;

function initialiseRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      importScripts("/vendor/pyodide/pyodide.js");
      const runtime = await loadPyodide({ indexURL: "/vendor/pyodide/" });
      // The learner program only needs Python's in-memory standard library.
      // Remove browser networking APIs before any learner source is evaluated.
      for (const key of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "indexedDB", "caches"]) {
        try { Object.defineProperty(self, key, { value: undefined, configurable: false, writable: false }); } catch { /* unavailable */ }
      }
      return runtime;
    })();
  }
  return runtimePromise;
}

function valueAtPath(value, path) {
  if (path === "trace.events") return Array.isArray(value?.trace) ? value.trace.map((event) => event?.event) : undefined;
  return path.split(".").reduce((current, segment) => {
    if (current == null) return undefined;
    const index = /^\d+$/.test(segment) ? Number(segment) : segment;
    return current[index];
  }, value);
}

function equivalent(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function execute(request) {
  const runtime = await initialiseRuntime();
  runtime.globals.set("learner_source_json", JSON.stringify(request.source));
  runtime.globals.set("fixtures_json", JSON.stringify(request.cases));
  const resultJson = await runtime.runPythonAsync(`
import ast
import contextlib
import io
import json

source = json.loads(learner_source_json)
cases = json.loads(fixtures_json)

if len(source) > 20000:
    raise ValueError("SOURCE_TOO_LARGE")

tree = ast.parse(source, filename="learner_submission.py", mode="exec")
allowed_imports = {"json"}
banned_calls = {"eval", "exec", "compile", "open", "input", "breakpoint", "globals", "locals", "vars", "__import__"}

for node in ast.walk(tree):
    if isinstance(node, ast.Import):
        if any(alias.name.split(".")[0] not in allowed_imports for alias in node.names):
            raise ValueError("IMPORT_NOT_ALLOWED")
    if isinstance(node, ast.ImportFrom):
        raise ValueError("IMPORT_NOT_ALLOWED")
    if isinstance(node, (ast.AsyncFunctionDef, ast.Await, ast.Global, ast.Nonlocal)):
        raise ValueError("LANGUAGE_FEATURE_NOT_ALLOWED")
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in banned_calls:
        raise ValueError("CALL_NOT_ALLOWED")

real_import = __import__
def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    if level != 0 or name.split(".")[0] not in allowed_imports:
        raise ValueError("IMPORT_NOT_ALLOWED")
    return real_import(name, globals, locals, fromlist, level)

safe_builtins = {
    "__import__": safe_import, "abs": abs, "all": all, "any": any,
    "bool": bool, "dict": dict, "enumerate": enumerate, "float": float,
    "int": int, "isinstance": isinstance, "len": len, "list": list,
    "max": max, "min": min, "print": print, "range": range,
    "reversed": reversed, "set": set, "str": str, "sum": sum,
    "tuple": tuple, "zip": zip, "Exception": Exception,
    "ValueError": ValueError, "TypeError": TypeError,
}
namespace = {"__builtins__": safe_builtins, "__name__": "learner_submission"}
captured = io.StringIO()
with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
    exec(compile(tree, "learner_submission.py", "exec"), namespace, namespace)

run = namespace.get("run")
if not callable(run):
    raise ValueError("MISSING_RUN_FUNCTION")

outputs = []
for case in cases:
    try:
        actual = run(json.loads(json.dumps(case["input"])))
        encoded = json.dumps(actual, ensure_ascii=False, sort_keys=True)
        if len(encoded) > 100000:
            raise ValueError("OUTPUT_TOO_LARGE")
        outputs.append({"caseKind": case["caseKind"], "fixtureId": case["fixtureId"], "actual": json.loads(encoded)})
    except Exception as error:
        outputs.append({"caseKind": case["caseKind"], "fixtureId": case["fixtureId"], "errorType": type(error).__name__, "error": str(error)[:300]})

json.dumps(outputs, ensure_ascii=False)
`);
  const outputs = JSON.parse(resultJson);
  const results = request.cases.map((testCase, index) => {
    const output = outputs[index];
    if (output?.error) return { ...output, passed: false, divergentPath: "runtime", expected: "successful run", actual: `${output.errorType}: ${output.error}` };
    for (const path of testCase.assertionPaths) {
      const expected = valueAtPath(testCase.expected, path);
      const actual = valueAtPath(output?.actual, path);
      if (!equivalent(expected, actual)) return { ...output, passed: false, divergentPath: path, expected, actual };
    }
    return { ...output, passed: true };
  });
  return { passed: results.every((result) => result.passed), results };
}

self.onmessage = async (event) => {
  const request = event.data;
  if (!request || typeof request.requestId !== "string") return;
  try {
    if (request.type === "INIT") {
      await initialiseRuntime();
      self.postMessage({ type: "READY", requestId: request.requestId });
      return;
    }
    if (request.type === "RUN") {
      const result = await execute(request);
      self.postMessage({ type: "RESULT", requestId: request.requestId, ...result });
    }
  } catch (error) {
    self.postMessage({ type: "ERROR", requestId: request.requestId, error: error instanceof Error ? error.message : String(error) });
  }
};
