### How to add new problem

1. Collect one or more puzzle URLs (for example from [Brain teasers long list](https://suresolv.com/brain-teaser/challenging-brain-teasers-with-solutions-long-list)).
2. Run the generator: `bun --bun tsx scripts/add-problems.ts <url-1> <url-2> ...`.
3. Open the generated files in `src/data/problems/`:
   - Fill in the remaining frontmatter fields (`difficulty`).
   - Replace the solution placeholder with the actual walkthrough.
4. Update `src/lib/problems.ts` by adding a new entry to the `problems` array using the generated slug.
