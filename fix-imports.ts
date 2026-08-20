import { Project } from "ts-morph";
import * as path from "path";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const files = project.getSourceFiles("src/routing/handlers/*.ts");
for (const file of files) {
    if (file.getBaseName() === "index.ts") continue;
    for (const imp of file.getImportDeclarations()) {
        const specifier = imp.getModuleSpecifierValue();
        if (specifier.startsWith("../")) {
            imp.setModuleSpecifier("../" + specifier);
        } else if (specifier.startsWith("./")) {
            // Need to see if it should still be ./ or if it refers to something in routing/
            // Originally they were in routing/handlers.ts, so ./ was routing/
            // Now they are in routing/handlers/xxx.ts, so ./ refers to routing/handlers/
            // If they are trying to import base.js, it's ./base.js.
            // Let's manually fix based on the previous file location.
        }
    }
}
await project.save();
