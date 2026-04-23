const https = require("https");

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

const AUTH = "Bearer 2|HUwdYnYZXYfaddZwOiEWXcK7yUTw1hKGz5dZCV8jbd0ef3f0";
const SERVICE = "co8k0ksggkc8wgos4ss4gc0o";

async function main() {
  // 1. Get current docker_compose_raw
  const get = await req({
    hostname: "coolify.getneonbot.com",
    path: `/api/v1/services/${SERVICE}`,
    method: "GET",
    headers: { Authorization: AUTH },
  });

  const svc = JSON.parse(get.body);
  let compose = svc.docker_compose_raw;

  // 2. Inject Traefik labels into the 'api' service
  // Insert after the last volume line, before the expose block
  const traefikBlock = [
    "    labels:",
    "      - traefik.enable=true",
    "      - traefik.http.middlewares.gzip.compress=true",
    "      - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https",
    "      - 'traefik.http.routers.http-neonbot-api.entryPoints=http'",
    "      - traefik.http.routers.http-neonbot-api.middlewares=redirect-to-https",
    "      - 'traefik.http.routers.http-neonbot-api.rule=Host(`api.getneonbot.com`) && PathPrefix(`/`)'",
    "      - 'traefik.http.routers.https-neonbot-api.entryPoints=https'",
    "      - traefik.http.routers.https-neonbot-api.middlewares=gzip",
    "      - 'traefik.http.routers.https-neonbot-api.rule=Host(`api.getneonbot.com`) && PathPrefix(`/`)'",
    "      - traefik.http.routers.https-neonbot-api.tls.certresolver=letsencrypt",
    "      - traefik.http.routers.https-neonbot-api.tls=true",
  ].join("\n");

  if (compose.includes("traefik")) {
    console.log("Labels already injected");
  } else {
    // Insert before 'expose:' inside the api service block
    compose = compose.replace(
      "    expose:\n      - '8080'",
      traefikBlock + "\n    expose:\n      - '8080'",
    );
  }

  if (!compose.includes("api.getneonbot.com")) {
    console.error("Failed to inject labels!");
    process.exit(1);
  }
  console.log("Labels injected. Patching service...");

  // 3. PATCH the service with base64-encoded compose
  const b64 = Buffer.from(compose).toString("base64");
  const patchBody = JSON.stringify({ docker_compose_raw: b64 });
  const patch = await req(
    {
      hostname: "coolify.getneonbot.com",
      path: `/api/v1/services/${SERVICE}`,
      method: "PATCH",
      headers: {
        Authorization: AUTH,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(patchBody),
      },
    },
    patchBody,
  );

  console.log("PATCH status:", patch.status);

  // 4. Start the service
  const start = await req({
    hostname: "coolify.getneonbot.com",
    path: `/api/v1/services/${SERVICE}/start`,
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      "Content-Length": 0,
    },
  });

  console.log("Start status:", start.status, start.body);
}

main().catch(console.error);
