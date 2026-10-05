"use client";

import { useId, useState, type ReactNode } from "react";
import { BadgeCheck, FileKey, KeyRound, RadioTower, Server, ShieldCheck, UserRound, WifiOff } from "lucide-react";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import {
  certificateTrace,
  keyChoices,
  keyOwnershipTrace,
  quantumScenarios,
  quantumTrace,
  tlsScenarios,
  tlsTrace,
  type CertificateMode,
  type CryptoActor,
  type CryptoMechanism,
  type KeyChoice,
  type QuantumScenario,
  type SecurityGoal,
  type SecurityStep,
  type SecurityVisualKind,
  type SignatureCase,
  type TlsScenario,
} from "@/app/lib/paper3/security-models";
import { Button } from "@/app/components/algocore-ui";
import { StateControls, StateExplanation, StateHeading, StateTable } from "./Section15VisualPrimitives";
import styles from "./Section17SecurityWorkbench.module.css";

const text = (value: Localized, locale: Locale) => value[locale];
const viTokens: Readonly<Record<string, string>> = {
  "plain-text": "bản rõ", "goal-selected": "đã chọn mục tiêu", "choice-rejected": "lựa chọn bị từ chối", "cipher-text": "bản mã", signed: "đã ký", delivered: "đã chuyển", decrypted: "đã giải mã", verified: "đã kiểm chứng",
  prepare: "chuẩn bị", received: "đã nhận", sifted: "đã sàng lọc", sampled: "đã lấy mẫu", decision: "quyết định", pending: "đang chờ", accept: "chấp nhận", abort: "hủy",
  prepared: "đã chuẩn bị", disturbed: "bị nhiễu", kept: "được giữ", "discarded-basis": "loại do cơ sở", "public-sample": "mẫu công khai", "candidate-key": "vật liệu khóa ứng viên", "discarded-abort": "loại vì đã hủy khóa",
  request: "yêu cầu", "certificate-presented": "đã trình chứng thư", "certificate-rejected": "chứng thư bị từ chối", "identity-validated": "đã xác thực danh tính", "session-established": "đã thiết lập phiên", "protected-data": "dữ liệu được bảo vệ",
  start: "bắt đầu", "request-ready": "yêu cầu sẵn sàng", "under-review": "đang kiểm tra", checked: "đã kiểm tra", issued: "đã cấp", digested: "đã tạo tóm lược", "certificate-validated": "đã xác thực chứng thư", valid: "hợp lệ", invalid: "không hợp lệ",
  "MEET AT 09:00": "GẶP LÚC 09:00", "RESULTS APPROVED": "KẾT QUẢ ĐÃ DUYỆT", "RESULTS APPROVED + SIG(A4)": "KẾT QUẢ ĐÃ DUYỆT + SIG(A4)", "Approve results": "Duyệt kết quả", "Reject results": "Từ chối kết quả",
  "nobody yet": "chưa ai", sender: "người gửi", recipient: "người nhận", public: "công chúng", "nobody in transit": "không ai trên đường truyền", "sender public key holders": "người có khóa công khai người gửi", "not the purpose": "không phải mục tiêu",
  "client hello": "yêu cầu mở phiên từ client", "local file request": "yêu cầu tệp cục bộ", "certificate + handshake data": "chứng thư + dữ liệu bắt tay", "certificate warning": "cảnh báo chứng thư", "finished handshake": "bắt tay hoàn tất", "encrypted credentials": "thông tin đăng nhập đã bảo vệ", "encrypted payment details": "thông tin thanh toán đã bảo vệ",
  none: "không", client: "client", "client and server": "client và server", "not established": "chưa thiết lập", "pending validation": "đang chờ xác thực", "server public key validated": "đã xác thực khóa công khai server", "shared session keys established": "đã thiết lập khóa phiên dùng chung",
  "client-server connection": "kết nối client-server", "local device only": "chỉ thiết bị cục bộ", "Alice 110 · Bob 101 (reconciliation required)": "Alice 110 · Bob 101 (cần đối soát)", "discarded": "đã loại",
  "signature created": "đã tạo chữ ký", "sender identity-public-key binding validated": "đã xác thực liên kết danh tính–khóa công khai người gửi", "invalid: message changed": "không hợp lệ: thông điệp đã đổi", "invalid: wrong public key": "không hợp lệ: sai khóa công khai", "identity-public-key binding issued": "đã cấp liên kết danh tính–khóa công khai", "separate encryption required": "cần mã hóa riêng", "not started": "chưa bắt đầu", "certificate pending": "đang chờ chứng thư", passed: "đã đạt",
};
const localToken = (value: string | number | boolean, locale: Locale) => locale === "vi" && typeof value === "string" ? (viTokens[value] ?? value) : String(value);

