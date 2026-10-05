import type { Localized } from "./catalog";

export type SecurityVisualKind = "key-ownership" | "quantum-key-distribution" | "tls-session" | "certificate-signature";
export interface SecurityStep<S> {
  readonly id: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly outcome: Localized;
  readonly before: S;
  readonly after: S;
}

const L = (en: string, vi: string): Localized => ({ en, vi });
const freeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) freeze(nested);
    Object.freeze(value);
  }
  return value;
};
function assertMember<T extends string>(value: unknown, values: readonly T[], name: string): asserts value is T {
  if (typeof value !== "string" || !values.includes(value as T)) throw new RangeError(`Invalid ${name}`);
}

export type SecurityGoal = "private" | "verified";
export type CryptoMechanism = "asymmetric" | "symmetric";
export type CryptoActor = "sender" | "recipient" | "public";
export type KeyChoice = "recipient-public" | "recipient-private" | "sender-private" | "sender-public" | "shared-secret";
export interface KeyState { readonly phase: string; readonly artefact: string; readonly readableBy: string; readonly verifiableBy: string; readonly accepted: boolean | null }

const keyLabel: Record<KeyChoice, Localized> = {
  "recipient-public": L("recipient public key", "khóa công khai của người nhận"),
  "recipient-private": L("recipient private key", "khóa riêng của người nhận"),
  "sender-private": L("sender private key", "khóa riêng của người gửi"),
  "sender-public": L("sender public key", "khóa công khai của người gửi"),
  "shared-secret": L("shared secret key", "khóa bí mật dùng chung"),
};
const actorLabel: Record<CryptoActor, Localized> = {
  sender: L("sender", "Người gửi"),
  recipient: L("recipient", "Người nhận"),
  public: L("public verifier", "Người kiểm chứng công khai"),
};

export const keyChoices = freeze(Object.entries(keyLabel).map(([id, label]) => freeze({ id: id as KeyChoice, label })));

