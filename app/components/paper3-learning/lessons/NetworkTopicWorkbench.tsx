"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Laptop, LockKeyhole, Network, RotateCcw, UnlockKeyhole, Users } from "lucide-react";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import type { Locale } from "@/app/lib/paper3/catalog";
import {
  protocolScenario, protocolScenarios, bittorrentTrace, bittorrentScenarios, packetRoutingTrace, packetRoutingScenarios, switchingTrace, switchingScenarios,
  type ApplicationProtocol, type BitTorrentState, type NetworkTopicKind, type NetworkTopicStep, type PacketRoutingTrace, type PacketState, type PeerId, type RouteNodeId, type SwitchingMethod, type SwitchingScenarioId, type SwitchingState,
} from "@/app/lib/paper3/network-topic-models";
import styles from "./NetworkTopicWorkbench.module.css";

function Controls({ steps, index, onChange, locale }: { readonly steps: readonly NetworkTopicStep[]; readonly index: number; readonly onChange: (index: number) => void; readonly locale: Locale }) {
  const id = useId();
  return <div className={styles.controls}>
    <Button variant="secondary" data-topic-previous disabled={index === 0} onClick={() => onChange(index - 1)}><ArrowLeft size={16} aria-hidden="true" />{locale === "vi" ? "Bước trước" : "Previous"}</Button>
    <Button data-topic-next disabled={index === steps.length - 1} onClick={() => onChange(index + 1)}>{locale === "vi" ? "Bước tiếp" : "Next"}<ArrowRight size={16} aria-hidden="true" /></Button>
    <Button variant="quiet" data-topic-reset onClick={() => onChange(0)}><RotateCcw size={16} aria-hidden="true" />{locale === "vi" ? "Đặt lại" : "Reset"}</Button>
    <div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn bước" : "Jump to step"}</label><select id={id} data-topic-jump value={index} onChange={event => onChange(Number(event.target.value))}>{steps.map((step, i) => <option key={step.id} value={i}>{i + 1}. {step.title[locale]}</option>)}</select></div>
  </div>;
}

function Heading({ step, index, count, locale }: { readonly step: NetworkTopicStep; readonly index: number; readonly count: number; readonly locale: Locale }) {
  return <div className={styles.heading}><span>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{count}</span><h3>{step.title[locale]}</h3><span className={styles.srOnly} role="status">{locale === "vi" ? "Bước" : "Step"} {index + 1}. {step.title[locale]}.</span></div>;
}

function Explanation({ step, locale }: { readonly step: NetworkTopicStep; readonly locale: Locale }) {
  return <dl className={styles.explanation} data-step-explanation><div><dt>{locale === "vi" ? "Thao tác" : "Action"}</dt><dd data-step-action>{step.action[locale]}</dd></div><div><dt>{locale === "vi" ? "Vì sao" : "Why"}</dt><dd data-step-why>{step.why[locale]}</dd></div><div><dt>{locale === "vi" ? "Kết quả" : "Outcome"}</dt><dd data-step-outcome>{step.outcome[locale]}</dd></div></dl>;
}

function SnapshotTable<S extends NetworkTopicStep>({ steps, stepId, before, after, locale }: { readonly steps: readonly S[]; readonly stepId: string; readonly before: (step: S) => ReactNode; readonly after: (step: S) => ReactNode; readonly locale: Locale }) {
  return <details className={styles.fallback} data-topic-fallback><summary>{locale === "vi" ? "Đọc toàn bộ trạng thái dạng bảng" : "Read every snapshot as a table"}</summary><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Bảng trạng thái minh họa" : "Visual snapshot table"}><table><caption>{locale === "vi" ? "Bảng và hình dùng cùng snapshot; hàng đang chọn được đánh dấu." : "The table and diagram use the same snapshots; the selected row is marked."}</caption><thead><tr>{(locale === "vi" ? ["Bước", "Trước", "Sau", "Thao tác / Lý do / Kết quả"] : ["Step", "Before", "After", "Action / Why / Outcome"]).map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{steps.map((step, i) => <tr key={step.id} data-fallback-step={step.id} data-selected={stepId === step.id} aria-current={stepId === step.id ? "step" : undefined}><th scope="row">{i + 1}. {step.title[locale]}{stepId === step.id && <strong className={styles.selectedTag}>{locale === "vi" ? "Đang chọn" : "Selected"}</strong>}</th><td data-state-before>{before(step)}</td><td data-state-after>{after(step)}</td><td><p>{step.action[locale]}</p><p>{step.why[locale]}</p><p>{step.outcome[locale]}</p></td></tr>)}</tbody></table></div></details>;
}

