const recursivelyStringify = <T extends Object>(obj: T): string => {
	const allKeys: Set<string> = new Set();
	JSON.stringify(obj, (key, value) => {
		allKeys.add(key);
		return value;
	});
	return JSON.stringify(obj, Array.from(allKeys).sort());
};

export const unique = <T extends Object>(
	arr: T[],
	keyFn?: (obj: T) => string,
) => {
	// Objects can be complex, so we can't use Set here
	return arr.filter(
		(v, i, a) =>
			a.findIndex(
				(t) =>
					recursivelyStringify(keyFn ? keyFn(t) : t) ===
					recursivelyStringify(keyFn ? keyFn(v) : v),
			) === i,
	);
};

export const extractDomain = (url: string) => {
	const parsedUrl = new URL(url);
	return parsedUrl.hostname.replace(/^www\./, "");
};
