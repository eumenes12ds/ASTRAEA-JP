# Japanese MVU settings contract, 2026-10-16

Canonical update values: `主AI追従出力` / `追加モデル解析`. Account settings, worldbook overrides, script comparisons, controls and action identities use the same Japanese protocol. Legacy Chinese and Japanese inputs remain readable. Japanese writes use `mvu_jp_settings`; Rinne preserves its main-only private namespace. Unknown fields and false/zero preferences are retained.

Maintained MVU source: `source/MagVarUpdate`. The upstream version is unchanged; rebuild uses the included package lock and webpack configuration. External imports retain the previously released vendored dependency bytes. The full application integration and per-card audit live in the private dev_astraea project.

Deployment uses an immutable compact tag with a parent pointing to the reviewed source commit. Existing unrelated card assets keep their prior pins. This release includes 9 runtime/license files (1645982 bytes).

The home UI source is reconciled with the already published 2026-10-07 carousel release (source commit 5bb2ac2b94925f5fdeb96e22d132cffcd47c1ed8); this preserves the live layout while changing mode linkage by worldbook UID.

Recovered MVU source provenance: upstream MagicalAstrogy/MagVarUpdate commit `4623e742f879e99d9881b6020274495aebf7a6d8`, matched to this card's shipped runtime.
