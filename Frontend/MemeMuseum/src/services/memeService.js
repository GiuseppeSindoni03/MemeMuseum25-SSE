import { apiFetch } from "../utility/apiFetch";


export async function fetchMemes(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  return await apiFetch(`/meme?${query.toString()}`);
}


export async function getTodayMemes(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  return await apiFetch(`/meme/today?${query.toString()}`);
}

export async function getMyUpvotedMemes(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  console.log("Ris: ",await apiFetch(`/meme/my-upvoted-memes?${query.toString()}`));
  return await apiFetch(`/meme/my-upvoted-memes?${query.toString()}`);
}

export async function getMyMemes() {
  return await apiFetch(`/meme/mine`);
}

export async function getMemeById(memeId) {
  return await apiFetch(`/meme/${memeId}`);
}

export async function createMeme({ title, tags, imageFile }) {
  const formData = new FormData();

  formData.append("title", title);
  tags.forEach((tag) => formData.append("tags", tag));
  formData.append("file", imageFile);

  return await apiFetch(`/meme`, {
    method: "POST",
    body: formData,
  });
}

export async function searchMeme({ title, date, tags, sortBy }, limit = 10, offset = 0) {
  const query = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  return await apiFetch(`/meme/search?${query.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title ?? "",
      date: date ?? null,
      tags: Array.isArray(tags) ? tags : [],
      sortBy: sortBy ?? "date",
    }),
  });
}


export async function deleteMeme(memeId) {
  return await apiFetch(`/meme/${memeId}`, {
    method: "DELETE",
  });
}
