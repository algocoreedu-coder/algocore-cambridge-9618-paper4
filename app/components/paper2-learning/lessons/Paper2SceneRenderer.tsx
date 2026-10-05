"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/app/lib/paper2/catalog";
import type {
  Paper2VisualScene,
  VisualDiagramConnector,
  VisualDiagramMark,
  VisualDiagramNode,
  VisualGraphNode,
  VisualText,
} from "@/app/lib/paper2/visual-types";
import styles from "./Paper2Lesson.module.css";

export function visualText(value: VisualText | undefined, locale: Locale) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "en" in value && "vi" in value) return String(value[locale]);
  return String(value);
}

const stateLabel = (status: string | undefined, locale: Locale) => ({
  active: locale === "vi" ? "đang xét" : "active",
  muted: locale === "vi" ? "chưa hoạt động" : "inactive",
  done: locale === "vi" ? "đã hoàn tất" : "done",
  match: locale === "vi" ? "khớp" : "match",
}[status ?? ""] ?? status ?? "");

function statusClass(status: string | undefined) {
  return status ? `${styles.sceneState} ${styles[`state_${status}`] ?? ""}` : "";
}

function wrap(value: string, size = 22) {
  const result: string[] = [];
  for (const paragraph of value.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      if (line && `${line} ${word}`.length > size) { result.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    if (line) result.push(line);
  }
  return result.length ? result : [""];
}

function SvgLines({ value, x, y, locale, size = 16, width = 24, className }: { value: VisualText; x: number; y: number; locale: Locale; size?: number; width?: number; className?: string }) {
  const lines = wrap(visualText(value, locale), width);
  const lineHeight = size * 1.25;
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  return <text x={x} y={top} textAnchor="middle" fontSize={size} className={className}>{lines.map((line, index) => <tspan key={`${line}-${index}`} x={x} dy={index ? lineHeight : 0}>{line}</tspan>)}</text>;
}

function MarkerDefs({ prefix }: { prefix: string }) {
  return <defs><marker id={`${prefix}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8 Z" /></marker><marker id={`${prefix}-arrow-active`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs>;
}

function markerProps(connector: VisualDiagramConnector, prefix: string) {
  const marker = `url(#${prefix}-arrow${connector.active ? "-active" : ""})`;
  return { markerStart: connector.arrow === "start" || connector.arrow === "both" ? marker : undefined, markerEnd: connector.arrow === "end" || connector.arrow === "both" ? marker : undefined };
}

function pointsPath(points: readonly (readonly [number, number])[] | undefined) {
  return (points ?? []).map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
}

function DiagramNode({ node, locale }: { node: VisualDiagramNode; locale: Locale }) {
  const { x, y, w, h } = node;
  let shape: ReactNode;
  if (node.shape === "decision") shape = <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} />;
  else if (node.shape === "io") { const slant = Math.min(24, w * .14); shape = <polygon points={`${x + slant},${y} ${x + w},${y} ${x + w - slant},${y + h} ${x},${y + h}`} />; }
  else if (["connector", "state", "final-state"].includes(node.shape)) shape = <><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} />{node.shape === "final-state" && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 7} ry={h / 2 - 7} />}</>;
  else shape = <><rect x={x} y={y} width={w} height={h} rx={node.shape === "terminator" ? h / 2 : 0} />{node.shape === "predefined" && <path d={`M ${x + 14} ${y} V ${y + h} M ${x + w - 14} ${y} V ${y + h}`} />}</>;
  return <g className={`${styles.diagramNode} ${statusClass(node.tone)}`} data-key={`diagram-node-${node.id}`} data-node-shape={node.shape}>{shape}<SvgLines value={node.label} x={x + w / 2} y={y + h / 2 - (node.detail ? 8 : 0)} locale={locale} size={node.fontSize ?? 16} width={Math.max(8, Math.floor(w / 9))} />{node.detail && <SvgLines value={node.detail} x={x + w / 2} y={y + h / 2 + 19} locale={locale} size={13} width={Math.max(8, Math.floor(w / 8))} className={styles.diagramDetail} />}</g>;
}

