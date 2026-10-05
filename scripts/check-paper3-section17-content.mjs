import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = join(root, "..", "planning", "paper3-2026", "completion-program-2026", "evidence", "section17");
const contracts = [
  ["P3-17.1-T01", "confidentiality-and-key-choice", "key-ownership"],
  ["P3-17.1-T02", "quantum-cryptography", "quantum-key-distribution"],
  ["P3-17.1-T03", "ssl-tls-communication", "tls-session"],
  ["P3-17.1-T04", "certificates-and-signatures", "certificate-signature"],
];
const coverage = [
  ["encryption works", /plaintext[\s\S]*ciphertext|ciphertext[\s\S]*plaintext/i],
  ["public/private keys", /public key[\s\S]*private key|private key[\s\S]*public key/i],
  ["plain/cipher text", /plain ?text[\s\S]*cipher ?text/i],
  ["encryption/decryption", /encryption[\s\S]*decryption/i],
  ["symmetric", /symmetric/i],
  ["asymmetric", /asymmetric/i],
  ["private message", /private message|confidential message/i],
  ["verified public message", /verified[\s\S]*public|public[\s\S]*verif/i],
  ["encrypt/decrypt with both arrangements", /symmetric[\s\S]*asymmetric/i],
  ["quantum purpose", /QKD[\s\S]*key material|quantum key distribution/i],
  ["quantum benefit", /benefit/i],
  ["quantum drawback", /drawback|limitation/i],
  ["SSL/TLS purpose/use/situation", /TLS[\s\S]*client[\s\S]*server[\s\S]*(login|payment|personal data)/i],
  ["certificate acquisition", /certificate[\s\S]*(request|acquisition|acquire)[\s\S]*(issue|issued)/i],
  ["certificate/signature use", /certificate[\s\S]*signature|signature[\s\S]*certificate/i],
];

function allLocalized(value, at = "$", failures = []) {
  if (!value || typeof value !== "object") return failures;
  if (Object.hasOwn(value, "en") || Object.hasOwn(value, "vi")) {
    if (typeof value.en !== "string" || !value.en.trim()) failures.push(`${at}.en is empty`);
    if (typeof value.vi !== "string" || !value.vi.trim()) failures.push(`${at}.vi is empty`);
    return failures;
  }
  if (Array.isArray(value)) value.forEach((item, index) => allLocalized(item, `${at}[${index}]`, failures));
  else Object.entries(value).forEach(([key, item]) => allLocalized(item, `${at}.${key}`, failures));
  return failures;
}

const failures = [];
const lessons = [];
for (const [topicId, slug, visualKind] of contracts) {
  const path = join(root, "content", "paper3", "lessons", `${slug}.json`);
  const raw = await readFile(path, "utf8");
  const lesson = JSON.parse(raw);
  lessons.push({ lesson, raw, path });
  if (lesson.topicId !== topicId || lesson.slug !== slug) failures.push(`${slug}: identity mismatch`);
  if (lesson.visual?.kind !== visualKind) failures.push(`${slug}: expected visual kind ${visualKind}`);
  if ((lesson.theory?.length ?? 0) < 3) failures.push(`${slug}: needs at least 3 theory blocks`);
  if ((lesson.workedExample?.steps?.length ?? 0) < 4) failures.push(`${slug}: needs at least 4 worked steps`);
  if ((lesson.checkpoints?.length ?? 0) < 4) failures.push(`${slug}: needs at least 4 checkpoints`);
  if ((lesson.misconceptions?.length ?? 0) < 4) failures.push(`${slug}: needs at least 4 misconceptions`);
  if (!lesson.estimatedMinutes) failures.push(`${slug}: missing estimated time`);
  failures.push(...allLocalized(lesson).map((item) => `${slug}: ${item}`));
  const sourceKinds = new Set(lesson.sources?.map(source => source.kind));
  for (const kind of ["syllabus", "book", "question-paper", "mark-scheme"]) if (!sourceKinds.has(kind)) failures.push(`${slug}: missing ${kind} source`);
  for (const check of lesson.checkpoints ?? []) {
    if (!check.choices?.some(item => item.id === check.correctChoiceId)) failures.push(`${slug}/${check.id}: missing correct choice`);
    if (new Set(check.choices?.map(item => item.feedback.en)).size !== check.choices?.length) failures.push(`${slug}/${check.id}: EN feedback is not choice-specific`);
    if (new Set(check.choices?.map(item => item.feedback.vi)).size !== check.choices?.length) failures.push(`${slug}/${check.id}: VI feedback is not choice-specific`);
  }
}

const corpus = lessons.map(({ raw }) => raw).join("\n");
const coverageResult = coverage.map(([item, pattern], index) => ({ item: index + 1, label: item, pass: pattern.test(corpus) }));
for (const row of coverageResult) if (!row.pass) failures.push(`coverage ${row.item}: ${row.label}`);
const assertedCorpus = lessons.map(({ lesson }) => JSON.stringify({ theory: lesson.theory, workedExample: lesson.workedExample, takeaways: lesson.takeaways })).join("\n");
const unsafeClaims = [
  /signature (?:always )?(?:encrypts|hides) the (?:whole )?message/i,
  /TLS (?:guarantees|proves) (?:a |the )?(?:website|site) is (?:safe|honest|trustworthy)/i,
  /one (?:matching|clean) (?:bit|sample) proves no eavesdropper/i,
  /certificate contains (?:the )?(?:owner'?s|subject'?s) private key/i,
];
for (const pattern of unsafeClaims) if (pattern.test(assertedCorpus)) failures.push(`unsafe academic claim matched: ${pattern}`);

const result = {
  schemaVersion: 1,
  gate: "paper3-section17-content",
  generatedAt: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS",
  lessonCount: lessons.length,
  coverage: { passed: coverageResult.filter(row => row.pass).length, total: coverageResult.length, rows: coverageResult },
  lessons: lessons.map(({ lesson, raw }) => ({ topicId: lesson.topicId, slug: lesson.slug, visualKind: lesson.visual.kind, theoryBlocks: lesson.theory.length, workedSteps: lesson.workedExample.steps.length, checkpoints: lesson.checkpoints.length, sha256: createHash("sha256").update(raw).digest("hex") })),
  failures,
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(join(evidenceDir, "TEACHER_CONTENT_CHECK.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
