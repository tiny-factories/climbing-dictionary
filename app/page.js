import Link from "next/link";
import styles from "./index.module.css";
import { mapTermsToExperienceBuckets, EXPERIENCE_LEVELS } from "../lib/climbing-terms";
import { getPosts } from "../lib/local-db";

export const revalidate = 60;

const formatDate = (rawDate) => {
  if (!rawDate) {
    return "Unknown edit date";
  }

  return new Date(rawDate).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export default async function HomePage() {
  const posts = await getPosts();
  const terms = posts.map((post) => post.title).filter(Boolean);
  const termMap = mapTermsToExperienceBuckets(terms);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Climbing terms from a local repo database</h1>
        <p>
          This project now runs fully from a lightweight in-repo JSON database
          and maps your current climbing term list to the experience level where each term is most
          frequently encountered.
        </p>
        <p className={styles.muted}>
          Edit <code>data/climbing-posts.json</code> to add or update terms.
        </p>
      </header>

      <section>
        <h2 className={styles.heading}>Experience-level mapping</h2>
        <p className={styles.mapIntro}>
          {termMap.uniqueTerms} unique terms found ({termMap.totalTerms} total
          entries). Each term is grouped under the level where it appears most
          often.
        </p>
        <div className={styles.mapGrid}>
          {EXPERIENCE_LEVELS.map((level) => {
            const levelTerms = termMap.buckets[level.id];
            return (
              <article className={styles.levelCard} key={level.id}>
                <h3 className={styles.levelTitle}>{level.label}</h3>
                <p className={styles.levelSummary}>
                  Weighted frequency score: {termMap.totals[level.id].toFixed(2)}
                </p>
                {levelTerms.length === 0 ? (
                  <p className={styles.muted}>No terms mapped yet.</p>
                ) : (
                  <ul className={styles.levelTerms}>
                    {levelTerms.map((entry) => (
                      <li key={entry.term}>
                        <strong>{entry.term}</strong>{" "}
                        <span className={styles.muted}>
                          ({Math.round(entry.confidence * 100)}% fit, {entry.occurrences}x)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={styles.heading}>All terms / posts</h2>
        <ol className={styles.posts}>
          {posts.map((post) => (
            <li key={post.id} className={styles.post}>
              <h3 className={styles.postTitle}>
                <Link href={`/${post.id}`}>{post.title}</Link>
              </h3>
              <p className={styles.postDescription}>
                Last edited: {formatDate(post.lastEdited)}
              </p>
              <Link href={`/${post.id}`}>Read details →</Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
