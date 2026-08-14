const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "packet.json");


// Make sure packet.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({ students: [] }, null, 2)
    );
}


// Read JSON file
function readData() {
    const data = fs.readFileSync(DATA_FILE, "utf8");

    return JSON.parse(data);
}


// Write JSON file
function writeData(data) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
    );
}


// Create server
const server = http.createServer((req, res) => {

    // Allow browser requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    // Handle browser preflight request
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }


    // GET all registrations
    if (
        req.method === "GET" &&
        req.url === "/registrations"
    ) {

        try {

            const data = readData();

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify(data));

        } catch (error) {

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Could not read JSON file."
            }));
        }

        return;
    }


    // POST new registration
    if (
        req.method === "POST" &&
        req.url === "/register"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });


        req.on("end", () => {

            try {

                const student = JSON.parse(body);

                // Basic validation
                if (
                    !student.name ||
                    !student.email ||
                    !student.mobile
                ) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message:
                            "Name, email and mobile are required."
                    }));

                    return;
                }


                // Read existing registrations
                const data = readData();


                // Add new student
                data.students.push({
                    name: student.name,
                    email: student.email,
                    mobile: student.mobile
                });


                // Save updated data
                writeData(data);


                // Send success response
                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    message: "Registration successful.",
                    student: student
                }));


            } catch (error) {

                console.error(error);

                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Invalid JSON data."
                }));
            }
        });

        return;
    }


    // Unknown route
    res.writeHead(404, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        success: false,
        message: "Route not found."
    }));
});


server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});