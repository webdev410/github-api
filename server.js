import express from 'express';
import cors from 'cors';
import { fetchGitHubData } from './script.js';

const app = express();
app.use(cors());

const username = process.env.GITHUB_USERNAME;
const token = process.env.API_TOKEN;
fetchGitHubData(username, token).then((data) => {
	console.log(data);
});

app.listen(6969, () => console.log('Server ready'));
