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

// ── Order / delivery / tracking parsers ────────────────────────────────────
// The MCP returns Markdown for these too. We parse out the useful bits for
// rich UI cards, but always keep the original text as `raw` for a graceful
// fallback when a field can't be matched.

export interface ParsedOrder {
  orderNumber?: string;
  payUrl?: string;
  total?: number;
  currency?: string;
  raw: string;
}

export function parseOrderResult(raw: unknown): ParsedOrder {
  const text = extractMarkdown(raw);
  const payUrl =
    text.match(/\]\((https?:\/\/[^)]*(?:pay|checkout|order|payment)[^)]*)\)/i)?.[1] ??
    text.match(/(https?:\/\/\S*(?:pay|checkout|order|payment)\S*)/i)?.[1];
  const orderNumber =
    text.match(/order\s*(?:number|no\.?|#|id)\s*[:#]?\s*`?([A-Z0-9][A-Z0-9-]{3,})`?/i)?.[1] ??
    text.match(/\border\s+`?([A-Z0-9]{4,}[A-Z0-9-]*)`?/i)?.[1] ??
    text.match(/#\s*([A-Z0-9][A-Z0-9-]{3,})/)?.[1];

  let total: number | undefined;
  let currency: string | undefined;
  const totalLine = text.match(/total[^\n]*?(LKR|USD|GBP|AUD|CAD|EUR)\s*([\d,]+(?:\.\d+)?)/i);
  if (totalLine) {
    currency = totalLine[1].toUpperCase();
    total = Number(totalLine[2].replace(/,/g, ""));
  }

  return {
    orderNumber: orderNumber?.trim(),
    payUrl: payUrl?.trim(),
    total,
    currency,
    raw: text,
  };
}

export interface ParsedDelivery {
  available: boolean;
  city?: string;
  date?: string;
  fee?: number;
  currency?: string;
  note?: string;
  raw: string;
}

export function parseDeliveryResult(raw: unknown): ParsedDelivery {
  const text = extractMarkdown(raw);
  // Treat error responses (e.g. "Error (city_not_found): Unknown city ...")
  // and explicit negatives as NOT available, so the UI never shows a green
  // "delivery available" card for what is really a failure.
  const available =
    !/\b(error|unknown city|not found|invalid|not available|unavailable|cannot deliver|can't deliver|no delivery|not deliverable|not possible)\b/i.test(
      text
    );

  // Fee: prefer a keyworded line ("fee/charge/rate ... LKR 300"); otherwise
  // fall back to the first currency amount anywhere in the (short) response.
  const feeMatch =
    text.match(
      /(?:fee|charge|cost|rate|flat rate)[^\n]*?(LKR|USD|GBP|AUD|CAD|EUR)\s*([\d,]+(?:\.\d+)?)/i
    ) ?? text.match(/(LKR|USD|GBP|AUD|CAD|EUR)\s*([\d,]+(?:\.\d+)?)/i);
  const fee = feeMatch ? Number(feeMatch[2].replace(/,/g, "")) : undefined;
  const currency = feeMatch ? feeMatch[1].toUpperCase() : undefined;

  // City: the response title is "## Delivery to <City> on <date>".
  const cityMatch =
    text.match(/delivery to\s+(.+?)\s+on\b/i) ??
    text.match(/\b(?:to|city)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9\s]{1,30})/i);
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);

  return {
    available,
    city: cityMatch?.[1]?.trim(),
    date: dateMatch?.[1],
    fee,
    currency,
    note: text.split("\n").map((l) => l.trim()).find((l) => l.length > 0),
    raw: text,
  };
}

export interface ParsedTracking {
  orderNumber?: string;
  status?: string;
  steps?: Array<{ label: string; done: boolean }>;
  raw: string;
}

export function parseTrackingResult(raw: unknown): ParsedTracking {
  const text = extractMarkdown(raw);
  const orderNumber =
    text.match(/order\s*(?:number|no\.?|#|id)\s*[:#]?\s*`?([A-Z0-9][A-Z0-9-]{3,})`?/i)?.[1] ??
    text.match(/#\s*([A-Z0-9][A-Z0-9-]{3,})/)?.[1];
  const status =
    text.match(/\*\*Status\*\*:\s*(.+)/i)?.[1]?.trim() ??
    text.match(/status\s*[:\-]\s*(.+)/i)?.[1]?.trim();

  // Pull bullet lines as a loose timeline of milestones.
  const steps = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-*•]\s+/.test(l))
    .map((l) => {
      const label = l.replace(/^[-*•]\s+/, "").replace(/[*`]/g, "").trim();
      const done = /✓|✅|done|completed|delivered|dispatched|shipped|confirmed|packed/i.test(label);
      return { label, done };
    });

  return {
    orderNumber: orderNumber?.trim(),
    status,
    steps: steps.length > 0 ? steps : undefined,
    raw: text,
  };
}
