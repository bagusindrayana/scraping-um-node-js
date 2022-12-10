const express = require('express');
var cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
app.use(express.json()) // for parsing application/json
app.use(express.text()) // this is for plan/text format
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json())

// app.use(cors({ credentials: true }));
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

app.post('/siam/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(req.body);
    const results = await api.login(username, password);
    res.status(results.status).json(results.data);
});

app.post('/siam/jadwal-kuliah', async (req, res) => {
    const results = await api.getJadwal(req.body._session);
    res.status(results.status).json(results.data);
});

app.post('/siam/biodata', async (req, res) => {
    const results = await api.getBiodata(req.body._session);
    res.status(results.status).json(results.data);
});


const port = 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});