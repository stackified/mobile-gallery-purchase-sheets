## Description
A clear and concise description of what this pull request changes and why.

## Related issue
Closes #(issue number), if applicable.

## Type of change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Print layout change
- [ ] Hosting / build / APK change
- [ ] Documentation update
- [ ] Refactor / cleanup

## How has this been tested?
Describe how you ran the app (`file://`, or `bash build.sh` and served `_site/`) and what you checked (Purchase List, Price List, Master Data, print preview, backup/restore, offline mode, update banner, mobile Chrome).

## Checklist
- [ ] `index.html` works when opened directly from a `file://` path
- [ ] `bash build.sh` completes and the app works when `_site/` is served over HTTP
- [ ] The printed sheet still fits on exactly one A4 page
- [ ] Existing saved data and older backup files still load (no breaking change to the stored format)
- [ ] No external requests, CDNs, fonts or analytics were added
- [ ] No real client, customer or price data is included in the change
- [ ] No console errors in the browser
- [ ] I have updated documentation where needed