export function keyOwnershipTrace(goal: SecurityGoal, mechanism: CryptoMechanism, actor: CryptoActor, key: KeyChoice) {
  assertMember(goal, ["private", "verified"], "security goal");
  assertMember(mechanism, ["asymmetric", "symmetric"], "cryptographic mechanism");
  assertMember(actor, ["sender", "recipient", "public"], "actor");
  assertMember(key, ["recipient-public", "recipient-private", "sender-private", "sender-public", "shared-secret"], "key choice");
  const initial: KeyState = freeze({ phase: "plain-text", artefact: goal === "private" ? "MEET AT 09:00" : "RESULTS APPROVED", readableBy: "sender", verifiableBy: "nobody yet", accepted: null });
  const firstOperation = goal === "private"
    ? mechanism === "asymmetric" ? actor === "sender" && key === "recipient-public" : actor === "sender" && key === "shared-secret"
    : mechanism === "asymmetric" && actor === "sender" && key === "sender-private";
  const matchingOperation = goal === "private"
    ? mechanism === "asymmetric" ? actor === "recipient" && key === "recipient-private" : actor === "recipient" && key === "shared-secret"
    : mechanism === "asymmetric" && actor === "public" && key === "sender-public";
  const correct = firstOperation || matchingOperation;
  let state = initial;
  const steps: SecurityStep<KeyState>[] = [];
  const emit = (id: string, title: Localized, action: Localized, why: Localized, outcome: Localized, next: KeyState) => {
    const before = state; state = freeze(next); steps.push(freeze({ id, title, action, why, outcome, before, after: state }));
  };
  emit("identify-goal", L("Identify the security goal", "Xác định mục tiêu bảo mật"), goal === "private" ? L("Keep the message confidential for the recipient.", "Giữ bí mật thông điệp cho người nhận.") : L("Let the public verify the sender and detect a changed message.", "Cho công chúng xác minh người gửi và phát hiện thông điệp bị đổi."), L("Key choice follows the goal: confidentiality and verification are different outcomes.", "Chọn khóa theo mục tiêu: bí mật và xác minh là hai kết quả khác nhau."), goal === "private" ? L("Need encryption that the recipient can undo.", "Cần phép mã hóa mà người nhận có thể giải.") : L("Need a signature operation that the public can verify.", "Cần phép ký mà công chúng có thể kiểm chứng."), { ...state, phase: "goal-selected" });
  if (!correct) {
    const reason = goal === "verified" && mechanism === "symmetric"
      ? L("A shared secret cannot provide public verification: every holder could have produced the same value.", "Khóa bí mật dùng chung không thể xác minh công khai: mọi người giữ khóa đều có thể tạo cùng giá trị.")
      : mechanism === "asymmetric" && key === "shared-secret"
        ? L("A shared secret belongs to the symmetric model; choose one owner-specific public/private operation for this asymmetric scenario.", "Khóa bí mật dùng chung thuộc mô hình đối xứng; hãy chọn thao tác khóa công khai/riêng tư có chủ cụ thể cho kịch bản bất đối xứng.")
        : mechanism === "symmetric" && key !== "shared-secret"
          ? L("This symmetric scenario uses the shared secret at both ends, not a public/private key.", "Kịch bản đối xứng này dùng bí mật dùng chung ở cả hai đầu, không dùng khóa công khai/riêng tư.")
          : key === "recipient-public"
            ? L("The sender uses the recipient public key to encrypt a confidential message; the selected actor or goal does not match that operation.", "Người gửi dùng khóa công khai của người nhận để mã hóa thông điệp bí mật; tác nhân hoặc mục tiêu đã chọn không khớp thao tác đó.")
            : key === "recipient-private"
              ? L("Only the recipient uses the recipient private key to decrypt the matching confidential cipher text.", "Chỉ người nhận dùng khóa riêng của người nhận để giải bản mã bí mật tương ứng.")
              : key === "sender-private"
                ? L("Only the sender uses the sender private key to sign for public verification; this is not a confidentiality operation.", "Chỉ người gửi dùng khóa riêng của người gửi để ký cho kiểm chứng công khai; đây không phải thao tác tạo bí mật.")
                : key === "sender-public"
                  ? L("A public verifier uses the sender public key to check the sender signature; it does not encrypt or decrypt a private message.", "Người kiểm chứng công khai dùng khóa công khai của người gửi để kiểm chữ ký người gửi; khóa này không mã hóa hay giải mã thông điệp bí mật.")
                  : L("Only the sender and intended recipient use the shared secret for symmetric confidentiality; it cannot support a public verifier.", "Chỉ người gửi và người nhận dự định dùng bí mật chung cho tính bí mật đối xứng; nó không hỗ trợ người kiểm chứng công khai.");
    emit("reject-choice", L("Reject the candidate operation", "Từ chối thao tác được chọn"), L(`${actorLabel[actor].en} tries to use the ${keyLabel[key].en}.`, `${actorLabel[actor].vi} thử dùng ${keyLabel[key].vi}.`), reason, L("The original message stays unchanged; choose another actor, mechanism or key.", "Thông điệp gốc không đổi; hãy chọn tác nhân, cơ chế hoặc khóa khác."), { ...state, phase: "choice-rejected", accepted: false });
    return freeze({ goal, mechanism, actor, key, valid: false, initial, steps: freeze(steps), feedback: reason });
  }
  if (firstOperation) {
    emit("apply-operation", goal === "private" ? L("Encrypt the message", "Mã hóa thông điệp") : L("Create the signature", "Tạo chữ ký"), mechanism === "symmetric" ? L("The sender encrypts with the shared secret.", "Người gửi mã hóa bằng khóa bí mật dùng chung.") : goal === "private" ? L("The sender encrypts with the recipient public key.", "Người gửi mã hóa bằng khóa công khai người nhận.") : L("The sender signs the message digest with the sender private key.", "Người gửi ký bản tóm lược bằng khóa riêng của mình."), goal === "private" ? L("Only the matching decryption key should reveal the plain text in this model.", "Chỉ khóa giải mã tương ứng mới làm lộ bản rõ trong mô hình này.") : L("The private operation links the signature to the sender's key pair; it does not hide the message.", "Phép dùng khóa riêng liên kết chữ ký với cặp khóa của người gửi; nó không che thông điệp."), goal === "private" ? L("The artefact is cipher text.", "Sản phẩm là bản mã.") : L("The message remains readable and travels with a signature.", "Thông điệp vẫn đọc được và đi cùng chữ ký."), { phase: goal === "private" ? "cipher-text" : "signed", artefact: goal === "private" ? "7F·A2·19" : `${state.artefact} + SIG(A4)`, readableBy: goal === "private" ? "nobody in transit" : "public", verifiableBy: goal === "verified" ? "sender public key holders" : "not the purpose", accepted: true });
    emit("receive", L("Deliver the artefact", "Chuyển sản phẩm"), goal === "private" ? L("Transmit cipher text to the recipient.", "Truyền bản mã cho người nhận.") : L("Publish the message and signature together.", "Công bố thông điệp cùng chữ ký."), L("Transmission does not change key ownership.", "Quá trình truyền không thay đổi quyền sở hữu khóa."), L("The receiver/verifier now has the artefact, not any private key.", "Người nhận/người kiểm chứng có sản phẩm, không có khóa riêng."), { ...state, phase: "delivered" });
  } else {
    emit("receive-prerequisite", goal === "private" ? L("Receive the cipher text", "Nhận bản mã") : L("Receive the signed message", "Nhận thông điệp đã ký"), goal === "private" ? L("The sender has already encrypted and delivered the cipher text.", "Người gửi đã mã hóa và chuyển bản mã.") : L("The sender has already signed and published the readable message.", "Người gửi đã ký và công bố thông điệp có thể đọc."), L("A matching operation needs the output of the first operation; no private key travels with it.", "Thao tác cặp cần đầu ra của thao tác đầu; không có khóa riêng nào đi cùng."), goal === "private" ? L("The recipient now has cipher text.", "Người nhận hiện có bản mã.") : L("The public verifier now has the message and signature.", "Người kiểm chứng công khai hiện có thông điệp và chữ ký."), { phase: "delivered", artefact: goal === "private" ? "7F·A2·19" : `${initial.artefact} + SIG(A4)`, readableBy: goal === "private" ? "nobody in transit" : "public", verifiableBy: goal === "verified" ? "sender public key holders" : "not the purpose", accepted: true });
  }
  emit("complete-goal", goal === "private" ? L("Decrypt for the recipient", "Giải mã cho người nhận") : L("Verify for the public", "Công chúng kiểm chứng"), mechanism === "symmetric" ? L("The recipient uses the same shared secret.", "Người nhận dùng cùng khóa bí mật dùng chung.") : goal === "private" ? L("The recipient uses the matching recipient private key.", "Người nhận dùng khóa riêng tương ứng của mình.") : L("A verifier uses the sender public key and compares the digest result.", "Người kiểm chứng dùng khóa công khai người gửi và so sánh kết quả tóm lược."), goal === "private" ? L("The private/shared decryption key is not sent with the cipher text.", "Khóa giải mã riêng/dùng chung không được gửi cùng bản mã.") : L("A valid result supports authenticity and integrity, not confidentiality.", "Kết quả hợp lệ hỗ trợ tính xác thực và toàn vẹn, không tạo tính bí mật."), goal === "private" ? L("Recipient reads the original plain text.", "Người nhận đọc được bản rõ gốc.") : L("The public accepts the sender/message binding; the message remains public.", "Công chúng chấp nhận liên kết người gửi/thông điệp; thông điệp vẫn công khai."), { phase: goal === "private" ? "decrypted" : "verified", artefact: initial.artefact, readableBy: goal === "private" ? "recipient" : "public", verifiableBy: goal === "verified" ? "public" : "not the purpose", accepted: true });
  return freeze({ goal, mechanism, actor, key, valid: true, initial, steps: freeze(steps), feedback: steps.at(-1)!.outcome });
}

