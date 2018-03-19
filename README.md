# InViewer

A Three.js-based viewer for visualizing OGC IndoorGML data

![Image of preview](docs/assets/images/inviewer-preview.JPG)

## Main Features
- Visualizing OGC IndoorGML data
- Interactive Visualizing with [InEditor]

## Prerequisites

- Node.js >= ^5.0.0
- npm >= ^3.0.0

## Quick Start

1. You need to install modules. Please follow step.
```
npm install
```

2. Start server by executing `npm start` and launch a web browser and open the viewer (http://127.0.0.1:3000).

## Building for Production

TBD

## Project Structure

```
.
├── build                    # All build-related code
├── docs                     # Assets for documentation
├── public                   # Static public assets
├── server                   # Express application that provides webpack middleware
│   └── main.js              # Server application entry point
├── src                      # Application source code
│   ├── index.html           # Main HTML page container for app
│   ├── index.js             # Application bootstrap and rendering
│   ├── normalize.js         # Browser normalization and polyfills
│   ├── components           # Global Reusable Components
│   ├── containers           # Global Reusable Container Components
│   ├── layouts              # Components that dictate major page structure
│   │   └── CoreLayout       # Global application layout in which to render routes
│   ├── routes               # Main route definitions and async split points
│   │   ├── index.js         # Bootstrap main application routes with store
│   │   ├── Main             # The main route
│   │   │   ├── index.js     # Route definitions and async split points
│   │   │   ├── assets       # Assets required to render components
│   │   │   ├── components   # Presentational React Components
│   │   │   ├── container    # Connect components to actions and store
│   │   └── └── modules      # Collections of reducers/constants/actions
│   ├── services             # Global service manager based on EventsEmitter
│   ├── store                # Redux-specific pieces
│   │   ├── createStore.js   # Create and instrument redux store
│   │   └── reducers.js      # Reducer registry and injection
│   └── styles               # Application-wide styles (generally settings)
└── tests                    # Unit tests
```

## Authors

Name | E-mail | Affiliation
--- | --- | ---
**Hyung-Gyu Ryoo** | hgryoo@pnu.edu | Pusan National University
**Suhee Jung** | lalune1120@hotmail.com | Pusan National University
**Soojin Kim** | gini.pig@kakaocorp.com | Kakao Mobility

## Note

This project is based on the cool [React Redux Starter Kit](https://github.com/davezuko/react-redux-starter-kit) and [forge-rcdb.node.js](https://github.com/Autodesk-Forge/forge-rcdb.nodejs)
