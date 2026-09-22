import registry from "../../data/stage8-runtime-registry.json";

import type { RuntimeRegistry } from "./types";

// Compile-time assertion only. It prevents the generated registry and the visual
// runtime from drifting before a route is built.
export const stage8RegistryContractCheck: RuntimeRegistry = registry;
