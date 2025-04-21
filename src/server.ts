import express, { Request, Response, ErrorRequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/Routes";
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../swagger.json'

dotenv.config();

const app = express(); 

app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  const uptimeInSeconds = process.uptime();
  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);
  const routes: string[] = [];

  const getRoutesFromStack = (stack: any) => {
    stack.forEach((middleware: any) => {
      if (middleware.route) {
        routes.push(`${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.handle && middleware.handle.stack) {
        getRoutesFromStack(middleware.handle.stack);
      }
    });
  };
  getRoutesFromStack(app._router.stack);

  res.json({
    status: "API-DIARIAAQssssUI",
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    timestamp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    developed: "Josue Henrique",
    portfolio: "https://josuashenrique.site/",
    rotas: routes
  });
});

app.use(apiRoutes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Endpoint não encontrado." });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400);
  console.log(err);
  res.json({ error: "Ocorreu algum erro." });
};
app.use(errorHandler);

export { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}