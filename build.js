#!/usr/bin/env node

const fs = require('fs');

const html = fs.readFileSync('src/index.html', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const js = fs.readFileSync('src/script.js', 'utf8');

const finalHtml = html
    .replace('<!-- CSS -->', `<style>${css}</style>`)
    .replace('<!-- JS -->', `<script>${js}</script>`);

fs.writeFileSync('dist/speedreader.html', finalHtml);