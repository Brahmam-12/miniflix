const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Health Check
app.get("/health", (req, res) => {
    res.status(200).send("Application is Healthy");
});

app.listen(PORT, () => {
    console.log(`MiniFlix running on port ${PORT}`);
});