export type QuantumScenario = "clean" | "eve-hidden" | "eve-detected" | "eve-measures";
export interface QuantumTransmission {
  readonly position: number;
  readonly aliceBit: "0" | "1";
  readonly aliceBasis: "+" | "×";
  readonly eveBasis: "+" | "×" | "—";
  readonly eveResult: "0" | "1" | "—";
  readonly bobBasis: "+" | "×";
  readonly bobResult: "0" | "1";
  readonly disposition: "prepared" | "received" | "disturbed" | "kept" | "discarded-basis" | "public-sample" | "candidate-key" | "discarded-abort";
}
export interface QuantumState { readonly phase: string; readonly sent: string; readonly kept: string; readonly sampled: string; readonly candidateKey: string; readonly errors: number; readonly decision: "pending" | "accept" | "abort"; readonly transmissions: readonly QuantumTransmission[] }
export const quantumScenarios = freeze([
  { id: "clean" as const, label: L("No eavesdropper", "Không có kẻ nghe lén") },
  { id: "eve-measures" as const, label: L("Eve measures and resends", "Eve đo và gửi lại") },
  { id: "eve-hidden" as const, label: L("Sample misses a disturbance", "Mẫu chưa gặp nhiễu") },
  { id: "eve-detected" as const, label: L("Sample detects disturbance", "Mẫu phát hiện nhiễu") },
]);
export function quantumTrace(scenario: QuantumScenario) {
  assertMember(scenario, ["clean", "eve-hidden", "eve-detected", "eve-measures"], "quantum scenario");
  const aliceBits = ["0", "1", "1", "0", "1", "0"] as const;
  const aliceBases = ["+", "×", "+", "×", "+", "×"] as const;
  const bobBases = ["+", "×", "+", "+", "+", "×"] as const;
  const eveBases = ["×", "×", "×", "+", "+", "+"] as const;
  const eveResults = ["1", "1", "0", "1", "1", "1"] as const;
  const bobClean = ["0", "1", "1", "1", "1", "0"] as const;
  const bobDisturbed = ["0", "1", "0", "1", "1", "1"] as const;
  const intercepted = scenario !== "clean";
  const bobResults = intercepted ? bobDisturbed : bobClean;
  const buildTransmissions = (phase: QuantumState["phase"], samplePositions: readonly number[] = [], abort = false): readonly QuantumTransmission[] => freeze(aliceBits.map((aliceBit, index) => {
    const position = index + 1;
    const basisMatch = aliceBases[index] === bobBases[index];
    const disturbed = intercepted && basisMatch && aliceBit !== bobResults[index];
    const disposition: QuantumTransmission["disposition"] = phase === "prepare" ? "prepared"
      : phase === "received" ? disturbed ? "disturbed" : "received"
        : !basisMatch ? "discarded-basis"
          : samplePositions.includes(position) ? "public-sample"
            : phase === "decision" && abort ? "discarded-abort"
              : phase === "sampled" || phase === "decision" ? "candidate-key" : "kept";
    return freeze({ position, aliceBit, aliceBasis: aliceBases[index], eveBasis: intercepted ? eveBases[index] : "—", eveResult: intercepted ? eveResults[index] : "—", bobBasis: bobBases[index], bobResult: bobResults[index], disposition });
  }));
  const initial: QuantumState = freeze({ phase: "prepare", sent: "0 1 1 0 1 0", kept: "—", sampled: "—", candidateKey: "—", errors: 0, decision: "pending", transmissions: buildTransmissions("prepare") });
  let state = initial; const steps: SecurityStep<QuantumState>[] = [];
  const emit = (id: string, title: Localized, action: Localized, why: Localized, outcome: Localized, patch: Partial<QuantumState>) => { const before = state; state = freeze({ ...state, ...patch }); steps.push(freeze({ id, title, action, why, outcome, before, after: state })); };
  emit("prepare", L("Alice prepares a teaching sequence", "Alice chuẩn bị chuỗi minh họa"), L("Alice chooses bits and bases from this fixed fixture.", "Alice chọn bit và cơ sở từ dữ liệu cố định này."), L("The fixture is deterministic so every learner and test sees the same evidence.", "Dữ liệu cố định giúp mọi học sinh và kiểm thử thấy cùng bằng chứng."), L("Six quantum transmissions are ready.", "Sáu lượt truyền lượng tử đã sẵn sàng."), {});
  emit("quantum-channel", scenario === "clean" ? L("Transmit without interception", "Truyền không bị chặn") : L("Eve measures and resends", "Eve đo và gửi lại"), scenario === "clean" ? L("Bob receives Alice's transmissions directly.", "Bob nhận trực tiếp các lượt truyền của Alice.") : L("Eve measures before preparing replacements for Bob.", "Eve đo rồi chuẩn bị trạng thái thay thế gửi Bob."), scenario === "clean" ? L("No third party interacts with the quantum channel in this scenario.", "Không có bên thứ ba tương tác với kênh lượng tử trong tình huống này.") : L("An incompatible measurement can disturb a state; it does not reveal every bit with certainty.", "Phép đo không tương thích có thể làm nhiễu trạng thái; nó không cho biết chắc chắn mọi bit."), scenario === "clean" ? L("No disturbance is introduced by Eve.", "Eve không gây nhiễu.") : L("Positions 3 and 6 are disturbed in this fixture.", "Vị trí 3 và 6 bị nhiễu trong dữ liệu này."), { phase: "received", transmissions: buildTransmissions("received") });
  emit("sift", L("Compare bases over a classical channel", "So sánh cơ sở qua kênh cổ điển"), L("Alice and Bob disclose bases, not the secret bit values, and keep matching positions 1, 2, 3, 5 and 6.", "Alice và Bob công bố cơ sở, không công bố bit bí mật, rồi giữ các vị trí khớp 1, 2, 3, 5 và 6."), L("Mismatched bases cannot supply reliable shared-key bits in this model.", "Cơ sở không khớp không tạo bit khóa chung đáng tin cậy trong mô hình này."), L("Five candidate positions remain; position 4 is discarded.", "Còn năm vị trí ứng viên; vị trí 4 bị loại."), { phase: "sifted", kept: "1 2 3 5 6", transmissions: buildTransmissions("sifted") });
  const detected = scenario === "eve-detected" || scenario === "eve-measures";
  const sample = detected ? "3, 5" : scenario === "eve-hidden" ? "1, 5" : "2, 5";
  const samplePositions = sample.split(",").map(item => Number(item.trim()));
  const candidateKey = detected ? "discarded" : scenario === "eve-hidden" ? "Alice 110 · Bob 101 (reconciliation required)" : "Alice 010 · Bob 010";
  emit("sample", L("Compare a public sample", "So sánh một mẫu công khai"), L(`Reveal fixture positions ${sample}; remove them from the candidate key.`, `Công bố vị trí ${sample}; loại chúng khỏi khóa ứng viên.`), L("A sample provides evidence about disturbance but never proves that every undisclosed bit is error-free.", "Mẫu cung cấp bằng chứng về nhiễu nhưng không chứng minh mọi bit chưa công bố đều không lỗi."), detected ? L("The sample contains one mismatch.", "Mẫu có một vị trí không khớp.") : scenario === "eve-hidden" ? L("This sample contains no mismatch although unsampled positions 3 and 6 were disturbed.", "Mẫu này không có lỗi dù các vị trí 3 và 6 chưa lấy mẫu đã bị nhiễu.") : L("The sample contains no mismatch.", "Mẫu không có vị trí sai."), { phase: "sampled", sampled: sample, candidateKey, errors: detected ? 1 : 0, transmissions: buildTransmissions("sampled", samplePositions) });
  emit("decide", detected ? L("Abort key establishment", "Hủy thiết lập khóa") : L("Accept the remaining candidate material", "Chấp nhận vật liệu khóa ứng viên còn lại"), detected ? L("Discard this candidate key and restart.", "Loại khóa ứng viên này và bắt đầu lại.") : L("Keep the undisclosed candidate bits under the lesson's acceptance rule.", "Giữ các bit ứng viên chưa công bố theo quy tắc chấp nhận của bài."), detected ? L("The observed mismatch is evidence of disturbance; do not use the candidate key.", "Sai lệch quan sát được là bằng chứng về nhiễu; không dùng khóa ứng viên.") : scenario === "eve-hidden" ? L("A zero-error sample does not prove that Eve was absent; later reconciliation/privacy processing is still required.", "Mẫu không lỗi không chứng minh Eve vắng mặt; vẫn cần đối soát/xử lý riêng tư sau đó.") : L("This fixture supplies no evidence of interception; later classical post-processing is still required.", "Dữ liệu này không cho thấy bằng chứng chặn nghe; vẫn cần xử lý cổ điển tiếp theo."), detected ? L("Decision: abort. No shared key is established.", "Quyết định: hủy. Không thiết lập khóa chung.") : L("Decision: accept candidate key material under this sample rule, without claiming the finite sample proves safety.", "Quyết định: chấp nhận vật liệu khóa ứng viên theo quy tắc mẫu này, không khẳng định mẫu hữu hạn chứng minh an toàn."), { phase: "decision", decision: detected ? "abort" : "accept", transmissions: buildTransmissions("decision", samplePositions, detected) });
  return freeze({ scenario, initial, steps: freeze(steps), final: state });
}

