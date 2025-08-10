import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

let proxies = [];
let currentProxyIndex = 0;

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15"
];

function loadProxies() {
  if (!proxies.length) {
    const filePath = path.resolve('./proxies.txt');
    proxies = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(p => p.startsWith('http') ? p : `http://${p}`);
    if (!proxies.length) throw new Error('Список прокси пуст');
  }
}

function getNextProxy() {
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  return proxy;
}

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export default async function handler(req, res) {
  try {
    loadProxies();

    const { page = 1, url } = req.query;
    if (!url) {
      res.status(400).json({ error: 'Отсутствует параметр "url"' });
      return;
    }

    const targetUrl = `https://tineye.com/api/v1/result_json/?page=${page}&url=${encodeURIComponent(url)}&tags=stock`;

    let lastError;
    for (let i = 0; i < proxies.length; i++) {
      const proxy = getNextProxy();
      try {
        const agent = new HttpsProxyAgent(proxy);
        const response = await fetch(targetUrl, {
          headers: { 'User-Agent': getRandomUserAgent() },
          agent
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(json);
        return;
      } catch (err) {
        lastError = err;
        console.warn(`Прокси ${proxy} не сработал: ${err.message}`);
      }
    }
    throw lastError;
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
