package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"

	"github.com/iden3/go-circuits"
	core "github.com/iden3/go-iden3-core"
	"github.com/iden3/go-iden3-crypto/babyjub"
	"github.com/iden3/go-iden3-crypto/poseidon"
	merkletree "github.com/iden3/go-merkletree-sql"
	"github.com/iden3/go-merkletree-sql/db/memory"
)

func main() {

	// 1. BabyJubJub key

	// generate babyJubjub private key randomly
	babyJubjubPrivKey := babyjub.NewRandPrivKey()

	// generate public key from private key
	babyJubjubPubKey := babyJubjubPrivKey.Public()

	// print public key
	fmt.Println(babyJubjubPubKey)

	// 2. Sparse Merkle Tree

	ctx := context.Background()

	// Tree storage
	store := memory.NewMemoryStorage()

	// Generate a new MerkleTree with 32 levels
	mt, _ := merkletree.NewMerkleTree(ctx, store, 32)

	// Add a leaf to the tree with index 1 and value 10
	index1 := big.NewInt(1)
	value1 := big.NewInt(10)
	mt.Add(ctx, index1, value1)

	// Add another leaf to the tree
	index2 := big.NewInt(2)
	value2 := big.NewInt(15)
	mt.Add(ctx, index2, value2)

	// Proof of membership of a leaf with index 1
	proofExist, value, _ := mt.GenerateProof(ctx, index1, mt.Root())

	fmt.Println("Proof of membership:", proofExist.Existence)
	fmt.Println("Value corresponding to the queried index:", value)

	// Proof of non-membership of a leaf with index 4
	proofNotExist, _, _ := mt.GenerateProof(ctx, big.NewInt(4), mt.Root())

	fmt.Println("Proof of membership:", proofNotExist.Existence)

	// 3.1. Create a Generic Claim

	ageSchema, _ := core.NewSchemaHashFromHex("ce38102464833febf36e714922a83050")

	// define age
	age := big.NewInt(25)

	// create claim based on the ageSchema storing the age in the first index slot, while the second data slot remains empty
	claim, _ := core.NewClaim(ageSchema, core.WithIndexDataInts(age, nil))

	// transform claim from bytes array to json
	claimToMarshal, _ := json.Marshal(claim)

	fmt.Println(string(claimToMarshal))

	// 3.2. Create Auth Claim

	authSchemaHash, _ := core.NewSchemaHashFromHex("ca938857241db9451ea329256b9c06e5")

	// Add revocation nonce. Used to invalidate the claim. This may be a random number in the real implementation.
	revNonce := uint64(1)

	authClaim, _ := core.NewClaim(authSchemaHash,
		core.WithIndexDataInts(babyJubjubPubKey.X, babyJubjubPubKey.Y),
		core.WithRevocationNonce(revNonce))

	authClaimToMarshal, _ := json.Marshal(authClaim)

	fmt.Println(string(authClaimToMarshal))

	// 4.1. Generate identity trees

	// Create empty Claims tree
	clt, _ := merkletree.NewMerkleTree(ctx, memory.NewMemoryStorage(), 32)

	// Create empty Revocation tree
	ret, _ := merkletree.NewMerkleTree(ctx, memory.NewMemoryStorage(), 32)

	// Create empty Roots tree
	rot, _ := merkletree.NewMerkleTree(ctx, memory.NewMemoryStorage(), 32)

	// Get the Index of the claim and the Value of the authClaim
	hIndex, hValue, _ := authClaim.HiHv()

	// add auth claim to claims tree with value hValue at index hIndex
	clt.Add(ctx, hIndex, hValue)

	// print the roots
	fmt.Println(clt.Root().BigInt(), ret.Root().BigInt(), rot.Root().BigInt())

	// 4.2. Retrieve identity state

	state, _ := merkletree.HashElems(
		clt.Root().BigInt(),
		ret.Root().BigInt(),
		rot.Root().BigInt())

	fmt.Println("Identity State:", state)

	// 4.3. Retrieve Identifier (ID)

	id, _ := core.IdGenesisFromIdenState(core.TypeDefault, state.BigInt())

	fmt.Println("ID:", id)

	// 5. Identity State Transition

	// GENESIS STATE:

	// 1. Generate Merkle Tree Proof for authClaim at Genesis State
	authMTPProof, _, _ := clt.GenerateProof(ctx, hIndex, clt.Root())

	// 2. Generate the Non-Revocation Merkle tree proof for the authClaim at Genesis State
	authNonRevMTPProof, _, _ := ret.GenerateProof(ctx, new(big.Int).SetUint64(revNonce), ret.Root())

	// Snapshot of the Genesis State
	genesisTreeState := circuits.TreeState{
		State:          state,
		ClaimsRoot:     clt.Root(),
		RevocationRoot: ret.Root(),
		RootOfRoots:    rot.Root(),
	}
	// STATE 1:

	// Before updating the claims tree, add the claims tree root at Genesis state to the Roots tree.
	rot.Add(ctx, clt.Root().BigInt(), big.NewInt(0))

	// Create a new random claim
	schemaHex := hex.EncodeToString([]byte("myAge_test_claim"))
	schema, _ := core.NewSchemaHashFromHex(schemaHex)

	code := big.NewInt(51)

	newClaim, _ := core.NewClaim(schema, core.WithIndexDataInts(code, nil))

	// Get hash Index and hash Value of the new claim
	hi, hv, _ := newClaim.HiHv()

	// Add claim to the Claims tree
	clt.Add(ctx, hi, hv)

	// Fetch the new Identity State
	newState, _ := merkletree.HashElems(
		clt.Root().BigInt(),
		ret.Root().BigInt(),
		rot.Root().BigInt())

	// Sign a message (hash of the genesis state + the new state) using your private key
	hashOldAndNewStates, _ := poseidon.Hash([]*big.Int{state.BigInt(), newState.BigInt()})

	signature := babyJubjubPrivKey.SignPoseidon(hashOldAndNewStates)

	// Generate state transition inputs
	stateTransitionInputs := circuits.StateTransitionInputs{
		ID:                id,
		OldTreeState:      genesisTreeState,
		NewState:          newState,
		IsOldStateGenesis: true,
		AuthClaim: circuits.Claim{
			Claim: authClaim,
			Proof: authMTPProof,
			NonRevProof: &circuits.ClaimNonRevStatus{
				Proof: authNonRevMTPProof,
			},
		},
		Signature: signature,
	}

	// Perform marshalling of the state transition inputs
	inputBytes, _ := stateTransitionInputs.InputsMarshal()

	fmt.Println(string(inputBytes))
}
