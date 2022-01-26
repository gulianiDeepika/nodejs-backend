
const chalk = require('chalk');
const prompt = require('prompt');
const request = require('request');
const fs = require('fs');

const { searchCommitMessage } = require("./helper");


function search() {
        prompt.start();
        prompt.get(['searchStr'], function (err, result) {
            console.log('Command-line input received:');
            console.log('  searchstring: ' + result.searchStr);
            const searchStr = result.searchStr;

            let options = {
                host: 'api.github.com',
                url: "https://api.github.com/repos/nodejs/node/commits?sha=master",
                method: 'GET',
                headers: {'user-agent': 'node.js', 'Authorization' : 'Bearer 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'},
            };
            request.get(options, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            const commitsArray = JSON.parse(response.body);
            const searchResult = searchCommitMessage(searchStr, commitsArray);
            if (searchResult) {
                fs.writeFile("./commit.txt", searchResult, { flag: 'w' }, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log(chalk.green.bold("The file was saved!!"));
                }); 
            } else {
                console.log(chalk.red.bold('No results found.'));
            }
            });
        });
}
module.exports = search