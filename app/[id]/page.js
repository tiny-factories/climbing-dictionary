import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById, getPostIds } from "../../lib/local-db";
import styles from "../post.module.css";

export const revalidate = 60;

const renderBlock = (block, index) => {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case "heading": {
      if (block.level === 3) {
        return <h3 key={key}>{block.text}</h3>;
      }

      if (block.level === 1) {
        return <h1 key={key}>{block.text}</h1>;
      }

      return <h2 key={key}>{block.text}</h2>;
    }
    case "paragraph":
      return <p key={key}>{block.text}</p>;
    case "quote":
      return <blockquote key={key}>{block.text}</blockquote>;
    case "code":
      return (
        <pre className={styles.pre} key={key}>
          <code className={styles.code_block}>{block.code}</code>
        </pre>
      );
    case "list": {
      const items = Array.isArray(block.items) ? block.items : [];
      if (block.style === "numbered") {
        return (
          <ol key={key}>
            {items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>{item}</li>
            ))}
          </ol>
        );
      }

      return (
        <ul key={key}>
          {items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    }
    default:
      return null;
  }
};

export async function generateStaticParams() {
  const ids = await getPostIds();
  return ids.map((id) => ({ id }));
}

const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <article className={styles.container}>
      <h1 className={styles.name}>{post.title}</h1>
      <p className={styles.meta}>Last edited: {formatDate(post.lastEdited)}</p>
      <section>{post.content.map((block, index) => renderBlock(block, index))}</section>
      <Link href="/" className={styles.back}>
        ← Go home
      </Link>
    </article>
  );
}
