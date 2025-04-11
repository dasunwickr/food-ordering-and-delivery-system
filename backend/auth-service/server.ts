import express, { Application, Request, Response } from "express";
import dotenv from "dotenv"

// For env file
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000

app.get("/", (req: Request, res: Response) => {
    res.send(`Auth service backend!!`);
})

app.listen(port, () => {
    console.log(`Server is Fire at https://localhost:${port}`);
})