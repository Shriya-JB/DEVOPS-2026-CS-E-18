const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");


/* Middleware */

app.use(express.json());

app.use(express.static(__dirname));


/* Register student */

app.post("/api/register", (req, res) => {

    const student = req.body;

    try {

        const data = JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

        data.students.push(student);

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 2)
        );

        res.status(201).json({
            success: true,
            message: "Registration saved successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration could not be saved"
        });

    }

});


/* Get registrations */

app.get("/api/registrations", (req, res) => {

    try {

        const data = JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

        res.json({
            success: true,
            count: data.students.length,
            students: data.students
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not read registrations"
        });

    }

});


/* Start server */

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});