# Adaptive regex initialization maintenance

The deployed Japanese module is based on immutable tag v1.5.12 (SHA-256 e63f9dc3cb2c9d5708354ed62d0490cb5db03f1686934a7675bf56004eb29db7). The main branch previously retained an older module; this change brings this one file forward from the deployed tag and applies only the verified initialization correction. No unbundled source exists for that deployed module, so scripts/patch-auto-regex-noop.mjs checks its exact preimage and reverses every edit to verify that other bytes are preserved.

Unchanged regex arrays no longer call the write API. Reading rule names uses getTavernRegexes, and the initial chat ID comes from the current context. Real enable/add/remove changes still reach replaceTavernRegexes and retain the helper's ordinary refresh behavior. Protected and retired rule lists, matching patterns, embedded catalog, variable protocol, event subscriptions and 500 ms switch debounce remain unchanged.

Run node --test scripts/auto-regex.test.mjs. The fixture decodes the unchanged embedded catalog without network requests and covers no-op writes, real updates, failures, initialization, chat switching and retired-rule cleanup. Browser acceptance and account/data preservation evidence remain in the private host project.

Publish this module with LICENSE and this note in a new compact immutable tag, then change only the auto-regex import in both metadata payloads of the Japanese card. Preserve all old tags for existing cards.
