import Link from "next/link";
import styles from "./index.module.css";
import { mapTermsToExperienceBuckets, EXPERIENCE_LEVELS } from "../lib/climbing-terms";
import { getDatabase, getPageTitle, hasNotionConfig } from "../lib/notion";

const databaseId = process.env.NOTION_DATABASE_ID;
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
  const posts = await getDatabase(databaseId);
  const terms = posts.map((post) => getPageTitle(post)).filter(Boolean);
  const termMap = mapTermsToExperienceBuckets(terms);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Climbing terms from your Notion database</h1>
        <p>
          This project was refreshed to modern Next.js and now maps your current
          climbing term list to the experience level where each term is most
          frequently encountered.
        </p>
        {!hasNotionConfig && (
          <p className={styles.muted}>
            Add <code>NOTION_TOKEN</code> and <code>NOTION_DATABASE_ID</code> in
            <code>.env.local</code> to load your live terms.
          </p>
        )}
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
                <Link href={`/${post.id}`}>{getPageTitle(post)}</Link>
              </h3>
              <p className={styles.postDescription}>
                Last edited: {formatDate(post.last_edited_time)}
              </p>
              <Link href={`/${post.id}`}>Read details →</Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
