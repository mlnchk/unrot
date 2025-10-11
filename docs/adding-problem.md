### How to add new problem

1. Go to [Brain teasers long list](https://suresolv.com/brain-teaser/challenging-brain-teasers-with-solutions-long-list) and choose a problem
2. Get the problem URL and go to [URL to Markdown](https://www.tomarkdown.org/url-to-markdown)
3. Open advanced settings and put `#content-area` to the target selectors field
4. Create a md file for problem and solution in `src/data/problems` and put mardown there. Don't forget to add metadata
5. Add problem to the problems array in `src/lib/problems.ts`
