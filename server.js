import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { fetchGitHubData } from './script.js';

const app = express();
app.use(cors());

const username = process.env.GITHUB_USERNAME;
const token = process.env.API_TOKEN;
fetchGitHubData(username, token).then((data) => {
	fs.writeFileSync('output/resume.json', JSON.stringify(data, null, 2));
	return;
});

app.listen(6969, () => console.log('Server ready'));
