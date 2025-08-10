import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const BRIGHTDATA_PROXY_HOST = 'zproxy.lum-superproxy.io';
const BRIGHTDATA_PROXY_PORT = 22225;
const BRIGHTDATA_PROXY_USERNAME = 'customer-bgawesom-zone-static';
const BRIGHTDATA_PROXY_PASSWORD = '5c5b53aa79e568b7097c11310970d888ecc19caad1d9b5c5075ea1044890a062';

function getBrightDataProxyUrl() {
  return `http://${BRIGHTDATA_PROXY_USERNAME}:${BRIGHTDATA_PROXY_PASSWORD}@${BRIGHTDATA_PROXY_HOST}:${BRIGHTDATA_PROXY_PORT}`;
}

export default async function handler(req, res) {
  try {
    const { page = 1, url } = req.query;
    if (!url) {
      res.status(400).json({ error: 'Отсутствует параметр "url"' });
      return;
    }

    const targetUrl = `https://tineye.com/api/v1/result_json/?page=${page}&url=${encodeURIComponent(url)}&tags=stock`;

    const proxyUrl = getBrightDataProxyUrl();
    const agent = new HttpsProxyAgent(proxyUrl);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      },
      agent,
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(json);

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
