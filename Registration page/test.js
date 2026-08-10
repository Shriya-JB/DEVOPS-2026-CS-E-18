const fs = require("fs");
let passed = true;
console.log("Registration Test\n");

//TC01:check index.html
if(fs.existsSync("index.html")){
    console.log("TC01:index.html exists:PASS");
}
else{
    console.log("TC01:index.html exists:FAIL");
    passed = false;
}

//TC02:check style.css
if(fs.existsSync("style.css")){
    console.log("TC02:style.css exists:PASS");
}
else{
    console.log("TC02:style.css exists:FAIL");
    passed = false;
}

//TC03:check script.js
if(fs.existsSync("script.js")){
    console.log("TC03:script.js exists:PASS");
}
else{
    console.log("TC03:script.js exists:FAIL");
    passed = false;
}
//TC04:check packet.json
if(fs.existsSync("packet.json")){
    console.log("TC04:packet.json exists:PASS");
}
else{
    console.log("TC04:packet.json exists:FAIL");
    passed = false;
}

const data = JSON.parse(fs.readFileSync("packet.json", "utf8"));
const student = data.students[0];



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
    console.log("TC05:Password validation : FAIL");
    passed = false;
}
//T10: Registration successful
if(passed){
    console.log("TC10 :Registration successful :PASS");
    console.log("\n Build Succes");
}
else{
    console.log("TC10 :Registration successful : FAIL");
    console.log("\n Build Failed");
    passed = false;
}