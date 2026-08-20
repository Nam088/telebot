import { Project } from "ts-morph";
import * as fs from "fs";

async function run() {
    const project = new Project({ tsConfigFilePath: "tsconfig.json" });
    const queueFile = project.getSourceFileOrThrow("src/scheduler/queue.ts");
    
    // Create job.ts
    const jobFile = project.createSourceFile("src/scheduler/job.ts", "", { overwrite: true });
    
    // Copy imports
    for (const imp of queueFile.getImportDeclarations()) {
        jobFile.addImportDeclaration(imp.getStructure());
    }

    const typeAlias = queueFile.getTypeAlias("JobCallback");
    if (typeAlias) {
        jobFile.addTypeAlias(typeAlias.getStructure());
        typeAlias.remove();
    }

    const cls = queueFile.getClass("Job");
    if (cls) {
        jobFile.addClass(cls.getStructure());
        cls.remove();
    }
    
    // Let's create an index.ts
    // Wait, let's see if src/scheduler/index.ts exists
    
    queueFile.addImportDeclaration({
        moduleSpecifier: "./job.js",
        namedImports: ["Job", "JobCallback"]
    });
    
    for (const file of project.getSourceFiles()) {
        file.fixMissingImports();
        file.fixUnusedIdentifiers();
    }
    await project.save();
}
run().catch(console.error);
