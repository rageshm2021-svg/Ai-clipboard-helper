# PromptVault – AI Prompt & Snippet Manager

A small, fast dashboard for saving your favorite AI prompts and text snippets in categorized cards, with a one-click **Copy to clipboard** button on every card.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step, no server.

## Features

- Save prompts as cards with a title, category and text
- One-click copy with animated confirmation
- Filter by category and search by title or text
- Edit and delete cards
- Light and dark themes (remembers your choice)
- Responsive layout that works on phones, tablets and desktops
- Everything is saved in your browser (`localStorage`), so nothing leaves your device

## Project structure

```
prompt-vault/
├── index.html   # page structure
├── style.css    # all styling and animations
├── script.js    # app logic
└── README.md
```

## How to use

1. Open `index.html` in your browser (double-click it).
2. Click **+ New prompt**, fill in the title, category and text, then click **Save prompt**.
3. Click **Copy to clipboard** on any card, then paste it into your AI tool.
4. Use the category buttons or the search box to find a prompt fast.

> Your prompts live in this browser on this device. Clearing site data removes them.

## Deploy on GitHub Pages

1. Create a new repository on GitHub (for example `prompt-vault`).
2. Upload the files from this folder (`index.html`, `style.css`, `script.js`, `README.md`) to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then click **Save**.
5. After a minute, your site is live at `https://YOUR-USERNAME.github.io/prompt-vault/`.

## Customize

- **Colors and fonts:** edit the variables at the top of `style.css`.
- **Starter prompts:** edit the `SAMPLES` list at the top of `script.js`.
- **Reset the app:** clear the site's data in your browser settings.

## License

Free to use and modify.
