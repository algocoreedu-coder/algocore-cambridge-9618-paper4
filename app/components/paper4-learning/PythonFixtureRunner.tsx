"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/app/components/algocore-ui";
import type { JsonValue, PythonArtifactDto } from "@/app/components/paper4-visual/types";
import type { LearningLocale, PythonExpectedOutput, PythonFixture } from "./types";
import { PAPER4_CODE_GATE_VERSION, starterSource, type CodeExerciseContract } from "./paper4CodeExercises";
import styles from "./PythonFixtureRunner.module.css";

type CaseResult = Readonly<{
  caseKind: string;
  fixtureId: string;
  passed: boolean;
  divergentPath?: string;
  expected?: JsonValue | string;
  actual?: JsonValue | string;
}>;

type RunResult = Readonly<{ passed: boolean; results: readonly CaseResult[] }>;
type Phase = "idle" | "loading" | "running";

const copy = {
  en: {
    badge: "Browser-tested Python · pilot",
    title: "Run the declared fixture tests",
    intro: "Edit the starter, then run normal, boundary and failure cases. This task is complete only when all three pass.",
    editor: "Your Python",
    run: "Run 3 tests",
    loading: "Loading the Python runtime…",
    running: "Running the three declared cases…",
    reset: "Restore starter",
    results: "Test result",
    pass: "Pass",
    fail: "Repair",
    complete: "Execution gate passed. All declared cases match the canonical contract.",
    incomplete: "Execution gate remains locked. Repair the first divergent case, then run all three again.",
    timeout: "The run exceeded the time limit. Check for a loop whose bounds do not move.",
    unavailable: "The browser Python runtime could not start. Your draft is saved; retry when the connection is stable.",
    firstDifference: "First difference",
    expected: "expected",
    actual: "got",
    trace: "trace event sequence",
    runtime: "program run",
    security: "Runs in a time-limited browser worker. Learner code is not sent to the server and browser network APIs are removed before execution.",
  },
  vi: {
    badge: "Python được kiểm bằng trình duyệt · pilot",
    title: "Chạy các fixture đã công bố",
    intro: "Sửa starter rồi chạy ba ca normal, boundary và failure. Bài chỉ hoàn thành khi cả ba ca đều đạt.",
    editor: "Mã Python của em",
    run: "Chạy 3 test",
    loading: "Đang nạp môi trường Python…",
    running: "Đang chạy ba trường hợp đã công bố…",
    reset: "Khôi phục starter",
    results: "Kết quả test",
    pass: "Đạt",
    fail: "Cần sửa",
    complete: "Đã qua cổng thực thi. Cả ba trường hợp khớp hợp đồng chuẩn.",
    incomplete: "Cổng thực thi vẫn khóa. Sửa trường hợp lệch đầu tiên rồi chạy lại cả ba ca.",
    timeout: "Lần chạy vượt quá giới hạn thời gian. Hãy kiểm tra vòng lặp có cập nhật biên hay không.",
    unavailable: "Không thể khởi động Python trong trình duyệt. Bản nháp đã được lưu; hãy thử lại khi kết nối ổn định.",
    firstDifference: "Điểm lệch đầu tiên",
    expected: "cần",
    actual: "nhận được",
    trace: "chuỗi sự kiện trace",
    runtime: "lần chạy chương trình",
    security: "Mã chạy trong worker trình duyệt có giới hạn thời gian. Mã học sinh không được gửi lên máy chủ và API mạng bị gỡ trước khi thực thi.",
  },
} as const;

function storageKey(itemId: string) { return `algocore.paper4.code.v${PAPER4_CODE_GATE_VERSION}.${itemId}`; }

function readable(value: unknown) {
  if (Array.isArray(value)) return value.length > 8 ? `${JSON.stringify(value.slice(0, 8))}…` : JSON.stringify(value);
  if (typeof value === "string") return value;
  const encoded = JSON.stringify(value);
  return encoded && encoded.length > 180 ? `${encoded.slice(0, 180)}…` : encoded ?? String(value);
}

function pathLabel(path: string | undefined, locale: LearningLocale) {
  if (path === "trace.events") return copy[locale].trace;
  if (path === "runtime") return copy[locale].runtime;
  return path ?? "output";
}

