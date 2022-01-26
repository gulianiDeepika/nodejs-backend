const { find } = require("lodash");

const searchCommitMessage = (searchTerm, commits) => {
    const commitObject = find(commits, (commit) => {
        if (commit.commit.message.indexOf(searchTerm) !== -1) {
            return true;
        }
    });

    return commitObject ? commitObject.commit.message : "";
};

const prepareDataForGraph = (tree) => {

};

module.exports = searchCommitMessage;