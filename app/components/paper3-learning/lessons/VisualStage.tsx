import type { Locale } from "@/app/lib/paper3/catalog";
import type { Paper3Lesson } from "@/app/lib/paper3/lesson-types";
import { FloatWorkbench } from "./FloatWorkbench";
import { FileWorkbench } from "./FileWorkbench";
import { ConceptWorkbench } from "./ConceptWorkbench";
import { NumericWorkbench } from "./NumericWorkbench";
import { NetworkWorkbench } from "./NetworkWorkbench";
import { NetworkTopicWorkbench } from "./NetworkTopicWorkbench";
import { HardwareWorkbench } from "./HardwareWorkbench";
import { LogicWorkbench } from "./LogicWorkbench";
import { HardwareScaleWorkbench } from "./HardwareScaleWorkbench";
import { LogicScaleWorkbench } from "./LogicScaleWorkbench";
import { Section16Workbench, type Section16Kind } from "./Section16Workbench";
import { Section17SecurityWorkbench, type SecurityVisualKind } from "./Section17SecurityWorkbench";
import { Section18AIWorkbench, type AIVisualKind } from "./Section18AIWorkbench";
import { Section19ComputationalWorkbench, type Section19VisualKind } from "./Section19ComputationalWorkbench";
import { Section20FurtherProgrammingWorkbench, type Section20VisualKind } from "./Section20FurtherProgrammingWorkbench";
import { CambridgeVisualPrimer } from "./CambridgeVisualPrimer";
import styles from "./LessonPage.module.css";

export function VisualStage({ lesson, locale }: { readonly lesson: Paper3Lesson; readonly locale: Locale }) {
  return <div className={styles.visualStage} data-visual-stage>
    <CambridgeVisualPrimer kind={lesson.visual.kind} locale={locale} />
    <div className={styles.visualTask}>{lesson.visual.task[locale]}</div>
    <div className={styles.conventions}><strong>{locale === "vi" ? "Quy ước của minh họa" : "Conventions for this visual"}</strong><ul>{lesson.visual.conventions.map((convention, index) => <li key={index}>{convention[locale]}</li>)}</ul></div>
    {["paradigm-procedural", "addressing-modes", "assembly-workbench", "oop-encapsulation", "oop-relationships", "declarative-inference", "sequential-files", "random-files", "exception-flow"].includes(lesson.visual.kind) ? <Section20FurtherProgrammingWorkbench kind={lesson.visual.kind as Section20VisualKind} locale={locale} /> : ["linear-search", "binary-search", "bubble-sort", "insertion-sort", "stack-adt", "queue-adt", "linked-list", "binary-tree", "dictionary", "adt-implementation", "complexity-comparator", "recursion-trace", "call-stack-unwinding"].includes(lesson.visual.kind) ? <Section19ComputationalWorkbench kind={lesson.visual.kind as Section19VisualKind} locale={locale} /> : ["dijkstra-search", "astar-search", "learning-categories", "neural-network", "backpropagation", "regression"].includes(lesson.visual.kind) ? <Section18AIWorkbench kind={lesson.visual.kind as AIVisualKind} locale={locale} /> : ["key-ownership", "quantum-key-distribution", "tls-session", "certificate-signature"].includes(lesson.visual.kind) ? <Section17SecurityWorkbench kind={lesson.visual.kind as SecurityVisualKind} locale={locale} /> : ["process-states", "cpu-scheduling", "kernel-interrupts", "memory-addressing", "page-replacement", "translation-workflows", "compilation-pipeline", "bnf-explorer", "rpn-stack"].includes(lesson.visual.kind) ? <Section16Workbench kind={lesson.visual.kind as Section16Kind} locale={locale} /> : lesson.visual.kind === "pipeline-registers-interrupts" ? <HardwareWorkbench kind="pipeline-registers-interrupts" locale={locale} /> : lesson.visual.kind === "logic-circuit" ? <LogicWorkbench kind="logic-circuit" locale={locale} /> : ["risc-cisc", "flynn-parallelism", "virtual-machines"].includes(lesson.visual.kind) ? <HardwareScaleWorkbench kind={lesson.visual.kind as "risc-cisc" | "flynn-parallelism" | "virtual-machines"} locale={locale} /> : ["adders", "sr-jk-flip-flops", "boolean-simplification", "karnaugh-map"].includes(lesson.visual.kind) ? <LogicScaleWorkbench kind={lesson.visual.kind as "adders" | "sr-jk-flip-flops" | "boolean-simplification" | "karnaugh-map"} locale={locale} /> : lesson.visual.kind === "tcp-ip-stack" ? <NetworkWorkbench locale={locale} /> : ["application-protocols", "bittorrent", "packet-routing", "switching-methods"].includes(lesson.visual.kind) ? <NetworkTopicWorkbench kind={lesson.visual.kind as "application-protocols" | "bittorrent" | "packet-routing" | "switching-methods"} locale={locale} /> : lesson.visual.kind === "floating-conversion" ? <FloatWorkbench locale={locale} /> : ["enumeration", "pointers", "sets", "records"].includes(lesson.visual.kind) ? <ConceptWorkbench kind={lesson.visual.kind} locale={locale} /> : lesson.visual.kind === "file-organisation" || lesson.visual.kind === "hashing" || lesson.visual.kind === "collisions" ? <FileWorkbench kind={lesson.visual.kind} locale={locale} /> : <NumericWorkbench kind={lesson.visual.kind as "normalisation" | "precision-range" | "rounding-errors"} locale={locale} />}
  </div>;
}
