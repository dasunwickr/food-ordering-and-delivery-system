import cors from 'cors';
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan";
import limiter from './src/middleware/rateLimiterUtil';

// For env file
dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'))
app.use(limiter);
const port = process.env.PORT || 5000

app.get("/", (req: Request, res: Response) => {
    res.send(`Auth service backend!!`);
})

app.listen(port, () => {
    console.log(`Server is Fire at https://localhost:${port}`);
})