import { Octokit } from "@octokit/rest"

export function getOctokit(token: string) {
	return new Octokit({ auth: token })
}

// Create an Octokit instance that can be unauthenticated (public API) when token is not provided
export function getOctokitOptional(token?: string | null) {
	if (token) return new Octokit({ auth: token })
	const publicToken = process.env.GITHUB_PUBLIC_TOKEN
	return publicToken ? new Octokit({ auth: publicToken }) : new Octokit()
}
