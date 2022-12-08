const randUserAgent = require('rand-user-agent');
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const app = express();

app.get('/', (req, res) => {
    res.end("All data from https://universitasmulia.ac.id");
});

async function scrapePost(url) {
    
    try {
        const agent = randUserAgent("chrome", "linux");
        const { data } = await axios.get(url,{
            headers: { 
                'User-Agent':agent,
                'Accept': 'text/html, text/plain, */*',
                'Accept-Encoding': '*',
                'Content-Type': 'text/html; charset=utf-8',
            }
        });
        const posts = [];
        const $ = cheerio.load(data);
        
        $('article.post-entry').each((i, el) => {
            const post = {
                title: $(el).find('h2 a').text(),
                link: "post/slug?s="+$(el).find('h2 a').attr('href').replace('https://universitasmulia.ac.id/', ''),
                image: $(el).find('.blog-meta img').attr('src'),
                date: $(el).find('time').attr('datetime'),
                excerpt: $(el).find('.entry-content').text(),
            };
            posts.push(post);
        });
        return posts;
    } catch (err) {
        console.log(err);
        return err;
    }
}

async function scrapePostDetail(url) {
    
    try {
        const agent = randUserAgent("chrome", "linux");
        const { data } = await axios.get(url,{
            headers: { 
                'User-Agent':agent,
                'Accept': 'text/html, text/plain, */*',
                'Accept-Encoding': '*',
                'Content-Type': 'text/html; charset=utf-8',
            }
        });
        let post = {};
        console.log(data);
        const $ = cheerio.load(data);
        
        post = {
            title: $('.entry-content-wrapper header.entry-content-header .post-title').text(),
            categories: $('.entry-content-wrapper header.entry-content-header .blog-categories').text().split(', '),
            image: $('.entry-content-wrapper .big-preview a').attr('href'),
            date: $('.entry-content-wrapper time.date-container').attr('datetime'),
            description: $('.entry-content-wrapper .entry-content').text(),
        };
        return post;
    } catch (err) {
        return err;
    }
}

app.get('/post', async (req, res) => {
    const cat = req.query.cat ?? 'berita';
    const page = req.query.page ?? 1;
    const url = `https://universitasmulia.ac.id/category/${cat}/page/${page}`;
    const results = await scrapePost(url);
    res.json(results);
});

app.get('/post/slug', async (req, res) => {
    const slug = req.query.s;
    const url = `https://universitasmulia.ac.id/${slug}`;
    const results = await scrapePostDetail(url);
    res.json(results);
});


const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});