function ProtocolWorkbench({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [scenarioId, setScenarioId] = useState("scenario-web");
  const [choice, setChoice] = useState<ApplicationProtocol | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState<Readonly<Record<string, boolean>>>({});
  const scenario = useMemo(() => protocolScenario(scenarioId), [scenarioId]);
  const selected = scenario.choices.find(item => item.id === choice);
  const reveal = () => { setRevealed(true); setSeen(current => ({ ...current, [scenarioId]: true })); };
  return <div className={styles.workbench} data-visual-kind="application-protocols" data-scenario-id={scenarioId} data-protocol-choice={choice ?? "none"} data-answer-seen={Boolean(seen[scenarioId])}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn nhu cầu sử dụng" : "Choose the required service"}</label><select id={id} data-topic-scenario value={scenarioId} onChange={event => { setScenarioId(event.target.value); setChoice(null); setChecked(false); setRevealed(false); }}>{protocolScenarios.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div></div>
    <div className={styles.body}>
      <div className={styles.taskCard}><span>{locale === "vi" ? "NHU CẦU → CHỨC NĂNG → GIAO THỨC" : "TASK → FUNCTION → PROTOCOL"}</span><h3>{scenario.prompt[locale]}</h3></div>
      <div className={styles.protocolChoices} role="group" aria-label={locale === "vi" ? "Chọn giao thức" : "Select a protocol"}>{scenario.choices.map(item => <button type="button" key={item.id} data-protocol-option={item.id} aria-pressed={choice === item.id} onClick={() => { setChoice(item.id); setChecked(false); }}><strong>{item.label[locale]}</strong></button>)}</div>
      <div className={styles.actions}><Button disabled={!choice} data-protocol-check onClick={() => setChecked(true)}>{locale === "vi" ? "Kiểm tra lựa chọn" : "Check choice"}</Button><Button variant="secondary" onClick={reveal}>{locale === "vi" ? "Xem lời giải" : "Show explanation"}</Button><Button variant="quiet" onClick={() => { setChoice(null); setChecked(false); setRevealed(false); }}>{locale === "vi" ? "Thử lại" : "Try again"}</Button></div>
      {checked && selected && <div className={styles.feedback} role="status" data-correct={selected.correct}><strong>{selected.correct ? (locale === "vi" ? "Phù hợp với nhu cầu" : "Matches the required service") : (locale === "vi" ? "Xét lại chức năng cần có" : "Reconsider the required function")}</strong><p>{selected.feedback[locale]}</p></div>}
      {(checked || revealed) && <div className={styles.answerPath} data-protocol-path><div><small>{locale === "vi" ? "Chức năng cần có" : "Required function"}</small><p>{scenario.requiredFunction[locale]}</p></div><ArrowRight size={22} aria-hidden="true" /><div><small>{revealed ? (locale === "vi" ? "Phù hợp nhất với đề bài" : "Best match for this prompt") : (locale === "vi" ? "Lựa chọn của bạn" : "Your choice")}</small><strong>{revealed ? scenario.correctChoiceId : choice}</strong></div></div>}
      {revealed && <Explanation step={scenario} locale={locale} />}
      {seen[scenarioId] && <p className={styles.supported}>{locale === "vi" ? "Lượt luyện tập này đã có hỗ trợ từ lời giải." : "This practice attempt has had support from the explanation."}</p>}
    </div>
    <details className={styles.fallback} data-topic-fallback onToggle={event => { if (event.currentTarget.open) setSeen(Object.fromEntries(protocolScenarios.map(item => [item.id, true]))); }}><summary>{locale === "vi" ? "Đọc bảng nhu cầu, giao thức và lý do" : "Read the service, protocol and reasoning table"}</summary><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Bảng lựa chọn giao thức" : "Protocol selection table"}><table><thead><tr><th scope="col">{locale === "vi" ? "Nhu cầu" : "Task"}</th><th scope="col">{locale === "vi" ? "Chức năng" : "Function"}</th><th scope="col">{locale === "vi" ? "Giao thức và lý do" : "Protocol and reason"}</th></tr></thead><tbody>{protocolScenarios.map(item => { const row = protocolScenario(item.id); return <tr key={row.id} data-fallback-scenario={row.id} data-selected={row.id === scenarioId}><th scope="row">{row.prompt[locale]}</th><td>{row.requiredFunction[locale]}</td><td><strong>{row.correctChoiceId}</strong><p>{row.why[locale]}</p></td></tr>; })}</tbody></table></div></details>
  </div>;
}

const peerIds: readonly PeerId[] = ["S", "P", "Q", "L"];
function TorrentSummary({ state, locale }: { readonly state: BitTorrentState; readonly locale: Locale }) {
  return <>{peerIds.map(peer => <p key={peer}>{peer}: {state.inventories[peer].join(", ") || "∅"} · {state.online[peer] ? "online" : "offline"}</p>)}<p>{locale === "vi" ? "Metadata" : "Metadata"}: {state.metadataObtained ? "✓" : "—"}; {locale === "vi" ? "Tìm peer" : "Peer discovery"}: {state.peersDiscovered ? "✓" : "—"}</p><p>{state.assembled ? (locale === "vi" ? "Đã ghép tệp" : "File assembled") : (locale === "vi" ? "Chưa ghép tệp" : "File not assembled")}{state.blockedPiece && ` · ${locale === "vi" ? "Không có nguồn online cho" : "No online source for"} ${state.blockedPiece}`}</p></>;
}

function BitTorrentWorkbench({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [scenarioId, setScenarioId] = useState("complete");
  const [index, setIndex] = useState(0);
  const trace = useMemo(() => bittorrentTrace(scenarioId), [scenarioId]);
  const step = trace.steps[index];
  return <div className={styles.workbench} data-visual-kind="bittorrent" data-scenario-id={scenarioId} data-visual-step={step.id}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn tình huống swarm" : "Choose a swarm scenario"}</label><select id={id} data-topic-scenario value={scenarioId} onChange={event => { setScenarioId(event.target.value); setIndex(0); }}>{bittorrentScenarios.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div></div>
    <Controls steps={trace.steps} index={index} onChange={setIndex} locale={locale} />
    <div className={styles.body}><Heading step={step} index={index} count={trace.steps.length} locale={locale} /><p className={styles.caption}>{trace.convention[locale]}</p>
      <div className={styles.coordination}><div data-metadata-ready={step.after.metadataObtained} data-active={step.id === "metadata"}><strong><FileText size={18} aria-hidden="true" />{locale === "vi" ? "Metadata mô tả tệp" : "File metadata"}</strong><p>{step.after.metadataObtained ? (locale === "vi" ? "L đã đọc mô tả các piece A–D." : "L has read the description of pieces A–D.") : (locale === "vi" ? "L chưa đọc mô tả tệp." : "L has not read the descriptor yet.")}</p><p>{locale === "vi" ? "Metadata không phải nội dung các piece." : "Metadata is not the file-piece content."}</p></div><div data-tracker-pieces="none" data-peers-discovered={step.after.peersDiscovered} data-active={step.id === "discover-peers"}><strong><Users size={18} aria-hidden="true" />Tracker</strong><p>{step.after.peersDiscovered ? (locale === "vi" ? "Đã cung cấp thông tin liên hệ S, P, Q cho L." : "Has supplied S, P and Q contact information to L.") : (locale === "vi" ? "Cung cấp thông tin để tìm peer." : "Provides information for peer discovery.")}</p><p>{locale === "vi" ? "Tracker không chuyển các piece tệp." : "The tracker does not transfer file pieces."}</p></div></div>
      {step.transfer && <div className={styles.transfer} data-piece-transfer data-transfer-source={step.transfer.source} data-transfer-target={step.transfer.target} data-transfer-piece={step.transfer.piece}><div><strong>{step.transfer.source}</strong><small>{locale === "vi" ? "Nguồn giữ bản sao" : "Source keeps its copy"}</small></div><div><span className={styles.pieceInFlight}>{step.transfer.piece}</span><ArrowRight size={22} aria-hidden="true" /></div><div><strong>{step.transfer.target}</strong><small>{locale === "vi" ? "Nhận bản sao" : "Receives a copy"}</small></div></div>}
      <div className={styles.swarm}>{peerIds.map(peer => <div className={styles.peer} key={peer} data-peer-id={peer} data-online={step.after.online[peer]} data-active={step.transfer?.source === peer || step.transfer?.target === peer}><div className={styles.peerTitle}><strong>{peer === "S" ? "Seed S" : `Peer ${peer}`}</strong><span>{step.after.online[peer] ? "● online" : "○ offline"}</span></div><div className={styles.pieces}>{trace.pieces.map(piece => { const owned = step.after.inventories[peer].includes(piece); const added = owned && !step.before.inventories[peer].includes(piece); return <span key={piece} className={styles.piece} data-piece-id={piece} data-owned={owned} data-added={added} aria-label={`${peer}, ${piece}: ${owned ? (locale === "vi" ? "đã có" : "owned") : (locale === "vi" ? "chưa có" : "not owned")}${added ? (locale === "vi" ? ", vừa nhận" : ", newly received") : ""}`}>{owned ? piece : "—"}</span>; })}</div><p>{locale === "vi" ? "Đang giữ" : "Owns"}: {step.after.inventories[peer].join(", ") || "∅"}</p></div>)}</div>
      <div className={styles.result} data-complete={step.after.assembled} data-blocked-piece={step.after.blockedPiece ?? "none"}><strong>{step.after.assembled ? (locale === "vi" ? "L đã ghép đủ tệp A–D" : "L has assembled the complete A–D file") : (locale === "vi" ? "Tệp ở L chưa được ghép hoàn chỉnh" : "L’s file has not been fully assembled")}</strong>{step.after.blockedPiece && <p>{locale === "vi" ? "Dừng: không có peer online nào giữ piece" : "Stopped: no online peer holds piece"} {step.after.blockedPiece}.</p>}</div>
      <Explanation step={step} locale={locale} />
    </div><SnapshotTable steps={trace.steps} stepId={step.id} before={item => <TorrentSummary state={item.before} locale={locale} />} after={item => <TorrentSummary state={item.after} locale={locale} />} locale={locale} />
  </div>;
}

const positions: Readonly<Record<RouteNodeId, readonly [number, number]>> = { Source: [8, 50], R1: [29, 50], R2: [57, 20], R3: [57, 80], Destination: [87, 50] };
const nodeLabel = (node: RouteNodeId, locale: Locale) => node === "Source" ? (locale === "vi" ? "Nguồn" : "Source") : node === "Destination" ? (locale === "vi" ? "Đích" : "Destination") : node;
function RoutingDiagram({ trace, state, locale }: { readonly trace: PacketRoutingTrace; readonly state: PacketState; readonly locale: Locale }) {
  const links = trace.topology.map(([from, to]) => ({ from, to, available: !(from === "R1" && to === "R2") || state.linkR1R2Up, active: from === state.activeRouter && to === state.chosenNextHop }));
  const diagramLabel = `${locale === "vi" ? "Mạng minh họa. Router đang xét" : "Illustrative network. Router in focus"}: ${state.activeRouter ?? "—"}; next hop: ${state.chosenNextHop ?? "—"}; R1–R2: ${state.linkR1R2Up ? (locale === "vi" ? "khả dụng" : "available") : (locale === "vi" ? "không khả dụng" : "unavailable")}.`;
  return <><div className={styles.graph} role="img" aria-label={diagramLabel}><svg viewBox="0 0 1000 240" aria-hidden="true" preserveAspectRatio="none">{links.map(link => <path key={`${link.from}-${link.to}`} d={`M${positions[link.from][0] * 10} ${positions[link.from][1] * 2.4} L${positions[link.to][0] * 10} ${positions[link.to][1] * 2.4}`} data-route-edge={`${link.from}-${link.to}`} data-available={link.available} data-active={link.active} />)}</svg>{(Object.keys(positions) as RouteNodeId[]).map(node => <div key={node} className={styles.graphNode} style={{ left: `${positions[node][0]}%`, top: `${positions[node][1]}%` }} data-route-node={node} data-active={state.activeRouter === node}>{node === "Source" || node === "Destination" ? <Laptop size={17} aria-hidden="true" /> : <Network size={17} aria-hidden="true" />}{nodeLabel(node, locale)}</div>)}</div><div className={styles.topologyList} aria-label={locale === "vi" ? "Các kết nối của mạng minh họa" : "Illustrative network connections"}>{links.map(link => <span key={`${link.from}-${link.to}`} data-route-edge={`${link.from}-${link.to}`} data-active={link.active} data-available={link.available}>{nodeLabel(link.from, locale)} → {nodeLabel(link.to, locale)}{!link.available && ` · ${locale === "vi" ? "không khả dụng" : "unavailable"}`}{link.active && ` · ${locale === "vi" ? "đang xét" : "in focus"}`}</span>)}</div></>;
}

function RoutingSummary({ state, locale }: { readonly state: PacketState; readonly locale: Locale }) {
  return <><p>{Object.entries(state.locations).map(([id, location]) => `${id}: ${nodeLabel(location, locale)}`).join("; ")}</p><p>R1–R2: {state.linkR1R2Up ? (locale === "vi" ? "khả dụng" : "available") : (locale === "vi" ? "không khả dụng" : "unavailable")}</p><p>{locale === "vi" ? "Router / dòng / next hop" : "Router / row / next hop"}: {state.activeRouter ?? "—"} / {state.matchedRow ?? "—"} / {state.chosenNextHop ?? "—"}</p><p>{locale === "vi" ? "Thứ tự đến" : "Arrival order"}: {state.arrivalOrder.join(" → ") || "∅"}</p><p>{state.stopped ? (locale === "vi" ? "Đã dừng" : "Stopped") : state.assembled ? state.message : (locale === "vi" ? "Chưa ghép" : "Not reassembled")}</p></>;
}

function RoutingWorkbench({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [scenarioId, setScenarioId] = useState("reroute");
  const [index, setIndex] = useState(0);
  const trace = useMemo(() => packetRoutingTrace(scenarioId), [scenarioId]);
  const step = trace.steps[index];
  const state = step.after;
  return <div className={styles.workbench} data-visual-kind="packet-routing" data-scenario-id={scenarioId} data-visual-step={step.id}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn thông tin định tuyến được cung cấp" : "Choose the provided routing information"}</label><select id={id} data-topic-scenario value={scenarioId} onChange={event => { setScenarioId(event.target.value); setIndex(0); }}>{packetRoutingScenarios.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div></div><Controls steps={trace.steps} index={index} onChange={setIndex} locale={locale} />
    <div className={styles.body}><Heading step={step} index={index} count={trace.steps.length} locale={locale} /><p className={styles.caption}>{trace.convention[locale]}</p>
      <div className={styles.packetList}>{trace.packets.map(packet => <div className={styles.packet} key={packet.id} data-packet-id={packet.id} data-packet-location={state.locations[packet.id]} data-active={state.activePacket === packet.id}><strong>{packet.id} · {locale === "vi" ? "thứ tự" : "order"} {packet.order}</strong><span>{locale === "vi" ? "Đích" : "Destination"}: {nodeLabel(packet.destination, locale)}</span><span>{locale === "vi" ? "Vị trí" : "Location"}: {nodeLabel(state.locations[packet.id], locale)}</span><code>{packet.payload}</code></div>)}</div>
      <RoutingDiagram trace={trace} state={state} locale={locale} />
      {state.activeRouter && <div className={styles.lookup} data-active-router={state.activeRouter}><strong>{locale === "vi" ? "Bảng tại" : "Table at"} {state.activeRouter}</strong><p>{locale === "vi" ? "So đích của packet với thông tin định tuyến được cung cấp." : "Match the packet’s destination against the supplied routing information."}</p><div className={styles.routingRows}>{trace.tables[state.activeRouter].map(row => <div key={row.id} data-routing-row={row.id} data-matched={state.matchedRow === row.id}><span>{nodeLabel(row.destination, locale)} → <strong>{nodeLabel(row.nextHop, locale)}</strong></span><span>{row.priority === 1 ? (locale === "vi" ? "Dòng chính" : "Primary row") : (locale === "vi" ? "Dòng thay thế" : "Alternative row")}{state.matchedRow === row.id && " · ◉"}</span></div>)}</div><p data-next-hop>{locale === "vi" ? "Next hop đang xét" : "Next hop under consideration"}: <strong>{state.chosenNextHop ? nodeLabel(state.chosenNextHop, locale) : "—"}</strong></p></div>}
      <div className={styles.buffer} data-receiver-buffer data-assembled={state.assembled}><h4>{locale === "vi" ? "Bộ đệm bên nhận" : "Receiver buffer"}</h4><p>{locale === "vi" ? "Thứ tự đến" : "Arrival order"}: <span data-arrival-order>{state.arrivalOrder.join(" → ") || "∅"}</span></p><div className={styles.bufferPieces}>{state.buffer.map(packetId => <span key={packetId}>{packetId} · {trace.packets.find(packet => packet.id === packetId)!.payload}</span>)}</div>{state.assembled && <strong className={styles.reassembled} data-reassembled-message>{state.message}</strong>}{!state.assembled && <p>{locale === "vi" ? "Chưa ghép thông điệp hoàn chỉnh." : "The complete message has not been reassembled."}</p>}</div>
      {state.stopped && <div className={styles.result} data-routing-stopped><strong>{locale === "vi" ? "Dừng: không có next hop khả dụng trong bảng được cho." : "Stopped: the supplied table provides no available next hop."}</strong><p>{locale === "vi" ? "Không tự tạo tuyến thay thế hay ghép dữ liệu chưa đến." : "No alternative route or missing arrival is invented."}</p></div>}
      <Explanation step={step} locale={locale} />
    </div><SnapshotTable steps={trace.steps} stepId={step.id} before={item => <RoutingSummary state={item.before} locale={locale} />} after={item => <RoutingSummary state={item.after} locale={locale} />} locale={locale} />
  </div>;
}

const methodLabel = (method: SwitchingMethod, locale: Locale) => method === "circuit" ? (locale === "vi" ? "Chuyển mạch kênh" : "Circuit switching") : (locale === "vi" ? "Chuyển mạch gói" : "Packet switching");
function useLabel(use: string, locale: Locale) { return use === "none" ? (locale === "vi" ? "Không truyền" : "No transmission") : use === "idle" ? (locale === "vi" ? "Đang rỗi" : "Idle") : use; }
function SwitchingSummary({ state, locale }: { readonly state: SwitchingState; readonly locale: Locale }) {
  return <><p>{locale === "vi" ? "Dành riêng cho A" : "Reserved for A"}: {state.reservedForA ? (locale === "vi" ? "Có" : "Yes") : (locale === "vi" ? "Không" : "No")}</p><p>{locale === "vi" ? "Đang dùng liên kết" : "Link use"}: {useLabel(state.linkUse, locale)}</p><p>{locale === "vi" ? "Lưu lượng khác được dùng lượt khác" : "Other traffic eligible for other turns"}: {state.otherTrafficCanUseResource ? (locale === "vi" ? "Có" : "Yes") : (locale === "vi" ? "Không" : "No")}</p><p>{locale === "vi" ? "Đã nhận" : "Received"}: {state.delivered.join(", ") || "∅"}; {state.complete ? (locale === "vi" ? "hoàn chỉnh" : "complete") : (locale === "vi" ? "chưa hoàn chỉnh" : "not complete")}{state.released && `; ${locale === "vi" ? "đã giải phóng kênh" : "channel released"}`}</p></>;
}

function SwitchingWorkbench({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [scenarioId, setScenarioId] = useState<SwitchingScenarioId>("continuous");
  const [method, setMethod] = useState<SwitchingMethod>("circuit");
  const [indices, setIndices] = useState<Readonly<Record<SwitchingMethod, number>>>({ circuit: 0, packet: 0 });
  const trace = useMemo(() => switchingTrace(scenarioId, method), [scenarioId, method]);
  const index = indices[method];
  const step = trace.steps[index];
  const state = step.after;
  const ReservationIcon = state.reservedForA ? LockKeyhole : UnlockKeyhole;
  return <div className={styles.workbench} data-visual-kind="switching-methods" data-scenario-id={scenarioId} data-switching-method={method} data-visual-step={step.id}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn nhu cầu chung để so sánh" : "Choose the common demand to compare"}</label><select id={id} data-topic-scenario value={scenarioId} onChange={event => { setScenarioId(event.target.value as SwitchingScenarioId); setIndices({ circuit: 0, packet: 0 }); }}>{switchingScenarios.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div><SegmentedControl label={locale === "vi" ? "Cơ chế chuyển mạch" : "Switching mechanism"} segments={[{ id: "circuit", label: methodLabel("circuit", locale) }, { id: "packet", label: methodLabel("packet", locale) }]} value={method} onChange={value => setMethod(value as SwitchingMethod)} /></div>
    <Controls steps={trace.steps} index={index} onChange={value => setIndices(current => ({ ...current, [method]: value }))} locale={locale} />
    <div className={styles.body}><Heading step={step} index={index} count={trace.steps.length} locale={locale} /><p className={styles.caption}>{trace.convention[locale]}</p><div className={styles.taskCard}><span>{trace.title[locale]}</span><p>{trace.demand[locale]}</p><strong>{locale === "vi" ? "Dữ liệu A" : "A’s data"}: {trace.units.join(" → ")}</strong></div>
      <div className={styles.methodScene}><div className={styles.endpoints}><span><Laptop size={18} aria-hidden="true" />{locale === "vi" ? "Bên gửi A" : "Sender A"}</span><ArrowRight size={24} aria-hidden="true" /><span><Laptop size={18} aria-hidden="true" />{locale === "vi" ? "Bên nhận A" : "Receiver A"}</span></div><div className={styles.resource} data-reserved={state.reservedForA} data-link-use={state.linkUse} data-other-traffic-eligible={state.otherTrafficCanUseResource}><strong>{methodLabel(method, locale)}</strong><span className={styles.resourceStatus}><ReservationIcon size={17} aria-hidden="true" />{state.reservedForA ? (locale === "vi" ? "Kênh dành riêng cho A" : "Channel reserved for A") : (locale === "vi" ? "Không dành riêng cho A" : "No reservation for A")}</span><p>{locale === "vi" ? "Đang dùng liên kết" : "Current link use"}: <strong>{useLabel(state.linkUse, locale)}</strong></p><p>{state.otherTrafficCanUseResource ? (locale === "vi" ? "Lưu lượng khác có thể dùng lượt khác; không truyền đồng thời trong lượt đang xét." : "Other traffic may use other turns; not simultaneous transmission in this turn.") : (locale === "vi" ? "Lưu lượng khác không thể dùng phần kênh đã cấp cho A." : "Other traffic cannot use the channel allocated to A.")}</p>{state.released && <p><Check size={16} aria-hidden="true" />{locale === "vi" ? "Đã giải phóng phần dành riêng" : "Reservation released"}</p>}</div></div>
      {method === "packet" && <div className={styles.packetList}>{trace.units.map(unit => <div className={styles.packet} key={unit} data-switching-packet={unit} data-active={state.linkUse === unit}><strong>{unit}</strong><span>{locale === "vi" ? "Thông tin điều khiển / địa chỉ" : "Control / addressing information"}</span><code>{state.delivered.includes(unit) ? (locale === "vi" ? "Đã nhận" : "Received") : (locale === "vi" ? "Chưa nhận" : "Not received")}</code></div>)}</div>}
      <div className={styles.buffer} data-switching-delivered={state.delivered.join(",")} data-complete={state.complete}><h4>{locale === "vi" ? "Bên nhận A" : "Receiver A"}</h4><div className={styles.bufferPieces}>{state.delivered.length ? state.delivered.map(unit => <span key={unit}>{unit}</span>) : <span>∅</span>}</div><p>{state.complete ? (locale === "vi" ? "Dữ liệu A đã hoàn chỉnh theo thứ tự ban đầu." : "A’s data is complete in its original order.") : (locale === "vi" ? "Chưa có thông điệp A hoàn chỉnh." : "A’s complete message is not ready yet.")}</p></div>
      <Explanation step={step} locale={locale} />
      <div className={styles.tradeoff} data-conditional-preference={trace.preferredMethod}><strong>{locale === "vi" ? "Theo ưu tiên của tình huống này" : "For this scenario’s stated priorities"}: {methodLabel(trace.preferredMethod, locale)}</strong><p>{trace.reason[locale]}</p></div>
    </div><SnapshotTable steps={trace.steps} stepId={step.id} before={item => <SwitchingSummary state={item.before} locale={locale} />} after={item => <SwitchingSummary state={item.after} locale={locale} />} locale={locale} />
  </div>;
}

export function NetworkTopicWorkbench({ kind, locale }: { readonly kind: NetworkTopicKind; readonly locale: Locale }) {
  switch (kind) {
    case "application-protocols": return <ProtocolWorkbench locale={locale} />;
    case "bittorrent": return <BitTorrentWorkbench locale={locale} />;
    case "packet-routing": return <RoutingWorkbench locale={locale} />;
    case "switching-methods": return <SwitchingWorkbench locale={locale} />;
  }
}
