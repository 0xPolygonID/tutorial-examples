package main

import (
	"fmt"
	"os"

	core "github.com/iden3/go-iden3-core"
	"github.com/iden3/go-iden3-crypto/keccak256"
)

func main() {

	schemaBytes, _ := os.ReadFile("../proof-of-dao-membership.json-ld")

	var sHash core.SchemaHash
	h := keccak256.Hash(schemaBytes, []byte("ProofOfDaoMembership"))

	copy(sHash[:], h[len(h)-16:])

	sHashHex, _ := sHash.MarshalText()

	fmt.Println(string(sHashHex))
	// 5a5cb158b44f6b5a132789ce1abc73ae
}
