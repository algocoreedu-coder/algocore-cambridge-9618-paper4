"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import { fileOrganisationTrace, hashAddress, hashTrace, type FileAccess, type FileOrganisation, type FileTask, type HashStep } from "@/app/lib/paper3/visual-models";
import { StepControls } from "./VisualPrimitives";
import common from "./LessonPage.module.css";
import styles from "./FileWorkbench.module.css";

const L = (en: string, vi: string): Localized => ({ en, vi });
type SceneStep = { id: string; title: Localized; action: Localized; why: Localized; table: readonly (number | null)[]; active: number; visited: readonly number[]; outcome: string; equation?: string; target?: number };
const baseKeys = [10, 17, 24, 6, 13] as const;
const fullKeys = [0, 7, 14, 21, 28, 35, 42] as const;
const emptyTable: readonly null[] = Array(7).fill(null);
const outcomes: Record<string, Localized> = { ready: L("Ready", "Sẵn sàng"), scan: L("Inspecting", "Đang xét"), probe: L("Compare and continue", "So sánh rồi dò tiếp"), found: L("Record found", "Tìm thấy bản ghi"), missing: L("Key absent", "Không có khóa"), inserted: L("Record inserted", "Đã chèn bản ghi"), duplicate: L("Duplicate rejected", "Từ chối khóa trùng"), full: L("Table full: no write", "Bảng đầy: không ghi"), read: L("Record read", "Đã đọc"), unsupported: L("Combination not supported here", "Mô hình chưa hỗ trợ tổ hợp này"), candidate: L("Candidate slot", "Ô ứng viên"), collision: L("Different key: follow the collision policy", "Khóa khác: cần xử lý va chạm"), empty: L("Empty home slot", "Ô gốc trống") };

function RecordSlots({ table, active, visited, locale, zeroBased = true }: { table: readonly (number | null)[]; active: number; visited: readonly number[]; locale: Locale; zeroBased?: boolean }) {
  return <ol className={styles.slots} aria-label={locale === "vi" ? "Các vị trí lưu bản ghi" : "Record storage positions"}>{table.map((key, index) => <li key={index} data-slot={zeroBased ? index : index + 1} data-key={key ?? "empty"} data-active={index === active} data-visited={visited.includes(index)}><span>{locale === "vi" ? (zeroBased ? "Ô" : "Vị trí") : (zeroBased ? "Slot" : "Position")} {zeroBased ? index : index + 1}</span><strong>{key === null ? "∅" : key}</strong><small>{index === active ? (locale === "vi" ? "◉ Đang xét" : "◉ Current") : visited.includes(index) ? (locale === "vi" ? "✓ Đã xét" : "✓ Checked") : key === null ? (locale === "vi" ? "Trống" : "Empty") : (locale === "vi" ? "Khóa" : "Key")}</small></li>)}</ol>;
}

