const Promise = require('promise');
const https = require('https');

const API_PATH = 'api.github.com';

let HTTPS_OPTIONS = {
    hostname: API_PATH,
    port: 443,
    method: 'GET',
    headers: {
        'User-Agent': 'sparkling',
        authorization: ''
    }
};
exports.authentication = (options) => {
    let basic = new Buffer(options.username + ':' + options.password, 'ascii').toString('base64');
    HTTPS_OPTIONS.headers.authorization = 'Basic ' + basic;
};
exports.getAllStars = (username) => {
    username = username.toString();
    return new Promise((resolve, reject)=> {
        HTTPS_OPTIONS.headers = {
            'User-Agent': username
        };
        getReposInfo(username).then((reposData) => {
            let stars = 0;
            reposData.forEach((repo) => {
                stars += repo['stargazers_count'];
            });
            resolve(stars);
        }, (message, limit) => {
            reject(message, limit);
        });
    });
};
function getReposInfo(username) {
    return new Promise((resolve, reject)=> {
        let per_page = 100, pages, req, reposData = [];

        getGithuberInfo(username).then((reposCount) => {
            pages = Math.ceil(reposCount / per_page);
            iterator(1);
        }, (message, limit) => {
            reject(message, limit);
        });
        function iterator(page) {
            if (page > pages) {
                resolve(reposData);
                return;
            }
            HTTPS_OPTIONS.path = '/users/' + username + '/repos?page=' + page + '&per_page=' + per_page;
            req = https.request(HTTPS_OPTIONS, res => {
                let result = '';
                res.on('data', chunk => {
                    result += chunk.toString();
                });
                res.on('end', () => {
                    let data;
                    try {
                        data = JSON.parse(result);
                    } catch (e) {
                        data = '';
                    }
                    reposData = reposData.concat(data);
                    iterator(++page);
                })
            });
            req.end();

            req.on('error', err => {
                reject(err.message);
            });
        }
    });
}
/**
 * 获取github用户信息
 * @param username
 * @returns Promise
 */
function getGithuberInfo(username) {
    HTTPS_OPTIONS.path = '/users/' + username;
    return new Promise((resolve, reject) => {
        https.request(HTTPS_OPTIONS, res => {
                let result = '';
                res.on('data', chunk => {
                    result += chunk.toString();
                });
                res.on('end', () => {
                    let data;
                    try {
                        data = JSON.parse(result);
                    } catch (e) {
                    }
                    if (typeof data.public_repos !== 'undefined') {
                        resolve(data.public_repos);
                    } else if (res.headers['x-ratelimit-remaining'] === 0) {
                        reject(data.message, true);
                    } else {
                        if (data.message === 'Not Found') {
                            data.message = 'User ' + username + ' not been found in Github.';
                        }
                        reject(data.message);
                    }
                })
            })
            .on('error', err => {
                reject(err.message);
            }).end();
    });
}