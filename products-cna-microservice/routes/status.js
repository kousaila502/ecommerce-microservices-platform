const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const uptime = process.uptime();
  const timestamp = Date.now();

  res.json({
    status: "ok",
    uptime: `${Math.floor(uptime)}s`,
    timestamp,
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
  });
});

module.exports = router;
