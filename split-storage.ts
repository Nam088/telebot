import { Project } from "ts-morph";
import * as fs from "fs";

async function run() {
    const project = new Project({ tsConfigFilePath: "tsconfig.json" });
    const driverFile = project.getSourceFileOrThrow("src/storage/driver.ts");
    
    // Create types.ts
    const typesFile = project.createSourceFile("src/storage/types.ts", "", { overwrite: true });
    
    const intfJob = driverFile.getInterface("PersistedJob");
    if (intfJob) {
        typesFile.addInterface(intfJob.getStructure());
        intfJob.remove();
    }
    
    const intfPersist = driverFile.getInterface("Persistence");
    if (intfPersist) {
        typesFile.addInterface(intfPersist.getStructure());
        intfPersist.remove();
    }
    
    // Create base.persistence.ts
    const baseFile = project.createSourceFile("src/storage/base.persistence.ts", "", { overwrite: true });
    baseFile.addImportDeclaration({
        moduleSpecifier: "./types.js",
        namedImports: ["Persistence", "PersistedJob"]
    });
    const cls = driverFile.getClass("BasePersistence");
    if (cls) {
        baseFile.addClass(cls.getStructure());
        cls.remove();
    }
    
    // driver.ts becomes barrel
    driverFile.replaceWithText(`export * from "./types.js";\nexport * from "./base.persistence.js";\n`);
    
    for (const file of project.getSourceFiles()) {
        file.fixMissingImports();
        file.fixUnusedIdentifiers();
    }
    await project.save();
}
run().catch(console.error);
