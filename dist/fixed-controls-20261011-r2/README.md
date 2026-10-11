# Fixed controls, final settings UI

This immutable status bundle uses the deployed v1.5.15 baseline with the four scoped status patches listed in manifest.json. It removes the data editing settings row entirely and keeps the read-only store and field guards from the preceding release. Theme settings remain available. The opening continues to use the preceding immutable release.

Build with the baseline webpack configuration in production mode, applying only these source changes. Unrelated main-branch UI changes are excluded. The manifest records the shipped HTML checksum.
