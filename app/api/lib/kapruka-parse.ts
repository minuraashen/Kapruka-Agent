// The Kapruka MCP returns human-readable Markdown strings rather than JSON.
// These helpers turn that Markdown into structured product data so the UI can
// render rich product cards / carousels instead of a wall of text.

export interface ParsedProduct {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  in_stock: boolean;
  stock_label?: string;
  ships_internationally?: boolean;
  url?: string;
  image?: string;
  description?: string;
  category?: string;
  vendor?: string;
}

/**
 * MCP tool results are normalized to either a raw string or an object shaped
 * like `{ result: "..." }`. Pull the Markdown text out of whatever we get.
 */
export function extractMarkdown(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (typeof r.result === "string") return r.result;
    if (typeof r.text === "string") return r.text;
  }
  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

const CURRENCY_RE = /\b(LKR|USD|GBP|AUD|CAD|EUR)\b/i;

function parsePrice(line: string): { price: number; currency: string } {
  const currencyMatch = line.match(CURRENCY_RE);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : "LKR";
  // Grab the number that follows the currency code.
  const priceMatch = line.match(
    new RegExp(`${currency}\\s*([\\d,]+(?:\\.\\d+)?)`, "i")
  );
  const price = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 0;
  return { price, currency };
}

/**
 * Parse the Markdown returned by `kapruka_search_products` into a product list.
 *
 * Expected shape (per product):
 *   **1. Royal Chocolate Drizzle Tower Cake**
 *      ID: `CAKE00KA001783` · LKR 6,850 · In stock (low) · ships internationally
 *      [View product](https://www.kapruka.com/...)
 */
export function parseSearchResults(markdown: string): ParsedProduct[] {
  const lines = markdown.split("\n");
  const products: ParsedProduct[] = [];
  let current: ParsedProduct | null = null;

  const pushCurrent = () => {
    if (current && current.product_id) products.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // New product header: **1. Name**
    const nameMatch = line.match(/^\*\*\d+\.\s*(.+?)\*\*$/);
    if (nameMatch) {
      pushCurrent();
      current = {
        product_id: "",
        name: nameMatch[1].trim(),
        price: 0,
        currency: "LKR",
        in_stock: true,
      };
      continue;
    }

    if (!current) continue;

    // Detail line containing the ID.
    const idMatch = line.match(/ID:\s*`([^`]+)`/i);
    if (idMatch) {
      current.product_id = idMatch[1].trim();
      const { price, currency } = parsePrice(line);
      current.price = price;
      current.currency = currency;
      current.in_stock = !/out of stock/i.test(line);
      const stockMatch = line.match(/(In stock(?:\s*\([^)]*\))?|Out of stock)/i);
      if (stockMatch) current.stock_label = stockMatch[1].trim();
      current.ships_internationally = /ships internationally/i.test(line);
      continue;
    }

    // View product link.
    const urlMatch = line.match(/\[View product\]\((https?:\/\/[^)]+)\)/i);
    if (urlMatch) {
      current.url = urlMatch[1].trim();
      continue;
    }
  }

  pushCurrent();
  return products;
}

/**
 * Parse the Markdown returned by `kapruka_get_product` into a single product
 * (this is the only tool that returns an image URL).
 */
export function parseProductDetail(markdown: string): ParsedProduct | null {
  const nameMatch = markdown.match(/^##\s*(.+)$/m);
  const idMatch = markdown.match(/\*\*ID\*\*:\s*`?([^`\n]+)`?/i);
  if (!nameMatch && !idMatch) return null;

  const { price, currency } = parsePrice(
    markdown.match(/\*\*Price\*\*:\s*(.+)/i)?.[1] ?? ""
  );
  const imageMatch = markdown.match(/\*\*Image\*\*:\s*(https?:\/\/\S+)/i);
  const urlMatch = markdown.match(/\[View on Kapruka\]\((https?:\/\/[^)]+)\)/i);
  const categoryMatch = markdown.match(/\*\*Category\*\*:\s*(.+)/i);
  const vendorMatch = markdown.match(/\*\*Vendor\*\*:\s*(.+)/i);
  const stockMatch = markdown.match(/\*\*Stock\*\*:\s*(.+)/i);

  // Description: the free-text paragraph after the metadata block.
  let description: string | undefined;
  const descMatch = markdown.match(/\n\n([^*#\n][^\n]{40,})/);
  if (descMatch) description = descMatch[1].trim();

  return {
    product_id: (idMatch?.[1] ?? "").trim(),
    name: (nameMatch?.[1] ?? "").trim(),
    price,
    currency,
    in_stock: stockMatch ? !/out of stock/i.test(stockMatch[1]) : true,
    stock_label: stockMatch?.[1]?.trim(),
    image: imageMatch?.[1]?.trim(),
    url: urlMatch?.[1]?.trim(),
    category: categoryMatch?.[1]?.trim(),
    vendor: vendorMatch?.[1]?.trim(),
    description,
  };
}
