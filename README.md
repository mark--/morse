# Morsen

A browser-based Morse code trainer with no build step — just HTML, CSS, and vanilla JS modules.

## Features

- **Three training modes**: Decode (listen/watch → type), Encode (key the Morse), Mixed (alternating)
- **Four difficulty levels**: single character, character pair, character group, word copy
- **Audio output**: classic tone, soft click, hard click
- **Visual output**: LED indicator, screen flash
- **Farnsworth timing**: fast character speed with extended inter-character gaps
- **Progression system**: automatic level up/down based on accuracy, weak spot tracking
- **Multi-profile support**: create, rename, delete, import and export profiles
- **Bilingual UI**: English and German

## Usage

Open `index.html` in a browser (requires a local server due to ES module imports and `fetch`).

```bash
# Example using Python
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Project Structure

```
index.html
styles/         # CSS (base, components, themes)
js/             # Application modules
  app.js        # Main controller
  morse-engine.js
  training-decode.js
  training-encode.js
  training-mixed.js
  progression.js
  weakspots.js
  profiles.js
  persistence.js
  audio-output.js
  visual-output.js
  input-keyboard.js
  input-mouse.js
  scheduler.js
  i18n.js
data/           # JSON data (morse table, lessons, word lists)
docs/           # Reference pages (EN + DE)
scripts/        # Deploy tooling
```

## Deployment

Copy `.deploy/sftp.config.json.example` to `.deploy/sftp.config.json`, fill in your server credentials, then:

```bash
npm install
npm run deploy:sftp:dry    # preview files
npm run deploy:sftp:test   # test connection
npm run deploy:sftp        # deploy
```
