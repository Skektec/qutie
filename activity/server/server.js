import fs from "fs";
import https from "https";
import express from "express";
import fetch from "node-fetch";
import config from "../../data/config.json" with { type: "json" };

const app = express();
const port = 443; // Discord requires HTTPS on 443

// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
  try {
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.discordToken,
        grant_type: "authorization_code",
        code: req.body.code,
      }),
    });

    const data = await response.json();

    res.send({ access_token: data.access_token });
  } catch (err) {
    console.error("Token exchange failed", err);
    res.status(500).send("OAuth exchange failed");
  }
});

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/fluxus.ddns.net/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/fluxus.ddns.net/fullchain.pem"),
};

https.createServer(options, app).listen(port, () => {
  console.log(`✅ HTTPS server running at https://fluxus.ddns.net:${port}`);
});
