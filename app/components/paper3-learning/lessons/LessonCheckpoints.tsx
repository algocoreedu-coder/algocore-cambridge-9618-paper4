"use client";

import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import type { Checkpoint } from "@/app/lib/paper3/lesson-types";
import styles from "./LessonPage.module.css";

type Response = { selected?: string; checked?: string; answerSeen?: boolean; revealed?: boolean };

export function LessonCheckpoints({ checkpoints, locale }: { readonly checkpoints: readonly Checkpoint[]; readonly locale: Locale }) {
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const update = (id: string, patch: Partial<Response>) => setResponses((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  return <div className={styles.checkpoints}>{checkpoints.map((checkpoint, index) => {
    const response = responses[checkpoint.id] ?? {};
    const checkedChoice = checkpoint.choices.find((choice) => choice.id === response.checked);
    const correct = response.checked === checkpoint.correctChoiceId;
    return <article className={styles.checkpoint} key={checkpoint.id} data-checkpoint-id={checkpoint.id}>
      <div className={styles.checkpointLabel}><span>{locale === "vi" ? "Câu" : "Question"} {index + 1}</span><span>{checkpoint.transfer ? (locale === "vi" ? "Áp dụng vào tình huống mới" : "Apply to a new situation") : (locale === "vi" ? "Kiểm tra hiểu" : "Check your understanding")}</span></div>
      <fieldset><legend>{checkpoint.prompt[locale]}</legend><div className={styles.choiceList}>{checkpoint.choices.map((choice) => <label key={choice.id} className={styles.choice} data-selected={response.selected === choice.id}><input type="radio" name={`checkpoint-${checkpoint.id}`} value={choice.id} checked={response.selected === choice.id} onChange={() => update(checkpoint.id, { selected: choice.id, checked: undefined })} /><span>{choice.label[locale]}</span></label>)}</div></fieldset>
      <div className={styles.checkpointActions}><Button disabled={!response.selected} onClick={() => update(checkpoint.id, { checked: response.selected })}>{locale === "vi" ? "Kiểm tra câu trả lời" : "Check answer"}</Button><Button variant="quiet" onClick={() => update(checkpoint.id, { revealed: !response.revealed, answerSeen: true })}>{response.revealed ? (locale === "vi" ? "Ẩn giải thích" : "Hide explanation") : (locale === "vi" ? "Xem giải thích" : "Show explanation")}</Button></div>
      <div aria-live="polite" aria-atomic="true">{checkedChoice && <div className={styles.answerFeedback} data-correct={correct}><strong>{correct ? <><Check size={17} aria-hidden="true" />{locale === "vi" ? "Đúng" : "Correct"}</> : <><Lightbulb size={17} aria-hidden="true" />{locale === "vi" ? "Hãy xem lại cách suy luận" : "Revisit your reasoning"}</>}</strong><p>{checkedChoice.feedback[locale]}</p>{response.answerSeen && <small>{locale === "vi" ? "Bạn đã xem giải thích của câu này. Đây là lần làm lại có hỗ trợ." : "You have viewed this question’s explanation. This is a supported retry."}</small>}</div>}</div>
      {response.revealed && <div className={styles.explanation}><strong>{locale === "vi" ? "Vì sao?" : "Why?"}</strong><p>{checkpoint.explanation[locale]}</p></div>}
    </article>;
  })}</div>;
}

export function RecallPrompt({ prompt, answerPoints, locale }: { readonly prompt: Localized; readonly answerPoints: readonly Localized[]; readonly locale: Locale }) {
  const [revealed, setRevealed] = useState(false);
  return <div className={styles.recall}><p>{prompt[locale]}</p><Button variant="secondary" onClick={() => setRevealed(!revealed)} aria-expanded={revealed}>{revealed ? (locale === "vi" ? "Ẩn ý chính" : "Hide key points") : (locale === "vi" ? "Đối chiếu ý chính" : "Compare with the key points")}</Button>{revealed && <ul>{answerPoints.map((point, index) => <li key={index}>{point[locale]}</li>)}</ul>}</div>;
}
