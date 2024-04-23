const { resolver } = require("@iden3/js-iden3-auth");

/**
 * Wrapper around a state resolver that logs the state resolution process. Useful for debugging and learning how state resolution works.
 * 
 * @param {resolver.IStateResolver} resolver
 * @returns {resolver.IStateResolver}
 */
export default function interceptStateResolver(resolver) {
  return {
    async resolve(id, state) {
      try {
        console.log("Resolving state", id, state);
        const result = await resolver.resolve(id, state);
        console.log("Resolved state", id, state, result);
        return result;
      } catch (e) {
        console.error("Error resolving state", id, state, e);
        throw e;
      }
    },
    async rootResolve(state) {
      try {
        console.log("Resolving root state", state);
        const result = await resolver.rootResolve(state);
        console.log("Resolved root state", state, result);
        return result;
      } catch (e) {
        console.error("Error resolving root state", state, e);
        throw e;
      }
    },
  };
}
