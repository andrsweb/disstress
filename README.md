# aw-html-gulp-build

Gulp build template for rapid web development: SCSS, HTML modules, JS via esbuild, linters, and project setup wizard.

## Installation

```bash
npm install
```

## Main Commands

```bash
npm start         # dev server + setup wizard (optional)
npm run start:nl  # dev server without HTML/CSS validation (--no-lint)

npm run build     # production build + HTML and SCSS validation
npm run build:nl  # production build without validation (--no-lint)

npm run help      # brief help on wizard steps and commands
```

## Project Setup Wizard

The wizard runs when you execute `npm start` and guides you through several steps.

1. **Layout Grid**  
   Configure container width and inner padding.  
   Can be skipped — default values will be used.

2. **Base Colors**  
   Create and update variables in `dev/src/scss/vars/_colors.scss` (`$c-white`, `$c-black`, etc.).  
   Can be skipped — base colors will remain standard.

3. **Fonts**  
   Connect fonts from Google Fonts: locally or via CDN.  
   The wizard:
   - parses Google Fonts CSS;
   - suggests selecting weights (100–900, comma-separated);
   - can connect normal and italic;
   - updates `dev/src/scss/vars/_text.scss` (font-family and `$fw-XXX`).

4. **Templates**  
   A set of ready-made solutions that can be selectively enabled:
   - fixed header on scroll;
   - basic modal script.

## Templates

### Fixed Header

When enabling the template:

- creates/updates `dev/src/html/components/common/header/header.js` with logic:
  - adds class `scrolled` to `.header` on scroll;
- imports `header.js` into `dev/src/js/main.js`;
- updates `header.scss`:
  - ensures `position: fixed; left: 0; top: 0; width: 100%;` for `.header`;
  - adds `&.scrolled { background-color: red; }`.

### Basic Modal Script

When enabling the modal template:

- creates `dev/src/js/common/modal.js` with universal logic;
- adds import `./modal` to `dev/src/js/common/common.js`.

The script uses the `body-scroll-lock` library and works via data attributes:

- **Open modal**: element with `data-modal-open="id"`  
  Expects modal window `.modal[data-modal-id="id"]`.
- **Close modal**:
  - any element with `data-modal-close` inside `.modal`;
  - click on background (`.modal` area outside content);
  - `Esc` key closes the last opened modal.

Modal state:

- base block: `.modal` (size, positioning, hidden state);
- active state: class `.modal-active` — shows modal and raises `z-index`.

Example markup:

```html
<button type="button" data-modal-open="example">Open Modal</button>

<div class="modal" data-modal-id="example">
	<div class="modal-inner">
		<button type="button" data-modal-close>Close</button>
		...
	</div>
</div>
```

SCSS for modal is located in `dev/src/scss/ui/modal.scss` and already connected in `main.scss`.

## Linters and Validation

### HTML

- Uses `w3c-html-validator`.
- In dev (`npm start`) errors are shown in console but don't break the server.
- In build (`npm run build`) errors cause the build to fail.

### SCSS

- Uses `stylelint` + `stylelint-config-standard-scss` via `gulp-stylelint-esm`.
- In dev (`lintStylesDev`) errors are written to console but don't break the process.
- In build (`validateStyles`) errors block the build.
- At the end of validation, a summary is displayed:

  ```
  SCSS validation: pass (messages: X)
  ```

### Disabling Validation

In all commands, you can disable HTML/SCSS validation via `--no-lint`:

```bash
npm run start:nl  # dev without linters
npm run build:nl  # build without HTML/SCSS validators
```

## Project Structure (main)

- `dev/src/html` — HTML modules and sections.
- `dev/src/scss` — SCSS (vars, common, ui, generated modules).
- `dev/src/js` — source JS (common scripts, template and module connections).
- `dev/core` — Gulp configuration, setup wizard, templates.
- `assets` / `build` — final build folder (depends on paths settings).

## JS Build

JS is built via `esbuild`:

- entry: `dev/src/js/main.js`;
- format: `iife` (for connecting with a single `<script>`);
- in production, minification and obfuscation via `javascript-obfuscator` are enabled.

## License

The project is intended as a starting template for personal and commercial projects. The license can be adapted to your requirements.