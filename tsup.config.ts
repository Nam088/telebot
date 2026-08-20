import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "client/index": "src/client/index.ts",
    "kernel/index": "src/kernel/index.ts",
    "routing/index": "src/routing/index.ts",
    "filters/index": "src/filters/index.ts",
    "storage/index": "src/storage/index.ts",
    "scheduler/index": "src/scheduler/index.ts",
    "components/index": "src/components/index.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node22",
  splitting: false,
});
