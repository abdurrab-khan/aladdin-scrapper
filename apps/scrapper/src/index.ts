import App from "./server.js";

console.log("Starting the server...");

const PORT = Number(process.env["PORT"] || 5000);

App.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
