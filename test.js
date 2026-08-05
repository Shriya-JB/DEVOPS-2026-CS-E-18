const fs = require("fs");

let passed = true;

console.log("========== CyberAI Test ==========\n");

// TC01: Check index.html
if (fs.existsSync("index.html")) {
    console.log("TC01: index.html exists : PASS");
} else {
    console.log("TC01: index.html exists : FAIL");
    passed = false;
}

// TC02: Check style.css
if (fs.existsSync("style.css")) {
    console.log("TC02: style.css exists : PASS");
} else {
    console.log("TC02: style.css exists : FAIL");
    passed = false;
}

// TC03: Check script.js
if (fs.existsSync("script.js")) {
    console.log("TC03: script.js exists : PASS");
} else {
    console.log("TC03: script.js exists : FAIL");
    passed = false;
}

// TC04: Check README.md
if (fs.existsSync("README.md")) {
    console.log("TC04: README.md exists : PASS");
} else {
    console.log("TC04: README.md exists : FAIL");
    passed = false;
}

// TC05: Check Jenkinsfile
if (fs.existsSync("Jenkinsfile")) {
    console.log("TC05: Jenkinsfile exists : PASS");
} else {
    console.log("TC05: Jenkinsfile exists : FAIL");
    passed = false;
}

console.log("\n====================================");

if (passed) {
    console.log("All test cases passed.");
    process.exit(0);
} else {
    console.log("Some test cases failed.");
    process.exit(1);
}