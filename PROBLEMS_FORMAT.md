# Problems Format Documentation

This document describes the format and structure for adding brain teasers and riddles to this application.

## Overview

Each problem consists of two separate Markdown files:

- **Problem file** (`{slug}.md`) - Contains the problem statement
- **Solution file** (`{slug}.solution.md`) - Contains the detailed solution

Both files are stored in `src/data/problems/`.

## File Structure

```
src/data/problems/
├── {slug}.md              # Problem statement
└── {slug}.solution.md     # Solution walkthrough
```

### Naming Convention

- Use **kebab-case** for file names (e.g., `two-jugs-riddle.md`)
- The slug (filename without extension) becomes the URL path
- Problem and solution files must share the same slug

## Problem File Format

### Frontmatter Schema

Every problem file must start with YAML frontmatter containing metadata:

```yaml
---
title: "Problem Title"
category: "Logic Puzzle"
difficulty: "Moderate"
estimatedTime: "15 minutes"
hint: "A helpful hint for solvers"
source: "https://original-source-url.com/problem"
---
```

#### Required Fields

| Field           | Type   | Description                 | Example                                           |
| --------------- | ------ | --------------------------- | ------------------------------------------------- |
| `title`         | string | Display name of the problem | `"Two Jugs Riddle"`                               |
| `category`      | string | Problem category            | `"Logic Puzzle"`                                  |
| `difficulty`    | string | Difficulty level            | `"Easy"`, `"Moderate"`, `"Challenging"`, `"Hard"` |
| `estimatedTime` | string | Expected solve time         | `"15 minutes"`                                    |
| `hint`          | string | A single helpful hint       | `"Think where to start."`                         |

#### Optional Fields

| Field    | Type   | Description         | Example                        |
| -------- | ------ | ------------------- | ------------------------------ |
| `source` | string | Original source URL | `"https://example.com/riddle"` |

### Content Body

After the frontmatter, write the problem statement in Markdown format.

**Supported Markdown features:**

- Headings (`##`, `###`, etc.)
- Paragraphs
- Lists (ordered and unordered)
- Bold and italic text
- Images (with URLs)
- Links
- Code blocks
- Blockquotes

**Example:**

```markdown
---
title: "Two Jugs Riddle"
category: "Logic Puzzle"
difficulty: "Moderate"
estimatedTime: "15 minutes"
hint: "Think where to start."
source: "https://suresolv.com/brain-teaser/two-jugs-riddle-systematic-problem-solving"
---

![Water Jug Riddle from Die Hard 3](https://example.com/image.png)

## Use Common Sense Reasoning to Solve the Water Jug Riddle

Measure 4 liter of water with two empty jugs of 5 liter and 3 liter capacity and a tank full of water. Fill and pour as many times as you want.

How many ways can you measure 4 liters of water by repeating fill and pour moves?
```

## Solution File Format

The solution file contains **only content** (no frontmatter) and should provide a detailed walkthrough of the solution.

**Example:**

```markdown
Learn how to solve this famous water jug riddle with **no random trial and error**, using only common sense reasoning.

## Step by Step Solution

### Stage 1: Visualizing Results

It'll be easy to decide the result of a move in this way—all in your mind.

1. Fill the 3-liter jug from the tank.
2. Empty the 3-liter jug into the 5-liter jug.

The **RESULT** of these two actions:

- The 3-liter jug empty
- 3 liter of water in the 5-liter jug

...

![Solution diagram](https://example.com/solution-image.png)
```

## Adding a New Problem

### Step 1: Create the Files

1. Choose a descriptive slug (e.g., `bridge-crossing-puzzle`)
2. Create two files in `src/data/problems/`:
   - `bridge-crossing-puzzle.md`
   - `bridge-crossing-puzzle.solution.md`

### Step 2: Add Frontmatter and Content

Fill in the frontmatter with all required fields and write the problem statement.

### Step 3: Write the Solution

Create a detailed solution walkthrough in the `.solution.md` file.

### Step 4: Test

The problem will automatically appear in the application. Navigate to:

- Homepage: Will show in the problems list
- Problem page: `/problems/bridge-crossing-puzzle`

## Best Practices

### Problem Statement

