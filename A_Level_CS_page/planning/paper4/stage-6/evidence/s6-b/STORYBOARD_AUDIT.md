# S6-B storyboard audit

Status: **REWORK_REQUIRED**

Exact Stage 5 mappings: **8 patterns / 24 storyboard entries**.
The generated entries use only PASS traces whose `visual_event_id` set equals the frozen Stage 5 inventory set.

## Missing denominators

| Pattern | Visual briefs | Scenarios | Event entries | Evidence gap |
|---|---:|---:|---:|---|
| `STACK_SETUP` | 1 | 3 | 4 | No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs. |
| `STACK_PUSH` | 1 | 3 | 5 | No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs. |
| `STACK_POP` | 1 | 3 | 5 | No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs. |
| `STACK_PAIR` | 1 | 3 | 7 | No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs. |
| `STACK_REDUCE` | 1 | 3 | 7 | No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs. |

These gaps remain explicit for Lead rework. No synthetic storyboard or event ID was created, and Stage 6 release files were not changed.
