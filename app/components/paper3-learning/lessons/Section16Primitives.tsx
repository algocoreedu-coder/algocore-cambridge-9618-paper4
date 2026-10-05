"use client";
import {useId,type ReactNode} from "react";
import type {Locale} from "@/app/lib/paper3/catalog";
import {StateControls,StateExplanation,StateHeading,StateTable,type VisualStepCopy} from "./Section15VisualPrimitives";
import styles from "./Section16Workbench.module.css";
export function Field({label,children}:{readonly label:string;readonly children:(id:string)=>ReactNode}){const id=useId();return <div className={styles.field}><label htmlFor={id}>{label}</label>{children(id)}</div>;}
export function Scene<S>({steps,index,setIndex,locale,children,digest}:{readonly steps:readonly (VisualStepCopy&{readonly before:S;readonly after:S})[];readonly index:number;readonly setIndex:(n:number)=>void;readonly locale:Locale;readonly children:ReactNode;readonly digest:(state:S)=>ReactNode}){const step=steps[index]??steps[0];return <div className={styles.body} data-section16-step={step.id}><StateHeading step={step} index={index} count={steps.length} locale={locale}/><StateControls steps={steps} index={index} onChange={setIndex} locale={locale}/><div className={styles.scene} data-section16-scene>{children}</div><StateExplanation step={step} locale={locale}/><StateTable steps={steps} selectedId={step.id} before={s=>digest(s.before)} after={s=>digest(s.after)} locale={locale}/></div>;}
export function Digest({items}:{readonly items:readonly (readonly [string,ReactNode])[]}){return <dl className={styles.digest}>{items.map(([label,value],i)=><div key={`${label}-${i}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;}
export function ScrollTable({label,children}:{readonly label:string;readonly children:ReactNode}){return <div className={styles.scroll} role="region" aria-label={label} tabIndex={0}>{children}</div>;}
