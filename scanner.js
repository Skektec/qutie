//This program will scan through saved qoutes and output a leaderboard.

const fs = require("fs");

let replacements = [
  { target: "473024549370462209", replacement: "Kspace" },
  { target: "551478150627065862", replacement: "Cyne" },
  { target: "703303649870217309", replacement: "Skeksis" },
  { target: "535118345004122142", replacement: "Mia" },
  { target: "313366936341708819", replacement: "P3xA" },
  { target: "690954746344767538", replacement: "017" },
  { target: "919635711026692107", replacement: "LizardBlizzard" },
  { target: "803369229360431134", replacement: "Blu" },
  { target: "609100564235681803", replacement: "Headip Shitpin" },
  { target: "486144133858197515", replacement: "Fizzgig" },
  { target: "795939963220525087", replacement: "tthhuunnddrr" },
  { target: "289028991069978624", replacement: "Memes" },
  { target: "699676778095968407", replacement: "Sophie" },
  { target: "673227352880316416", replacement: "Destroyer" },
  { target: "698160735376769084", replacement: "Jobear" },
  { target: "702803260175679490", replacement: "chlorinechloe" },
  { target: "332576819125420033", replacement: "Glu" },
  { target: "430457743577579530", replacement: "ebinmemes" },
  { target: "498401858520612865", replacement: "shibusu" },
  { target: "590414231409786880", replacement: "someweirdperson" },
  { target: "413409129110175754", replacement: "karno" },
  { target: "85614143951892480", replacement: "cocks :yum:" },
];

// This counts the amount of qoutes from each person
fs.readFile("./qoutes.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const qoutes = JSON.parse(data);
  const counts = {};

  qoutes.forEach((item) => {
    const name = item.userId;
    counts[name] = (counts[name] || 0) + 1;
  });

  const updatedCounts = nameFromId(counts, replacements);

  const sortedCounts = sortCountsByQuotes(updatedCounts);

  console.log(sortedCounts);
});

//Replaces the userId with a nickname
function nameFromId(score, replacements) {
  const updatedScore = {};
  for (const userId in score) {
    const replacement =
      replacements.find((pair) => pair.target === userId)?.replacement ||
      userId;
    updatedScore[replacement] = score[userId];
  }
  return updatedScore;
}

//Sorts the leaderboard by score
function sortCountsByQuotes(counts) {
  const countsArray = Object.entries(counts);
  countsArray.sort((a, b) => b[1] - a[1]);

  return Object.fromEntries(countsArray);
}
