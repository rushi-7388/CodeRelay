import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../src/models/Problem.js";

dotenv.config();

const languages = [
    "cpp", "c", "rust", "go", "csharp", "ruby", "php", "swift", "kotlin", "sql", "typescript"
];

// Template generators for common problem structures
const getBoilerplate = (lang, problem) => {
    const { id, title, name, args, tests } = problem;
    
    const argList = args.map(a => a.name).join(", ");
    const tsArgs = args.map(a => `${a.name}: ${a.tsType}`).join(", ");
    
    switch (lang) {
        case "cpp":
            return `class Solution {\npublic:\n    ${problem.retCpp} ${name}(${args.map(a => `${a.cppType} ${a.name}`).join(", ")}) {\n        // Write your solution here\n        \n    }\n};\n\n// Test cases\nint main() {\n    Solution sol;\n    // Example: sol.${name}(...);\n    return 0;\n}`;
        case "c":
            return `// Write your solution here\n${problem.retC} ${name}(${args.map(a => `${a.cType} ${a.name}`).join(", ")}) {\n    \n}\n\nint main() {\n    // Implement tests\n    return 0;\n}`;
        case "rust":
            return `impl Solution {\n    pub fn ${problem.name_snake}(${args.map(a => `${a.name}: ${a.rustType}`).join(", ")}) -> ${problem.retRust} {\n        // Write your solution here\n        \n    }\n}\n\nfn main() {\n    // Implement tests\n}`;
        case "go":
            return `package main\nimport "fmt"\n\nfunc ${name}(${args.map(a => `${a.name} ${a.goType}`).join(", ")}) ${problem.retGo} {\n    // Write your solution here\n    \n}\n\nfunc main() {\n    // fmt.Println(${name}(...))\n}`;
        case "csharp":
            return `using System;\n\npublic class Solution {\n    public ${problem.retCSharp} ${name}(${args.map(a => `${a.csharpType} ${a.name}`).join(", ")}) {\n        // Write your solution here\n        \n    }\n}\n\nclass Program {\n    static void Main() {\n        // Solution sol = new Solution();\n    }\n}`;
        case "ruby":
            return `def ${problem.name_snake}(${argList})\n    # Write your solution here\n    \nend\n\n# Test cases\n# p ${problem.name_snake}(...)`;
        case "php":
            return `<?php\n\nclass Solution {\n    /**\n     * @param ${args.map(a => a.phpType).join(" ")}\n     * @return ${problem.retPhp}\n     */\n    function ${name}(${args.map(a => `$${a.name}`).join(", ")}) {\n        // Write your solution here\n        \n    }\n}\n?>`;
        case "swift":
            return `class Solution {\n    func ${name}(${args.map(a => `_ ${a.name}: ${a.swiftType}`).join(", ")}) -> ${problem.retSwift} {\n        // Write your solution here\n        \n    }\n}\n\n// Solution().${name}(...)`;
        case "kotlin":
            return `class Solution {\n    fun ${name}(${args.map(a => `${a.name}: ${a.kotlinType}`).join(", ")}): ${problem.retKotlin} {\n        // Write your solution here\n        \n    }\n}\n\nfun main() {\n    // println(Solution().${name}(...))\n}`;
        case "sql":
            return `-- Write your SQL query here\nSELECT * FROM ...;`;
        case "typescript":
            return `function ${name}(${tsArgs}): ${problem.retTs} {\n    // Write your solution here\n    \n}\n\n// console.log(${name}(...));`;
        default:
            return "// Write your solution here";
    }
};

const problemMeta = [
    {
        id: "two-sum",
        name: "twoSum",
        name_snake: "two_sum",
        args: [{name: "nums", cppType: "vector<int>&", cType: "int*", rustType: "Vec<i32>", goType: "[]int", csharpType: "int[]", phpType: "Integer[]", swiftType: "[Int]", kotlinType: "IntArray", tsType: "number[]"}],
        retCpp: "vector<int>", retC: "int*", retRust: "Vec<i32>", retGo: "[]int", retCSharp: "int[]", retPhp: "Integer[]", retSwift: "[Int]", retKotlin: "IntArray", retTs: "number[]"
    },
    // Adding more as I go
];

async function patch() {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    const problems = await Problem.find({});

    for (const p of problems) {
        console.log(`Patching ${p.id}...`);
        
        // Ensure starterCode is treated as a Map if it's not already
        if (!p.starterCode) p.starterCode = new Map();

        // If it's a POJO, we might need to handle it or Mongoose Map might handle it
        // Since we changed schema to Map, Mongoose should handle it.

        for (const lang of languages) {
            // Check if it already exists to avoid overwriting user experiments (though this is seed)
            if (!p.starterCode.has(lang)) {
                p.starterCode.set(lang, `// Write your ${lang} solution here for ${p.title}\n\n// Boilerplate coming soon for complex problems...`);
            }
        }
        
        await p.save();
    }

    console.log("Done!");
    process.exit(0);
}

patch();
