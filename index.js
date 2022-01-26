
const searchCommitMessage = require("./helper");

const express = require('express');
const request = require('request');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express()
const port = 3001;
const prompt = require('prompt');
const fs = require('fs');

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

prompt.start();

prompt.get(['searchStr'], function (err, result) {
    console.log('Command-line input received:');
    console.log('  username: ' + result.searchStr);
    const searchStr = result.searchStr;

    let options = {
        host: 'api.github.com',
        url: "https://api.github.com/repos/nodejs/node/commits?sha=master",
        method: 'GET',
        headers: {'user-agent': 'node.js'}
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
            console.log("The file was saved!!");
        }); 
      } else {
          console.log("No results found");
      }
    });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/developers', (req, res) => {

    const queryLang = `query { repository(owner: "nodejs", name: "node") {
        ref(qualifiedName: "master") {
          target {
            ... on Commit {
              id
              history(first: 40) {
                pageInfo {
                  hasNextPage
                }
                edges {
                  node {
                    changedFiles
                    messageHeadline
                    oid
                    message
                    author {
                      name
                      email
                      date
                    }
                    tree {
                      entries {
                        name
                      }
                    }
                    commitResourcePath
                  }
                }
              }
            }
          }
        }
      }}`;

    let options = {
        host: 'api.github.com',
        url: "https://api.github.com/graphql",
        method: 'POST',
        headers: {'user-agent': 'node.js', 'Authorization' : 'Bearer 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'},
        body: JSON.stringify({ query : queryLang })
    };
    request.post(options, (err, response) => {
      if (err) {
          console.log(err);
          return;
      }
        console.log(JSON.parse(response.body));
        res.send(JSON.parse(response.body));
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

