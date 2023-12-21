import fs from 'fs';
const input = {
	profile: fs.readFileSync('templates/profile.txt', 'utf8'),
	skills: [],
	technologies: [],
	reposToInclude: ['blog'],
};
export default input;
