import { readFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "climbing-posts.json");

const normalizePosts = (posts = []) =>
  posts.map((post) => ({
    ...post,
    id: String(post.id),
    title: post.title || "Untitled",
    lastEdited: post.lastEdited || new Date(0).toISOString(),
    content: Array.isArray(post.content) ? post.content : [],
  }));

const readLocalDatabase = async () => {
  const raw = await readFile(LOCAL_DB_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return normalizePosts(parsed.posts);
};

export const getPosts = async () => {
  const posts = await readLocalDatabase();
  return posts.sort(
    (a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
  );
};

export const getPostById = async (id) => {
  const posts = await readLocalDatabase();
  return posts.find((post) => post.id === id) || null;
};

export const getPostIds = async () => {
  const posts = await readLocalDatabase();
  return posts.map((post) => post.id);
};
