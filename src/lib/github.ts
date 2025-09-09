import { Octokit } from "@octokit/rest"

export function getOctokit(token: string) {
	return new Octokit({ auth: token })
}
