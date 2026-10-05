"use client";

import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Laptop, RotateCcw, Server } from "lucide-react";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import type { Locale } from "@/app/lib/paper3/catalog";
import {
  tcpIpJourney, tcpIpLayers, tcpIpPayloads, tcpIpPrediction, tcpIpResponsibilityQuestions,
  tcpIpScenario, tcpIpWrapperLabels,
  type LayerResponsibilityQuestion, type NetworkLayerId, type NetworkLinkScope,
  type TcpIpJourneyStep, type TcpIpPayloadId, type TcpIpUnitState,
} from "@/app/lib/paper3/network-models";
import styles from "./NetworkWorkbench.module.css";

type Mode = "journey" | "layer-responsibility";
type Answer = Readonly<{ choice: NetworkLayerId | null; checked: boolean; revealed: boolean; answerSeen: boolean }>;
const initialAnswer: Answer = { choice: null, checked: false, revealed: false, answerSeen: false };
const layerLabel = (layer: NetworkLayerId, locale: Locale) => tcpIpLayers.find(item => item.id === layer)!.label[locale];
const scopeLabel = (scope: NetworkLinkScope, locale: Locale) => scope === "first-link"
  ? (locale === "vi" ? "Liên kết đầu" : "First link")
  : scope === "final-link" ? (locale === "vi" ? "Liên kết cuối" : "Final link") : "";
const actorLabel = (actor: TcpIpJourneyStep["actor"], locale: Locale) => actor === "sender"
  ? (locale === "vi" ? "Host gửi" : "Sender")
  : actor === "receiver" ? (locale === "vi" ? "Host nhận" : "Receiver") : (locale === "vi" ? "Qua mạng" : "Network transit");

function changeText(step: TcpIpJourneyStep, locale: Locale) {
  if (step.operation === "add-wrapper" && step.changedWrapper) return `${locale === "vi" ? "Thêm" : "Added"}: ${tcpIpWrapperLabels[step.changedWrapper][locale]}`;
  if (step.operation === "remove-wrapper" && step.changedWrapper) return `${locale === "vi" ? "Xử lý rồi bỏ" : "Processed and removed"}: ${tcpIpWrapperLabels[step.changedWrapper][locale]}`;
  if (step.operation === "transfer") return `${locale === "vi" ? "Tạo lại thông tin Link" : "Link control renewed"}: ${scopeLabel(step.before.linkScope, locale)} → ${scopeLabel(step.after.linkScope, locale)}`;
  if (step.after.delivered) return locale === "vi" ? "Ứng dụng nhận đã hiểu yêu cầu" : "Request interpreted by the receiving application";
  return locale === "vi" ? "Yêu cầu ứng dụng đã được định dạng" : "The application request is formatted";
}

function HostStack({ host, step, locale }: { readonly host: "sender" | "receiver"; readonly step: TcpIpJourneyStep; readonly locale: Locale }) {
  const isSender = host === "sender";
  const Icon = isSender ? Laptop : Server;
  const Direction = isSender ? ArrowDown : ArrowUp;
  return <div className={styles.host} data-host={host}>
    <div className={styles.hostTitle}><Icon size={18} aria-hidden="true" /><strong>{actorLabel(host, locale)}</strong></div>
    <p className={styles.hostDetail}>{isSender ? (locale === "vi" ? "Trình duyệt" : "Browser host") : (locale === "vi" ? "Máy chủ web" : "Web-server host")}</p>
    <ol className={styles.layers} aria-label={isSender ? tcpIpScenario.senderLabel[locale] : tcpIpScenario.receiverLabel[locale]}>
      {tcpIpLayers.map(layer => {
        const active = step.actor === host && step.layer === layer.id;
        return <li key={layer.id} data-layer-id={layer.id} data-active={active} aria-current={active ? "step" : undefined}>
          <span className={styles.layerDot} aria-hidden="true">{active ? "●" : "○"}</span><span>{layer.label[locale]}{active && <span className={styles.srOnly}> · {locale === "vi" ? "Đang xử lý" : "Active"}</span>}</span>
        </li>;
      })}
    </ol>
    <p className={styles.direction}><Direction size={17} aria-hidden="true" />{isSender ? (locale === "vi" ? "Gửi: đi xuống" : "Send: down the stack") : (locale === "vi" ? "Nhận: đi lên" : "Receive: up the stack")}</p>
  </div>;
}

