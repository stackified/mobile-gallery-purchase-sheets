# Excel prototypes (superseded)

The first version of this tool was an Excel workbook. These are the fourteen
iterations it went through before it became the web app in the repo root.

Kept only for reference — **do not use them**. They are superseded by
`index.html`, which fixed the problems these could not:

- Excel silently stripped the dropdown data-validation on some installs
  ("Removed Feature: Data validation" on open), so item and client dropdowns
  came up empty on one machine and worked on another
- `IFERROR` is not recognised by older OpenOffice/LibreOffice, giving `#NAME?`
  down the UNIT and RATE columns
- A fixed grid of rows and columns, so client count could not flex
- No reliable way to force one sheet onto a single A4 page

`v14` was the last and best of them, if you ever need to look at one.