export type TlsScenario = "login" | "payment" | "bad-certificate" | "offline";
export interface TlsState { readonly phase: string; readonly travelling: string; readonly checkedBy: string; readonly keyStatus: string; readonly protectedData: boolean; readonly scope: string }
export const tlsScenarios = freeze([
  { id: "login" as const, label: L("Sign in to a school portal", "Đăng nhập cổng trường") },
  { id: "payment" as const, label: L("Submit payment details", "Gửi thông tin thanh toán") },
  { id: "bad-certificate" as const, label: L("Certificate check fails", "Kiểm tra chứng thư thất bại") },
  { id: "offline" as const, label: L("Open a local offline file", "Mở tệp cục bộ ngoại tuyến") },
]);
export function tlsTrace(scenario: TlsScenario) {
  assertMember(scenario, ["login", "payment", "bad-certificate", "offline"], "TLS scenario");
  const appropriate = scenario !== "offline";
  const initial: TlsState = freeze({ phase: "request", travelling: appropriate ? "client hello" : "local file request", checkedBy: "none", keyStatus: "not established", protectedData: false, scope: appropriate ? "client-server connection" : "local device only" });
  let state = initial; const steps: SecurityStep<TlsState>[] = [];
  const emit = (id: string, title: Localized, action: Localized, why: Localized, outcome: Localized, patch: Partial<TlsState>) => { const before = state; state = freeze({ ...state, ...patch }); steps.push(freeze({ id, title, action, why, outcome, before, after: state })); };
  emit("classify", L("Classify the situation", "Phân loại tình huống"), appropriate ? L("A client is about to send sensitive data to a server.", "Client sắp gửi dữ liệu nhạy cảm tới server.") : L("The file stays on the device; no client-server session exists.", "Tệp ở lại trên thiết bị; không có phiên client-server."), L("TLS protects communication in transit; first check whether there is a network session to protect.", "TLS bảo vệ giao tiếp khi truyền; trước tiên cần kiểm tra có phiên mạng cần bảo vệ không."), appropriate ? L("TLS is appropriate for this communication.", "TLS phù hợp với giao tiếp này.") : L("This local-file action does not use a TLS session.", "Thao tác tệp cục bộ này không dùng phiên TLS."), {});
  if (!appropriate) return freeze({ scenario, appropriate, initial, steps: freeze(steps), final: state });
  emit("certificate", L("Server presents its certificate", "Server xuất trình chứng thư"), L("The server sends certificate information and proof associated with its identity.", "Server gửi thông tin chứng thư và bằng chứng gắn với danh tính."), L("The certificate binds the named server identity to a public key under a trusted issuer's signature.", "Chứng thư liên kết danh tính server với khóa công khai dưới chữ ký của tổ chức phát hành tin cậy."), L("The client has identity/key material to validate; the application data is not sent yet.", "Client có thông tin danh tính/khóa để kiểm tra; dữ liệu ứng dụng chưa được gửi."), { phase: "certificate-presented", travelling: "certificate + handshake data", checkedBy: "client", keyStatus: "pending validation" });
  if (scenario === "bad-certificate") {
    emit("reject-certificate", L("Reject the certificate", "Từ chối chứng thư"), L("The client finds that the certificate name does not match the requested server.", "Client phát hiện tên trên chứng thư không khớp server được yêu cầu."), L("A failed identity binding must stop the simplified handshake before session keys or protected application data.", "Liên kết danh tính thất bại phải dừng handshake giản lược trước khóa phiên hoặc dữ liệu ứng dụng được bảo vệ."), L("Connection stopped: no established TLS session and no protected application data sent.", "Kết nối dừng: không có phiên TLS được thiết lập và không gửi dữ liệu ứng dụng được bảo vệ."), { phase: "certificate-rejected", travelling: "certificate warning", checkedBy: "client", keyStatus: "not established", protectedData: false });
    return freeze({ scenario, appropriate, initial, steps: freeze(steps), final: state });
  }
  emit("validate", L("Client validates the certificate", "Client kiểm tra chứng thư"), L("Check issuer trust, server name, validity and handshake proof in this simplified model.", "Kiểm tra bên phát hành, tên server, thời hạn và bằng chứng handshake trong mô hình giản lược."), L("A certificate check supports server authentication; a padlock alone does not prove that all site content or business practices are safe.", "Kiểm tra chứng thư hỗ trợ xác thực server; biểu tượng ổ khóa không chứng minh mọi nội dung hay hoạt động của website đều an toàn."), L("The client accepts this fixture's server identity.", "Client chấp nhận danh tính server trong dữ liệu minh họa."), { phase: "identity-validated", checkedBy: "client", keyStatus: "server public key validated" });
  emit("establish", L("Establish session keys", "Thiết lập khóa phiên"), L("Client and server complete the simplified handshake and derive shared session keys.", "Client và server hoàn tất handshake giản lược và tạo khóa phiên dùng chung."), L("Asymmetric/certificate operations establish trust; efficient symmetric keys protect the application-data session in this teaching model.", "Phép bất đối xứng/chứng thư thiết lập niềm tin; khóa đối xứng hiệu quả bảo vệ phiên dữ liệu ứng dụng trong mô hình giảng dạy này."), L("The protected session is now established.", "Phiên được bảo vệ nay đã thiết lập."), { phase: "session-established", travelling: "finished handshake", checkedBy: "client and server", keyStatus: "shared session keys established" });
  emit("application", L("Send protected application data", "Gửi dữ liệu ứng dụng được bảo vệ"), scenario === "login" ? L("Send the login credentials inside the established TLS session.", "Gửi thông tin đăng nhập trong phiên TLS đã thiết lập.") : L("Send payment details inside the established TLS session.", "Gửi thông tin thanh toán trong phiên TLS đã thiết lập."), L("Application data is shown as protected only after session establishment.", "Dữ liệu ứng dụng chỉ được thể hiện là được bảo vệ sau khi thiết lập phiên."), L("TLS protects this transmission; it does not replace application authorisation or prove the site has no malware.", "TLS bảo vệ lượt truyền này; nó không thay thế phân quyền ứng dụng hoặc chứng minh website không có mã độc."), { phase: "protected-data", travelling: scenario === "login" ? "encrypted credentials" : "encrypted payment details", protectedData: true });
  return freeze({ scenario, appropriate, initial, steps: freeze(steps), final: state });
}

