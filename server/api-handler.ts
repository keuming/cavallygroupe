import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import webhookRoutes from "./_core/webhook-routes";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/debug", (_req, res) => {
  res.json({
    hasDb: !!process.env.DATABASE_URL,
    dbPrefix: process.env.DATABASE_URL?.substring(0, 30) ?? "MISSING",
    nodeEnv: process.env.NODE_ENV,
    hasJwt: !!process.env.JWT_SECRET,
  });
});

app.use("/api/webhooks", webhookRoutes);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export default function handler(req, res) {
  return app(req, res);
}
