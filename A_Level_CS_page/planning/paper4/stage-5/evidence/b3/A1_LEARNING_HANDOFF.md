# B3 bilingual learning handoff

This candidate keeps Stage 4 stable IDs and source contracts for queue and linked-list patterns. Each fixture, run and trace carries the exact pattern, visual scenario and event IDs needed by later learning-page stages.

| Pattern family | VI learning focus | EN learning focus |
|---|---|---|
| Queue setup/enqueue/dequeue | khóa convention, guard trước mutation, giữ FIFO | lock the convention, guard before mutation, preserve FIFO |
| Queue inspect/reduce | phân biệt đọc không phá state với consume | distinguish read-only inspection from consuming reduction |
| Linked list setup/traverse | theo `Next`, không theo physical row | follow `Next`, never physical row order |
| Linked list insert/remove | save link, unlink rồi recycle, giữ partition | save links, unlink before recycle, preserve partition |

Trace events retain paired `learner_explanation.vi` and `learner_explanation.en`; Stage 6 may turn them into bilingual learning pages and Stage 7/8 may turn them into event-driven visuals.

Status: SUBMITTED; A5 rerun, A8 review and Lead gate remain downstream controls.
