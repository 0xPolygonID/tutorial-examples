package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/iden3/go-circuits"
	auth "github.com/iden3/go-iden3-auth"
	"github.com/iden3/go-iden3-auth/loaders"
	"github.com/iden3/go-iden3-auth/pubsignals"
	"github.com/iden3/go-iden3-auth/state"
	"github.com/iden3/iden3comm/protocol"
)

func main() {
	http.HandleFunc("/api/sign-in", GetAuthRequest)
	http.HandleFunc("/api/callback", Callback)
	http.ListenAndServe(":8080", nil)
}

// Create a map to store the auth requests and their session IDs
var requestMap = make(map[string]interface{})

// GetQR returns auth request
func GetAuthRequest(w http.ResponseWriter, r *http.Request) {

	// Audience is verifier id
	rURL := "<YOUR REMOTE NGROK HOST>"
	sessionID := 1
	CallbackURL := "/api/callback"
	Audience := "1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ"

	uri := fmt.Sprintf("%s%s?sessionId=%s", rURL, CallbackURL, strconv.Itoa(sessionID))

	var request protocol.AuthorizationRequestMessage

	// Generate request for basic authentication
	request = auth.CreateAuthorizationRequestWithMessage("test flow", "message to sign", Audience, uri)

	request.ID = "7f38a193-0918-4a48-9fac-36adfdb8b542"
	request.ThreadID = "7f38a193-0918-4a48-9fac-36adfdb8b542"

	// Add request for a specific proof
	var mtpProofRequest protocol.ZeroKnowledgeProofRequest
	mtpProofRequest.ID = 1
	mtpProofRequest.CircuitID = string(circuits.AtomicQuerySigCircuitID)
	mtpProofRequest.Rules = map[string]interface{}{
		"query": pubsignals.Query{
			AllowedIssuers: []string{"*"},
			Req: map[string]interface{}{
				"birthDay": map[string]interface{}{
					"$lt": 20000101,
				},
			},
			Schema: protocol.Schema{
				URL:  "https://schema.polygonid.com/jsonld/kyc.json-ld",
				Type: "AgeCredential",
			},
		},
	}

	request.Body.Scope = append(request.Body.Scope, mtpProofRequest)

	// Store auth request in map associated with session ID
	requestMap[strconv.Itoa(sessionID)] = request

	// print request
	fmt.Println(request)

	msgBytes, _ := json.Marshal(request)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(msgBytes)
	return
}

// Callback works with sign-in callbacks
func Callback(w http.ResponseWriter, r *http.Request) {

	// Get session ID from request
	sessionID := r.URL.Query().Get("sessionId")

	// get JWZ token params from the post request
	tokenBytes, err := io.ReadAll(r.Body)

	// Add Polygon Mumbai RPC node endpoint - needed to read on-chain state
	ethURL := "<RPCNODEURL>"

	// Add identity state contract address
	contractAddress := "0x46Fd04eEa588a3EA7e9F055dd691C688c4148ab3"

	// Locate the directory that contains circuit's verification keys
	keyDIR := "../keys"

	// fetch authRequest from sessionID
	authRequest, _ := requestMap[sessionID]

	// print authRequest
	fmt.Println(authRequest)

	// load the verifcation key
	var verificationKeyloader = &loaders.FSKeyLoader{Dir: keyDIR}
	resolver := state.ETHResolver{
		RPCUrl:   ethURL,
		Contract: contractAddress,
	}

	// EXECUTE VERIFICATION
	verifier := auth.NewVerifier(verificationKeyloader, loaders.DefaultSchemaLoader{IpfsURL: "ipfs.io"}, resolver)
	authResponse, err := verifier.FullVerify(r.Context(), string(tokenBytes),
		authRequest.(protocol.AuthorizationRequestMessage))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := authResponse.From

	messageBytes := []byte("User with ID " + userID + " Successfully authenticated")

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Write(messageBytes)

	return
}
