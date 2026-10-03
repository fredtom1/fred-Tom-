# Working notes for this repository

## Referencing style (the owner's standing preference)

Use **APA 7th edition** for every reference and citation, in every file and in chat replies.

- **List every author.** Up to 20 authors: list them all, with "&" before the last. 21 or more: list the first 19, then ". . .", then the final author. Never shorten a reference-list entry to "et al."
- **In-text citations:** (Author, year) for one author, (Author & Author, year) for two, (First author et al., year) for three or more. Narrative form: Author et al. (year). Several sources in one bracket go in alphabetical order, separated by semicolons.
- **Reference list:** alphabetical by first author, hanging indent, sentence-case article titles, italic journal name and volume, issue in brackets, page range or article number, and the DOI as `https://doi.org/...`.
- **Verify before citing.** Check author lists, volume, issue, pages and DOI against PubMed, Crossref or the publisher before adding a reference. Do not write author names from memory.
- **Every claim on a slide carries an in-text citation** in its source line.

## Where the references live

`tools/deck-source/refs.js` is the single source for all reference data and APA formatting. The deck (`build_v3.js`), the speaker script (`build_script.js`), the handout (`build_handout.js`) and `References.md` are all generated from it. To add a source, add it there and rebuild.
