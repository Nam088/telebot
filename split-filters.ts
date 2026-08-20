import { Project } from "ts-morph";
import * as fs from "fs";

async function run() {
    const project = new Project({ tsConfigFilePath: "tsconfig.json" });
    const matchersFile = project.getSourceFileOrThrow("src/filters/matchers.ts");
    
    // Create base.ts
    const baseFile = project.createSourceFile("src/filters/base.ts", "", { overwrite: true });
    
    // Copy imports
    for (const imp of matchersFile.getImportDeclarations()) {
        baseFile.addImportDeclaration(imp.getStructure());
    }

    const baseExports = ["BaseFilter", "AndFilter", "OrFilter", "NotFilter"];
    for (const name of baseExports) {
        const cls = matchersFile.getClass(name);
        if (cls) {
            baseFile.addClass(cls.getStructure());
            cls.remove();
        }
    }

    // Now in matchers.ts, we need to import BaseFilter, AndFilter, OrFilter, NotFilter from base.ts
    matchersFile.addImportDeclaration({
        moduleSpecifier: "./base.js",
        namedImports: ["BaseFilter"]
    });

    // Let's create an index.ts
    project.createSourceFile("src/filters/index.ts", `
export * from "./base.js";
export * from "./matchers.js";
    `, { overwrite: true });

    for (const file of project.getSourceFiles()) {
        file.fixMissingImports();
        file.fixUnusedIdentifiers();
    }
    
    await project.save();
}
run().catch(console.error);
