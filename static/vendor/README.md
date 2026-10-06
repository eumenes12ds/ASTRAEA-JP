# Browser runtime vendors

These files are kept in this repository so ASTRAEA-JP's battle panel and
character viewer do not depend on third-party package CDN paths at runtime.

- jQuery 3.7.1 — MIT License
- Lodash 4.17.21 — MIT License
- Font Awesome Free 6.5.1 CSS and webfonts — Font Awesome Free License
- Pinia 4.0.3 jsDelivr ESM bundle and logo — MIT License
- js-yaml 4.1.1 jsDelivr ESM bundle — MIT License

The HTML entrypoints load these files through jsDelivr's GitHub delivery path
for `eumenes12ds/ASTRAEA-JP`. The dependency files themselves are versioned
here under `static/vendor`.

## Battle library repair (2026-10-07)

The historical inline HTML and extracted files contained corrupted JavaScript replacement-string expansions. These files now contain the original, unchanged upstream distributions, retaining their license headers.

- jQuery 3.7.1: https://code.jquery.com/jquery-3.7.1.min.js ; SHA-256 fc9a93dd241f6b045cbff0481cf4e1901becd0e12fb45166a8f17f95823f0b1a
- Lodash 4.17.21: https://github.com/lodash/lodash/blob/4.17.21/dist/lodash.min.js ; SHA-256 a9705dfc47c0763380d851ab1801be6f76019f6b67e40e9b873f8b4a0603f7a9

The two battle dependencies are pinned to the compact immutable tag `v1.5.6-battle-vendors-20261007`. Other dependencies retain their existing tags.
