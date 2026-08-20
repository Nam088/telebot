import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

for (const file of project.getSourceFiles("tests/**/*.test.ts")) {
    for (const imp of file.getImportDeclarations()) {
        const specifier = imp.getModuleSpecifierValue();
        if (specifier.includes("src/scheduler/queue.js")) {
            const namedImports = imp.getNamedImports();
            const jobImport = namedImports.find(n => n.getName() === "Job");
            if (jobImport) {
                jobImport.remove();
                file.addImportDeclaration({
                    moduleSpecifier: specifier.replace("queue.js", "job.js"),
                    namedImports: ["Job"]
                });
            }
        }
    }
}
await project.save();
