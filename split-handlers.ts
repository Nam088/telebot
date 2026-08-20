import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const handlersFile = project.getSourceFileOrThrow("src/routing/handlers.ts");

const exports = handlersFile.getExportedDeclarations();
for (const [name, decls] of exports) {
    console.log(name);
}
