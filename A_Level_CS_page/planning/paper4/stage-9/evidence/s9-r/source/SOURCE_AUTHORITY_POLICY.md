# Stage 9 source authority and access policy

The lesson renderer preserves the registry's raw `authority`, `sourceId`, `locator` or `citation`, and `status`. It also maps the authority to one learner-facing class:

| Class | Includes | Public meaning |
|---|---|---|
| `official-exam` | `QP`, `MS`, `official_qp`, `official_ms` | Cambridge exam material checked in the internal corpus |
| `coursebook` | authority containing `coursebook` | coursebook section joined by Stage 3 |
| `algocore-editorial` | authority containing `AlgoCore` | AlgoCore explanation, policy, inference, or risk note |
| `internal-evidence` | authority beginning with `Stage...` | trace, brief, map, or prior-stage evidence |
| `unclassified` | every unmatched value | source reviewer must classify or explicitly accept it before release |

`internal-citation` is the default. A locator can contain a Windows path, repository-relative path, fragment, page number, or even URL-looking text; it is rendered only as escaped text.

`verified-external` is granted only when the record has explicit `accessMode`, a dedicated HTTPS field (`externalUrl`, `external_url`, or `url`), and either a verified status or explicit verified flag. The locator is never considered when constructing `href`.

Every card links to the fixed internal route `/paper-4/sources?lang=vi|en`, which explains these authority and access labels without exposing a local locator in the route.
