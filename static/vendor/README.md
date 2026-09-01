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