- **Be clear and concise** - State the problem unambiguously
- **Include all constraints** - Mention rules, limitations, and requirements
- **Use examples** - Visual aids and examples help clarify complex problems
- **Preserve original content** - When adapting from sources, keep the original text
- **Include images** - Use external URLs for images (they load dynamically)

### Solution

- **Break down steps** - Use clear stages or numbered steps
- **Explain reasoning** - Don't just show the answer; explain why it works
- **Use visual aids** - Diagrams, tables, and images enhance understanding
- **Provide alternatives** - If multiple solutions exist, document them
- **Credit techniques** - Mention problem-solving strategies used

### Metadata

- **Difficulty levels:**
  - `Easy` - Solvable in a few minutes with basic logic
  - `Moderate` - Requires systematic thinking or insight
  - `Challenging` - Needs careful analysis or creative approaches
  - `Hard` - Demands advanced reasoning or multiple insights

- **Categories:** Keep consistent (e.g., "Logic Puzzle", "Math Puzzle", "Word Puzzle", "Pattern Recognition")

- **Estimated time:** Be realistic based on average solver experience

- **Hints:** Should guide without spoiling - point to an approach, not the answer

## Examples

### Minimal Example

**File:** `simple-riddle.md`

```markdown
---
title: "Simple Riddle"
category: "Logic Puzzle"
difficulty: "Easy"
estimatedTime: "5 minutes"
hint: "Think about the literal meaning."
---

What has keys but no locks, space but no room, and you can enter but can't go inside?
```

**File:** `simple-riddle.solution.md`

```markdown
The answer is a **keyboard**.

- It has keys (letter keys)
- It has a space bar (space without a room)
- It has an Enter key (but you can't physically go inside it)
```

### Complex Example with Images

**File:** `tower-of-hanoi.md`

```markdown
---
title: "Tower of Hanoi"
category: "Logic Puzzle"
difficulty: "Challenging"
estimatedTime: "20 minutes"
hint: "Think recursively - solve for smaller numbers first."
source: "https://en.wikipedia.org/wiki/Tower_of_Hanoi"
---

![Tower of Hanoi puzzle](https://example.com/tower-of-hanoi.png)

## The Classic Tower of Hanoi Puzzle

You have three rods and five disks of different sizes. All disks start on the first rod, arranged from largest (bottom) to smallest (top).

**Rules:**

1. Move one disk at a time
2. A disk can only be placed on top of a larger disk
3. All disks must end up on the third rod

What is the minimum number of moves required?
```

## Technical Details

### How Problems are Loaded

1. **Discovery:** The system uses `import.meta.glob()` to find all `.md` files in `src/data/problems/`
2. **Parsing:** Frontmatter is parsed using a regex-based parser
3. **Rendering:** Problem content is rendered using `react-markdown`
4. **Navigation:** Problems appear automatically in the sidebar and homepage

### Type Definitions

Problems are typed using TypeScript interfaces in `src/lib/types/problem.ts`:

```typescript
export type ProblemMetadata = {
  title: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  hint: string;
  source?: string;
};

export type Problem = {
  slug: string;
  metadata: ProblemMetadata;
  content: string;
};

export type ProblemSolution = {
  slug: string;
  content: string;
};
```

## Future Enhancements

The current format is designed to support future features:

- **Translations:** Add `locale` field to frontmatter (e.g., `locale: "en"`, `locale: "es"`)
- **Multiple solutions:** Create `{slug}.solution-alternative.md` files
- **Difficulty ratings:** Add user ratings or success rates
- **Prerequisites:** Link to related problems or concepts
- **Interactive elements:** Embed visualizations or interactive demos

## Troubleshooting

### Problem doesn't appear

- Check that both `.md` and `.solution.md` files exist
- Verify frontmatter syntax (must start with `---` and end with `---`)
- Ensure all required fields are present
- Check for YAML syntax errors in frontmatter

### Images not loading

- Verify image URLs are accessible
- Use absolute URLs (not relative paths)
- Check that image URLs use `https://` protocol

### Formatting issues

- Ensure proper Markdown syntax
- Leave blank lines between elements
- Close all opened tags in HTML (if used)

## Contributing

When adding problems:

1. Follow the format exactly
2. Test the problem locally
3. Verify images load correctly
4. Proofread for clarity
5. Ensure the solution is complete and accurate

---

**Last Updated:** October 9, 2025
