const randUserAgent = require('rand-user-agent');
const cheerio = require('cheerio');
const _axios = require('axios');

const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
}); 
const axios = _axios.create({ httpsAgent })



async function scrapePost(url) {
    var data = {};
    const agent = randUserAgent("chrome", "linux");
    await axios.get(url, {
        headers: {
            'User-Agent': agent,
            'Accept': 'text/html, text/plain, */*',
            'Accept-Encoding': '*',
            'Content-Type': 'text/html; charset=utf-8',
        }
    }).then((response) => {

        if (response.status) {
            const posts = [];
            const $ = cheerio.load(response.data);

            $('article.post-entry').each((i, el) => {
                const post = {
                    title: $(el).find('h2 a').text(),
                    link: "post/slug?s=" + $(el).find('h2 a').attr('href').replace('https://universitasmulia.ac.id/', ''),
                    image: $(el).find('.blog-meta img').attr('src'),
                    date: $(el).find('time').attr('datetime'),
                    excerpt: $(el).find('.entry-content').text(),
                };
                posts.push(post);
            });
            data = {
                status: 200,
                data: posts
            };
        } else {
            data = {
                status: 404,
                data: "Not Found"
            };
        }
    }).catch((err) => {
        data = {
            status: 500,
            data: err
        };
    });
    return data;
}

async function scrapePostDetail(url) {
    var data = {};
    const agent = randUserAgent("chrome", "linux");
    await axios.get(url, {
        headers: {
            'User-Agent': agent,
            'Accept': 'text/html, text/plain, */*',
            'Accept-Encoding': '*',
            'Content-Type': 'text/html; charset=utf-8',
        }
    }).then((response) => {
        if (response.status == 200) {
            try {

                let post = {};

                const $ = cheerio.load(response.data);

                post = {
                    title: $('.entry-content-wrapper header.entry-content-header .post-title').text(),
                    categories: $('.entry-content-wrapper header.entry-content-header .blog-categories').text().split(', '),
                    image: $('.entry-content-wrapper .big-preview a').attr('href'),
                    date: $('.entry-content-wrapper time.date-container').attr('datetime'),
                    description: $('.entry-content-wrapper .entry-content').text(),
                };
                data = {
                    status: response.status,
                    data: post
                }
            } catch (err) {
                data = {
                    status: 500,
                    data: err
                }
            }
        } else {
            data = {
                status: response.status,
                data: "Ops"
            }
        }
    }).catch((err) => {
        data = {
            status: 500,
            data: err
        };
    })
    return data;

}

async function login(username,password) {
    var data = {};
    const agent = randUserAgent("chrome", "linux");
    await axios.post("https://sias.universitasmulia.ac.id/login_controller/login_process/siam",{
        username: username,
        password: password
    }, {
        headers: {
            'User-Agent': agent,
            'Accept': 'text/html, text/plain, */*',
            'Accept-Encoding': '*',
            'Content-Type': 'text/html; charset=utf-8',
        }
    }).then((response) => {
        if (response.status == 200) {
            try {

                
                data = {
                    status: response.status,
                    data: response.headers.get("set-cookie")
                }
            } catch (err) {
                data = {
                    status: 500,
                    data: err
                }
            }
        } else {
            data = {
                status: response.status,
                data: "Ops"
            }
        }
    }).catch((err) => {
        data = {
            status: 500,
            data: err
        };
    })
    return data;

}


async function getJadwal(cookie) {
    var data = {};
    const agent = randUserAgent("chrome", "linux");
    await axios.get("https://sias.universitasmulia.ac.id/siam/jadwal-kuliah.html",{
        headers: {
            'User-Agent': agent,
            'Accept': 'text/html, text/plain, */*',
            'Accept-Encoding': '*',
            'Content-Type': 'text/html; charset=utf-8',
            'Set-Cookie':cookie,
            'Cookie':cookie
        },
        withCredentials: true
    }).then((response) => {
        if (response.status == 200) {
            try {
                const jadwals = [];
                const $ = cheerio.load(response.data);
                $(".content table.table tbody tr").each((i,el)=>{
                    console.log(el);
                    if($(el).attr('rowspan') == undefined || $(el).attr('rowspan') == ""){
                        const jadwal = {
                            jam: $(el).find('td').eq(0).text(),
                            kode: $(el).find('td').eq(1).text(),
                            nama: $(el).find('td').eq(2).text(),
                            sks: $(el).find('td').eq(3).text(),
                            kelas: $(el).find('td').eq(4).text(),
                            ruang: $(el).find('td').eq(5).text(),
                            dosen: $(el).find('td').eq(6).text(),
                        };
                        jadwals.push(jadwal);
                    }
                });
                data = {
                    status: response.status,
                    data: jadwals
                }
            } catch (err) {
                data = {
                    status: 500,
                    data: err
                }
            }
        } else {
            data = {
                status: response.status,
                data: "Ops"
            }
        }
    }).catch((err) => {
        data = {
            status: 500,
            data: err
        };
    })
    return data;

}



module.exports = {
    scrapePost:scrapePost,
    scrapePostDetail:scrapePostDetail,
    login:login,
    getJadwal:getJadwal
};