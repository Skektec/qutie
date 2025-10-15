const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const outputFile = path.join(dataDir, 'training_data.jsonl');

const files = fs.readdirSync(dataDir);

let trainingData = '';

for (const file of files) {
  if (file.endsWith('.json') && file !== 'config.json' && file !== 'mapBlacklist.json' && file !== 'teamGames.json' && file !== 'wtMaps.json' && file !== 'formTeamData.json' && file !== 'deletedQuotes.json') {
    const filePath = path.join(dataDir, file);
    const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (let i = 0; i < messages.length - 1; i++) {
      const prompt = messages[i + 1];
      const completion = messages[i];

      if (prompt.author.bot || completion.author.bot) {
        continue;
      }

      trainingData += JSON.stringify({
        prompt: `${prompt.author.username}: ${prompt.content}`,
        completion: `${completion.author.username}: ${completion.content}`
      }) + '\n';
    }
  }
}

fs.writeFileSync(outputFile, trainingData);