export function PythonFixtureRunner({
  contract,
  artifact,
  fixtures,
  expectedOutputs,
  locale,
  onPassChange,
}: Readonly<{
  contract: CodeExerciseContract;
  artifact: PythonArtifactDto;
  fixtures: readonly PythonFixture[];
  expectedOutputs: readonly PythonExpectedOutput[];
  locale: LearningLocale;
  onPassChange?: (passed: boolean) => void;
}>) {
  const t = copy[locale];
  const initialSource = useMemo(() => starterSource(contract, artifact), [artifact, contract]);
  const [source, setSource] = useState(initialSource);
  const [result, setResult] = useState<RunResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const sourceRef = useRef(initialSource);
  const workerRef = useRef<Worker | null>(null);
  const activeRequestRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cases = useMemo(() => contract.requiredCases.map((caseKind) => {
    const fixture = fixtures.find((candidate) => candidate.case_kind === caseKind);
    const expected = fixture ? expectedOutputs.find((candidate) => candidate.fixture_ref === fixture.fixture_id) : undefined;
    if (!fixture || !expected) return null;
    const assertionPaths = caseKind === "failure"
      ? ["status", "index", "trace.events"]
      : ["status", "index", "recursive_index", "trace.events"];
    return { caseKind, fixtureId: fixture.fixture_id, input: fixture.input, expected: expected.value, assertionPaths };
  }).filter((value): value is NonNullable<typeof value> => value !== null), [contract.requiredCases, expectedOutputs, fixtures]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(storageKey(contract.assessmentItemId)) ?? "null") as { gateVersion?: unknown; source?: unknown; result?: unknown } | null;
      if (stored?.gateVersion === PAPER4_CODE_GATE_VERSION && typeof stored.source === "string") {
        sourceRef.current = stored.source;
        setSource(stored.source);
        if (stored.result && typeof stored.result === "object") {
          const restored = stored.result as RunResult;
          setResult(restored);
          onPassChange?.(restored.passed === true);
        }
      }
    } catch { /* Storage can be unavailable or stale. */ }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      workerRef.current?.terminate();
    };
  }, [contract.assessmentItemId, onPassChange]);

  const persist = (nextSource: string, nextResult: RunResult | null) => {
    try { window.sessionStorage.setItem(storageKey(contract.assessmentItemId), JSON.stringify({ gateVersion: PAPER4_CODE_GATE_VERSION, source: nextSource, result: nextResult })); } catch { /* Storage can be unavailable. */ }
  };

  const stopWorker = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setPhase("idle");
  };

  const failRuntime = (message: string) => {
    stopWorker();
    setError(message);
    setResult(null);
    onPassChange?.(false);
    persist(sourceRef.current, null);
  };

  const sendRun = (worker: Worker, requestId: string) => {
    setPhase("running");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => failRuntime(t.timeout), 4000);
    worker.postMessage({ type: "RUN", requestId, source: sourceRef.current, cases });
  };

  const runTests = () => {
    setError("");
    setResult(null);
    onPassChange?.(false);
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    activeRequestRef.current = requestId;
    let worker = workerRef.current;
    if (!worker) {
      worker = new Worker("/workers/paper4-python-runner.js");
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent) => {
        const message = event.data as { type?: string; requestId?: string; passed?: boolean; results?: readonly CaseResult[]; error?: string };
        if (message.requestId !== activeRequestRef.current) return;
        if (message.type === "READY") { sendRun(worker!, message.requestId); return; }
        if (message.type === "RESULT") {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = null;
          setPhase("idle");
          const nextResult = { passed: message.passed === true, results: message.results ?? [] };
          setResult(nextResult);
          onPassChange?.(nextResult.passed);
          persist(sourceRef.current, nextResult);
          return;
        }
        if (message.type === "ERROR") failRuntime(message.error || t.unavailable);
      };
      worker.onerror = () => failRuntime(t.unavailable);
      setPhase("loading");
      timerRef.current = setTimeout(() => failRuntime(t.unavailable), 20000);
      worker.postMessage({ type: "INIT", requestId });
      return;
    }
    sendRun(worker, requestId);
  };

  const changeSource = (value: string) => {
    sourceRef.current = value;
    setSource(value);
    setResult(null);
    setError("");
    onPassChange?.(false);
    persist(value, null);
  };

  const restoreStarter = () => changeSource(initialSource);
  const busy = phase !== "idle";

  return <section
    className={styles.runner}
    data-python-fixture-runner
    data-code-gate-version={PAPER4_CODE_GATE_VERSION}
    data-execution-complete={result?.passed ? "true" : "false"}
    aria-labelledby={`python-runner-${contract.assessmentItemId}`}
  >
    <header className={styles.header}>
      <span className={styles.badge}>{t.badge}</span>
      <h4 id={`python-runner-${contract.assessmentItemId}`}>{t.title}</h4>
      <p>{t.intro}</p>
    </header>
    <label className={styles.editor}>
      <span>{t.editor}</span>
      <textarea value={source} onChange={(event) => changeSource(event.currentTarget.value)} disabled={busy} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby={`python-security-${contract.assessmentItemId}`} />
    </label>
    <div className={styles.actions}>
      <Button onClick={runTests} disabled={busy || cases.length !== 3}>{busy ? phase === "loading" ? t.loading : t.running : t.run}</Button>
      <Button variant="secondary" onClick={restoreStarter} disabled={busy}>{t.reset}</Button>
    </div>
    <p id={`python-security-${contract.assessmentItemId}`} className={styles.security}>{t.security}</p>
    <div className={styles.results} role="status" aria-live="polite" aria-atomic="true">
      {error && <p className={styles.fail}>{error}</p>}
      {result && <>
        <h5>{t.results}</h5>
        <ul className={styles.caseList}>{result.results.map((caseResult) => <li key={caseResult.fixtureId} className={`${styles.case} ${caseResult.passed ? styles.pass : styles.fail}`}>
          <strong>{caseResult.caseKind}: {caseResult.passed ? t.pass : t.fail}</strong>
          {!caseResult.passed && <div>{t.firstDifference}: <code>{pathLabel(caseResult.divergentPath, locale)}</code><small>{t.expected}: {readable(caseResult.expected)} · {t.actual}: {readable(caseResult.actual)}</small></div>}
        </li>)}</ul>
        <p className={result.passed ? styles.complete : undefined}>{result.passed ? t.complete : t.incomplete}</p>
      </>}
    </div>
  </section>;
}
