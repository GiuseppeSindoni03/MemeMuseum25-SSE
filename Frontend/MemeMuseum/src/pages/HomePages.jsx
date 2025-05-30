import React, { useEffect, useState } from "react";
import { fetchMemes, searchMeme } from "../services/memeService";
import MemeCard from "../components/MemeCard";

export default function HomePage({
  memes,
  setMemes,
  onClickNotLogged,
}) {

  const handleUpdateMeme = (updatedMeme) => {
    setMemes((memesList) =>
      memesList.map((meme) => (meme.id === updatedMeme.id ? updatedMeme : meme))
    );
  };

  const handleDeleteMeme = (deletedMemeId) => {
    setMemes((memesList) =>
      memesList.filter((meme) => meme.id !== deletedMemeId)
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: "750px" }}>
      {memes.length === 0 ? (
      <h2 style={{color: "white", paddingTop: '10%'}}>Nessun elemento trovato</h2>
    ) : (memes.map((meme) => (
        <MemeCard
          key={meme.id}
          memeId={meme.id}
          title={meme.title}
          author={meme.author}
          date={meme.createdAt}
          imageUrl={"http://dietiestates.duckdns.org:3001" + meme.imageUrl}
          tags={meme.tags}
          likes={meme.upvote}
          dislikes={meme.downvote}
          commentsCount={meme.commentsCount}
          userVote={meme.userVote}
          onUpdate={handleUpdateMeme}
          onClickNotLogged={onClickNotLogged}
          onDeleteMeme={handleDeleteMeme}
        />
      ))
    )}
  </div>
);
}
