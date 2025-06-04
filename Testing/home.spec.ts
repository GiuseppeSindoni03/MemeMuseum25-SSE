import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://mememuseum.duckdns.org:5173");
  // Expect the page has a title matching a substring.
  await expect(page).toHaveTitle(/MemeMuseum25/);
});

test.describe("Authenticated Area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://mememuseum.duckdns.org:5173/");
    await page.getByRole("button", { name: "Accedi/Registrati" }).click();
    await page.getByRole("textbox", { name: "Email" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("testuser@example.com");
    await page.getByRole("textbox", { name: "Password" }).click();
    await page.getByRole("textbox", { name: "Password" }).fill("Str0ngP@ssw0rd!");
    await page.getByRole("button", { name: "Entra" }).click();
  });

  test("Logout", async ({ page }) => {
    await page.getByRole("navigation").getByRole("button").filter({ hasText: /^$/ }).click();
    await page.getByRole("button", { name: "Logout" }).click();
  });

  test("Vote Up", async ({ page }) => {
    const meme = page.locator('.meme-card:has-text("Primo di una lunga serie")');
    await expect(meme).toHaveCount(1);

    const likeBlock = meme.locator('.meme-footer .action').nth(0);

    const likeText = await likeBlock.textContent();
    const currentLikes = parseInt(likeText?.replace(/\D/g, '') ?? '0', 10);

    await likeBlock.click();
    await page.waitForTimeout(500);

    
    const updatedText = await likeBlock.textContent();
    const updatedLikes = parseInt(updatedText?.replace(/\D/g, '') ?? '0', 10);

    
    expect([currentLikes - 1, currentLikes + 1]).toContain(updatedLikes);
  });

  test("Vote Down", async ({ page }) => {
    const meme = page.locator('.meme-card:has-text("Primo di una lunga serie")');
    await expect(meme).toHaveCount(1);

    const likeBlock = meme.locator('.meme-footer .action').nth(1);

    const likeText = await likeBlock.textContent();
    const currentLikes = parseInt(likeText?.replace(/\D/g, '') ?? '0', 10);

    await likeBlock.click();
    await page.waitForTimeout(500);

    
    const updatedText = await likeBlock.textContent();
    const updatedLikes = parseInt(updatedText?.replace(/\D/g, '') ?? '0', 10);

    
    expect([currentLikes - 1, currentLikes + 1]).toContain(updatedLikes);
  });

  test("Open Comments", async ({ page }) => {
    const meme = page.locator('.meme-card:has-text("Primo di una lunga serie")');
    await expect(meme).toHaveCount(1);

    const commentButton = meme.locator('.meme-footer .action').nth(2)

    await commentButton.click();

    const commentSection = meme.locator('.comments-section');
    await expect(commentSection).toBeVisible();
  });

  test("Write comment", async ({ page }) => {
    const commentText = 'Test End to End';

    const meme = page.locator('.meme-card:has-text("Primo di una lunga serie")');
    await expect(meme).toHaveCount(1);

    const commentButton = meme.locator('.meme-footer .action').nth(2);
    await commentButton.click();

    const commentSection = meme.locator('.comments-section');
    await expect(commentSection).toBeVisible();

    const textArea = commentSection.locator('textarea');
    await textArea.fill(commentText);

    const sendButton = commentSection.locator('button', { hasText: 'Invia' });
    await sendButton.click();

    const newComment = commentSection.locator('.comment-body', { hasText: commentText });
    await expect(newComment).toBeVisible();
  });

  test("Navigate To Profile", async ({ page }) => {
    await page.getByRole('navigation').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('button', { name: 'Profilo' }).click();
    const sidebar = page.locator('.left-sidebar');
    const ProfileMenuItem = sidebar.locator('.menu-item:has-text("Profilo")');
    await expect(ProfileMenuItem).toHaveClass(/selected/);
  });

  test("Navigate To Meme Del Giorno", async ({ page }) => {
    const sidebar = page.locator('.left-sidebar');
    const TodayMemeMenuItem = sidebar.locator('.menu-item:has-text("Meme Del Giorno")');
    await expect(TodayMemeMenuItem).toBeVisible();
    await TodayMemeMenuItem.click();
    await expect(TodayMemeMenuItem).toHaveClass(/selected/);
  });

  test("Navigate To Mi Piace", async ({ page }) => {
    const sidebar = page.locator('.left-sidebar');
    const likesMenuItem = sidebar.locator('.menu-item:has-text("Mi Piace")');
    await expect(likesMenuItem).toBeVisible();
    await likesMenuItem.click();
    await expect(likesMenuItem).toHaveClass(/selected/);
  });
});
