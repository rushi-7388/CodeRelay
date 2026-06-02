import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../src/models/Problem.js";

dotenv.config();

const LANGUAGES = [
    "javascript", "python", "java", "cpp", "c", "rust", "go",
    "csharp", "ruby", "php", "swift", "kotlin", "sql", "typescript"
];

const PROBLEMS_RAW = [
    {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array • Hash Table",
        description: {
            text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
            notes: [
                "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
                "You can return the answer in any order."
            ]
        },
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
        ],
        constraints: ["2 ≤ nums.length ≤ 10⁴", "Only one valid answer exists"],
        hint: "Use a Hash Map to store indices of numbers you've seen.",
        meta: {
            funcName: "twoSum",
            params: [{ name: "nums", type: "array", itemType: "int" }, { name: "target", type: "int" }],
            returnType: "array", itemType: "int"
        }
    },
    {
        id: "reverse-string",
        title: "Reverse String",
        difficulty: "Easy",
        category: "String • Two Pointers",
        description: {
            text: "Write a function that reverses a string. The input string is given as an array of characters s.",
            notes: ["You must do this by modifying the input array in-place with O(1) extra memory."]
        },
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ],
        constraints: ["1 ≤ s.length ≤ 10⁵"],
        hint: "Use two pointers, one at start and one at end, and swap characters.",
        meta: {
            funcName: "reverseString",
            params: [{ name: "s", type: "array", itemType: "char" }],
            returnType: "void"
        }
    },
    {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "Easy",
        category: "String • Two Pointers",
        description: {
            text: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
            notes: ["Return true if it is a palindrome, or false otherwise."]
        },
        examples: [
            { input: 's = "A man, a plan, a canal: Panama"', output: "true" }
        ],
        constraints: ["1 ≤ s.length ≤ 2 * 10⁵"],
        hint: "Clean the string (lowercase, remove non-alphanumeric) then check forward vs backward.",
        meta: {
            funcName: "isPalindrome",
            params: [{ name: "s", type: "string" }],
            returnType: "boolean"
        }
    },
    {
        id: "maximum-subarray",
        title: "Maximum Subarray",
        difficulty: "Medium",
        category: "Array • Dynamic Programming",
        description: {
            text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
            notes: []
        },
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }
        ],
        constraints: ["1 ≤ nums.length ≤ 10⁵"],
        hint: "Kadane's Algorithm: keep a running sum and reset if it drops below zero.",
        meta: {
            funcName: "maxSubArray",
            params: [{ name: "nums", type: "array", itemType: "int" }],
            returnType: "int"
        }
    },
    {
        id: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        category: "Array • Two Pointers",
        description: {
            text: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            notes: ["Return the maximum amount of water a container can store."]
        },
        examples: [
            { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" }
        ],
        constraints: ["2 ≤ n ≤ 10⁵"],
        hint: "Use two pointers and always move the pointer pointing to the shorter line.",
        meta: {
            funcName: "maxArea",
            params: [{ name: "height", type: "array", itemType: "int" }],
            returnType: "int"
        }
    },
    {
        id: "merge-two-sorted-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        category: "Linked List • Recursion",
        description: {
            text: "Merge two sorted linked lists list1 and list2 into one sorted list.",
            notes: ["The list should be made by splicing together the nodes of the first two lists."]
        },
        examples: [
            { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" }
        ],
        constraints: ["0 ≤ length ≤ 50"],
        hint: "Use recursion or a dummy head and a while loop.",
        meta: {
            funcName: "mergeTwoLists",
            params: [{ name: "l1", type: "list" }, { name: "l2", type: "list" }],
            returnType: "list"
        }
    },
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Easy",
        category: "Stack • String",
        description: {
            text: "Determine if the input string containing just '()[]{}' is valid.",
            notes: ["Open brackets must be closed by the same type in the correct order."]
        },
        examples: [
            { input: 's = "()[]{}"', output: "true" }
        ],
        constraints: ["1 ≤ s.length ≤ 10⁴"],
        hint: "Use a stack to keep track of open brackets.",
        meta: {
            funcName: "isValid",
            params: [{ name: "s", type: "string" }],
            returnType: "boolean"
        }
    },
    {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        category: "String • Sliding Window",
        description: {
            text: "Find the length of the longest substring without repeating characters.",
            notes: []
        },
        examples: [
            { input: 's = "abcabcbb"', output: "3" }
        ],
        constraints: ["0 ≤ s.length ≤ 5 * 10⁴"],
        hint: "Use a sliding window or a sliding hash map.",
        meta: {
            funcName: "lengthOfLongestSubstring",
            params: [{ name: "s", type: "string" }],
            returnType: "int"
        }
    },
    {
        id: "product-of-array-except-self",
        title: "Product of Array Except Self",
        difficulty: "Medium",
        category: "Array • Prefix Sum",
        description: {
            text: "Return an array answer such that answer[i] is equal to the product of all elements except nums[i].",
            notes: ["O(n) time and no division."]
        },
        examples: [
            { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }
        ],
        constraints: ["2 ≤ nums.length ≤ 10⁵"],
        hint: "Calculate prefix products and suffix products.",
        meta: {
            funcName: "productExceptSelf",
            params: [{ name: "nums", type: "array", itemType: "int" }],
            returnType: "array", itemType: "int"
        }
    },
    {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: "Hard",
        category: "Array • Two Pointers",
        description: {
            text: "Given n non-negative integers representing an elevation map, compute how much water it can trap.",
            notes: []
        },
        examples: [
            { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }
        ],
        constraints: ["1 ≤ n ≤ 2 * 10⁴"],
        hint: "Two pointers or precalculate max left/right heights.",
        meta: {
            funcName: "trap",
            params: [{ name: "height", type: "array", itemType: "int" }],
            returnType: "int"
        }
    }
];

