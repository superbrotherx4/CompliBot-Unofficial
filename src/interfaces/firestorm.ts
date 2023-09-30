export interface Contribution {
	id: string;
	date: number; // unix timestamp
	texture: string; // texture ID
	resolution: number; // texture resolution
	pack:
		| "faithful_64x"
		| "faithful_32x"
		| "classic_faithful_32x"
		| "classic_faithful_64x"
		| "classic_faithful_32x_progart"
		| "classic_faithful_64x_progart";
	authors: string[];
}

export interface Path {
	id: string;
	use: string; // use ID
	name: string; // texture path
	mcmeta: boolean; // true if animated
	versions: string[]; // texture versions
}

export interface Use {
	id: string;
	name: string;
	edition: "java" | "bedrock" | "dungeons";
}

export interface Texture {
	id: string;
	name: string;
	tags: string[];
	uses?: Use[];
	paths?: Path[];
	contributions?: Contribution[];
}

export interface Contributor {
	id: string;
	contributions: number;
	username?: string;
	uuid?: string;
}