function Field({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return <div className={styles.field}><strong>{label}</strong><span>{children}</span></div>;
}

function SelectField({ label, value, onChange, children }: { readonly label: string; readonly value: string; readonly onChange: (value: string) => void; readonly children: ReactNode }) {
  const id = useId();
  return <div className={styles.field}><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}>{children}</select></div>;
}

function Legend({ locale }: { readonly locale: Locale }) {
  return <div className={styles.legend} aria-label={locale === "vi" ? "Chú giải quyền sở hữu khóa" : "Key ownership legend"}>
    <span data-key-status="public"><KeyRound size={16} aria-hidden="true" />{locale === "vi" ? "Công khai: có thể phân phối" : "Public: distributable"}</span>
    <span data-key-status="private"><FileKey size={16} aria-hidden="true" />{locale === "vi" ? "Riêng: chỉ chủ sở hữu giữ" : "Private: owner only"}</span>
    <span data-key-status="shared"><ShieldCheck size={16} aria-hidden="true" />{locale === "vi" ? "Bí mật dùng chung: các bên được phép" : "Shared secret: authorised parties"}</span>
  </div>;
}

function Scene<S>({ steps, index, setIndex, onReset, locale, digest, children }: { readonly steps: readonly SecurityStep<S>[]; readonly index: number; readonly setIndex: (value: number) => void; readonly onReset?: () => void; readonly locale: Locale; readonly digest: (state: S) => ReactNode; readonly children: (step: SecurityStep<S>) => ReactNode }) {
  const step = steps[index] ?? steps[0];
  return <div className={styles.body} data-security-step={step.id}>
    <StateHeading step={step} index={index} count={steps.length} locale={locale} />
    <StateControls steps={steps} index={index} onChange={setIndex} onReset={onReset} locale={locale} />
    <div className={styles.scene}>{children(step)}</div>
    <StateExplanation step={step} locale={locale} />
    <StateTable steps={steps} selectedId={step.id} before={item => digest(item.before)} after={item => digest(item.after)} locale={locale} />
  </div>;
}

