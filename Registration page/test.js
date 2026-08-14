const fs = require("fs");

let passed = true;

console.log("================================");
console.log("Student Registration Test");
console.log("================================\n");

// TC01: Check index.html
if (fs.existsSync("index.html")) {
    console.log("TC01: index.html exists: PASS");
} else {
    console.log("TC01: index.html exists: FAIL");
    passed = false;
}

// TC02: Check style.css
if (fs.existsSync("style.css")) {
    console.log("TC02: style.css exists: PASS");
} else {
    console.log("TC02: style.css exists: FAIL");
    passed = false;
}

// TC03: Check script.js
if (fs.existsSync("script.js")) {
    console.log("TC03: script.js exists: PASS");
} else {
    console.log("TC03: script.js exists: FAIL");
    passed = false;
}

// TC04: Check server.js
if (fs.existsSync("server.js")) {
    console.log("TC04: server.js exists: PASS");
} else {
    console.log("TC04: server.js exists: FAIL");
    passed = false;
}

// TC05: Check data.json
if (fs.existsSync("data.json")) {
    console.log("TC05: data.json exists: PASS");
} else {
    console.log("TC05: data.json exists: FAIL");
    passed = false;
}


// Read data.json
let data;

try {

    data = JSON.parse(
        fs.readFileSync("data.json", "utf8")
    );

    console.log("TC06: data.json is valid JSON: PASS");

} catch (error) {

    console.log("TC06: data.json is valid JSON: FAIL");
    console.log(error.message);

    passed = false;
}


// Check students array
if (data && Array.isArray(data.students)) {

    console.log("TC07: students array exists: PASS");

} else {

    console.log("TC07: students array exists: FAIL");

    passed = false;
}


// Find a valid student
let student = null;

if (data && Array.isArray(data.students)) {

    student = data.students.find(
        s =>
            s &&
            typeof s === "object" &&
            s.name &&
            s.email &&
            s.mobile
    );
}


// Student existence
if (student) {

    console.log("TC08: Registered student exists: PASS");

} else {

    console.log("TC08: Registered student exists: FAIL");

    passed = false;
}


// Validate student
if (student) {

    // TC09: Name validation
    if (
        typeof student.name === "string" &&
        student.name.trim() !== ""
    ) {

        console.log("TC09: Name validation: PASS");

    } else {

        console.log("TC09: Name validation: FAIL");

        passed = false;
    }


    // TC10: Email validation
    if (
        typeof student.email === "string" &&
        student.email.includes("@")
    ) {

        console.log("TC10: Email validation: PASS");

    } else {

        console.log("TC10: Email validation: FAIL");

        passed = false;
    }


    // TC11: Mobile validation
    if (
        typeof student.mobile === "string" &&
        /^\d{10}$/.test(student.mobile)
    ) {

        console.log("TC11: Mobile validation: PASS");

    } else {

        console.log("TC11: Mobile validation: FAIL");

        passed = false;
    }


    // TC12: Course validation
    if (
        typeof student.course === "string" &&
        student.course.trim() !== ""
    ) {

        console.log("TC12: Course validation: PASS");

    } else {

        console.log("TC12: Course validation: FAIL");

        passed = false;
    }


    // TC13: Gender validation
    if (
        typeof student.gender === "string" &&
        student.gender.trim() !== ""
    ) {

        console.log("TC13: Gender validation: PASS");

    } else {

        console.log("TC13: Gender validation: FAIL");

        passed = false;
    }
}


// Final result
console.log("\n================================");

if (passed) {

    console.log("ALL TESTS PASSED");
    console.log("BUILD SUCCESS");

} else {

    console.log("SOME TESTS FAILED");
    console.log("BUILD FAILED");

    process.exit(1);
}

console.log("================================");