function generateStarterCode(problem, lang) {
    const { funcName, params, returnType } = problem.meta;
    const test1 = problem.examples[0];

    switch (lang) {
        case "javascript":
            return `function ${funcName}(${params.map(p => p.name).join(", ")}) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(${funcName}(${test1.input.split("=")[1]?.trim() || ""})); // Expected: ${test1.output}`;
        
        case "python":
            return `def ${funcName}(${params.map(p => p.name).join(", ")}):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(${funcName}(${test1.input.split("=")[1]?.replace(/\[/g, "[").replace(/\]/g, "]").trim() || ""}))  # Expected: ${test1.output}`;

        case "java":
            const javaRet = returnType === "array" ? "int[]" : returnType === "boolean" ? "boolean" : returnType === "string" ? "String" : "int";
            return `import java.util.*;\n\nclass Solution {\n    public static ${javaRet} ${funcName}(${params.map(p => (p.type === "array" ? "int[] " : p.type === "string" ? "String " : "int ") + p.name).join(", ")}) {\n        // Write your solution here\n        return ${returnType === "array" ? "new int[0]" : returnType === "boolean" ? "false" : "0"};\n    }\n\n    public static void main(String[] args) {\n        // Implement test cases here\n    }\n}`;

        case "cpp":
            return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    ${returnType === "array" ? "vector<int>" : returnType === "boolean" ? "bool" : "int"} ${funcName}(${params.map(p => (p.type === "array" ? "vector<int>& " : p.type === "string" ? "string " : "int ") + p.name).join(", ")}) {\n        // Write your solution here\n        \n    }\n};\n\nint main() {\n    Solution sol;\n    // Test cases\n    return 0;\n}`;

        case "typescript":
            const tsRet = returnType === "array" ? "number[]" : returnType === "boolean" ? "boolean" : returnType === "string" ? "string" : "number";
            return `function ${funcName}(${params.map(p => p.name + ": " + (p.type === "array" ? "number[]" : p.type === "string" ? "string" : "number")).join(", ")}): ${tsRet} {\n    // Write your solution here\n    \n}\n\n// console.log(${funcName}(...));`;

        case "go":
            return `package main\nimport "fmt"\n\nfunc ${funcName}(${params.map(p => p.name + " " + (p.type === "array" ? "[]int" : p.type === "string" ? "string" : "int")).join(", ")}) ${returnType === "array" ? "[]int" : returnType === "boolean" ? "bool" : "int"} {\n    // Write your solution here\n    \n}\n\nfunc main() {\n    // fmt.Println(${funcName}(...))\n}`;

        case "rust":
            return `impl Solution {\n    pub fn ${funcName}(${params.map(p => p.name + ": " + (p.type === "array" ? "Vec<i32>" : p.type === "string" ? "String" : "i32")).join(", ")}) -> ${returnType === "array" ? "Vec<i32>" : returnType === "boolean" ? "bool" : "i32"} {\n        // Write your solution here\n        \n    }\n}\n\nfn main() {\n    // Implement tests\n}`;

        case "ruby":
            return `def ${funcName}(${params.map(p => p.name).join(", ")})\n    # Write your solution here\n    \nend\n\n# Test cases`;

        case "php":
            return `<?php\nclass Solution {\n    function ${funcName}(${params.map(p => "$" + p.name).join(", ")}) {\n        // Write your solution here\n        \n    }\n}\n?>`;

        case "swift":
            return `class Solution {\n    func ${funcName}(${params.map(p => "_ " + p.name + ": " + (p.type === "array" ? "[Int]" : p.type === "string" ? "String" : "Int")).join(", ")}) -> ${returnType === "array" ? "[Int]" : returnType === "boolean" ? "Bool" : "Int"} {\n        // Write your solution here\n        \n    }\n}`;

        case "kotlin":
            return `class Solution {\n    fun ${funcName}(${params.map(p => p.name + ": " + (p.type === "array" ? "IntArray" : p.type === "string" ? "String" : "Int")).join(", ")}): ${returnType === "array" ? "IntArray" : returnType === "boolean" ? "Boolean" : "Int"} {\n        // Write your solution here\n        \n    }\n}`;

        case "sql":
            return `-- Write your SQL query here\nSELECT * FROM dummy;`;

        case "c":
            return `#include <stdio.h>\n\n// Write your solution here\n\nint main() {\n    // Implement tests\n    return 0;\n}`;

        case "csharp":
            return `using System;\n\npublic class Solution {\n    public void ${funcName}() {\n        // Write your solution here\n    }\n}`;

        default:
            return "// Write your solution here";
    }
}

const PROBLEMS = PROBLEMS_RAW.map(p => {
    const starterCode = {};
    const expectedOutput = {};
    LANGUAGES.forEach(lang => {
        starterCode[lang] = generateStarterCode(p, lang);
        // expectedOutput is usually the same across languages unless format differs
        // Here we just use the raw output string from examples
        expectedOutput[lang] = p.examples[0].output;
    });
    return { ...p, starterCode, expectedOutput };
});

const seedProblems = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("✅ Connected to MongoDB");
        await Problem.deleteMany({});
        console.log("🗑️ Cleared existing problems");
        await Problem.insertMany(PROBLEMS);
        console.log("🌱 Seeded problems successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding problems:", error);
        process.exit(1);
    }
};

seedProblems();
