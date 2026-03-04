import axios from 'axios';
import * as cheerio from 'cheerio';
import RSS from 'rss';

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      'https://romamobilita.it/news-eventi/tutte-le-news-e-gli-eventi/',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const $ = cheerio.load(response.data);
    
    const feed = new RSS({
      title: 'Roma Mobilità - News e Eventi',
      description: 'Ultime news da Roma Mobilità',
      feed_url: 'https://tuo-vercel-url.vercel.app/api/feed',
      site_url: 'https://romamobilita.it/news-eventi/tutte-le-news-e-gli-eventi/',
      language: 'it'
    });

    // Estrai articoli
    const articles = [];
    
    $('article, div.card, div.news-item').each((i, elem) => {
      const $elem = $(elem);
      const title = $elem.find('h2, h3').text().trim();
      const link = $elem.find('a').first().attr('href');
      const desc = $elem.find('p').first().text().trim();

      if (title && link) {
        articles.push({
          title: title.substring(0, 200),
          link: link.startsWith('http') ? link : 'https://romamobilita.it' + link,
          description: desc.substring(0, 500) || 'Leggi articolo',
          date: new Date()
        });
      }
    });

    articles.slice(0, 20).forEach(article => {
      feed.item({
        title: article.title,
        description: article.description,
        url: article.link,
        date: article.date,
        author: 'Roma Mobilità'
      });
    });

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(feed.xml());

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}