function CurrentUnit({ step, locale }: { readonly step: TcpIpJourneyStep; readonly locale: Locale }) {
  return <div className={styles.unit} data-current-unit data-unit-location={step.after.location} data-delivered={step.after.delivered}>
    <div className={styles.unitHeading}><h4>{locale === "vi" ? "Đơn vị dữ liệu sau bước này" : "The unit after this step"}</h4><span>{locale === "vi" ? "Ngoài → trong → payload" : "Outer → inner → payload"}</span></div>
    <ol className={styles.bands} aria-label={locale === "vi" ? "Thông tin điều khiển từ ngoài vào trong và payload" : "Control information from outer to inner, then payload"}>
      {step.after.wrappers.map(wrapper => <li className={styles.wrapper} data-wrapper-id={wrapper} data-link-scope={wrapper === "link" ? step.after.linkScope : undefined} data-changed={step.changedWrapper === wrapper || (wrapper === "link" && step.operation === "transfer")} key={wrapper}>
        <span>{tcpIpWrapperLabels[wrapper][locale]}</span>{wrapper === "link" && <strong>{scopeLabel(step.after.linkScope, locale)}</strong>}
      </li>)}
      <li className={styles.payload} data-payload-id={step.after.payload.id} data-payload-text={step.after.payload.text}>
        <span>{locale === "vi" ? "Yêu cầu ứng dụng · HTTP" : "Application request · HTTP"}</span><strong>{step.after.payload.text}</strong>
        {step.after.delivered && <span className={styles.delivered}><Check size={16} aria-hidden="true" />{locale === "vi" ? "Đã tới ứng dụng nhận" : "Delivered to the receiving application"}</span>}
      </li>
    </ol>
    {step.after.wrappers.length === 0 && <p className={styles.unitNote}>{locale === "vi" ? "Không có phần bọc của tầng dưới quanh payload ở trạng thái này." : "No lower-layer wrappers surround the payload in this state."}</p>}
    <p className={styles.change} data-unit-change>{changeText(step, locale)}</p>
  </div>;
}

function StateSummary({ state, locale }: { readonly state: TcpIpUnitState; readonly locale: Locale }) {
  return <><span className={styles.tableUnit}>{state.wrappers.map(wrapper => `${tcpIpWrapperLabels[wrapper][locale]}${wrapper === "link" ? ` (${scopeLabel(state.linkScope, locale)})` : ""}`).join(" → ")}{state.wrappers.length > 0 && " → "}<strong>{state.payload.text}</strong></span><span className={styles.tableMeta}>{actorLabel(state.location, locale)} · {state.delivered ? (locale === "vi" ? "Đã giao cho ứng dụng" : "Delivered to application") : (locale === "vi" ? "Chưa giao cho ứng dụng" : "Not yet delivered to application")}</span></>;
}

