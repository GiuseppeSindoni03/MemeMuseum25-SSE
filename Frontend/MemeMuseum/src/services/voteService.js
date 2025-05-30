import { apiFetch } from "../utility/apiFetch";

export async function createOrUpdateVote(memeId, voteType) {
  return await apiFetch(`/vote/${memeId}`, {
    method: "POST",
    body: JSON.stringify({ type: voteType }),
  });
}
