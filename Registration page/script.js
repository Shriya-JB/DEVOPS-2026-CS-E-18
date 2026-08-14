document
    .getElementById("registrationForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const course =
            document.getElementById("course").value;

        const genderElement =
            document.querySelector(
                'input[name="gender"]:checked'
            );

        const gender =
            genderElement ? genderElement.value : "";

        const student = {
            name: name,
            email: email,
            mobile: mobile,
            course: course,
            gender: gender
        };

        try {

            const response = await fetch("/api/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(student)

            });

            const result = await response.json();

            const message =
                document.getElementById("message");

            if (response.ok && result.success) {

                message.innerHTML = result.message;

                message.className =
                    "success-message";

                document
                    .getElementById("registrationForm")
                    .reset();

                loadRegistrations();

            } else {

                message.innerHTML =
                    result.message || "Registration failed";

                message.className =
                    "error-message";
            }

        } catch (error) {

            console.error(error);

            document.getElementById("message").innerHTML =
                "Server error. Please try again.";

            document.getElementById("message").className =
                "error-message";
        }

    });


async function loadRegistrations() {

    try {

        const response =
            await fetch("/api/registrations");

        const result =
            await response.json();

        const list =
            document.getElementById("registrationsList");

        const count =
            document.getElementById("registrationCount");

        count.textContent = result.count;

        if (result.students.length === 0) {

            list.innerHTML = `
                <div class="empty-state">
                    No registrations yet.
                </div>
            `;

            return;
        }

        list.innerHTML = "";

        result.students.forEach((student, index) => {

            list.innerHTML += `
                <div class="student-card">

                    <div class="student-number">
                        ${index + 1}
                    </div>

                    <div class="student-info">

                        <h3>${student.name}</h3>

                        <p>Email: ${student.email}</p>

                        <p>Mobile: ${student.mobile}</p>

                        <p>Course: ${student.course}</p>

                        <p>Gender: ${student.gender}</p>

                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error(
            "Could not load registrations:",
            error
        );

    }
}


loadRegistrations();