function TraceTable({ steps, stepId, locale }: { readonly steps: readonly TcpIpJourneyStep[]; readonly stepId: string; readonly locale: Locale }) {
  return <details className={styles.fallback} data-network-fallback>
    <summary>{locale === "vi" ? "Đọc toàn bộ các bước dạng bảng" : "Read all steps as a table"}</summary>
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Bảng chín trạng thái TCP/IP" : "Nine TCP/IP snapshots"}>
      <table><caption>{locale === "vi" ? "Cùng snapshot với hình. Phần bọc được liệt kê từ ngoài vào trong; payload giữ nguyên." : "The same snapshots as the diagram. Wrappers are listed outermost first; the payload is retained."}</caption>
        <thead><tr>{(locale === "vi" ? ["Bước / tầng", "Trước", "Thay đổi", "Sau", "Thao tác, lý do và kết quả"] : ["Step / layer", "Before", "Change", "After", "Action, why and outcome"]).map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{steps.map((item, index) => <tr key={item.id} data-fallback-step={item.id} data-selected={item.id === stepId} aria-current={item.id === stepId ? "step" : undefined}>
          <th scope="row">{index + 1}. {item.title[locale]}<span className={styles.tableMeta}>{actorLabel(item.actor, locale)}{item.layer && ` · ${layerLabel(item.layer, locale)}`}</span>{item.id === stepId && <strong className={styles.tableSelected}>{locale === "vi" ? "Đang chọn" : "Selected"}</strong>}</th>
          <td data-state-before><StateSummary state={item.before} locale={locale} /></td><td>{changeText(item, locale)}</td><td data-state-after><StateSummary state={item.after} locale={locale} /></td><td><p>{item.action[locale]}</p><p>{item.why[locale]}</p><p>{item.outcome[locale]}</p></td>
        </tr>)}</tbody>
      </table>
    </div>
  </details>;
}

function LayerQuestion({ question, answer, onChange, locale, prediction = false }: { readonly question: LayerResponsibilityQuestion; readonly answer: Answer; readonly onChange: (answer: Answer) => void; readonly locale: Locale; readonly prediction?: boolean }) {
  const id = useId();
  const selected = question.choices.find(choice => choice.layer === answer.choice);
  return <div className={styles.question} data-layer-question={question.id} data-answer-seen={answer.answerSeen}>
    <fieldset><legend>{question.prompt[locale]}</legend><div className={styles.choices}>
      {question.choices.map(choice => <label key={choice.layer} data-selected={answer.choice === choice.layer}><input type="radio" name={`${id}-layer`} value={choice.layer} checked={answer.choice === choice.layer} onChange={() => onChange({ ...answer, choice: choice.layer, checked: false })} /><span>{layerLabel(choice.layer, locale)}{prediction && <span className={styles.choiceHint}>{choice.layer === "application" ? (locale === "vi" ? "Nội dung yêu cầu ứng dụng" : "Application request content") : tcpIpWrapperLabels[choice.layer][locale]}</span>}</span></label>)}
    </div></fieldset>
    <div className={styles.answerActions}><Button variant="secondary" disabled={!answer.choice} onClick={() => onChange({ ...answer, checked: true })}>{locale === "vi" ? "Kiểm tra lựa chọn" : "Check choice"}</Button><Button variant="quiet" onClick={() => onChange({ ...answer, revealed: true, answerSeen: true })}>{locale === "vi" ? "Xem lời giải" : "Show explanation"}</Button>{(answer.checked || answer.revealed) && <Button variant="quiet" onClick={() => onChange({ ...initialAnswer, answerSeen: answer.answerSeen })}>{locale === "vi" ? "Thử lại" : "Try again"}</Button>}</div>
    {answer.checked && selected && <div className={styles.feedback} data-correct={selected.correct} role="status"><strong>{selected.correct ? (locale === "vi" ? "Đúng vai trò" : "Correct role") : (locale === "vi" ? "Xét lại vai trò của tầng" : "Reconsider the layer’s role")}</strong><p>{selected.feedback[locale]}</p></div>}
    {answer.revealed && <div className={styles.solution} data-layer-solution><strong>{locale === "vi" ? "Tầng phù hợp" : "The matching layer"}: {layerLabel(question.correctLayer, locale)}</strong><p>{question.explanation[locale]}</p></div>}
    {answer.answerSeen && <p className={styles.supported}>{locale === "vi" ? "Lượt luyện tập này đã có hỗ trợ từ lời giải." : "This practice attempt has had support from the explanation."}</p>}
  </div>;
}

export function NetworkWorkbench({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [payloadId, setPayloadId] = useState<TcpIpPayloadId>("revision-page");
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("journey");
  const [questionId, setQuestionId] = useState(tcpIpResponsibilityQuestions[0].id);
  const [answers, setAnswers] = useState<Readonly<Record<string, Answer>>>({});
  const [predictionAnswer, setPredictionAnswer] = useState<Answer>(initialAnswer);
  const steps = useMemo(() => tcpIpJourney(payloadId), [payloadId]);
  const step = steps[index];
  const question = tcpIpResponsibilityQuestions.find(item => item.id === questionId)!;
  return <div className={styles.workbench} data-visual-kind="tcp-ip-stack" data-visual-step={step.id} data-payload-id={payloadId} data-network-mode={mode}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={`${id}-payload`}>{tcpIpScenario.label[locale]}</label><select id={`${id}-payload`} data-network-payload value={payloadId} onChange={event => { setPayloadId(event.target.value as TcpIpPayloadId); setIndex(0); }}>{tcpIpPayloads.map(payload => <option value={payload.id} key={payload.id}>{payload.label[locale]} · {payload.resource}</option>)}</select></div>
      <SegmentedControl label={locale === "vi" ? "Chế độ quan sát TCP/IP" : "TCP/IP observation mode"} segments={[{ id: "journey", label: locale === "vi" ? "Hành trình thông điệp" : "Message journey" }, { id: "layer-responsibility", label: locale === "vi" ? "Vai trò từng tầng" : "Layer responsibility" }]} value={mode} onChange={value => setMode(value as Mode)} />
    </div>
    <p className={styles.convention}>{tcpIpScenario.schematicCaption[locale]}</p>
    {mode === "journey" ? <>
      <div className={styles.stepControls} aria-label={locale === "vi" ? "Điều khiển hành trình" : "Journey controls"}>
        <Button variant="secondary" data-network-previous disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft size={16} aria-hidden="true" />{locale === "vi" ? "Bước trước" : "Previous"}</Button>
        <Button data-network-next disabled={index === steps.length - 1} onClick={() => setIndex(index + 1)}>{locale === "vi" ? "Bước tiếp" : "Next"}<ArrowRight size={16} aria-hidden="true" /></Button>
        <Button variant="quiet" data-network-reset onClick={() => setIndex(0)}><RotateCcw size={16} aria-hidden="true" />{locale === "vi" ? "Đặt lại" : "Reset"}</Button>
        <div className={styles.field}><label htmlFor={`${id}-step`}>{locale === "vi" ? "Chọn bước" : "Jump to step"}</label><select id={`${id}-step`} data-network-jump value={index} onChange={event => setIndex(Number(event.target.value))}>{steps.map((item, stepIndex) => <option key={item.id} value={stepIndex}>{stepIndex + 1}. {item.title[locale]}</option>)}</select></div>
      </div>
      <div className={styles.body}>
        <div className={styles.activeHeading}><span>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{steps.length}</span><strong data-active-phase>{actorLabel(step.actor, locale)}{step.layer ? ` · ${layerLabel(step.layer, locale)}` : (locale === "vi" ? " · Giai đoạn truyền, không phải một tầng" : " · Transfer phase, not a layer")}</strong><h3>{step.title[locale]}</h3></div>
        <div className={styles.hosts} data-host-diagram><HostStack host="sender" step={step} locale={locale} /><HostStack host="receiver" step={step} locale={locale} /></div>
        <div className={styles.networkPath} data-network-path data-active={step.actor === "network"}><svg viewBox="0 0 600 32" aria-hidden="true" preserveAspectRatio="none"><path d="M150 0 V22 H450 V2" /><path d="M445 8 L450 2 L455 8" /></svg><span>{locale === "vi" ? "Qua mạng: host gửi → host nhận" : "Across the network: sender → receiver"}</span></div>
        <p className={styles.networkCaption}>{tcpIpScenario.networkCaption[locale]}</p>
        <CurrentUnit step={step} locale={locale} />
        <dl className={styles.explanation} data-step-explanation><div><dt>{locale === "vi" ? "Thao tác" : "Action"}</dt><dd data-step-action>{step.action[locale]}</dd></div><div><dt>{locale === "vi" ? "Vì sao" : "Why"}</dt><dd data-step-why>{step.why[locale]}</dd></div><div><dt>{locale === "vi" ? "Kết quả" : "Outcome"}</dt><dd data-step-outcome>{step.outcome[locale]}</dd></div></dl>
        {steps[index + 1]?.id === tcpIpPrediction.beforeStepId && <div className={styles.prediction} data-network-prediction><h4>{locale === "vi" ? "Dự đoán bước nhận đầu tiên" : "Predict the first receiving step"}</h4><p>{locale === "vi" ? "Tùy chọn: bạn có thể chọn Bước tiếp hoặc xem lời giải bất cứ lúc nào." : "Optional: you can choose Next or read the explanation at any time."}</p><LayerQuestion question={tcpIpPrediction} answer={predictionAnswer} onChange={setPredictionAnswer} locale={locale} prediction /></div>}
        <span className={styles.srOnly} role="status" aria-live="polite">{locale === "vi" ? "Bước" : "Step"} {index + 1}. {actorLabel(step.actor, locale)}. {step.title[locale]}.</span>
      </div>
    </> : <div className={styles.body} data-responsibility-mode>
      <p className={styles.savedStep}>{locale === "vi" ? "Hành trình đang giữ ở bước" : "Journey kept at step"} {index + 1}/9 · {step.title[locale]}</p>
      <div className={styles.field}><label htmlFor={`${id}-question`}>{locale === "vi" ? "Chọn nhiệm vụ để xét" : "Choose a task to examine"}</label><select id={`${id}-question`} data-responsibility-question value={questionId} onChange={event => setQuestionId(event.target.value)}>{tcpIpResponsibilityQuestions.map((item, questionIndex) => <option key={item.id} value={item.id}>{questionIndex + 1}. {item.prompt[locale]}</option>)}</select></div>
      <LayerQuestion question={question} answer={answers[questionId] ?? initialAnswer} onChange={answer => setAnswers(current => ({ ...current, [questionId]: answer }))} locale={locale} />
    </div>}
    <TraceTable steps={steps} stepId={step.id} locale={locale} />
  </div>;
}
