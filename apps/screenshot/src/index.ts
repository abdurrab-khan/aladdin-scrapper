import App from "./server.js";

const PORT = (process.env["PORT"] || 4000) as number;

App.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
