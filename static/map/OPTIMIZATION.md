# Full-resolution WebP maps (2026-09-20)

`map-4096.webp` and `map-8340.webp` are recompressed from `Maplite-4096.webp` and `Maplite.webp` in this repository, respectively. Composition, dimensions and map coordinates are unchanged. The original files and old release URLs are retained.

| File | Pixels | Original bytes | New bytes | Reduction |
|---|---:|---:|---:|---:|
| map-4096.webp | 4096 x 2335 | 11,243,442 | 1,938,494 | 82.76% |
| map-8340.webp | 8340 x 4756 | 39,414,782 | 6,887,510 | 82.53% |

Encoder: Pillow 12.3.0/libwebp, RGB, quality=82, method=6, no resizing. WebP quality 80, 82, 84, 85 and 90 were compared at original pixel scale across names, borders, mountains and illustrated linework. Quality 82 is the smallest accepted tested WebP candidate; this is visual approval, not a claim of losslessness or a mathematically optimal compression rate. AVIF candidates were discarded because the requested delivery format is WebP.

Chromium and WebKit decode the exact original dimensions. A real isolated card UI test opens both resolutions and switches away/back with one request per image, without preloading the high-resolution map. Asset URLs use immutable tag v1.5.15. There is no format negotiation or secondary image download.
