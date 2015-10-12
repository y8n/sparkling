var https = require('https');

var API_PATH = 'api.github.com';

var options = {
        hostname: API_PATH,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false,
        headers:{
            "User-Agent": "User-Agent"
        }
    };

var getGithuberInfo = function(username,callback){
    options.path = '/users/'+username;
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
                if(data.public_repos === 0){
                    console.log("You have no public repositories.");
                    return;
                }else{
                    callback(data.public_repos);
                }
            }
        })
    });
    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
}

var getReposInfo = function (username,callback) {

    var per_page=100,pages=1,req,reposData = [];

    getGithuberInfo(username,function(reposCount){
        pages = Math.ceil(reposCount/100);
        iterator(1);
    });

    function iterator(page){
        if(page > pages){
            if(callback && typeof callback === 'function'){
                callback(reposData);
            }
            return;
        }

        options.path = '/users/'+username+'/repos?page='+page+'&per_page='+per_page;
        req = https.request(options, function(res) {
            var result = "",data = [];
            res.on('data', function(chunk) {
                result += chunk.toString();
            });
            res.on('end',function(){
                try{
                    data = JSON.parse(result);
                }catch(e){}
                reposData = reposData.concat(data);
                iterator(++page);
            })
        });
        req.end();

        req.on('error', function(e) {
            console.error(e);
        });

    }

};

var getAllStars = function (username,callback) {

    if(typeof username !== 'string'){
        throw new Error("username must be a string.");
    }

    getReposInfo(username, function (reposData) {
        var stars = 0;
        console.log("一共"+reposData.length+"个项目")
        reposData.forEach(function(repo){
            stars += repo["stargazers_count"];
            // console.log(repo.name,"-----",repo["stargazers_count"]);
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
