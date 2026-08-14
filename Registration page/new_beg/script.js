const form = document.getElementById("registrationForm");
const registrationList = document.getElementById("registrationList");

let students = [];

form.addEventListener("submit", function (event) {

    event.preventDefault();

    // Fetch data from form using DOM
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;

    // Create student object
    const student = {
        name: name,
        email: email,
        mobile: mobile
    };

    // Store in JavaScript array
    students.push(student);

    // Convert data to JSON
    const jsonData = JSON.stringify(
        {
            students: students
        },
        null,
        2
    );

    console.log("JSON data:");
    console.log(jsonData);

    // Display registration using DOM
    displayRegistration(student);

    // Clear form
    form.reset();

});


function displayRegistration(student) {

    // Create card
    const card = document.createElement("div");

    card.className = "student-card";

    // Create name
    const nameElement = document.createElement("h3");

    nameElement.textContent = student.name;

    // Create email
    const emailElement = document.createElement("p");

    emailElement.textContent =
        "Email: " + student.email;

    // Create mobile
    const mobileElement = document.createElement("p");

    mobileElement.textContent =
        "Mobile: " + student.mobile;

    // Add elements to card
    card.appendChild(nameElement);
    card.appendChild(emailElement);
    card.appendChild(mobileElement);

    // Add card to page
    registrationList.appendChild(card);
}