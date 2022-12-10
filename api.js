const randUserAgent = require('rand-user-agent');
const cheerio = require('cheerio');
const _axios = require('axios');

const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
}); 
const axios = _axios.create({ httpsAgent,withCredentials: true, })




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
    const agent = randUserAgent("chrome", "apple");
    await axios.post("https://sias.universitasmulia.ac.id/login_controller/login_process/siam",{
        username: username,
        password: password,
        a:"send",
    }, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.95 Safari/537.36',
            'Accept': 'text/html, text/plain, */*',
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://sias.universitasmulia.ac.id",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://sias.universitasmulia.ac.id/siam/login.html",
            "Accept-Encoding": "gzip, deflate",
        }
    }).then((response) => {
        if (response.status == 200 && response.data == "TRUE") {
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
            console.log({
                username: username,
                password: password,
                a:"send",
                redirect:""
            });
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


async function getJadwal(_cookie) {

    
    const agent = randUserAgent("chrome", "linux");
    await axios.get("https://sias.universitasmulia.ac.id/siam/cetak-jadwal-kuliah.html",{
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.95 Safari/537.36',
            'Accept': 'text/html, text/plain, */*',
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://sias.universitasmulia.ac.id",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://sias.universitasmulia.ac.id/siam/login.html",
            "Accept-Encoding": "gzip, deflate",
            'Set-Cookie':_cookie,
            'Cookie':_cookie
        },
        withCredentials: true
    }).then((response) => {
        if (response.status == 200) {
            try {
                
                const jadwals = [];
                const $ = cheerio.load(response.data);
                if($("table").length <= 0){
                    console.log("empty");
                }
                var hari = "";
                $($("table tbody table")[2]).find("table tbody tr").each((i,el)=>{
                    
                    if($(el).find('th').length <= 0){
                        if($(el).find('td').eq(0).attr('rowspan') == undefined || $(el).find('td').eq(0).attr('rowspan') == ""){
                            const jadwal = {
                                hari:hari,
                                jam: $(el).find('td').eq(0).text(),
                                kode: $(el).find('td').eq(1).text(),
                                nama: $(el).find('td').eq(2).text(),
                                sks: $(el).find('td').eq(3).text(),
                                kelas: $(el).find('td').eq(4).text(),
                                ruang: $(el).find('td').eq(5).text(),
                                dosen: $(el).find('td').eq(6).text(),
                            };
                            jadwals.push(jadwal);
                        } else {
                            hari = $(el).find('td').eq(0).text();
                            const jadwal = {
                                hari: $(el).find('td').eq(1).text(),
                                jam: "",
                                kode: $(el).find('td').eq(2).text(),
                                nama: $(el).find('td').eq(3).text(),
                                sks: $(el).find('td').eq(4).text(),
                                kelas: $(el).find('td').eq(5).text(),
                                ruang: $(el).find('td').eq(6).text(),
                                dosen: $(el).find('td').eq(7).text(),
                            };
                            jadwals.push(jadwal);
                        }
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

async function getBiodata(_cookie) {

    
    const agent = randUserAgent("chrome", "linux");
    await axios.get("https://sias.universitasmulia.ac.id/siam/cetak-biodata.html",{
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.95 Safari/537.36',
            'Accept': 'text/html, text/plain, */*',
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://sias.universitasmulia.ac.id",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://sias.universitasmulia.ac.id/siam/login.html",
            "Accept-Encoding": "gzip, deflate",
            'Set-Cookie':_cookie,
            'Cookie':_cookie
        },
    }).then((response) => {
        if (response.status == 200) {
            try {
                
                const jadwals = [];
                const $ = cheerio.load(response.data);
                if($("table").length <= 0){
                    console.log("empty");
                }
                var hari = "";
                $($("table tbody table")[2]).find("table tbody tr").each((i,el)=>{
                    
                    if($(el).find('th').length <= 0){
                        if($(el).find('td').eq(0).attr('rowspan') == undefined || $(el).find('td').eq(0).attr('rowspan') == ""){
                            const jadwal = {
                                hari:hari,
                                jam: $(el).find('td').eq(0).text(),
                                kode: $(el).find('td').eq(1).text(),
                                nama: $(el).find('td').eq(2).text(),
                                sks: $(el).find('td').eq(3).text(),
                                kelas: $(el).find('td').eq(4).text(),
                                ruang: $(el).find('td').eq(5).text(),
                                dosen: $(el).find('td').eq(6).text(),
                            };
                            jadwals.push(jadwal);
                        } else {
                            hari = $(el).find('td').eq(0).text();
                            const jadwal = {
                                hari: hari,
                                jam: $(el).find('td').eq(1).text(),
                                kode: $(el).find('td').eq(2).text(),
                                nama: $(el).find('td').eq(3).text(),
                                sks: $(el).find('td').eq(4).text(),
                                kelas: $(el).find('td').eq(5).text(),
                                ruang: $(el).find('td').eq(6).text(),
                                dosen: $(el).find('td').eq(7).text(),
                            };
                            jadwals.push(jadwal);
                        }
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
    getJadwal:getJadwal,
    getBiodata:getBiodata
};