function DiagramMark({ mark, locale, prefix }: { mark: VisualDiagramMark; locale: Locale; prefix: string }) {
  const x = mark.x ?? mark.points?.[0]?.[0] ?? 0;
  const y = mark.y ?? mark.points?.[0]?.[1] ?? 0;
  const radius = mark.r ?? 7;
  const route = mark.path ?? pointsPath(mark.points);
  return <g className={`${styles.diagramMark} ${mark.active ? styles.isActive : ""} ${styles[`mark_${mark.type}`] ?? ""}`} data-key={`diagram-mark-${mark.id}`} data-mark-type={mark.type} data-mark-id={mark.id}>
    {route && <path className={styles.diagramRoute} d={route} {...markerProps(mark, prefix)} />}
    {mark.type === "selection" && <polygon points={`${x},${y - radius} ${x + radius},${y} ${x},${y + radius} ${x - radius},${y}`} />}
    {["data-couple", "control-couple", "initial"].includes(mark.type) && <circle className={mark.type} cx={x} cy={y} r={radius} />}
    {mark.label !== undefined && <SvgLines value={mark.label} x={mark.labelX ?? x} y={mark.labelY ?? y + radius + 20} locale={locale} size={mark.type === "text" ? 15 : 14} width={42} />}
  </g>;
}

