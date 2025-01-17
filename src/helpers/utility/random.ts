/** random integer between the given start and stop points */
export const randint = (start: number, stop: number) =>
	Math.floor(start + Math.random() * (stop - start + 1));
/** pick a random item out of an array */
export const choice = <T>(arr: T[]): T => arr[randint(0, arr.length - 1)];
/** return a randomly shuffled version of a provided array */
export const shuffle = <T>(arr: T[]): T[] => arr.sort(() => randint(-1, 1));
