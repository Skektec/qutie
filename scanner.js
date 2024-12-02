const fs = require('fs');

// This counts the amount of qoutes from each person
fs.readFile('./qoutes.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const qoutes = JSON.parse(data);
    const counts = {};

    qoutes.forEach((item) => {
        const name = item.userId;
        counts[name] = (counts[name] || 0) + 1;
    });

    const updatedCounts = nameFromId(counts);

    const sortedCounts = sortCountsByQuotes(updatedCounts);

    console.log(sortedCounts);
});

//Replaces the userId with a nickname
function nameFromId(score) {
    const updatedScore = {};
    for (const userId in score) {
        const updatedCounts = `<@${userId}>`;
        updatedScore[updatedCounts] = score[userId];
    }
    return updatedScore;
}

//Sorts the leaderboard by score
function sortCountsByQuotes(counts) {

    const countsArray = Object.entries(counts);
    countsArray.sort((a, b) => b[1] - a[1]);

    return Object.fromEntries(countsArray);
}
