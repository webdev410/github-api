import dotenv from 'dotenv';
import fs from 'fs';
import createResumeFromRepoData from './helpers/createResume.js';
dotenv.config();

export async function fetchGitHubData(username, token) {
	const headers = {
		Authorization: `token ${token}`,
		Accept: 'application/vnd.github.v3+json',
	};

	// Function to fetch paginated GitHub API data
	async function fetchGitHubApi(apiUrl) {
		const response = await fetch(apiUrl, { headers });
		if (!response.ok) {
			throw new Error(`GitHub API responded with status ${response.status}`);
		}
		return await response.json();
	}
	try {
		const repos = await fetchGitHubApi(
			`https://api.github.com/users/${username}/repos`
			// `https://api.github.com/search/repositories?q=user:${username}`
		);

		// Array to hold formatted data for resume
		let resumeData = [];

		for (const repo of repos) {
			const commits = await fetchGitHubApi(
				`https://api.github.com/repos/${username}/${repo.name}/commits`
			);

			// Extracting relevant data
			const repoData = {
				name: repo.name,
				numberOfCommits: commits.length,
				url: repo.html_url,
				description: repo.description,
				language: repo.language,
				createdAt: repo.created_at,
				updatedAt: repo.updated_at,
				forksCount: repo.forks_count,
				starsCount: repo.stargazers_count,
			};

			resumeData.push(repoData);
		}
		createResumeFromRepoData(resumeData);
		return resumeData;
	} catch (error) {
		console.error('Failed to fetch GitHub data:', error);
		return null;
	}
}