function Scene({ step, steps, index, locale, zeroBased = true }: { step: SceneStep; steps: readonly SceneStep[]; index: number; locale: Locale; zeroBased?: boolean }) {
  return <>
    <div className={common.visualBody}>
      <div className={common.scene}>
        <p className={common.sceneTitle}>{locale === "vi" ? "BỐ TRÍ ĐANG QUAN SÁT" : "THE CURRENT STORAGE LAYOUT"}</p>
        <RecordSlots table={step.table} active={step.active} visited={step.visited} locale={locale} zeroBased={zeroBased} />
        <p className={styles.path} data-probe-path>{locale === "vi" ? "Đường đã xét: " : "Inspected path: "}<strong>{step.visited.length ? step.visited.map(position => zeroBased ? position : position + 1).join(" → ") : "—"}</strong></p>
        {step.equation && <p className={common.equation} data-visual-equation>{step.equation}</p>}
        <p className={styles.outcome} data-outcome={step.outcome}>{(outcomes[step.outcome] ?? outcomes.ready)[locale]}</p>
      </div>
      <div className={styles.explanation}><span className={common.stepCount}>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{steps.length}</span><h3>{step.title[locale]}</h3><p>{step.action[locale]}</p><p className={common.why}><strong>{locale === "vi" ? "Vì sao? " : "Why? "}</strong>{step.why[locale]}</p></div>
      <span className={common.srOnly} role="status">{step.title[locale]}. {step.action[locale]}</span>
    </div>
    <details className={common.fallback}><summary>{locale === "vi" ? "Đọc toàn bộ các trạng thái bằng bảng" : "Read every state as a table"}</summary><div className={common.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Các trạng thái truy cập" : "Access snapshots"}><table><caption>{locale === "vi" ? "Cùng dữ liệu với hình và bước đang chọn" : "The same data as the diagram and selected step"}</caption><thead><tr><th scope="col">{locale === "vi" ? "Bước" : "Step"}</th><th scope="col">{locale === "vi" ? "Bố trí / đường đi" : "Layout / path"}</th><th scope="col">{locale === "vi" ? "Thao tác và lý do" : "Action and reason"}</th></tr></thead><tbody>{steps.map((item, i) => <tr key={item.id} data-fallback-step={item.id}><th scope="row">{i + 1}. {item.title[locale]}</th><td>{item.table.map((value, position) => `${zeroBased ? position : position + 1}: ${value ?? "∅"}`).join("; ")}<br />{item.visited.map(position => zeroBased ? position : position + 1).join(" → ") || "—"}{item.equation && <p>{item.equation}</p>}</td><td>{item.action[locale]}<br />{item.why[locale]}</td></tr>)}</tbody></table></div></details>
  </>;
}

function KeyInput({ draft, onDraft, onApply, onPreset, error, locale, disabled = false }: { draft: string; onDraft: (value: string) => void; onApply: () => void; onPreset: (value: number) => void; error: boolean; locale: Locale; disabled?: boolean }) {
  return <div className={styles.keyControls}><div className={common.inputGroup}><label htmlFor="file-key-input">{locale === "vi" ? "Khóa nguyên từ 0 đến 9999" : "Integer key from 0 to 9999"}</label><input id="file-key-input" inputMode="numeric" value={draft} disabled={disabled} aria-invalid={error || undefined} aria-describedby="file-key-help" onChange={event => onDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") onApply(); }} /><small id="file-key-help">{locale === "vi" ? "Giới hạn nhập của minh họa, không phải giới hạn của hash." : "A demonstration input bound, not a limit of hashing."}</small></div><Button disabled={disabled} onClick={onApply}>{locale === "vi" ? "Dùng khóa này" : "Use this key"}</Button><div className={styles.presets} aria-label={locale === "vi" ? "Khóa ví dụ" : "Example keys"}>{[10, 17, 24, 6, 13, 31].map(key => <Button variant="secondary" key={key} disabled={disabled} onClick={() => onPreset(key)}>{key}</Button>)}</div>{error && <p role="alert" className={styles.error}>{locale === "vi" ? "Nhập số nguyên 0–9999. Chưa đổi khóa hay bảng đang dùng." : "Enter an integer from 0 to 9999. The current key and table have not changed."}</p>}</div>;
}
function validKey(draft: string) { const trimmed = draft.trim(); return /^\d+$/.test(trimmed) && Number.isSafeInteger(Number(trimmed)) && Number(trimmed) <= 9999; }

function OrganisationWorkbench({ locale }: { locale: Locale }) {
  const [organisation, setOrganisation] = useState<FileOrganisation>("serial");
  const [access, setAccess] = useState<FileAccess>("sequential");
  const [task, setTask] = useState<FileTask>("find20");
  const [index, setIndex] = useState(0);
  const trace = useMemo(() => fileOrganisationTrace(organisation, access, task), [organisation, access, task]);
  const step = trace.steps[index] ?? trace.steps[0];
  return <div className={styles.workbench} data-visual-kind="file-organisation" data-visual-step={step.id} data-file-organisation={organisation} data-file-access={access} data-file-task={task}>
    <div className={common.visualControls}>
      <div className={common.inputGroup}><label htmlFor="file-organisation">{locale === "vi" ? "Cách tổ chức" : "Organisation"}</label><select id="file-organisation" value={organisation} onChange={event => { setOrganisation(event.target.value as FileOrganisation); setIndex(0); }}><option value="serial">Serial</option><option value="sequential">Sequential</option><option value="random">Random</option></select></div>
      <div className={common.inputGroup}><label htmlFor="file-access">{locale === "vi" ? "Cách truy cập" : "Access path"}</label><select id="file-access" value={access} onChange={event => { setAccess(event.target.value as FileAccess); setIndex(0); }}><option value="sequential">{locale === "vi" ? "Tuần tự" : "Sequential"}</option><option value="direct">{locale === "vi" ? "Trực tiếp" : "Direct"}</option></select></div>
      <div className={common.inputGroup}><label htmlFor="file-task">{locale === "vi" ? "Nhu cầu" : "Workload"}</label><select id="file-task" value={task} onChange={event => { setTask(event.target.value as FileTask); setIndex(0); }}><option value="find20">{locale === "vi" ? "Tìm khóa 20" : "Find key 20"}</option><option value="find18">{locale === "vi" ? "Tìm khóa 18" : "Find key 18"}</option><option value="read-all">{locale === "vi" ? "Đọc tất cả bản ghi" : "Read all records"}</option><option value="insert22">{locale === "vi" ? "Chèn khóa 22" : "Insert key 22"}</option></select></div>
    </div>
    <p className={styles.caption}>{locale === "vi" ? "Giữ nguyên bản ghi đầu vào; hai lựa chọn tổ chức và truy cập được xét riêng. Tổ hợp ngoài mô hình sẽ được giải thích, không tự đổi thuật toán." : "Keep the same input records; organisation and access are independent choices. A combination outside this model is explained, not silently replaced."}</p>
    {!trace.supported && <p className={styles.unsupported} role="status">{trace.steps[trace.steps.length - 1].action[locale]}</p>}
    {organisation === "sequential" && access === "direct" && <div className={styles.index}><strong>{locale === "vi" ? "Chỉ mục được cung cấp · khóa → vị trí" : "Provided index · key → position"}</strong><code>12 → 1; 18 → 2; 25 → 3; 31 → 4</code><p>{locale === "vi" ? "Chỉ mục này là cấu trúc riêng. Sau khi chèn hoặc di chuyển bản ghi, nó phải được cập nhật." : "This index is a separate structure. It must be updated after records are inserted or relocated."}</p></div>}
    <StepControls index={index} steps={trace.steps} onChange={setIndex} locale={locale} />
    <Scene step={step} steps={trace.steps} index={index} locale={locale} zeroBased={organisation === "random"} />
    {task === "read-all" && <p className={styles.readOutput} data-file-output>{locale === "vi" ? "Khóa đã đọc: " : "Keys read: "}{step.output.join(" → ") || "—"}</p>}
  </div>;
}

function HashWorkbench({ locale }: { locale: Locale }) {
  const [key, setKey] = useState(10); const [draft, setDraft] = useState("10"); const [error, setError] = useState(false); const [index, setIndex] = useState(0);
  const steps = useMemo<SceneStep[]>(() => {
    const address = hashAddress(key); const table = hashTrace(baseKeys, key, "lookup").table; const stored = table[address];
    return [
      { id: "key", title: L("Identify the record key", "Xác định khóa bản ghi"), action: L(`Requested key: ${key}.`, `Khóa yêu cầu: ${key}.`), why: L("A key identifies a record; its home slot has not yet been calculated.", "Khóa nhận diện bản ghi; chưa tính ô gốc."), table, active: -1, visited: [], outcome: "ready", equation: `k = ${key}` },
      { id: "division", title: L("Separate quotient and remainder", "Tách thương và số dư"), action: L(`Divide ${key} by 7.`, `Chia ${key} cho 7.`), why: L("MOD returns the remainder, not the quotient. The remainder must lie from 0 to 6.", "MOD trả về số dư, không phải thương. Số dư phải từ 0 đến 6."), table, active: -1, visited: [], outcome: "ready", equation: `${key} = ${Math.floor(key / 7)} × 7 + ${address}` },
      { id: "slot", title: L("Select the home slot", "Chọn ô gốc"), action: L(`h(${key}) = ${address}. Inspect this candidate slot.`, `h(${key}) = ${address}. Xét ô ứng viên này.`), why: L("Different keys may share this remainder, so the address alone is not proof of a match.", "Các khóa khác nhau có thể cùng số dư, nên riêng địa chỉ chưa chứng minh khớp."), table, active: address, visited: [], outcome: "candidate", equation: `${key} MOD 7 = ${address}` },
      { id: "record-check", title: L("Compare the stored key", "So sánh khóa được lưu"), action: stored === null ? L(`Slot ${address} is empty.`, `Ô ${address} trống.`) : L(`Slot ${address} stores key ${stored}; requested key is ${key}.`, `Ô ${address} lưu khóa ${stored}; khóa yêu cầu là ${key}.`), why: stored === key ? L("The record key matches. This is the requested record.", "Khóa bản ghi khớp. Đây là bản ghi cần tìm.") : stored === null ? L("In this insertion-only table, a never-used empty home slot means the key is absent.", "Trong bảng chỉ chèn này, ô gốc chưa dùng còn trống cho biết khóa không có.") : L("Do not return this different record or overwrite it. The collisions lesson traces the next probes.", "Không trả về bản ghi khác này hoặc ghi đè nó. Bài va chạm theo dõi các ô dò tiếp."), table, active: address, visited: [address], outcome: stored === key ? "found" : stored === null ? "empty" : "collision", equation: stored === null ? `${address}: ∅` : `${stored} ${stored === key ? "=" : "≠"} ${key}` },
    ];
  }, [key]);
  const step = steps[index]; const change = (value: number) => { setKey(value); setDraft(String(value)); setError(false); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="hashing" data-visual-step={step.id} data-visual-key={key}>
    <KeyInput draft={draft} onDraft={setDraft} onApply={() => validKey(draft) ? change(Number(draft)) : setError(true)} onPreset={change} error={error} locale={locale} />
    <p className={styles.caption}>{locale === "vi" ? "Bảng hiện tại được dựng lần lượt từ các khóa 10, 17, 24, 6, 13 bằng dò tuyến tính. Minh họa này tính ô gốc và kiểm khóa tại đó." : "The current table was built from keys 10, 17, 24, 6, 13 using linear probing. This visual calculates the home slot and checks its key."}</p>
    <div className={styles.flow} aria-label={locale === "vi" ? "Từ khóa tới ô ứng viên" : "From key to candidate slot"}><span>{locale === "vi" ? "Khóa" : "Key"}<strong>{key}</strong></span><ArrowRight aria-hidden="true" /><span>MOD<strong>7</strong></span><ArrowRight aria-hidden="true" /><span>{locale === "vi" ? "Ô gốc" : "Home slot"}<strong>{index >= 2 ? hashAddress(key) : "?"}</strong></span></div>
    <StepControls index={index} steps={steps} onChange={setIndex} locale={locale} /><Scene step={step} steps={steps} index={index} locale={locale} />
  </div>;
}

function CollisionWorkbench({ locale }: { locale: Locale }) {
  const [dataset, setDataset] = useState("base"); const [operation, setOperation] = useState<"lookup" | "insert" | "build">("lookup");
  const [key, setKey] = useState(24); const [draft, setDraft] = useState("24"); const [error, setError] = useState(false); const [index, setIndex] = useState(0);
  const keys = dataset === "base" ? baseKeys : dataset === "full" ? fullKeys : [];
  const steps = useMemo<SceneStep[]>(() => {
    const initialTable = operation === "build" ? emptyTable : hashTrace(keys, key, "lookup").table;
    const result: SceneStep[] = [{ id: "start", title: L("Read the starting table and policy", "Đọc bảng ban đầu và chính sách"), action: L(operation === "build" ? `Insert keys in order: ${keys.join(", ") || "none"}.` : `${operation === "insert" ? "Insert" : "Look up"} key ${key}; home slot = ${hashAddress(key)}.`, operation === "build" ? `Chèn khóa theo thứ tự: ${keys.join(", ") || "không có"}.` : `${operation === "insert" ? "Chèn" : "Tìm"} khóa ${key}; ô gốc = ${hashAddress(key)}.`), why: L("Use MOD 7, compare keys, then (slot + 1) MOD 7. No deletion; stop after at most seven inspected slots per operation.", "Dùng MOD 7, so sánh khóa rồi (ô + 1) MOD 7. Không xóa; dừng sau tối đa bảy ô đã xét cho mỗi thao tác."), table: initialTable, active: -1, visited: [], outcome: "ready", target: operation === "build" ? keys[0] : key }];
    const append = (modelSteps: readonly HashStep[], target: number, prefix: string) => {
      const visited: number[] = [];
      for (const state of modelSteps) { if (state.index >= 0) visited.push(state.index); result.push({ id: `${prefix}${state.id}`, title: L(state.index >= 0 ? `Key ${target} · slot ${state.index}` : `Key ${target} · stop`, state.index >= 0 ? `Khóa ${target} · ô ${state.index}` : `Khóa ${target} · dừng`), action: state.action, why: state.why, table: state.table, active: state.index, visited: [...visited], outcome: state.outcome, target, equation: `${target} MOD 7 = ${hashAddress(target)}` }); }
    };
    if (operation === "build") keys.forEach((target, i) => append(hashTrace(keys.slice(0, i), target, "insert").steps, target, `build-${i}-`));
    else append(hashTrace(keys, key, operation).steps, key, "");
    return result;
  }, [dataset, operation, key]); // The dataset selects one immutable, declared key sequence.
  const step = steps[index] ?? steps[0]; const change = (value: number) => { setKey(value); setDraft(String(value)); setError(false); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="collisions" data-visual-step={step.id} data-visual-key={step.target ?? "none"} data-collision-operation={operation} data-collision-dataset={dataset}>
    <div className={common.visualControls}><div className={common.inputGroup}><label htmlFor="collision-dataset">{locale === "vi" ? "Dữ liệu ban đầu" : "Starting dataset"}</label><select id="collision-dataset" value={dataset} onChange={event => { setDataset(event.target.value); setIndex(0); }}><option value="base">10, 17, 24, 6, 13</option><option value="empty">{locale === "vi" ? "Bảng trống" : "Empty table"}</option><option value="full">{locale === "vi" ? "Bảng đầy: 0, 7, 14, 21, 28, 35, 42" : "Full table: 0, 7, 14, 21, 28, 35, 42"}</option></select></div><div className={common.inputGroup}><label htmlFor="collision-operation">{locale === "vi" ? "Thao tác" : "Operation"}</label><select id="collision-operation" value={operation} onChange={event => { setOperation(event.target.value as typeof operation); setIndex(0); }}><option value="lookup">{locale === "vi" ? "Tìm khóa" : "Look up a key"}</option><option value="insert">{locale === "vi" ? "Chèn khóa" : "Insert a key"}</option><option value="build">{locale === "vi" ? "Dựng bảng từng khóa" : "Build the table key by key"}</option></select></div></div>
    <KeyInput draft={draft} onDraft={setDraft} onApply={() => validKey(draft) ? change(Number(draft)) : setError(true)} onPreset={change} error={error} locale={locale} disabled={operation === "build"} />
    <p className={styles.caption}>{locale === "vi" ? "Mỗi trace bắt đầu từ bộ dữ liệu đã chọn. Chọn Dựng bảng để xem các lần chèn liên tiếp; chế độ tìm và chèn dùng chính bảng được dựng từ bộ đó." : "Each trace starts from the selected dataset. Choose Build to see its successive insertions; lookup and insertion start from that same constructed table."}</p>
    <StepControls index={index} steps={steps} onChange={setIndex} locale={locale} /><Scene step={step} steps={steps} index={index} locale={locale} />
  </div>;
}

export function FileWorkbench({ kind, locale }: { kind: "file-organisation" | "hashing" | "collisions"; locale: Locale }) {
  return kind === "file-organisation" ? <OrganisationWorkbench locale={locale} /> : kind === "hashing" ? <HashWorkbench locale={locale} /> : <CollisionWorkbench locale={locale} />;
}
