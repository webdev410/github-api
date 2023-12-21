import fs from 'fs';
/**
 * 
 * @param {*} repoData 
 * @returns
 * 
 * Example usage
// Assuming repoData is the array of repository data you got from the GitHub API
const resumeHtml = createResumeFromRepoData(repoData);
document.body.innerHTML = resumeHtml; // Render the resume in the body of the web page
 
 */
export default function createResumeFromRepoData(repoData) {
	// Start with a header for the resume
	let resumeText = `GitHub Projects\n`;
	// Loop through each repository and add its details to the resume
	const resumeTextData = createResumeText(repoData);
	const resumeHtmlData = createResumeHtml(repoData);
	fs.writeFileSync('output/resume.txt', resumeTextData);
	fs.writeFileSync('output/resume.html', resumeHtmlData);
	return { resumeTextData, resumeHtmlData };
}
/**
 * 
 * @param 
 * 		{	name: repo.name,
				numberOfCommits: commits.length,
				commitsByYear: commitsByYear,
				url: repo.html_url,
				description: repo.description,
				language: repo.language,
				createdAt: repo.created_at,
				updatedAt: repo.updated_at,
				forksCount: repo.forks_count,
				starsCount: repo.stargazers_count,
				topics: repo.topics,
				visibility: repo.visibility,} repoData 
 * @returns 
 */
const createResumeText = (repoData) => {
	let resumeText = `GitHub Projects\n`;
	repoData.forEach((repo) => {
		resumeText += `${repo.name}\n${repo.description || 'No description'}\n${
			repo.language || 'N/A'
		}\n${repo.numberOfCommits}\n${new Date()}`;
	});
	return resumeText;
};
const createResumeHtml = (repoData) => {
	let resumeHtml = `<h1>GitHub Projects</h1>\n`;
	let templateContent = fs.readFileSync('templates/repo.html', 'utf8');

	// Split the template into start and end parts
	let htmlStart = templateContent.split('<!-- repos -->')[0];
	let htmlEnd = templateContent.split('<!-- end -->')[1];

	// Process each repo
	repoData.forEach((repo) => {
		console.log({ repoName: repo.name, topics: repo.topics });

		// Use a temporary variable for each repo to avoid overwriting templateContent
		let repoHtml = templateContent.split('<!-- repos -->')[1];
		repoHtml = repoHtml.split('<!-- end -->')[0];

		// Replace placeholders with actual data
		repoHtml = repoHtml.replace('{{REPO-NAME}}', repo.name);
		repoHtml = repoHtml.replace('{{REPO-DESCRIPTION}}', repo.description);
		repoHtml = repoHtml.replace('{{REPO-VISIBILITY}}', repo.visibility);
		repoHtml = repoHtml.replace('{{REPO-MAIN-LANGUAGE}}', repo.language);
		repoHtml = repoHtml.replace(
			'{{REPO-TOPICS}}',
			repo.topics.length ? repo.topics.join(', ') : ''
		);
		repoHtml = repoHtml.replace('{{REPO-COMMITS}}', repo.numberOfCommits);
		repoHtml = repoHtml.replace(
			'{{REPO-CREATED-DATE}}',
			new Date(repo.createdAt).toLocaleDateString()
		);
		repoHtml = repoHtml.replace(
			'{{REPO-LAST-UPDATED}}',
			new Date(repo.updatedAt).toLocaleDateString()
		);
		repoHtml = repoHtml.replace('{{REPO-URL}}', repo.url);
		repoHtml = repoHtml.replace('{{REPO-README}}', repo.readme);

		repoHtml = repoHtml.replace('{{WEBSITE-URL}}', repo.website);
		repoHtml = repoHtml.replace('{{website-url}}', repo.website);
		// Append the repo HTML to the resume HTML
		resumeHtml += repoHtml;
	});

	// Concatenate the final HTML
	const finalHtml = htmlStart + resumeHtml + htmlEnd;
	return finalHtml;
};
