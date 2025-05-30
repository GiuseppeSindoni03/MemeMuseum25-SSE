import { apiFetch } from "../utility/apiFetch";

export async function fetchComments(memeId) {
  return await apiFetch(`/comment/meme/${memeId}`);
}

export async function postComment(memeId, text) {
  return await apiFetch(`/comment/${memeId}`, {
    method: "POST",
    body: JSON.stringify({ text: text }),
  });
}

export async function deleteComment(commentId) {
  return await apiFetch(`/comment/${commentId}`, {
    method: "DELETE",
  });
}
