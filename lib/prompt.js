const readlineSync = require('readline-sync');
const colors = require('colors');

exports.ask = (question, option) => readlineSync.question(colors.gray(question), option);