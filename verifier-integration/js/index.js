const path = require("path");
const express = require("express");
const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
import VidosResolver from "./VidosResolver";

const app = express();
const port = 8080;

const VIDOS_RESOLVER_URL = undefined; // 'https://ugly-aqua-hummingbird-120.resolver.service.eu.vidos.local';
const VIDOS_API_KEY = undefined; // '24b500499e7c2f0a8634831d1b9894b74d656d3e7cd6de238d706c20a5db6d41';

app.use(express.static("../static"));

app.get("/api/sign-in", (req, res) => {
  console.log("get Auth Request");
  getAuthRequest(req, res);
});

app.post("/api/callback", (req, res) => {
  console.log("callback");
  callback(req, res);
});

app.listen(port, () => {
  console.log("server running on port 8080");
});

// Create a map to store the auth requests and their session IDs
const requestMap = new Map();

// GetQR returns auth request
async function getAuthRequest(req, res) {
  // Audience is verifier id
  const hostUrl = "<NGROK_URL>";
  const sessionId = 1;
  const callbackURL = "/api/callback";
  const audience =
    "did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR";

  const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

  // Generate request for basic authentication
  const request = auth.createAuthorizationRequest("test flow", audience, uri);

  request.id = "7f38a193-0918-4a48-9fac-36adfdb8b542";
  request.thid = "7f38a193-0918-4a48-9fac-36adfdb8b542";

  // Add request for a specific proof
  const proofRequest = {
    id: 1,
    circuitId: "credentialAtomicQuerySigV2",
    query: {
      allowedIssuers: ["*"],
      type: "KYCAgeCredential",
      context:
        "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
      credentialSubject: {
        birthday: {
          $lt: 20000101,
        },
      },
    },
  };
  const scope = request.body.scope ?? [];
  request.body.scope = [...scope, proofRequest];

  // Store auth request in map associated with session ID
  requestMap.set(`${sessionId}`, request);

  return res.status(200).set("Content-Type", "application/json").send(request);
}

// Callback verifies the proof after sign-in callbacks
async function callback(req, res) {
  // Get session ID from request
  const sessionId = req.query.sessionId;

  // get JWZ token params from the post request
  const raw = await getRawBody(req);
  const tokenStr = raw.toString().trim();
  console.log(tokenStr);

  const ethURL = "<AMOY_URL>";
  const contractAddress = "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124";
  const keyDIR = "../keys";

  const ethStateResolver = new resolver.EthStateResolver(
    ethURL,
    contractAddress
  );
  const vidosResolver = VIDOS_RESOLVER_URL && VIDOS_API_KEY ? new VidosResolver(VIDOS_RESOLVER_URL, VIDOS_API_KEY) : undefined;

  const resolvers = {
    ["polygon:amoy"]: vidosResolver ?? ethStateResolver,
  };

  // fetch authRequest from sessionID
  const authRequest = requestMap.get(`${sessionId}`);

  // EXECUTE VERIFICATION
  const verifier = await auth.Verifier.newVerifier({
    stateResolver: resolvers,
    circuitsDir: path.join(__dirname, keyDIR),
    ipfsGatewayURL: "https://ipfs.io",
  });

  try {
    const opts = {
      AcceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minute
    };
    authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
  } catch (error) {
    return res.status(500).send(error);
  }
  return res
    .status(200)
    .set("Content-Type", "application/json")
    .send(authResponse);
}