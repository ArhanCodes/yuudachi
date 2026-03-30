// Run: node generate-jwt.mjs <API_JWT_SECRET>
// Generates a JWT token for the website to authenticate with the bot API

import { createHmac } from "node:crypto";

const secret = process.argv[2];
if (!secret) {
	console.error("Usage: node generate-jwt.mjs <API_JWT_SECRET>");
	process.exit(1);
}

const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
const payload = Buffer.from(JSON.stringify({ sub: "website", iat: Math.floor(Date.now() / 1000) })).toString("base64url");
const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");

console.log(`${header}.${payload}.${signature}`);
