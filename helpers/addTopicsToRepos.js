import axios from 'axios';
import base64 from 'base-64';
import dotenv from 'dotenv';
dotenv.config();
const GITHUB_TOKEN = process.env.API_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

async function addTopicsToRepos(repos) {
	axios.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;
	axios.defaults.headers.common['Accept'] =
		'application/vnd.github.mercy-preview+json';

	async function getPackageJson(repoName) {
		try {
			const response = await axios.get(
				`https://api.github.com/repos/${USERNAME}/${repoName}/contents/package.json`
			);
			const content = base64.decode(response.data.content);
			return JSON.parse(content);
		} catch (error) {
			console.error(
				`Error fetching package.json for ${repoName}:`,
				error.message
			);
			return null;
		}
	}

	async function getCurrentTopics(repoName) {
		try {
			const url = `https://api.github.com/repos/${USERNAME}/${repoName}/topics`;
			const response = await axios.get(url);
			return response.data.names;
		} catch (error) {
			console.error(
				`Failed to get current topics for ${repoName}:`,
				error.message
			);
			return [];
		}
	}

	async function addTopicsToRepository(repoName, newTopics) {
		try {
			console.log('adding topics to repo', repoName);
			const currentTopics = await getCurrentTopics(repoName);
			const mergedTopics = Array.from(
				new Set([...currentTopics, ...newTopics])
			);
			const url = `https://api.github.com/repos/${USERNAME}/${repoName}/topics`;
			await axios.put(url, { names: mergedTopics });
			console.log(`Topics updated for ${repoName}`);
		} catch (error) {
			console.error(`Failed to update topics for ${repoName}:`, error.message);
		}
	}

	async function main(repos) {
		for (let repo of repos) {
			const packageJson = await getPackageJson(repo.name);
			if (packageJson && packageJson.dependencies) {
				const newTopics = Object.keys(packageJson.dependencies);
				await addTopicsToRepository(repo.name, newTopics);
			}
		}
	}
	await main(repos);

	return true;
}

export default addTopicsToRepos;
