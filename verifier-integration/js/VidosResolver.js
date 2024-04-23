const { Id } = require("@iden3/js-iden3-core");
const { resolver } = require("@iden3/js-iden3-auth");

/**
 * Implementation of {@link resolver.IStateResolver} that uses Vidos resolver service to resolve states.
 * It can serve as drop-in replacement for {@link resolver.EthStateResolver}.
 */
export default class VidosResolver extends resolver.IStateResolver {
  /**
   * @param {string} resolverUrl
   * @param {string} apiKey
   */
  constructor(resolverUrl, apiKey) {
    this.resolverUrl = resolverUrl;
    this.apiKey = apiKey;
  }

  /**
   * @param {bigint} state
   * @returns {Promise<resolver.ResolvedState>}
   */
  async rootResolve(state) {
    const stateHex = state.toString("16");

    const zeroAddress = "11111111111111111111"; // 1 is 0 in base58
    const did = `did:polygonid:polygon:amoy:${zeroAddress}?gist=${stateHex}`;

    const response = await fetch(`${this.resolverUrl}/${encodeURIComponent(did)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    const result = await response.json();
    // console.log("root result", JSON.stringify(result, null, 2));

    const globalInfo = result.didDocument.verificationMethod[0].global;
    if (globalInfo == null) throw new Error('gist info not found')

    if (globalInfo.root !== stateHex) {
      throw new Error('gist info contains invalid state');
    }

    if (globalInfo.replacedByRoot !== "0") {
      if (globalInfo.replacedAtTimestamp === "0") {
        throw new Error('state was replaced, but replaced time unknown');
      }
      return {
        latest: false,
        state: state,
        transitionTimestamp: globalInfo.replacedAtTimestamp,
        genesis: false,
      };
    }

    return {
      latest: true,
      state: state,
      transitionTimestamp: 0,
      genesis: false,
    };
  }

  /**
   * @param {bigint} id
   * @param {bigint} state
   * @returns {Promise<resolver.ResolvedState>}
   */
  async resolve(id, state) {
    const iden3Id = Id.fromBigInt(id);
    const stateHex = state.toString("16");

    const did = `did:polygonid:polygon:amoy:${iden3Id.string()}`;

    const didWithState = `${did}?state=${stateHex}`;
    const response = await fetch(
      `${this.resolverUrl}/${encodeURIComponent(didWithState)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    const result = await response.json();
    const isGenesis = resolver.isGenesisStateId(id, state);

    const stateInfo = result.didDocument.verificationMethod[0].info;
    if (stateInfo == null) throw new Error('state info not found');

    if (stateInfo.id !== did) {
      throw new Error(`state was recorded for another identity`);
    }

    if (stateInfo.state !== stateHex) {
      if (stateInfo.replacedAtTimestamp === "0") {
        throw new Error(`no information about state transition`);
      }
      return {
        latest: false,
        genesis: false,
        state: state,
        transitionTimestamp: Number.parseInt(stateInfo.replacedAtTimestamp),
      };
    }

    return {
      latest: stateInfo.replacedAtTimestamp === "0",
      genesis: isGenesis,
      state,
      transitionTimestamp: Number.parseInt(stateInfo.replacedAtTimestamp),
    };
  }
}
