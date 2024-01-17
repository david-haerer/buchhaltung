# Buchhaltung

_🧾 Accounting for families._

## Design

- Static website / PWA without build step.
- Store data in a user managed JSON file.

## Tooling

- [Alpine.js](https://alpinejs.dev/) for data binding.
- [Ajv JSON schema validator](https://ajv.js.org/) for data validation.
- [OpenProps](https://open-props.style/) for styling.
- [icongen](https://cthedot.de/icongen/) for icons.

## Roadmap

- [ ] Create a desktop version with [Tauri](https://tauri.app/).

## Development

Start a static file-server with

```sh
python -m http.server 8080
```

If you want to use live-reloading, you can install

```sh
pipx install livereload
```

and use it like

```sh
livereload -p 8080
```
