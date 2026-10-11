# Fixed character controls

The opening has a fixed 1000-point budget, without rolling. Saved presets normalize their budget to 1000. The status editor is permanently off, including historical true settings and the former tag-edit bypass. Theme selection and normal point spending remain available.

Build: export v1.5.15 to an isolated directory; overlay src/custom_start from v1.5.6. Apply only the eight source-file changes listed in manifest.json to their respective baseline files. Use the repository webpack configuration with production mode and entry=custom_start / entry=status, excluding the unrelated dump_schema plugin. Dependencies were reused without changing package versions. Outputs live here so unrelated main-branch UI differences and automatic dist rebuilds cannot change this pinned release.

Verification: node --test tests/fixed-controls.test.cjs (3 tests). Both webpack builds have zero errors and warnings. Browser acceptance is recorded in the main project report.
