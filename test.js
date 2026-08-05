const fs = require("fs");
let passed = true;
console.log("Registration Test\n");

//TC01:check new.html
if(fs.existsSync("new.html")){
    console.log("TC01:new.html exists:PASS");
}
else{
    console.log("TC01:new.html exists:FAIL");
    passed = false;
}

//TC02:check new.css
if(fs.existsSync("new.css")){
    console.log("TC01:new.css exists:PASS");
}
else{
    console.log("TC01:new.css exists:FAIL");
    passed = false;
}

//TC03:check new.js
if(fs.existsSync("new.js")){
    console.log("TC01:new.js exists:PASS");
}
else{
    console.log("TC01:new.js exists:FAIL");
    passed = false;
}
//TC04:check student.json
if(fs.existsSync("student.json")){
    console.log("TC04:student.json exists:PASS");
}
else{
    console.log("TC04:student.json exists:FAIL");
    passed = false;
}

const students = JSON.parse(
    fs.readFileSync("data/students.json")
);

const student = student[0];

//TC05: Name validation
if(student.name.trim()!==""){
    console.log("TC05 :Name validation :PASS");
}
else{
    console.log("TC05:Name validation : FAIL");
    passed = false;
}
//TC05: Name validation
if(student.email.includes("@")){
    console.log("TC05 : Email validation :PASS");
}
else{
    console.log("TC05: Email validation : FAIL");
    passed = false;
}

//TC05: Name validation
if(student.mobile.length===10){
    console.log("TC07 : Mobile validation :PASS");
}
else{
    console.log("TC07: Mobile validation : FAIL");
    passed = false;
}

//TC08: Branch validation
if(student.branch!==""){
    console.log("TC08 : Branch validation :PASS");
}
else{
    console.log("TC05: Branch validation : FAIL");
    passed = false;
}

//TC09: password validation
if(student.password.length>=6){
    console.log("TC09 :Password validation :PASS");
}
else{
    console.log("TC09:Password validation : FAIL");
    passed = false;
}