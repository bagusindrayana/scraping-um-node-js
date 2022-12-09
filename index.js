const express = require('express');
var cors = require('cors')
const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors({ credentials: true }));
const api = require('./api');

app.get('/', (req, res) => {
    res.end("All data from https://universitasmulia.ac.id");
});



app.get('/post', async (req, res) => {
    const cat = req.query.cat ?? 'berita';
    const page = req.query.page ?? 1;
    const url = `https://universitasmulia.ac.id/category/${cat}/page/${page}`;
    const results = await api.scrapePost(url);
    res.status(results.status).json(results.data);
});

app.get('/post/slug', async (req, res) => {
    const slug = req.query.s;
    const url = `https://universitasmulia.ac.id/${slug}`;
    const results = await api.scrapePostDetail(url);
    res.status(results.status).json(results.data);
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const results = await api.login(username, password);
    res.status(results.status).json(results.data);
});

app.post('/siam/jadwal-kuliah', async (req, res) => {
    const results = await api.getJadwal(req.headers['set-cookie']);
    res.status(results.status).json(results.data);
});


const port = 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});