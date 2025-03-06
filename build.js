#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'src', 'index.html');
const cssPath = path.join(__dirname, 'src', 'styles.css');
const jsFiles = [
    path.join(__dirname, 'src', 'TextProcessor.js'),
    path.join(__dirname, 'src', 'SpeedController.js'),
    path.join(__dirname, 'src', 'UIController.js'),
    path.join(__dirname, 'src', 'EventHandlers.js'),
    path.join(__dirname, 'src', 'script.js')
];
const outputPath = path.join(__dirname, 'dist', 'speedreader.html');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

let combinedJs = '';
jsFiles.forEach(file => {
    const jsContent = fs.readFileSync(file, 'utf8');
    const filteredJs = jsContent.split('\n').map(line => {
        if (line.trim().startsWith('import')) return '';
        return line.replace(/^\s*export\s+/, '');
    }).filter(line => line.trim() !== '').join('\n');
    combinedJs += filteredJs + '\n';
});

const finalHtml = html
    .replace('<!-- CSS -->', `<style>\n${css}\n</style>`)
    .replace('<!-- JS -->', `<script>\n${combinedJs}\n</script>`);

fs.writeFileSync(outputPath, finalHtml);

console.log('Building successfull.');