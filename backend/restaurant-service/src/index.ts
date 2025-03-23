import express, { Request, Response } from "express";

// Create an instance of the Express application
const app = express();
const port = process.env.PORT || 3000;

// Define a simple route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
