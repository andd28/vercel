import fetch from 'node-fetch';

const API_KEY = '5c5b53aa79e568b7097c11310970d888ecc19caad1d9b5c5075ea1044890a062'; // твой ключ
const ZONE = 'scraping_browser1'; // замени на название своей зоны из панели Bright Data (проверь у себя!)

export default async function handler(req, res) {
  try {
    const { page = 1, url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Отсутствует параметр "url"' });
    }

    const targetUrl = `https://tineye.com/api/v1/result_json/?page=${page}&url=${encodeURIComponent(url)}&tags=stock`;

    const body = {
      zone: ZONE,
      url: targetUrl,
      format: 'json'
    };

    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body),
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(json);

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
