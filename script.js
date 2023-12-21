import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import addTopicsToRepos from './helpers/addTopicsToRepos.js';
import createResumeFromRepoData from './helpers/createResume.js';
import getDescription from './helpers/getDescription.js';
dotenv.config();

export async function fetchGitHubData(username, token) {
	const headers = {
		Authorization: `token ${token}`,
		Accept: 'application/vnd.github.v3+json',
	};

	// Function to fetch paginated GitHub API data
	async function fetchGitHubApi(apiUrl) {
		try {
			const response = await fetch(apiUrl, { headers });
			return await response.json();
		} catch (error) {
			return console.error(error);
		}
	}

	function extractYear(dateString) {
		return new Date(dateString).getFullYear();
	}

	try {
		let resumeData = [];
		const folder = fs.readdirSync(path.join(path.resolve(), './data'));
		const folderPath = path.join(path.resolve(), './data');
		console.log({ folder });

		let repos = [];
		for (const file of folder) {
			let data = fs.readFileSync(path.join(folderPath, file), 'utf8');
			const rdata = JSON.parse(data).items;
			repos.push(...rdata);
		}
		console.log({ repos: repos.length });

		await addTopicsToRepos(repos);
		// *Format Each Repo
		for (const repo of repos) {
			// get all pages
			let commits = [];
			let page = 1;
			let response = await fetchGitHubApi(
				`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=100&page=${page}`
			);
			while (response.length > 0) {
				commits.push(...response);
				page++;
				response = await fetchGitHubApi(
					`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=100&page=${page}`
				);
			}

			let commitsByYear = {};

			for (const commit of commits) {
				console.log({ commit });

				const year = extractYear(commit.commit.committer.date);
				commitsByYear[year] = (commitsByYear[year] || 0) + 1;
			}

			const repoData = {
				name: repo.name,
				numberOfCommits: commits.length,
				commitsByYear: commitsByYear,
				url: repo.html_url,
				description: repo.description || getDescription(repo.name),
				language: repo.language,
				createdAt: repo.created_at,
				updatedAt: repo.updated_at,
				forksCount: repo.forks_count,
				website: repo.homepage || '',
				starsCount: repo.stargazers_count,
				topics: repo.topics,
				readme: `https://github.com/${username}/${repo.name}/tree/${repo.default_branch}#readme`,
				visibility: repo.visibility,
			};
			if (repoData.numberOfCommits > 1) resumeData.push(repoData);
		}

		// sort by name
		const sortBy = (key) => {
			if (key === 'name') {
				return resumeData.sort((a, b) => a.name.localeCompare(b.name));
			} else if (key === 'createdAt') {
				return resumeData.sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
			} else if (key === 'lastUpdated') {
				return resumeData.sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);
			} else {
				return resumeData.sort((a, b) => b[key] - a[key]);
			}
		};

		const sorted = sortBy('lastUpdated');

		// resumeData.push({ commitsByYear });
		createResumeFromRepoData(sorted);
		return sorted;
	} catch (error) {
		console.error('Failed to fetch GitHub data:', error);
		return null;
	}
}