function KeyOwnershipWorkbench({ locale }: { readonly locale: Locale }) {
  const [goal, setGoal] = useState<SecurityGoal>("private");
  const [mechanism, setMechanism] = useState<CryptoMechanism>("asymmetric");
  const [actor, setActor] = useState<CryptoActor>("sender");
  const [key, setKey] = useState<KeyChoice>("recipient-public");
  const [index, setIndex] = useState(0);
  const trace = keyOwnershipTrace(goal, mechanism, actor, key);
  const change = <T,>(setter: (value: T) => void) => (value: string) => { setter(value as T); setIndex(0); };
  const reset = () => { setGoal("private"); setMechanism("asymmetric"); setActor("sender"); setKey("recipient-public"); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="key-ownership" data-choice-valid={trace.valid} data-goal={goal}>
    <div className={styles.setup}>
      <SelectField label={locale === "vi" ? "Mục tiêu" : "Security goal"} value={goal} onChange={change(setGoal)}><option value="private">{locale === "vi" ? "Thông điệp riêng cho người nhận" : "Private message to recipient"}</option><option value="verified">{locale === "vi" ? "Thông điệp được công chúng xác minh" : "Publicly verified message"}</option></SelectField>
      <SelectField label={locale === "vi" ? "Cơ chế" : "Mechanism"} value={mechanism} onChange={change(setMechanism)}><option value="asymmetric">{locale === "vi" ? "Bất đối xứng" : "Asymmetric"}</option><option value="symmetric">{locale === "vi" ? "Đối xứng" : "Symmetric"}</option></SelectField>
      <SelectField label={locale === "vi" ? "Ai thao tác?" : "Who acts?"} value={actor} onChange={change(setActor)}><option value="sender">{locale === "vi" ? "Người gửi" : "Sender"}</option><option value="recipient">{locale === "vi" ? "Người nhận" : "Recipient"}</option><option value="public">{locale === "vi" ? "Người kiểm chứng công khai" : "Public verifier"}</option></SelectField>
      <SelectField label={locale === "vi" ? "Khóa ứng viên" : "Candidate key"} value={key} onChange={change(setKey)}>{keyChoices.map(option => <option value={option.id} key={option.id}>{text(option.label, locale)}</option>)}</SelectField>
    </div>
    <Legend locale={locale} />
    <Scene steps={trace.steps} index={index} setIndex={setIndex} onReset={reset} locale={locale} digest={state => `${localToken(state.phase, locale)}; ${localToken(state.artefact, locale)}; ${locale === "vi" ? "đọc" : "readable"}=${localToken(state.readableBy, locale)}; ${locale === "vi" ? "kiểm chứng" : "verify"}=${localToken(state.verifiableBy, locale)}`}>
      {step => <><div className={styles.lanes}>
        <div className={styles.actor} data-active={step.after.phase === "plain-text" || step.after.phase === "goal-selected" || step.after.phase === "signed" || step.after.phase === "cipher-text"}><UserRound aria-hidden="true" /><strong>{locale === "vi" ? "Người gửi" : "Sender"}</strong><span>{goal === "verified" ? (locale === "vi" ? "Chủ sở hữu khóa riêng người gửi" : "Owns sender private key") : (locale === "vi" ? "Bắt đầu với bản rõ" : "Starts with plain text")}</span></div>
        <div className={styles.channel}><span>{localToken(step.after.artefact, locale)}</span><b>{locale === "vi" ? "Sản phẩm hiện tại" : "Current artefact"}</b></div>
        <div className={styles.actor} data-active={["delivered", "decrypted", "verified"].includes(step.after.phase)}>{goal === "private" ? <UserRound aria-hidden="true" /> : <BadgeCheck aria-hidden="true" />}<strong>{goal === "private" ? (locale === "vi" ? "Người nhận" : "Recipient") : (locale === "vi" ? "Công chúng" : "Public verifier")}</strong><span>{goal === "private" ? (locale === "vi" ? "Chủ sở hữu khóa riêng người nhận" : "Owns recipient private key") : (locale === "vi" ? "Dùng khóa công khai người gửi" : "Uses sender public key")}</span></div>
      </div><div className={styles.status} data-result={trace.valid ? "valid" : "invalid"} role="status"><strong>{trace.valid ? (locale === "vi" ? "Lựa chọn hợp lệ" : "Valid choice") : (locale === "vi" ? "Lựa chọn bị từ chối" : "Rejected choice")}</strong><span>{text(step.outcome, locale)}</span></div></>}
    </Scene>
    <div className={styles.summaryTable} role="region" tabIndex={0} aria-label={locale === "vi" ? "Bảng mục tiêu và khóa" : "Goal and key summary"}><table><thead><tr><th>{locale === "vi" ? "Mục tiêu" : "Goal"}</th><th>{locale === "vi" ? "Ai làm" : "Who"}</th><th>{locale === "vi" ? "Khóa" : "Key"}</th><th>{locale === "vi" ? "Kết quả" : "Outcome"}</th></tr></thead><tbody><tr><td>{locale === "vi" ? "Bí mật bất đối xứng" : "Asymmetric confidentiality"}</td><td>{locale === "vi" ? "Người gửi" : "Sender"}</td><td>{locale === "vi" ? "Khóa công khai người nhận" : "Recipient public"}</td><td>{locale === "vi" ? "Người nhận giải mã bằng khóa riêng" : "Recipient decrypts with private key"}</td></tr><tr><td>{locale === "vi" ? "Xác minh công khai" : "Public verification"}</td><td>{locale === "vi" ? "Người gửi" : "Sender"}</td><td>{locale === "vi" ? "Khóa riêng người gửi" : "Sender private"}</td><td>{locale === "vi" ? "Công chúng kiểm chứng bằng khóa công khai người gửi" : "Public verifies with sender public"}</td></tr><tr><td>{locale === "vi" ? "Bí mật đối xứng" : "Symmetric confidentiality"}</td><td>{locale === "vi" ? "Người gửi" : "Sender"}</td><td>{locale === "vi" ? "Khóa bí mật dùng chung" : "Shared secret"}</td><td>{locale === "vi" ? "Người nhận dùng cùng khóa bí mật" : "Recipient uses same secret"}</td></tr></tbody></table></div>
  </div>;
}

function QuantumWorkbench({ locale }: { readonly locale: Locale }) {
  const [scenario, setScenario] = useState<QuantumScenario>("clean"); const [index, setIndex] = useState(0); const trace = quantumTrace(scenario);
  const reset = () => { setScenario("clean"); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="quantum-key-distribution" data-scenario={scenario} data-decision={trace.final.decision}>
    <div className={styles.setup}><SelectField label={locale === "vi" ? "Tình huống cố định" : "Deterministic scenario"} value={scenario} onChange={value => { setScenario(value as QuantumScenario); setIndex(0); }}>{quantumScenarios.map(item => <option key={item.id} value={item.id}>{text(item.label, locale)}</option>)}</SelectField><Field label={locale === "vi" ? "Giới hạn mô hình" : "Model boundary"}>{locale === "vi" ? "Minh họa phân phối khóa, không truyền toàn bộ thông điệp ứng dụng bằng photon." : "Illustrates key distribution, not an entire application message sent as photons."}</Field></div>
    <Scene steps={trace.steps} index={index} setIndex={setIndex} onReset={reset} locale={locale} digest={state => `${localToken(state.phase, locale)}; ${locale === "vi" ? "giữ" : "kept"}=${state.kept}; ${locale === "vi" ? "mẫu" : "sample"}=${state.sampled}; ${locale === "vi" ? "ứng viên" : "candidate"}=${localToken(state.candidateKey, locale)}; ${locale === "vi" ? "lỗi" : "errors"}=${state.errors}; ${locale === "vi" ? "quyết định" : "decision"}=${localToken(state.decision, locale)}`}>
      {step => <><div className={styles.quantumLanes}>
        <div className={styles.actor}><UserRound aria-hidden="true" /><strong>Alice</strong><span>{locale === "vi" ? "Chuẩn bị trạng thái" : "Prepares states"}</span></div>
        <div className={styles.channel} data-disturbed={scenario !== "clean" && step.after.phase !== "prepare"}><RadioTower aria-hidden="true" /><b>{locale === "vi" ? "Kênh lượng tử" : "Quantum channel"}</b><span>{step.after.sent}</span></div>
        <div className={styles.actor} data-eve-active={scenario !== "clean" && step.after.phase === "received"}><UserRound aria-hidden="true" /><strong>Eve</strong><span>{scenario === "clean" ? (locale === "vi" ? "Không có trong tình huống" : "Absent in this scenario") : (locale === "vi" ? "Đo và gửi lại" : "Measures and resends")}</span></div>
        <div className={styles.actor}><UserRound aria-hidden="true" /><strong>Bob</strong><span>{locale === "vi" ? "Đo trạng thái nhận" : "Measures received states"}</span></div>
      </div><div className={styles.transmissionTable} role="region" tabIndex={0} aria-label={locale === "vi" ? "Trạng thái từng lượt truyền" : "Per-transmission state"}><table><thead><tr><th>#</th><th>{locale === "vi" ? "Alice bit / cơ sở" : "Alice bit / basis"}</th><th>{locale === "vi" ? "Eve cơ sở / kết quả" : "Eve basis / result"}</th><th>{locale === "vi" ? "Bob cơ sở / kết quả" : "Bob basis / result"}</th><th>{locale === "vi" ? "Trạng thái" : "Disposition"}</th></tr></thead><tbody>{step.after.transmissions.map(item => <tr key={item.position} data-disposition={item.disposition}><th scope="row">{item.position}</th><td>{item.aliceBit} / {item.aliceBasis}</td><td>{item.eveBasis} / {item.eveResult}</td><td>{item.bobBasis} / {item.bobResult}</td><td>{localToken(item.disposition, locale)}</td></tr>)}</tbody></table></div><div className={styles.bitEvidence}><span><b>{locale === "vi" ? "Giữ sau sàng lọc" : "Kept after sifting"}</b>{step.after.kept}</span><span><b>{locale === "vi" ? "Mẫu công khai" : "Public sample"}</b>{step.after.sampled}</span><span><b>{locale === "vi" ? "Vật liệu khóa còn lại" : "Remaining key material"}</b>{localToken(step.after.candidateKey, locale)}</span><span><b>{locale === "vi" ? "Sai lệch trong mẫu công khai" : "Public-sample mismatches"}</b>{step.after.errors}</span><span data-decision={step.after.decision}><b>{locale === "vi" ? "Quyết định" : "Decision"}</b>{localToken(step.after.decision, locale)}</span></div></>}
    </Scene>
    <aside className={styles.mechanismNote}><strong>{locale === "vi" ? "Cơ chế → đánh đổi" : "Mechanism → trade-off"}</strong><p>{locale === "vi" ? "Phép đo có thể gây nhiễu nên so sánh mẫu có thể phát hiện nghe lén. Đổi lại, cần thiết bị/kênh chuyên dụng, kênh cổ điển và phép kiểm thống kê; mẫu không lỗi không chứng minh tuyệt đối Eve vắng mặt." : "Measurement can cause disturbance, so sample comparison can reveal eavesdropping. The trade-off is specialised equipment/channel, a classical channel and statistical checking; a clean sample never proves Eve was absent."}</p></aside>
  </div>;
}

function TlsWorkbench({ locale }: { readonly locale: Locale }) {
  const [scenario, setScenario] = useState<TlsScenario>("login"); const [index, setIndex] = useState(0); const trace = tlsTrace(scenario);
  const reset = () => { setScenario("login"); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="tls-session" data-scenario={scenario} data-session-established={trace.final.phase === "protected-data"}>
    <div className={styles.setup}><SelectField label={locale === "vi" ? "Tình huống" : "Situation"} value={scenario} onChange={value => { setScenario(value as TlsScenario); setIndex(0); }}>{tlsScenarios.map(item => <option key={item.id} value={item.id}>{text(item.label, locale)}</option>)}</SelectField><Field label={locale === "vi" ? "Phạm vi" : "Scope"}>{locale === "vi" ? "Mô hình syllabus giản lược; không phải packet trace theo byte hoặc một phiên bản TLS cụ thể." : "Simplified syllabus model; not a byte-accurate trace or one specific TLS version."}</Field></div>
    <Scene steps={trace.steps} index={index} setIndex={setIndex} onReset={reset} locale={locale} digest={state => `${localToken(state.phase, locale)}; ${locale === "vi" ? "tạo phẩm" : "artefact"}=${localToken(state.travelling, locale)}; ${locale === "vi" ? "bên kiểm tra" : "checked"}=${localToken(state.checkedBy, locale)}; ${locale === "vi" ? "khóa" : "keys"}=${localToken(state.keyStatus, locale)}; ${locale === "vi" ? "được bảo vệ" : "protected"}=${state.protectedData ? (locale === "vi" ? "có" : "true") : (locale === "vi" ? "không" : "false")}`}>
      {step => <><div className={styles.tlsLanes}>
        <div className={styles.actor} data-tls-endpoint-role={scenario === "offline" ? "local-device" : "client"}>{scenario === "offline" ? <FileKey aria-hidden="true" /> : <UserRound aria-hidden="true" />}<strong>{scenario === "offline" ? (locale === "vi" ? "Thiết bị cục bộ" : "Local device") : "Client"}</strong><span>{scenario === "offline" ? (locale === "vi" ? "Mở tệp ngay trên thiết bị" : "Opens a file on this device") : (locale === "vi" ? "Kiểm chứng server" : "Validates server")}</span></div>
        <div className={styles.channel} data-protected={step.after.protectedData}>{scenario === "offline" ? <WifiOff aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}<b>{localToken(step.after.travelling, locale)}</b><span>{step.after.protectedData ? (locale === "vi" ? "Dữ liệu ứng dụng được bảo vệ" : "Protected application data") : (locale === "vi" ? "Chưa phải dữ liệu ứng dụng được bảo vệ" : "Not protected application data yet")}</span></div>
        <div className={styles.actor} data-tls-endpoint-role={scenario === "offline" ? "no-server" : "server"}>{scenario === "offline" ? <WifiOff aria-hidden="true" /> : <Server aria-hidden="true" />}<strong>{scenario === "offline" ? (locale === "vi" ? "Không có server" : "No server") : "Server"}</strong><span>{scenario === "offline" ? (locale === "vi" ? "Không có phiên TLS hay chứng thư truyền qua mạng" : "No TLS session or certificate exchange") : (locale === "vi" ? "Trình chứng thư/dữ liệu handshake" : "Presents certificate/handshake data")}</span></div>
      </div><div className={styles.bitEvidence}><span><b>{locale === "vi" ? "Pha" : "Phase"}</b>{localToken(step.after.phase, locale)}</span><span><b>{locale === "vi" ? "Bên kiểm tra" : "Checked by"}</b>{localToken(step.after.checkedBy, locale)}</span><span><b>{locale === "vi" ? "Trạng thái khóa" : "Key status"}</b>{localToken(step.after.keyStatus, locale)}</span><span><b>{locale === "vi" ? "Được bảo vệ?" : "Protected?"}</b>{step.after.protectedData ? (locale === "vi" ? "Có" : "Yes") : (locale === "vi" ? "Chưa/không áp dụng" : "Not yet/not applicable")}</span></div></>}
    </Scene>
  </div>;
}

function CertificateWorkbench({ locale }: { readonly locale: Locale }) {
  const [mode, setMode] = useState<CertificateMode>("acquire"); const [signatureCase, setSignatureCase] = useState<SignatureCase>("valid"); const [index, setIndex] = useState(0); const trace = certificateTrace(mode, signatureCase);
  const reset = () => { setMode("acquire"); setSignatureCase("valid"); setIndex(0); };
  return <div className={styles.workbench} data-visual-kind="certificate-signature" data-mode={mode} data-signature-result={trace.final.result}>
    <div className={styles.setup}><SelectField label={locale === "vi" ? "Chế độ" : "Mode"} value={mode} onChange={value => { setMode(value as CertificateMode); setIndex(0); }}><option value="acquire">{locale === "vi" ? "A · Xin cấp chứng thư" : "A · Acquire a certificate"}</option><option value="verify">{locale === "vi" ? "B · Ký và kiểm chứng" : "B · Sign and verify"}</option></SelectField>{mode === "verify" && <SelectField label={locale === "vi" ? "Ca kiểm chứng" : "Verification case"} value={signatureCase} onChange={value => { setSignatureCase(value as SignatureCase); setIndex(0); }}><option value="valid">{locale === "vi" ? "Thông điệp hợp lệ" : "Valid message"}</option><option value="tampered">{locale === "vi" ? "Thông điệp bị sửa" : "Tampered message"}</option><option value="wrong-key">{locale === "vi" ? "Sai khóa công khai" : "Wrong public key"}</option></SelectField>}<Field label={locale === "vi" ? "Lưu ý" : "Fixture note"}>{mode === "acquire" ? (locale === "vi" ? "Dữ liệu danh tính, khóa công khai và CA là dữ liệu minh họa cục bộ; chứng thư không tự mã hóa dữ liệu." : "Identity, public-key and CA data are local fixtures; a certificate does not itself encrypt data.") : (locale === "vi" ? "Digest D7/A2 là token giảng dạy, không phải mật mã dùng thật." : "Digest D7/A2 is a teaching token, not production cryptography.")}</Field></div>
    <Legend locale={locale} />
    <Scene steps={trace.steps} index={index} setIndex={setIndex} onReset={reset} locale={locale} digest={state => mode === "acquire" ? `${localToken(state.phase, locale)}; ${locale === "vi" ? "chủ thể" : "subject"}=${state.subject}; ${locale === "vi" ? "khóa công khai" : "public key"}=${state.publicKey}; ${locale === "vi" ? "kiểm tra CA" : "CA check"}=${localToken(state.caCheck, locale)}; ${locale === "vi" ? "chứng thư" : "certificate"}=${state.certificate}` : `${localToken(state.phase, locale)}; ${locale === "vi" ? "thông điệp" : "message"}=${localToken(state.message, locale)}; digest=${state.digest}; ${locale === "vi" ? "chữ ký" : "signature"}=${state.signature}; ${locale === "vi" ? "chứng thư" : "certificate"}=${state.certificate}; ${locale === "vi" ? "kết quả" : "result"}=${localToken(state.result, locale)}; ${locale === "vi" ? "bí mật" : "confidentiality"}=${localToken(state.confidentiality, locale)}`}>
      {step => <><div className={styles.artefacts}>
        {mode === "acquire" ? <>
          <div data-certificate-artefact="subject" data-active={step.after.phase === "start" || step.after.phase === "request-ready"}><strong>{locale === "vi" ? "Chủ thể / danh tính" : "Subject / identity"}</strong><span>{step.after.subject}</span></div>
          <div data-certificate-artefact="public-key-request" data-active={["request-ready", "under-review"].includes(step.after.phase)}><strong>{locale === "vi" ? "Khóa công khai trong yêu cầu" : "Public key in request"}</strong><span>{step.after.publicKey}</span></div>
          <div data-certificate-artefact="ca-check" data-active={["under-review", "checked"].includes(step.after.phase)}><strong>{locale === "vi" ? "Kiểm tra của CA" : "CA check"}</strong><span>{localToken(step.after.caCheck, locale)}</span></div>
          <div data-certificate-artefact="certificate" data-active={step.after.certificate !== step.before.certificate || step.after.phase === "issued"}><strong>{locale === "vi" ? "Chứng thư được cấp" : "Issued certificate"}</strong><span>{step.after.certificate}</span></div>
        </> : <>
          <div data-certificate-artefact="message" data-active={step.after.message !== step.before.message || step.after.phase === "start"}><strong>{locale === "vi" ? "Thông điệp" : "Message"}</strong><span>{localToken(step.after.message, locale)}</span></div>
          <div data-certificate-artefact="digest" data-active={step.after.digest !== step.before.digest || step.after.phase === "digested"}><strong>Digest</strong><span>{step.after.digest}</span></div>
          <div data-certificate-artefact="signature" data-active={step.after.signature !== step.before.signature || step.after.phase === "signed"}><strong>{locale === "vi" ? "Chữ ký" : "Signature"}</strong><span>{step.after.signature}</span></div>
          <div data-certificate-artefact="certificate" data-active={step.after.certificate !== step.before.certificate || step.after.phase === "issued"}><strong>{locale === "vi" ? "Chứng thư" : "Certificate"}</strong><span>{step.after.certificate}</span></div>
        </>}
      </div><div className={styles.outcome} data-valid={step.after.result === "valid" || step.after.phase === "issued"}><strong>{locale === "vi" ? "Kết quả hiện tại" : "Current outcome"}</strong><span>{localToken(step.after.result, locale)}</span><small>{locale === "vi" ? "Bí mật: không; muốn bí mật cần mã hóa riêng." : "Confidentiality: none; separate encryption is required."}</small></div></>}
    </Scene>
    <div className={styles.separation}><span><FileKey aria-hidden="true" /><b>{locale === "vi" ? "Chứng thư" : "Certificate"}</b>{locale === "vi" ? "CA liên kết danh tính ↔ khóa công khai" : "CA binds identity ↔ public key"}</span><span><BadgeCheck aria-hidden="true" /><b>{locale === "vi" ? "Chữ ký" : "Signature"}</b>{locale === "vi" ? "Người gửi liên kết thông điệp ↔ thao tác bằng khóa riêng" : "Sender binds message ↔ private-key operation"}</span></div>
  </div>;
}

export function Section17SecurityWorkbench({ kind, locale }: { readonly kind: SecurityVisualKind; readonly locale: Locale }) {
  if (kind === "key-ownership") return <KeyOwnershipWorkbench locale={locale} />;
  if (kind === "quantum-key-distribution") return <QuantumWorkbench locale={locale} />;
  if (kind === "tls-session") return <TlsWorkbench locale={locale} />;
  return <CertificateWorkbench locale={locale} />;
}

export type { SecurityVisualKind };
