const { find, map, intersection } = require("lodash");
const axios = require("axios");

const searchCommitMessage = (searchTerm, commits) => {
    const commitObject = find(commits, (commit) => {
        if (commit.commit.message.indexOf(searchTerm) !== -1) {
            return true;
        }
    });

    return commitObject ? commitObject.commit.message : "";
};

async function getAllRest(tree) {
    const edges = tree.data.repository.ref.target.history.edges;
    let endpoints = [];

    map(edges, (edge) => {
        endpoints.push("https://api.github.com/repos/nodejs/node/commits/"+edge.node.oid);
    });
    const responseArray = await axios.all(endpoints.map((endpoint) => axios.get(endpoint, { headers: {
        'Authorization' : 'Bearer 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'
    }})))
    return responseArray;
};

const prepareEdges = (hashFiles) => {
    let edges = [];
    const filesKey = Object.keys(hashFiles);
    for(let i = 0; i < filesKey.length; i++) {
        for(let j = i + 1; j < filesKey.length; j++) {
            const intersectionFiles = intersection(hashFiles[filesKey[i]], hashFiles[filesKey[j]]);
            if (intersectionFiles.length) {
                let edge = {};
                edge.data = {
                    source: filesKey[i],
                    target: filesKey[j]
                };
                edges.push(edge);
            }
        }
    }
    return edges;
};

async function prepareDataForGraph(tree) {
    const hashFiles = {};
    const graphElements = {
        nodes : [],
        edges: []
    };
    const responseArray = await getAllRest(tree);
    try {
        map(responseArray, (response) => {
            const data = response.data;
            const { files, commit } = data;
            const authorFilesChanged = map(files, 'filename');
            const authorEmail = commit.author.email;
            hashFiles[authorEmail] = authorFilesChanged;
            graphElements.nodes.push(
                { data : { id : authorEmail } }
            )
            const edges = prepareEdges(hashFiles);
            graphElements.edges = edges;
        });
    } catch (err) {
        console.log(err);
    }
    return graphElements;
};

module.exports = {
    searchCommitMessage,
    prepareDataForGraph
}
