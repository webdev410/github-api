import axios from 'axios';
import base64 from 'base-64';
import dotenv from 'dotenv';
dotenv.config();

const GITHUB_TOKEN = process.env.API_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const FOLDERS = ['', 'server', 'client', 'app']; // Include root ('') and other folders

axios.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;
axios.defaults.headers.common['Accept'] =
	'application/vnd.github.mercy-preview+json';

async function getPackageJson(repoName, folder) {
	try {
		const path = folder ? `${folder}/package.json` : 'package.json';
		const response = await axios.get(
			`https://api.github.com/repos/${USERNAME}/${repoName}/contents/${path}`
		);
		const content = base64.decode(response.data.content);
		return JSON.parse(content);
	} catch (error) {
		// Ignore error if package.json is not found in a folder
		return null;
	}
}

async function combineDependencies(repoName) {
	let allDependencies = {};
	for (let folder of FOLDERS) {
		const packageJson = await getPackageJson(repoName, folder);
		if (packageJson && packageJson.dependencies) {
			allDependencies = { ...allDependencies, ...packageJson.dependencies };
		}
	}
	return Object.keys(allDependencies);
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
		console.log('Adding topics to repo', repoName);
		const currentTopics = await getCurrentTopics(repoName);
		const mergedTopics = Array.from(new Set([...currentTopics, ...newTopics]));
		const url = `https://api.github.com/repos/${USERNAME}/${repoName}/topics`;
		console.log({ mergedTopics });

		await axios.put(url, { names: mergedTopics });
		console.log(`Topics updated for ${repoName}`);
	} catch (error) {
		console.error(`Failed to update topics for ${repoName}:`, error.message);
	}
}

async function main(repos) {
	for (let repo of repos) {
		const topics = await combineDependencies(repo.name);
		if (topics.length > 0) {
			await addTopicsToRepository(repo.name, topics);
		}
	}
}

export default async function addTopicsToRepos(repos) {
	await main(repos);
	return true;
}
