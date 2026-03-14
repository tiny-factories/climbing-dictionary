import { Client } from "@notionhq/client";

const notionToken = process.env.NOTION_TOKEN;
const notion = notionToken ? new Client({ auth: notionToken }) : null;
export const hasNotionConfig = Boolean(
  process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID
);

const paginate = async (callback) => {
  let cursor = undefined;
  const allResults = [];

  while (true) {
    const response = await callback(cursor);
    allResults.push(...(response.results || []));

    if (!response.has_more || !response.next_cursor) {
      break;
    }

    cursor = response.next_cursor;
  }

  return allResults;
};

export const getDatabase = async (databaseId) => {
  if (!notion || !databaseId) {
    return [];
  }

  return paginate((startCursor) =>
    notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    })
  );
};

export const getPage = async (pageId) => {
  if (!notion || !pageId) {
    return null;
  }

  try {
    return await notion.pages.retrieve({ page_id: pageId });
  } catch {
    return null;
  }
};

export const getBlocks = async (blockId) => {
  if (!notion || !blockId) {
    return [];
  }

  return paginate((startCursor) =>
    notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: 100,
    })
  );
};

export const getBlockRichText = (value) => value?.rich_text ?? value?.text ?? [];

export const getPlainText = (richText = []) =>
  richText
    .map((segment) => segment?.plain_text ?? segment?.text?.content ?? "")
    .join("");

export const getPageTitle = (page) =>
  getPlainText(page?.properties?.Name?.title ?? []) || "Untitled";
