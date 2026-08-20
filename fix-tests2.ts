import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const file = project.getSourceFileOrThrow("tests/unit/scheduler/queue.test.ts");
const imps = file.getImportDeclarations();
for (const imp of imps) {
    if (imp.getModuleSpecifierValue() === "../../../src/scheduler/queue.js") {
        imp.getNamedImports().forEach(n => {
            if (n.getName() === "Job") n.remove();
        });
        file.addImportDeclaration({
            moduleSpecifier: "../../../src/scheduler/job.js",
            namedImports: ["Job"]
        });
    }
}
const rruleFile = project.getSourceFileOrThrow("tests/unit/scheduler/rrule.test.ts");
for (const imp of rruleFile.getImportDeclarations()) {
    if (imp.getModuleSpecifierValue() === "../../../src/scheduler/queue.js") {
        imp.getNamedImports().forEach(n => {
            if (n.getName() === "Job") n.remove();
        });
        rruleFile.addImportDeclaration({
            moduleSpecifier: "../../../src/scheduler/job.js",
            namedImports: ["Job"]
        });
    }
}
await project.save();
