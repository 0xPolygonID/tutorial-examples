const express = require('express');
const {auth, resolver, loaders} = require('@iden3/js-iden3-auth')
const getRawBody = require('raw-body')

const app = express();
const port = 8080;

app.use(express.static('static'));

app.get("/api/sign-in", (req, res) => {
    console.log('get QR');
    getQR(req,res);
});

app.post("/api/callback", (req, res) => {
    console.log('callback');
    callback(req,res);
});

app.listen(port, () => {
    console.log('server running on port 8080');
});

// Create a map to store the auth requests and their session IDs
const requestMap = new Map();

		// GetQR returns auth request
		async function getQR(req,res) {

			// Audience is verifier id
			const hostUrl = "<YOUR REMOTE HOST>";;
			const sessionId = 1;
			const callbackURL = "/api/callback"
			const audience = "1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ"

			const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

			// Generate request for basic authentication
			const request = auth.createAuthorizationRequestWithMessage(
				'test flow',
				'message to sign',
				audience,
				uri,
			);
			
			request.id = '7f38a193-0918-4a48-9fac-36adfdb8b542';
			request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';

			// Add request for a specific proof
			const proofRequest = {
			id: 1,
			circuit_id: 'credentialAtomicQuerySig',
			rules: {
				query: {
				allowedIssuers: ['*'],
				schema: {
					type: 'AgeCredential',
					url: 'https://schema.polygonid.com/jsonld/kyc.json-ld',
				},
				req: {
					birthDay: {
					$lt: 20000101, // bithDay field less then 2000/01/01
					},
				},
				},
			},
			};

			const scope = request.body.scope ?? [];
			request.body.scope = [...scope, proofRequest];

			// Store auth request in map associated with session ID
			requestMap.set(`${sessionId}`, request);

			return res.status(200).set('Content-Type', 'application/json').send(request);
        }

        // Callback verifies the proof after sign-in callbacks
		async function callback(req,res) {

			// Get session ID from request
			const sessionId = req.query.sessionId;

			// get JWZ token params from the post request
			const raw = await getRawBody(req);
			const tokenStr = raw.toString().trim();

			// fetch authRequest from sessionID
			const authRequest = requestMap.get(`${sessionId}`);

			console.log(authRequest)
				
			// Locate the directory that contains circuit's verification keys
			const verificationKeyloader = new loaders.FSKeyLoader('../keys');
			const sLoader = new loaders.UniversalSchemaLoader('ipfs.io');

			// Add Polygon RPC node endpoint - needed to read on-chain state and identity state contract address
			const ethStateResolver = new resolver.EthStateResolver('https://polygon-mainnet.g.alchemy.com/v2/bWaWfKLExAb_SZC_JUSNY6a6cCZGsTpb', '0xb8a86e138C3fe64CbCba9731216B1a638EEc55c8');

			// EXECUTE VERIFICATION
			const verifier = new auth.Verifier(
			verificationKeyloader,
			sLoader, ethStateResolver,
		);


		try {
			authResponse = await verifier.fullVerify(tokenStr, authRequest);
		} catch (error) {
		return res.status(500).send(error);
		}
		return res.status(200).set('Content-Type', 'application/json').send("user with ID: " + authResponse.from + " Succesfully authenticated");
		}
