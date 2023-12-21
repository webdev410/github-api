const getDescription = (repoName) => {
	switch (repoName) {
		case 'react':
			return 'A declarative, efficient, and flexible JavaScript library for building user interfaces.';
		default:
			return 'default repo description';
	}
};
export default getDescription;
