const express = require('express');
const { execFile } = require('child_process');
const _ = require('lodash');

const app = express();

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isValidHost(host) {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) {
    return false;
  }

  // On accepte une IPv4 ou un nom de domaine assez classique.
  return /^[a-zA-Z0-9.-]+$/.test(host);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/hello', (req, res) => {
  const rawName = typeof req.query.name === 'string' ? req.query.name : 'inconnu';
  const name = escapeHtml(rawName);

  res.type('html').send(`<h1>Bonjour ${name}</h1>`);
});

app.get('/ping', (req, res) => {
  const host = req.query.host;

  if (!isValidHost(host)) {
    return res.status(400).send('Hôte invalide');
  }

  // execFile sépare la commande des arguments, contrairement à exec.
  execFile('ping', ['-c', '1', host], { timeout: 5000 }, (err, stdout) => {
    if (err) return res.status(500).send('Erreur pendant le ping');
    return res.type('text').send(stdout);
  });
});

app.get('/prefs', (req, res) => {
  const defaults = { theme: 'light', lang: 'fr' };
  const accepted = _.pick(req.query, ['theme', 'lang']);

  // On ne fusionne plus tout ce que l'utilisateur nous envoie.
  const preferences = {
    theme: typeof accepted.theme === 'string' ? accepted.theme : defaults.theme,
    lang: typeof accepted.lang === 'string' ? accepted.lang : defaults.lang,
  };

  res.json(preferences);
});

module.exports = app;
module.exports.escapeHtml = escapeHtml;
module.exports.isValidHost = isValidHost;
