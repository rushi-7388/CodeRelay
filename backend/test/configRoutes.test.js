import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import configRoutes from "../src/routes/configRoutes.js";

test("GET /public returns only safe fields", async () => {
  const app = express();
  app.use("/api/config", configRoutes);

  const res = await request(app).get("/api/config/public");
  assert.equal(res.status, 200);
  assert.ok("apiUrl" in res.body);
  assert.ok("clerkPublishableKey" in res.body);
  assert.ok(!("ANTHROPIC_API_KEY" in res.body));
  assert.ok(!("OPENAI_API_KEY" in res.body));
  assert.ok(!("DB_URL" in res.body));
});
