import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlocks, getBlockRichText, getDatabase, getPage, getPageTitle } from "../../lib/notion";
import styles from "../post.module.css";

export const revalidate = 60;

const Text = ({ text = [] }) => {
  if (!text.length) {
    return null;
  }

  return text.map((value, index) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline } = {},
      text: textNode = {},
      href,
      plain_text: plainText,
    } = value;

    const content = textNode.content ?? plainText ?? "";
    const linkUrl = textNode.link?.url ?? href;

    return (
      <span
        key={`${content}-${index}`}
        className={[
          bold ? styles.bold : "",
          code ? styles.code : "",
          italic ? styles.italic : "",
          strikethrough ? styles.strikethrough : "",
          underline ? styles.underline : "",
        ].join(" ")}
        style={color && color !== "default" ? { color } : {}}
      >
        {linkUrl ? <a href={linkUrl}>{content}</a> : content}
      </span>
    );
  });
};

const renderNestedList = (block) => {
  const { type } = block;
  const value = block[type];
  if (!value?.children?.length) {
    return null;
  }

  const isNumberedList = value.children[0].type === "numbered_list_item";
  if (isNumberedList) {
    return <ol>{value.children.map((child) => renderBlock(child))}</ol>;
  }

  return <ul>{value.children.map((child) => renderBlock(child))}</ul>;
};

const renderBlock = (block) => {
  const { type, id } = block;
  const value = block[type];
  const richText = getBlockRichText(value);

  switch (type) {
    case "paragraph":
      return (
        <p>
          <Text text={richText} />
        </p>
      );
    case "heading_1":
      return (
        <h1>
          <Text text={richText} />
        </h1>
      );
    case "heading_2":
      return (
        <h2>
          <Text text={richText} />
        </h2>
      );
    case "heading_3":
      return (
        <h3>
          <Text text={richText} />
        </h3>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li key={id}>
          <Text text={richText} />
          {renderNestedList(block)}
        </li>
      );
    case "to_do":
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} checked={Boolean(value.checked)} readOnly />{" "}
            <Text text={richText} />
          </label>
        </div>
      );
    case "toggle":
      return (
        <details>
          <summary>
            <Text text={richText} />
          </summary>
          {value.children?.map((child) => (
            <Fragment key={child.id}>{renderBlock(child)}</Fragment>
          ))}
        </details>
      );
    case "child_page":
      return <p>{value.title}</p>;
    case "image": {
      const src = value.type === "external" ? value.external.url : value.file.url;
      const caption = value.caption?.[0]?.plain_text || "";
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "divider":
      return <hr key={id} />;
    case "quote":
      return <blockquote key={id}>{richText[0]?.plain_text}</blockquote>;
    case "code":
      return (
        <pre className={styles.pre}>
          <code className={styles.code_block} key={id}>
            {richText[0]?.plain_text}
          </code>
        </pre>
      );
    case "file": {
      const srcFile = value.type === "external" ? value.external.url : value.file.url;
      const splitSourceArray = srcFile.split("/");
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const captionFile = value.caption?.[0]?.plain_text || "";
      return (
        <figure>
          <div className={styles.file}>
            📎 <a href={srcFile}>{lastElementInArray.split("?")[0]}</a>
          </div>
          {captionFile && <figcaption>{captionFile}</figcaption>}
        </figure>
      );
    }
    case "bookmark": {
      const href = value.url;
      return (
        <a href={href} target="_blank" rel="noreferrer" className={styles.bookmark}>
          {href}
        </a>
      );
    }
    default:
      return `❌ Unsupported block (${
        type === "unsupported" ? "unsupported by Notion API" : type
      })`;
  }
};

const hydrateChildren = async (blocks) => {
  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => ({
        id: block.id,
        children: await getBlocks(block.id),
      }))
  );

  return blocks.map((block) => {
    if (block.has_children && !block[block.type]?.children) {
      block[block.type].children = childBlocks.find((x) => x.id === block.id)?.children;
    }

    return block;
  });
};

export async function generateStaticParams() {
  const database = await getDatabase(process.env.NOTION_DATABASE_ID);
  return database.map((page) => ({ id: page.id }));
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) {
    notFound();
  }

  const blocks = await getBlocks(id);
  const blocksWithChildren = await hydrateChildren(blocks);

  return (
    <article className={styles.container}>
      <h1 className={styles.name}>{getPageTitle(page)}</h1>
      <section>
        {blocksWithChildren.map((block) => (
          <Fragment key={block.id}>{renderBlock(block)}</Fragment>
        ))}
      </section>
      <Link href="/" className={styles.back}>
        ← Go home
      </Link>
    </article>
  );
}
