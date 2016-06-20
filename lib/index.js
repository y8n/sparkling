const pkg = require('../package.json');
const github = require('./github');
const colors = require('colors');
const prompt = require('./prompt');
const Progress = require('superman-progress');
const program = require('commander');

const progress = new Progress();

exports.run = () => {
    program
        .version(pkg.version)
        .usage('githubUsername [option]')
        .option('-a, --auth', 'use basic authentication')
        .on('--help', () => {
            console.log('  Examples:');
            console.log('');
            console.log('    $ sparkling --help');
            console.log('    $ sparkling -V');
            console.log('    $ sparkling username');
            console.log('    $ sparkling username -a');
            console.log('');
        })
        .parse(process.argv);

    let username = program.args[0];
    if (username) {
        progress.start();
        if (program.auth) {
            let userinfo = askForUserinfo();
            github.authentication(userinfo);
        }
        github.getAllStars(username).then(resolve, reject);
    }
    function resolve(starCount) {
        progress.end();
        if (starCount === 0) {
            console.log('oops~' + username + ' has not got any stars on GitHub.');
        } else if (starCount === 1) {
            console.log(username + ' has only one star on GitHub.')
        } else {
            console.log(username + ' has ' + starCount + ' stars on GitHub.')
        }
    }

    function reject(message, limit) {
        progress.end();
        if (limit) {//请求数目受限
            console.info(colors.red(
                'For unauthenticated requests, ' +
                'the rate limit allows you to make up to 60 requests per hour. ' +
                'You can make up to 5,000 requests per hour when using Basic Authentication or OAuth.'
            ));
            let useAuth = prompt.ask('Use your username and password for Basic Authentication?(Y/n)', {
                defaultInput: 'Y'
            });
            if (useAuth !== 'Y') {
                process.exit(1);
            }
            let userinfo = askForUserinfo();
            github.authentication(userinfo);
            progress.start();
            github.getAllStars(username).then(resolve, reject);
        } else {
            console.log(message);
            process.exit(1);
        }
    }
};
/**
 * 命令行接收用户输入用户名和密码
 * @returns {{username, password}}
 */
function askForUserinfo() {
    let username = prompt.ask('Your username:');
    let password = prompt.ask('Your password:', {
        hideEchoBack: true,
        mask: ' '
    });
    if (username && password) {
        return {
            username: username,
            password: password
        };
    } else {
        console.log('username and password are required.');
        process.exit(1);
    }
}
