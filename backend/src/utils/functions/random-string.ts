export const generateRandomKey = () => {
	return Math.random().toString(36).substring(7);
};
