var https = require('https');

var API_PATH = 'api.github.com';

var getReposInfo = function (username,callback) {

    var options = {
        hostname: API_PATH,
        port: 443,
        path: '/users/'+username+'/repos',
        method: 'GET',
        rejectUnauthorized: false,
        headers:{
            "User-Agent": username
        }
    };
    var req = https.request(options, function(res) {
        var result = "",data = {};
        res.on('data', function(chunk) {
            result += chunk.toString();
        });
        res.on('end',function(){
            try{
                data = JSON.parse(result);
            }catch(e){

            }
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        })
    });
    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
};

var getAllStars = function (username,callback) {

    if(typeof username !== 'string'){
        throw new Error("username must be a string.");
    }

    getReposInfo(username, function (reposData) {
        var stars = 0;
        reposData.forEach(function(repo){
            stars += repo["stargazers_count"];
                console.log(repo.name);
        });
        if(callback && typeof callback === 'function'){
            callback(stars);
        }
    });

};

var getFullInfo = function (username,callback) {

    if(typeof username !== 'string'){
        throw new Error("username must be a string.");
    }

    getReposInfo(username, function (reposData) {
        var repos = [],_repo;
        reposData.forEach(function(repo){
            _repo = {
                name:repo.name,
                starCount:repo["stargazers_count"] || 0,
                forksCount:repo["forks_count"] || 0
            };
            repos.push(_repo);
        });
        if(callback && typeof callback === 'function'){
            callback(repos);
        }
    });
};

exports.getAllStars = getAllStars;
exports.getFullInfo = getFullInfo;