export type CertificateMode = "acquire" | "verify";
export type SignatureCase = "valid" | "tampered" | "wrong-key";
export interface CertificateState { readonly phase: string; readonly subject: string; readonly publicKey: string; readonly caCheck: string; readonly message: string; readonly digest: string; readonly signature: string; readonly certificate: string; readonly result: string; readonly confidentiality: "none" | "separate encryption required" }
export function certificateTrace(mode: CertificateMode, signatureCase: SignatureCase = "valid") {
  assertMember(mode, ["acquire", "verify"], "certificate mode");
  assertMember(signatureCase, ["valid", "tampered", "wrong-key"], "signature case");
  const initial: CertificateState = freeze(mode === "acquire"
    ? { phase: "start", subject: "school.example", publicKey: "Kpub-school", caCheck: "not started", message: "—", digest: "—", signature: "—", certificate: "—", result: "pending", confidentiality: "none" }
    : { phase: "start", subject: "sender", publicKey: "Kpub-sender", caCheck: "certificate pending", message: "Approve results", digest: "D7", signature: "—", certificate: "—", result: "pending", confidentiality: "none" });
  let state = initial; const steps: SecurityStep<CertificateState>[] = [];
  const emit = (id: string, title: Localized, action: Localized, why: Localized, outcome: Localized, patch: Partial<CertificateState>) => { const before = state; state = freeze({ ...state, ...patch }); steps.push(freeze({ id, title, action, why, outcome, before, after: state })); };
  if (mode === "acquire") {
    emit("prepare", L("Prepare identity and public-key information", "Chuẩn bị danh tính và thông tin khóa công khai"), L("The school server keeps its private key and prepares a request containing its identity and public-key information.", "Server của trường giữ khóa riêng và chuẩn bị yêu cầu gồm danh tính cùng thông tin khóa công khai."), L("A private key is not sent to the Certificate Authority.", "Khóa riêng không được gửi cho Certificate Authority."), L("The request is ready; no certificate exists yet.", "Yêu cầu đã sẵn sàng; chưa có chứng thư."), { phase: "request-ready" });
    emit("request", L("Send the request to the CA", "Gửi yêu cầu tới CA"), L("The subject sends its certificate request to a trusted issuer.", "Chủ thể gửi yêu cầu chứng thư tới tổ chức phát hành tin cậy."), L("Issuance and message signing are separate workflows.", "Cấp chứng thư và ký thông điệp là hai quy trình khác nhau."), L("The CA has the requested identity/public-key binding to check.", "CA có liên kết danh tính/khóa công khai cần kiểm tra."), { phase: "under-review", caCheck: "pending" });
    emit("check", L("CA checks the request", "CA kiểm tra yêu cầu"), L("The CA performs the identity/ownership checks required by this simplified model.", "CA thực hiện kiểm tra danh tính/quyền sở hữu theo mô hình giản lược."), L("A certificate is meaningful because a trusted issuer vouches for the binding.", "Chứng thư có ý nghĩa vì tổ chức phát hành tin cậy xác nhận liên kết."), L("The fixture passes the CA check.", "Dữ liệu minh họa vượt qua kiểm tra CA."), { phase: "checked", caCheck: "passed" });
    emit("issue", L("CA issues the certificate", "CA cấp chứng thư"), L("The CA signs and returns a certificate binding school.example to public key Kpub-school.", "CA ký và trả chứng thư liên kết school.example với khóa công khai Kpub-school."), L("The certificate contains a public key and identity binding; it is neither the subject's private key nor a message signature.", "Chứng thư chứa liên kết danh tính và khóa công khai; nó không phải khóa riêng của chủ thể hay chữ ký của thông điệp."), L("Certificate: school.example ↔ Kpub-school, issued by Demo CA.", "Chứng thư: school.example ↔ Kpub-school, do Demo CA cấp."), { phase: "issued", caCheck: "passed", certificate: "Demo CA: school.example ↔ Kpub-school", result: "identity-public-key binding issued" });
  } else {
    emit("digest", L("Create a teaching digest", "Tạo bản tóm lược minh họa"), L("Apply the fixed teaching fixture to the original message: digest D7.", "Áp dụng dữ liệu minh họa cố định cho thông điệp gốc: digest D7."), L("This token illustrates a digest comparison; it is not production cryptography.", "Token này minh họa việc so sánh bản tóm lược; đây không phải mật mã dùng thật."), L("Original digest = D7.", "Bản tóm lược gốc = D7."), { phase: "digested" });
    emit("sign", L("Sender creates the signature", "Người gửi tạo chữ ký"), L("The sender applies the sender private-key operation to digest D7.", "Người gửi áp dụng phép dùng khóa riêng của mình lên digest D7."), L("Only the sender should control that private key; the message itself remains readable.", "Chỉ người gửi được kiểm soát khóa riêng đó; bản thân thông điệp vẫn đọc được."), L("Message + signature SIG(D7) are ready.", "Thông điệp + chữ ký SIG(D7) đã sẵn sàng."), { phase: "signed", signature: "SIG(D7)", certificate: "Demo CA: sender ↔ Kpub-sender", result: "signature created" });
    const message = signatureCase === "tampered" ? "Reject results" : state.message;
    const localizedMessage = signatureCase === "tampered" ? "Từ chối kết quả" : "Duyệt kết quả";
    emit("deliver", signatureCase === "tampered" ? L("Message is changed in transit", "Thông điệp bị đổi khi truyền") : L("Deliver message, signature and certificate", "Chuyển thông điệp, chữ ký và chứng thư"), signatureCase === "wrong-key" ? L("The verifier selects Kpub-other instead of the certified sender public key.", "Người kiểm chứng chọn Kpub-other thay vì khóa công khai người gửi trong chứng thư.") : L("The verifier receives the message, signature and sender certificate.", "Người kiểm chứng nhận thông điệp, chữ ký và chứng thư người gửi."), L("Certificate, signature and message are separate artefacts with different roles.", "Chứng thư, chữ ký và thông điệp là các sản phẩm riêng có vai trò khác nhau."), L(`Received message: ${message}.`, `Thông điệp nhận: ${localizedMessage}.`), { phase: "delivered", message });
    emit("validate-certificate", L("Validate the signer certificate", "Xác thực chứng thư người ký"), L("Check the trusted issuer, subject identity, validity and issuer signature, then obtain Kpub-sender from the accepted certificate.", "Kiểm tra bên cấp tin cậy, danh tính chủ thể, hiệu lực và chữ ký bên cấp, rồi lấy Kpub-sender từ chứng thư được chấp nhận."), L("The identity–public-key binding must be trusted before that key is used to verify the message signature.", "Phải tin cậy liên kết danh tính–khóa công khai trước khi dùng khóa đó kiểm chứng chữ ký thông điệp."), signatureCase === "wrong-key" ? L("The certificate identifies Kpub-sender; selecting Kpub-other next is a deliberate wrong-key fixture.", "Chứng thư xác định Kpub-sender; chọn Kpub-other tiếp theo là tình huống minh họa cố ý dùng sai khóa.") : L("The verifier accepts the sender ↔ Kpub-sender binding.", "Người kiểm chứng chấp nhận liên kết người gửi ↔ Kpub-sender."), { phase: "certificate-validated", caCheck: "passed", result: "sender identity-public-key binding validated" });
    const valid = signatureCase === "valid";
    emit("verify", valid ? L("Verification succeeds", "Kiểm chứng thành công") : L("Verification fails", "Kiểm chứng thất bại"), signatureCase === "wrong-key" ? L("Use the wrong public key: the recovered signature value does not match the current digest.", "Dùng sai khóa công khai: giá trị từ chữ ký không khớp digest hiện tại.") : L("Use the certified sender public key and compare the signature value with the digest of the received message.", "Dùng khóa công khai người gửi trong chứng thư và so sánh giá trị chữ ký với digest của thông điệp nhận."), valid ? L("Matching values support sender authenticity and message integrity.", "Giá trị khớp hỗ trợ tính xác thực người gửi và toàn vẹn thông điệp.") : signatureCase === "tampered" ? L("Changing the message changes its digest, so it no longer matches SIG(D7).", "Đổi thông điệp làm digest thay đổi nên không còn khớp SIG(D7).") : L("A different public key cannot verify a signature made with the sender's private key.", "Khóa công khai khác không thể kiểm chứng chữ ký tạo bằng khóa riêng người gửi."), valid ? L("Valid signature: authenticity/integrity supported; confidentiality is not provided.", "Chữ ký hợp lệ: hỗ trợ xác thực/toàn vẹn; không cung cấp bí mật.") : L("Invalid signature: reject the claimed binding/message.", "Chữ ký không hợp lệ: từ chối liên kết/thông điệp được tuyên bố."), { phase: valid ? "valid" : "invalid", digest: signatureCase === "tampered" ? "A2" : "D7", result: valid ? "valid" : signatureCase === "tampered" ? "invalid: message changed" : "invalid: wrong public key", confidentiality: "separate encryption required" });
  }
  return freeze({ mode, signatureCase, initial, steps: freeze(steps), final: state });
}
