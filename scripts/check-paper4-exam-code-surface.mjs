import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const component = await readFile(path.join(root, "app/components/paper4-learning/PatternRuntimeSupplement.tsx"), "utf8");
const css = await readFile(path.join(root, "app/components/paper4-learning/PatternRuntimeSupplement.module.css"), "utf8");
const start = component.indexOf("const searchCollectionPatterns");
const stackStart = component.indexOf("const stackPatterns");
const end = component.indexOf("function local", start);
const learnerCatalog = start >= 0 && end > start ? component.slice(start, end) : "";
const searchCatalog = start >= 0 && stackStart > start ? component.slice(start, stackStart) : "";
const stackCatalog = stackStart >= 0 && end > stackStart ? component.slice(stackStart, end) : "";
const failures = [];
const check = (condition, id, message) => { if (!condition) failures.push({ id, message }); };

check(/def count_occurrences\(values, target\):/.test(searchCatalog), "EXAM-CODE-01", "Count pattern is missing.");
check(/def filter_records\(records, threshold\):/.test(searchCatalog), "EXAM-CODE-02", "Filter pattern is missing.");
check(/def group_totals\(records\):/.test(searchCatalog), "EXAM-CODE-03", "Group totals pattern is missing.");
check(!/fixture|trace\.append|__main__|json\.loads|Path\(/.test(learnerCatalog), "EXAM-CODE-04", "Learner catalog exposes verification-harness code.");
check(/surfaceId="search-collections"/.test(component) && /data-exam-code-panel/.test(component), "EXAM-CODE-05", "The learner-facing exam-code surface is not declared.");
check(/lesson\.search-collections/.test(component) && /catalog=\{searchCollectionPatterns\}/.test(component), "EXAM-CODE-06", "Search Collections is not routed away from the generic runtime harness.");
check(/Bộ harness kiểm chứng chạy phía sau/.test(component) && /verification harness runs behind/.test(component), "EXAM-CODE-07", "The learner/audit distinction is not explained bilingually.");
const activeSets = [...learnerCatalog.matchAll(/active:\s*\[([^\]]*)\]/g)].map((match) => match[1].split(",").map((item) => item.trim()).filter(Boolean));
check(activeSets.length > 0 && activeSets.every((set) => set.length >= 1 && set.length <= 3), "EXAM-CODE-08", "A trace step emphasises more than three code lines.");
check(/@media \(max-width: 52rem\)/.test(css) && /@media \(max-width: 30rem\)/.test(css), "EXAM-CODE-09", "Responsive exam-code layout rules are missing.");
check(/def pop_pair\(left_stack, right_stack\):/.test(stackCatalog), "EXAM-CODE-10", "Stack pair pattern is missing.");
check(/def subtract_top_two\(stack\):/.test(stackCatalog), "EXAM-CODE-11", "Stack operand-order pattern is missing.");
check(/left_stack\.top == -1 or right_stack\.top == -1/.test(stackCatalog), "EXAM-CODE-12", "Stack pair does not guard both stacks before mutation.");
check(/right = stack\.pop\(\)[\s\S]*left = stack\.pop\(\)[\s\S]*return left - right/.test(stackCatalog), "EXAM-CODE-13", "Stack reduce does not preserve non-commutative operand order.");
check(/lesson\.stack/.test(component) && /catalog=\{stackPatterns\}/.test(component) && /surfaceId="stack"/.test(component), "EXAM-CODE-14", "Stack is not routed away from the generic runtime harness.");
check(!/pair_stacks|stack_from|run\(fixture\)|result\["trace"\]/.test(stackCatalog), "EXAM-CODE-15", "Stack learner catalog contains internal orchestration code.");

const result = {
  schema_version: "paper4-exam-code-surface-gate-v1",
  decision: failures.length ? "FAIL" : "PASS",
  checks_run: 15,
  checks_passed: 15 - failures.length,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
