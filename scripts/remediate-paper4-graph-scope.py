from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "content" / "paper4" / "assessments" / "production" / "assessment-items.json",
    ROOT / "content" / "paper4" / "records" / "full" / "assessment-items.json",
]


COPY = {
    "graphs.g1": {
        "prompt": {
            "en": "Use the supplied normal scenario fixture: a route network contains towns, one-way roads and journey times. Identify vertices and edges, then classify direction and weight. No graph-structure code is required.",
            "vi": "Dùng scenario fixture normal được cung cấp: mạng tuyến đường có town, đường một chiều và journey time. Xác định vertex, edge rồi phân loại direction và weight. Không yêu cầu code graph structure.",
        },
        "expected": {"en": "A labelled scenario model naming vertices, edges, direction, weights and the meaning of each choice.", "vi": "Mô hình tình huống có nhãn, nêu vertex, edge, direction, weight và ý nghĩa của từng lựa chọn."},
    },
    "graphs.f1": {
        "prompt": {
            "en": "Use the supplied boundary scenario fixture to compare an adjacency list and adjacency matrix for a sparse route network. Choose one representation and justify it; do not implement it.",
            "vi": "Dùng scenario fixture boundary để so sánh adjacency list và adjacency matrix cho mạng tuyến đường sparse. Chọn một representation và giải thích; không cài đặt.",
        },
        "expected": {"en": "A representation choice with a scenario-based justification and one limitation.", "vi": "Lựa chọn representation có giải thích theo tình huống và một hạn chế."},
    },
    "graphs.i1": {
        "prompt": {
            "en": "Treat the normal, boundary and failure fixtures as three scenario cases. Define vertices and edges, decide whether direction and weight are meaningful, and justify the graph. No Python implementation is required.",
            "vi": "Coi fixture normal, boundary và failure là ba scenario case. Xác định vertex, edge, quyết định direction và weight có ý nghĩa không, rồi giải thích graph. Không yêu cầu cài đặt Python.",
        },
        "expected": {"en": "An independent graph classification and justification grounded in the delivery scenario.", "vi": "Bản phân loại và giải thích graph độc lập, bám theo tình huống giao hàng."},
    },
}


def remediate(record: dict) -> None:
    item_id = record.get("assessment_item_id")
    if item_id not in COPY:
        return
    copy = COPY[item_id]
    record["prompt"] = copy["prompt"]
    record["expected_artifact"] = copy["expected"]
    record["hint"] = {
        "en": "Link each modelling choice to a fact in the scenario: entity, relationship, direction or measurable cost.",
        "vi": "Nối từng lựa chọn mô hình với một dữ kiện trong tình huống: entity, relationship, direction hoặc measurable cost.",
    }
    record["feedback"] = {
        "en": "If the model is unclear, return to the scenario and correct the first vertex, edge, direction or weight whose meaning is unsupported.",
        "vi": "Nếu mô hình chưa rõ, quay lại tình huống và sửa vertex, edge, direction hoặc weight đầu tiên chưa có ý nghĩa được chứng minh.",
    }
    rubric = record["self_rubric"]
    for criterion in rubric.get("criteria", []):
        cid = criterion.get("criterion_id", "")
        if cid.endswith(".requirement"):
            criterion["description"] = {"en": "The response addresses linked graph features and justification without requiring graph-structure code; workflow labels are not Cambridge mark allocations.", "vi": "Câu trả lời đáp ứng graph feature và giải thích mà không đòi code graph structure; nhãn workflow không phải phân bổ điểm Cambridge."}
            criterion["evidence_required"] = "A written scenario model identifying vertices, edges and every justified feature."
        elif cid.endswith(".execution"):
            criterion["description"] = {"en": "The classification matches the stated scenario facts.", "vi": "Phân loại khớp các dữ kiện đã nêu trong tình huống."}
            criterion["evidence_required"] = "A written mapping from scenario facts to graph features."
        elif cid.endswith(".trace"):
            criterion["description"] = {"en": "The reasoning identifies entities, relationships and every selected graph feature.", "vi": "Lập luận xác định entity, relationship và mọi graph feature đã chọn."}
            criterion["evidence_required"] = "A concise entity-to-vertex and relationship-to-edge explanation."
        elif cid.endswith(".transfer"):
            criterion["description"] = {"en": "The choice is transferred to a new scenario without adding unsupported graph features.", "vi": "Lựa chọn được chuyển sang tình huống mới mà không thêm graph feature thiếu căn cứ."}
            criterion["evidence_required"] = "An independent classification and justification for the new scenario."
    rubric["pass_rule"] = {"en": "Pass when every graph feature is correct and justified from the scenario.", "vi": "Đạt khi mọi graph feature đều đúng và được giải thích từ tình huống."}
    rubric["retry_rule"] = {"en": "Repair the first modelling choice that lacks support, then re-check the complete explanation.", "vi": "Sửa lựa chọn mô hình đầu tiên thiếu căn cứ rồi kiểm lại toàn bộ giải thích."}


def update_registry(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    count = 0
    for envelope in data:
        record = envelope.get("record", envelope)
        if record.get("assessment_item_id") in COPY:
            remediate(record)
            count += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def update_dto() -> int:
    path = ROOT / "app" / "data" / "paper4-v2" / "lessons" / "graphs.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    count = 0
    for record in data["practice"]["items"]:
        if record.get("assessment_item_id") in COPY:
            remediate(record)
            count += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def main() -> None:
    result = {str(path.relative_to(ROOT)): update_registry(path) for path in TARGETS}
    result["app/data/paper4-v2/lessons/graphs.json"] = update_dto()
    if any(count != 3 for count in result.values()):
        raise SystemExit(f"Expected three Graph items in every target: {result}")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
