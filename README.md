# André Hansen | Linux & Platform Engineering

Personal CV and engineering portfolio, published at https://andr0id88.github.io/.

## Website source

The production website is in `site/`. It is static HTML, CSS, and JavaScript with locally hosted fonts. No Ruby, Jekyll, Node packages, or backend services are required.

- `site/index.html`: CV and project content.
- `site/styles.css` and `site/site.js`: presentation and accessible project navigation.
- `site/media/`: approved project artwork and screenshots using demonstration data.
- `site/cv.html` and `site/cv.css`: print source for the downloadable CV.
- `site/andre-hansen-cv.pdf`: downloadable two-page CV. Regenerate from `cv.html` with A4 paper and CSS page sizing after CV changes.
- `site/fonts/OFL.txt`: font licence.

To preview locally:

```sh
python3 -m http.server 8000 --directory site
```

Open http://localhost:8000/.

## Publishing

GitHub Pages uses GitHub Actions. `.github/workflows/pages.yml` publishes only `site/` when changes are pushed to `master`; it can also be run manually. The Pages publishing source must remain **GitHub Actions**.

Before publishing, check the CV download, project screenshots, keyboard navigation, and narrow mobile layouts. Keep internal project examples anonymised and clearly marked as demonstration data. Certification dates describe when qualifications were earned; CKA is listed as a training course.

The older Jekyll theme and blog files remain in the repository for reference and are excluded from the deployed artifact. `_pages/portfolio.md` retains the content brief. The ignored `preview/` folder is the earlier local design review, not the production source.

To roll back a release, revert its commit on `master` and push; the same workflow republishes the restored `site/` directory.
