import { apiFetch } from "../utility/apiFetch";

export async function fetchMemes() {
  return await apiFetch(`/meme`);
}

export async function getTodayMemes() {
  return await apiFetch(`/meme/today`);
}

export async function getMyUpvotedMemes() {
  return await apiFetch(`/meme/my-upvoted-memes`);
}

export async function getMyMemes() {
  return await apiFetch(`/meme/mine`);
}

export async function getMemeById(memeId) {
  return await apiFetch(`/meme/${memeId}`);
}

export async function createMeme({ title, tags, imageFile }) {
  const formData = new FormData();

  formData.append("title", title); // campo "text" come richiesto dal DTO
  tags.forEach((tag) => formData.append("tags", tag));
  formData.append("file", imageFile); // campo immagine (Multer)

  return await apiFetch(`/meme`, {
    method: "POST",
    body: formData,
  });
}

export async function searchMeme({ title, date, tags }) {
  return await apiFetch(`/meme/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title ?? "",
      date: date ?? null,
      tags: Array.isArray(tags) ? tags : [],
    }),
  });
}

export async function deleteMeme(memeId) {
  return await apiFetch(`/meme/${memeId}`, {
    method: "DELETE",
  });
}