function DiagramScene({ scene, locale, prefix }: { scene: Extract<Paper2VisualScene, { type: "diagram" }>; locale: Locale; prefix: string }) {
  const [fitOverview, setFitOverview] = useState(true);
  return <div className={styles.preciseDiagram} role="region" tabIndex={0} aria-label={visualText(scene.caption, locale)}>
    <div className={styles.diagramViewControls} role="group" aria-label={locale === "vi" ? "Kích thước sơ đồ" : "Diagram size"}>
      <button type="button" aria-pressed={fitOverview} onClick={() => setFitOverview(true)}>{locale === "vi" ? "Toàn cảnh" : "Fit overview"}</button>
      <button type="button" aria-pressed={!fitOverview} onClick={() => setFitOverview(false)}>{locale === "vi" ? "Phóng to để đọc" : "Readable zoom"}</button>
    </div>
    <svg viewBox={`0 0 ${scene.width} ${scene.height}`} role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`} style={fitOverview ? { width: "100%", minWidth: 0 } : { width: scene.width, minWidth: scene.width }}>
    <title id={`${prefix}-title`}>{visualText(scene.caption, locale)}</title><desc id={`${prefix}-desc`}>{visualText(scene.description, locale)}</desc><MarkerDefs prefix={prefix} />
    {(scene.edges ?? []).map((edge, index) => <g key={edge.id ?? index} className={`${styles.diagramConnection} ${edge.active ? styles.isActive : ""}`} data-key={`diagram-edge-${edge.id ?? index}`}><path className={styles.diagramRoute} d={edge.path ?? pointsPath(edge.points)} {...markerProps(edge, prefix)} />{edge.label !== undefined && <SvgLines value={edge.label} x={edge.labelX ?? 0} y={edge.labelY ?? 0} locale={locale} size={14} width={32} />}</g>)}
    {scene.nodes.map((node) => <DiagramNode key={node.id} node={node} locale={locale} />)}
    {(scene.marks ?? []).map((mark) => <DiagramMark key={mark.id} mark={mark} locale={locale} prefix={prefix} />)}
  </svg></div>;
}

function GraphScene({ scene, locale, prefix }: { scene: Extract<Paper2VisualScene, { type: "graph" }>; locale: Locale; prefix: string }) {
  const nodes = scene.nodes.map((node) => ({ ...node, cx: Math.max(55, Math.min(845, node.x * 9)), cy: Math.max(40, Math.min(410, node.y * 4.5)) }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return <div className={styles.graphScene} role="region" tabIndex={0} aria-label={visualText(scene.caption, locale)}><svg viewBox="0 0 900 450" role="img"><title>{visualText(scene.caption, locale)}</title><MarkerDefs prefix={prefix} />
    {scene.edges.map((edge, index) => { const from = byId.get(edge.from); const to = byId.get(edge.to); if (!from || !to) return null; const reciprocal = scene.edges.some((other, otherIndex) => otherIndex !== index && other.from === edge.to && other.to === edge.from); const mx = (from.cx + to.cx) / 2; const my = (from.cy + to.cy) / 2; const dx = to.cx - from.cx; const dy = to.cy - from.cy; const length = Math.hypot(dx, dy) || 1; const nx = -dy / length; const ny = dx / length; const d = reciprocal ? `M ${from.cx} ${from.cy} Q ${mx + nx * 42} ${my + ny * 42} ${to.cx} ${to.cy}` : `M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`; return <g key={`${edge.from}-${edge.to}-${index}`} className={edge.active ? styles.isActive : ""}><path className={styles.graphEdge} d={d} markerEnd={`url(#${prefix}-arrow${edge.active ? "-active" : ""})`} />{edge.label !== undefined && <SvgLines value={edge.label} x={mx + (reciprocal ? nx * 32 : 0)} y={my + (reciprocal ? ny * 32 : -9)} locale={locale} size={12} width={24} />}</g>; })}
    {nodes.map((node: VisualGraphNode & { cx: number; cy: number }) => <g key={node.id} transform={`translate(${node.cx},${node.cy})`} className={`${styles.graphNode} ${statusClass(node.tone)}`} data-key={`graph-${node.id}`} data-node-shape={node.shape ?? "box"}>{node.shape === "diamond" ? <polygon points="0,-48 88,0 0,48 -88,0" /> : node.shape === "circle" ? <circle r="56" /> : node.shape === "io" ? <polygon points="-70,-34 86,-34 70,34 -86,34" /> : <rect x="-82" y="-34" width="164" height="68" rx={node.shape === "terminator" ? 34 : 9} />}<SvgLines value={node.label} x={0} y={node.detail ? -7 : 0} locale={locale} size={14} width={21} />{node.detail && <SvgLines value={node.detail} x={0} y={19} locale={locale} size={11} width={25} />}</g>)}
  </svg></div>;
}

function ArrayScene({ scene, locale }: { scene: Extract<Paper2VisualScene, { type: "array" }>; locale: Locale }) {
  const columns = Math.max(scene.cells.length, ...(scene.pointers ?? []).map((pointer) => pointer.index + 1), 1);
  return <div className={styles.arrayScene} style={{ "--array-columns": columns } as CSSProperties} role="region" tabIndex={0} aria-label={visualText(scene.caption, locale)}><div className={styles.arrayPointers}>{(scene.pointers ?? []).map((pointer, index) => <div key={`${visualText(pointer.label, locale)}-${index}`} className={styles.arrayPointer} style={{ gridColumn: Math.max(1, pointer.index + 1) }} data-key={`pointer-${visualText(pointer.label, locale)}`}><span>{visualText(pointer.label, locale)}</span><b aria-hidden="true">↓</b></div>)}</div><div className={styles.arrayCells}>{scene.cells.map((cell) => <div key={cell.id} className={`${styles.arrayCell} ${statusClass(cell.status)}`} data-key={`cell-${cell.id}`}><span>{visualText(cell.value, locale)}</span>{cell.status && <small>{stateLabel(cell.status, locale)}</small>}</div>)}</div><div className={styles.arrayIndices}>{scene.cells.map((cell) => <span key={cell.id}>{visualText(cell.label, locale)}</span>)}</div></div>;
}

function LanesScene({ scene, locale }: { scene: Extract<Paper2VisualScene, { type: "lanes" }>; locale: Locale }) {
  const items = scene.lanes.flatMap((lane) => lane.items);
  return <div className={styles.lanesScene} role="region" tabIndex={0} aria-label={visualText(scene.caption, locale)}>{scene.lanes.map((lane) => <section key={lane.id}><h5>{visualText(lane.label, locale)}</h5><div>{lane.items.map((item) => <div key={item.id} className={`${styles.laneItem} ${statusClass(item.status)}`} data-key={`item-${item.id}`}><span>{visualText(item.label, locale)}</span>{item.value !== undefined && <strong>{visualText(item.value, locale)}</strong>}{item.status && <small>{stateLabel(item.status, locale)}</small>}</div>)}</div></section>)}{(scene.links ?? []).length > 0 && <ul className={styles.laneLinks}>{scene.links?.map((link, index) => <li key={`${link.from}-${link.to}-${index}`} data-key={`link-${link.from}-${link.to}`}>{visualText(items.find((item) => item.id === link.from)?.label ?? link.from, locale)} → {visualText(items.find((item) => item.id === link.to)?.label ?? link.to, locale)}: {visualText(link.label, locale)}</li>)}</ul>}</div>;
}

function DomainScene({ scene, locale }: { scene: Extract<Paper2VisualScene, { type: "domain" }>; locale: Locale }) {
  const position = (value: number) => Math.max(0, Math.min(100, ((value - scene.min) / (scene.max - scene.min)) * 100));
  return <div className={styles.domainScene} role="region" tabIndex={0} aria-label={visualText(scene.caption, locale)}><p>{visualText(scene.label, locale)}</p><div className={styles.domainAxis}><div className={styles.domainValid} style={{ left: `${position(scene.low)}%`, width: `${position(scene.high) - position(scene.low)}%` }} /><span className={styles.domainValue} data-key="domain-value" style={{ left: `${position(scene.value)}%` }}>{scene.value}</span>{[...new Set([scene.min, scene.low, scene.high, scene.max])].map((value) => <span key={value} className={styles.domainLimit} data-domain-edge={value === scene.min ? "min" : value === scene.max ? "max" : undefined} style={{ left: `${position(value)}%` }}>{value}</span>)}</div><p>{locale === "vi" ? "Khoảng hợp lệ gồm hai đầu mút" : "Inclusive valid interval"}: <strong>[{scene.low}, {scene.high}]</strong></p></div>;
}

export function Paper2SceneRenderer({ scene, locale, hookPrefix }: { readonly scene: Paper2VisualScene; readonly locale: Locale; readonly hookPrefix: string }) {
  const prefix = hookPrefix.replace(/[^a-zA-Z0-9_-]/g, "-");
  if (scene.type === "array") return <ArrayScene scene={scene} locale={locale} />;
  if (scene.type === "graph") return <GraphScene scene={scene} locale={locale} prefix={prefix} />;
  if (scene.type === "diagram") return <DiagramScene scene={scene} locale={locale} prefix={prefix} />;
  if (scene.type === "lanes") return <LanesScene scene={scene} locale={locale} />;
  if (scene.type === "table") return <div className={styles.sceneTable} role="region" tabIndex={0} aria-label={scene.caption !== undefined ? visualText(scene.caption, locale) : (locale === "vi" ? "Bảng trạng thái visual" : "Visual state table")}><table><thead><tr>{scene.columns.map((column, index) => <th key={index} scope="col">{visualText(column, locale)}</th>)}</tr></thead><tbody>{scene.rows.map((row) => <tr key={row.id} className={statusClass(row.status)}>{row.cells.map((cell, index) => <td key={index}>{visualText(cell, locale)}</td>)}</tr>)}</tbody></table></div>;
  return <DomainScene scene={scene} locale={locale} />;
}

function markName(type: string, locale: Locale) {
  const labels: Record<string, readonly [string, string]> = {
    "data-couple": ["Data couple, hollow circle", "Truyền dữ liệu, vòng tròn rỗng"],
    "control-couple": ["Control couple, filled circle", "Truyền điều khiển, vòng tròn đặc"],
    selection: ["Selection indicator", "Ký hiệu lựa chọn"], repetition: ["Repetition indicator", "Ký hiệu lặp"], initial: ["Initial transition", "Chuyển tiếp khởi đầu"], text: ["Annotation", "Chú thích"],
  };
  return labels[type]?.[locale === "vi" ? 1 : 0] ?? type;
}

function diagramEndpoint(scene: Extract<Paper2VisualScene, { type: "diagram" }>, point: readonly [number, number] | undefined, locale: Locale) {
  if (!point) return undefined;
  let nearest: VisualDiagramNode | undefined;
  let distance = Number.POSITIVE_INFINITY;
  for (const node of scene.nodes) {
    const dx = point[0] - (node.x + node.w / 2);
    const dy = point[1] - (node.y + node.h / 2);
    const candidate = Math.hypot(dx, dy);
    if (candidate < distance) { nearest = node; distance = candidate; }
  }
  return nearest ? visualText(nearest.label, locale) : undefined;
}

function diagramRelationship(scene: Extract<Paper2VisualScene, { type: "diagram" }>, connector: VisualDiagramConnector, locale: Locale) {
  if (connector.from && connector.to) {
    const source = scene.nodes.find((node) => node.id === connector.from);
    const target = scene.nodes.find((node) => node.id === connector.to);
    if (source && target) {
      const sourceLabel = visualText(source.label, locale);
      const targetLabel = visualText(target.label, locale);
      return locale === "vi" ? `người gửi/nguồn ${sourceLabel} → người nhận/đích ${targetLabel}` : `sender/source ${sourceLabel} → receiver/target ${targetLabel}`;
    }
  }
  const points = connector.points;
  if (!points?.length) return "";
  const source = diagramEndpoint(scene, points[0], locale);
  const target = diagramEndpoint(scene, points[points.length - 1], locale);
  if (!source || !target) return "";
  return locale === "vi" ? `người gửi/nguồn ${source} → người nhận/đích ${target}` : `sender/source ${source} → receiver/target ${target}`;
}

export function Paper2SceneText({ scene, locale }: { readonly scene: Paper2VisualScene; readonly locale: Locale }) {
  if (scene.type === "array") return <ul>{scene.cells.map((cell, index) => <li key={cell.id}>{visualText(cell.label, locale)}: <strong>{visualText(cell.value, locale)}</strong>{cell.status ? ` — ${stateLabel(cell.status, locale)}` : ""}{(scene.pointers ?? []).filter((pointer) => pointer.index === index).map((pointer) => ` ← ${visualText(pointer.label, locale)}`).join("")}</li>)}</ul>;
  if (scene.type === "graph") return <><ul>{scene.nodes.map((node) => <li key={node.id}><strong>{visualText(node.label, locale)}</strong>{node.detail ? `: ${visualText(node.detail, locale)}` : ""}{node.tone ? ` — ${stateLabel(node.tone, locale)}` : ""}</li>)}</ul><ul>{scene.edges.map((edge, index) => <li key={`${edge.from}-${edge.to}-${index}`}>{visualText(scene.nodes.find((node) => node.id === edge.from)?.label ?? edge.from, locale)} → {visualText(scene.nodes.find((node) => node.id === edge.to)?.label ?? edge.to, locale)}{edge.label ? `: ${visualText(edge.label, locale)}` : ""}</li>)}</ul></>;
  if (scene.type === "lanes") return <><ul>{scene.lanes.map((lane) => <li key={lane.id}><strong>{visualText(lane.label, locale)}</strong><ul>{lane.items.map((item) => <li key={item.id}>{visualText(item.label, locale)}{item.value !== undefined ? `: ${visualText(item.value, locale)}` : ""}{item.status ? ` — ${stateLabel(item.status, locale)}` : ""}</li>)}</ul></li>)}</ul><ul>{scene.links?.map((link, index) => <li key={index}>{link.from} → {link.to}: {visualText(link.label, locale)}</li>)}</ul></>;
  if (scene.type === "table") return <table><thead><tr>{scene.columns.map((column, index) => <th key={index}>{visualText(column, locale)}</th>)}</tr></thead><tbody>{scene.rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={index}>{visualText(cell, locale)}</td>)}</tr>)}</tbody></table>;
  if (scene.type === "domain") return <p>{visualText(scene.label, locale)}: {scene.value}. {locale === "vi" ? "Miền hiển thị" : "Displayed domain"}: {scene.min}–{scene.max}. {locale === "vi" ? "Khoảng hợp lệ" : "Valid interval"}: {scene.low}–{scene.high}.</p>;
  return <><p>{visualText(scene.description, locale)}</p><ul>{scene.nodes.map((node) => <li key={node.id}><strong>{visualText(node.label, locale)}</strong>{node.detail ? `: ${visualText(node.detail, locale)}` : ""} — {node.shape}{node.tone ? ` · ${stateLabel(node.tone, locale)}` : ""}</li>)}</ul><ul>{scene.edges?.map((edge, index) => { const relationship = diagramRelationship(scene, edge, locale); return <li key={edge.id ?? index}>{relationship || (locale === "vi" ? "Đường nối theo sơ đồ" : "Authored connector")}{edge.label ? `: ${visualText(edge.label, locale)}` : ""}</li>; })}{scene.marks?.map((mark) => { const relationship = diagramRelationship(scene, mark, locale); return <li key={mark.id}>{markName(mark.type, locale)}: {visualText(mark.label, locale)}{relationship ? ` · ${relationship}` : ""}</li>; })}</ul></>;
}
