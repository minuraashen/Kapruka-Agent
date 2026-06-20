import { useChatStore } from "@/store/chatStore";

export type Lang = "en" | "si";

// Full UI-chrome localization. Kiki's *replies* are localized by the agent
// (the language is sent with every message); this dictionary localizes
// everything around the conversation — sidebar, header, inputs, cards, flows.
export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Splash
    "splash.tagline": "Your Smart Shopping Companion for Kapruka",
    "splash.cta": "Let's Shop!",

    // Greeting (templated with {name})
    "greeting": "Ayubowan, {name}! 🙏 I'm **Kiki**, your shopping buddy for Kapruka. I can find gifts, cakes, flowers and more — quote delivery anywhere in Sri Lanka, and take you all the way to checkout. What are we shopping for today?",
    "greeting.fallbackName": "there",

    // Sidebar
    "sidebar.newChat": "New chat",
    "sidebar.explore": "Explore",
    "sidebar.gifts": "Gifts",
    "sidebar.shop": "Shop",
    "sidebar.track": "Track order",
    "sidebar.liveTitle": "Live Kapruka catalog",
    "sidebar.liveSub": "Real products, real delivery quotes, real guest checkout.",
    "sidebar.guest": "Guest",
    "sidebar.logout": "Log out",
    "sidebar.signIn": "Personalize",

    // History rail
    "history.title": "This chat",
    "history.sub": "Your recent asks",
    "history.empty": "Your questions will show up here as you chat with Kiki.",
    "history.clear": "Clear chat",

    // Header
    "header.online": "Online",
    "header.subtitle": "Sri Lanka shopping & gifting assistant",
    "header.newChat": "New chat",
    "theme.light": "Light Glow",
    "theme.midnight": "Midnight",
    "theme.sunset": "Sunset Coral",

    // Input bar
    "input.placeholder": "Ask Kiki for gifts, cakes, flowers… (English / සිංහල / Tanglish)",
    "input.footer": "Kiki shops the live Kapruka catalog · Prices in LKR",
    "input.voiceStart": "Speak to Kiki",
    "input.voiceStop": "Listening… tap to stop",
    "quick.gift": "Gift ideas",
    "quick.cake": "Birthday cake",
    "quick.flowers": "Flowers",
    "quick.track": "Track order",

    // Onboarding
    "onb.giftTitle": "Send a Gift",
    "onb.giftDesc": "Find the perfect gift for someone special",
    "onb.shopTitle": "Shop for Myself",
    "onb.shopDesc": "Browse and buy products for yourself",
    "onb.trackTitle": "Track an Order",
    "onb.trackDesc": "Check the status of your existing order",
    "onb.genieTitle": "Gift Genie",
    "onb.genieDesc": "Answer 3 quick questions, get curated picks",

    // Festival chips
    "festival.title": "Shop the season",
    "festival.avurudu": "Avurudu",
    "festival.vesak": "Vesak",
    "festival.christmas": "Christmas",
    "festival.birthday": "Birthday",

    // Gift Genie
    "genie.title": "Gift Genie",
    "genie.subtitle": "Three taps to the perfect gift ✨",
    "genie.q1": "Who's it for?",
    "genie.q2": "What's the occasion?",
    "genie.q3": "Your budget?",
    "genie.who.mother": "Mother",
    "genie.who.father": "Father",
    "genie.who.partner": "Partner",
    "genie.who.friend": "Friend",
    "genie.who.child": "Child",
    "genie.who.colleague": "Colleague",
    "genie.occasion.birthday": "Birthday",
    "genie.occasion.anniversary": "Anniversary",
    "genie.occasion.thankyou": "Thank you",
    "genie.occasion.getwell": "Get well",
    "genie.occasion.congrats": "Congrats",
    "genie.occasion.justbecause": "Just because",
    "genie.budget.low": "Under LKR 3,000",
    "genie.budget.mid": "LKR 3,000–7,000",
    "genie.budget.high": "LKR 7,000+",
    "genie.find": "Find my gift",
    "genie.back": "Back",
    "genie.cancel": "Cancel",
    "genie.promptTemplate": "Help me find a gift for my {who} for {occasion}, budget {budget}. Show me some lovely options and recommend your favourite.",

    // Thinking / tool status
    "think.default": "Kiki is thinking…",
    "think.search": "Searching the Kapruka catalog…",
    "think.delivery": "Checking delivery options…",
    "think.track": "Looking up your order…",
    "think.order": "Placing your order…",
    "think.curate": "Curating the best picks for you…",

    // Action chips (under completed messages)
    "action.searched": "Searched catalog",
    "action.delivery": "Checked delivery",
    "action.track": "Tracked order",
    "action.order": "Created order",
    "action.product": "Viewed product",
    "action.categories": "Browsed categories",
    "action.cities": "Found cities",

    // Cart
    "cart.title": "Your Cart",
    "cart.items": "{n} items",
    "cart.empty": "Your cart is empty",
    "cart.emptyHint": "Add items from the product carousel!",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.add": "Add",
    "cart.added": "Added",
    "cart.outOfStock": "Out of Stock",
    "cart.noPreview": "No preview",

    // Delivery card
    "delivery.title": "Delivery quote",
    "delivery.available": "Delivery available",
    "delivery.unavailable": "Not available",
    "delivery.fee": "Delivery fee",
    "delivery.to": "To",
    "delivery.date": "Date",

    // Tracking card
    "track.title": "Order status",
    "track.order": "Order",
    "track.status": "Status",

    // Order confirmation
    "order.created": "Order Created!",
    "order.placed": "Your order has been placed successfully.",
    "order.payNow": "Pay Now",
    "order.number": "Order #{n}",

    // Checkout form
    "checkout.recipient": "Recipient",
    "checkout.delivery": "Delivery",
    "checkout.sender": "Sender",
    "checkout.recipientDetails": "Recipient Details",
    "checkout.deliveryDetails": "Delivery Details",
    "checkout.yourDetails": "Your Details",
    "checkout.fullName": "Full Name *",
    "checkout.address": "Address *",
    "checkout.city": "City * (e.g., Colombo, Kandy)",
    "checkout.phone": "Phone Number *",
    "checkout.emailOpt": "Email (optional)",
    "checkout.instructions": "Delivery Instructions (optional)",
    "checkout.sendGift": "Send as a gift?",
    "checkout.quickMessages": "Quick messages",
    "checkout.giftPlaceholder": "Write your gift message…",
    "checkout.giftCard": "Gift card",
    "checkout.yourName": "Your Name *",
    "checkout.yourEmail": "Your Email *",
    "checkout.yourPhone": "Your Phone (optional)",
    "checkout.summary": "Order Summary",
    "checkout.giftMessage": "Gift message: ",
    "checkout.back": "Back",
    "checkout.continue": "Continue",
    "checkout.placeOrder": "Place Order",
    "checkout.processing": "Processing...",
    "checkout.backToChat": "Back to Chat",
    "checkout.checkingDelivery": "Checking delivery…",
    "checkout.deliveryOk": "Delivery available to {city}",
    "checkout.deliveryFee": "Delivery fee: LKR {fee}",
    "checkout.deliveryBad": "Delivery may not be available for this city/date.",

    // Language toggle
    "lang.label": "Language",
    "lang.en": "English",
    "lang.si": "සිංහල",

    // Login
    "login.welcome": "Welcome to Kapruka Kiki",
    "login.sub": "Your dynamic AI shopping companion",
    "login.name": "Your Name",
    "login.namePlaceholder": "e.g. John Doe",
    "login.email": "Email Address",
    "login.emailPlaceholder": "e.g. john@example.com",
    "login.start": "Let's Start Shopping",
    "login.or": "Or",
    "login.guest": "Continue as Guest",
    "login.errName": "Please enter your name.",
    "login.errEmail": "Please enter a valid email address.",
  },

  si: {
    "splash.tagline": "Kapruka සඳහා ඔබේ බුද්ධිමත් සාප්පු සහායකයා",
    "splash.cta": "සාප්පු යමු!",

    "greeting": "ආයුබෝවන්, {name}! 🙏 මම **Kiki**, Kapruka සඳහා ඔබේ සාප්පු මිතුරා. තෑගි, කේක්, මල් සහ තවත් දේ සොයාගන්න, ශ්‍රී ලංකාවේ ඕනෑම තැනකට බෙදාහැරීම් මිල ගණන් කරන්න, සහ ඔබව චෙක්අවුට් දක්වා ගෙනියන්න මට පුළුවන්. අද අපි මොනවද මිලදී ගන්නේ?",
    "greeting.fallbackName": "ඔබට",

    "sidebar.newChat": "නව කතාබහක්",
    "sidebar.explore": "ගවේෂණය",
    "sidebar.gifts": "තෑගි",
    "sidebar.shop": "සාප්පුව",
    "sidebar.track": "ඇණවුම සොයන්න",
    "sidebar.liveTitle": "සජීවී Kapruka නාමාවලිය",
    "sidebar.liveSub": "සැබෑ භාණ්ඩ, සැබෑ බෙදාහැරීම් මිල, සැබෑ චෙක්අවුට්.",
    "sidebar.guest": "අමුත්තා",
    "sidebar.logout": "ඉවත් වන්න",
    "sidebar.signIn": "පුද්ගලීකරණය",

    "history.title": "මෙම කතාබහ",
    "history.sub": "ඔබේ මෑත විමසුම්",
    "history.empty": "ඔබ Kiki සමඟ කතා කරන විට ඔබේ ප්‍රශ්න මෙහි පෙන්වයි.",
    "history.clear": "කතාබහ මකන්න",

    "header.online": "සබැඳි",
    "header.subtitle": "ශ්‍රී ලංකා සාප්පු සහ තෑගි සහායකයා",
    "header.newChat": "නව කතාබහක්",
    "theme.light": "ආලෝකය",
    "theme.midnight": "මධ්‍යම රාත්‍රිය",
    "theme.sunset": "හිරු බැස යාම",

    "input.placeholder": "Kiki ගෙන් තෑගි, කේක්, මල් ඉල්ලන්න… (English / සිංහල / Tanglish)",
    "input.footer": "Kiki සජීවී Kapruka නාමාවලියෙන් සාප්පු කරයි · මිල LKR වලින්",
    "input.voiceStart": "Kiki සමඟ කතා කරන්න",
    "input.voiceStop": "සවන් දෙමින්… නැවැත්වීමට තට්ටු කරන්න",
    "quick.gift": "තෑගි අදහස්",
    "quick.cake": "උපන්දින කේක්",
    "quick.flowers": "මල්",
    "quick.track": "ඇණවුම සොයන්න",

    "onb.giftTitle": "තෑගි යවන්න",
    "onb.giftDesc": "විශේෂ කෙනෙකුට පරිපූර්ණ තෑග්ග සොයන්න",
    "onb.shopTitle": "මට සාප්පු යන්න",
    "onb.shopDesc": "ඔබ වෙනුවෙන් භාණ්ඩ බලන්න සහ මිලදී ගන්න",
    "onb.trackTitle": "ඇණවුමක් සොයන්න",
    "onb.trackDesc": "ඔබේ ඇණවුමේ තත්ත්වය පරීක්ෂා කරන්න",
    "onb.genieTitle": "තෑගි Genie",
    "onb.genieDesc": "ප්‍රශ්න 3කට පිළිතුරු දී තෝරාගත් යෝජනා ලබාගන්න",

    "festival.title": "සෘතුවට සාප්පු යන්න",
    "festival.avurudu": "අවුරුදු",
    "festival.vesak": "වෙසක්",
    "festival.christmas": "නත්තල",
    "festival.birthday": "උපන්දිනය",

    "genie.title": "තෑගි Genie",
    "genie.subtitle": "පරිපූර්ණ තෑග්ගට තට්ටු තුනයි ✨",
    "genie.q1": "කාටද?",
    "genie.q2": "අවස්ථාව මොකක්ද?",
    "genie.q3": "ඔබේ අයවැය?",
    "genie.who.mother": "අම්මා",
    "genie.who.father": "තාත්තා",
    "genie.who.partner": "සහකරු",
    "genie.who.friend": "මිතුරා",
    "genie.who.child": "දරුවා",
    "genie.who.colleague": "සහෝද්‍යෝගියා",
    "genie.occasion.birthday": "උපන්දිනය",
    "genie.occasion.anniversary": "සංවත්සරය",
    "genie.occasion.thankyou": "ස්තූතියි",
    "genie.occasion.getwell": "සුවය ලැබේවා",
    "genie.occasion.congrats": "සුබ පැතුම්",
    "genie.occasion.justbecause": "නිකම්ම",
    "genie.budget.low": "LKR 3,000 ට අඩු",
    "genie.budget.mid": "LKR 3,000–7,000",
    "genie.budget.high": "LKR 7,000+",
    "genie.find": "මගේ තෑග්ග සොයන්න",
    "genie.back": "ආපසු",
    "genie.cancel": "අවලංගු කරන්න",
    "genie.promptTemplate": "මගේ {who}ට {occasion} සඳහා {budget} අයවැයකින් තෑග්ගක් සොයාගන්න උදව් කරන්න. හොඳ විකල්ප කිහිපයක් පෙන්වා ඔබේ ප්‍රියතමය යෝජනා කරන්න.",

    "think.default": "Kiki සිතමින්…",
    "think.search": "Kapruka නාමාවලිය සොයමින්…",
    "think.delivery": "බෙදාහැරීම් විකල්ප පරීක්ෂා කරමින්…",
    "think.track": "ඔබේ ඇණවුම සොයමින්…",
    "think.order": "ඔබේ ඇණවුම තබමින්…",
    "think.curate": "ඔබට හොඳම යෝජනා තෝරමින්…",

    "action.searched": "නාමාවලිය සෙවීය",
    "action.delivery": "බෙදාහැරීම පරීක්ෂා කළා",
    "action.track": "ඇණවුම සෙවීය",
    "action.order": "ඇණවුම සෑදීය",
    "action.product": "භාණ්ඩය බැලීය",
    "action.categories": "ප්‍රවර්ග බැලීය",
    "action.cities": "නගර සෙවීය",

    "cart.title": "ඔබේ කරත්තය",
    "cart.items": "අයිතම {n}",
    "cart.empty": "ඔබේ කරත්තය හිස්ය",
    "cart.emptyHint": "භාණ්ඩ කැරොසලයෙන් අයිතම එක් කරන්න!",
    "cart.total": "මුළු එකතුව",
    "cart.checkout": "චෙක්අවුට් වෙත යන්න",
    "cart.add": "එක් කරන්න",
    "cart.added": "එක් කළා",
    "cart.outOfStock": "තොගයේ නැත",
    "cart.noPreview": "පෙරදසුනක් නැත",

    "delivery.title": "බෙදාහැරීම් මිල",
    "delivery.available": "බෙදාහැරීම තිබේ",
    "delivery.unavailable": "ලබා ගත නොහැක",
    "delivery.fee": "බෙදාහැරීම් ගාස්තුව",
    "delivery.to": "වෙත",
    "delivery.date": "දිනය",

    "track.title": "ඇණවුම් තත්ත්වය",
    "track.order": "ඇණවුම",
    "track.status": "තත්ත්වය",

    "order.created": "ඇණවුම සෑදුණා!",
    "order.placed": "ඔබේ ඇණවුම සාර්ථකව තබා ඇත.",
    "order.payNow": "දැන් ගෙවන්න",
    "order.number": "ඇණවුම #{n}",

    "checkout.recipient": "ලබන්නා",
    "checkout.delivery": "බෙදාහැරීම",
    "checkout.sender": "යවන්නා",
    "checkout.recipientDetails": "ලබන්නාගේ විස්තර",
    "checkout.deliveryDetails": "බෙදාහැරීම් විස්තර",
    "checkout.yourDetails": "ඔබේ විස්තර",
    "checkout.fullName": "සම්පූර්ණ නම *",
    "checkout.address": "ලිපිනය *",
    "checkout.city": "නගරය * (උදා: කොළඹ, මහනුවර)",
    "checkout.phone": "දුරකථන අංකය *",
    "checkout.emailOpt": "ඊමේල් (විකල්ප)",
    "checkout.instructions": "බෙදාහැරීම් උපදෙස් (විකල්ප)",
    "checkout.sendGift": "තෑග්ගක් ලෙස යවන්නද?",
    "checkout.quickMessages": "ඉක්මන් පණිවිඩ",
    "checkout.giftPlaceholder": "ඔබේ තෑගි පණිවිඩය ලියන්න…",
    "checkout.giftCard": "තෑගි කාඩ්පත",
    "checkout.yourName": "ඔබේ නම *",
    "checkout.yourEmail": "ඔබේ ඊමේල් *",
    "checkout.yourPhone": "ඔබේ දුරකථනය (විකල්ප)",
    "checkout.summary": "ඇණවුම් සාරාංශය",
    "checkout.giftMessage": "තෑගි පණිවිඩය: ",
    "checkout.back": "ආපසු",
    "checkout.continue": "ඉදිරියට",
    "checkout.placeOrder": "ඇණවුම තබන්න",
    "checkout.processing": "සැකසෙමින්...",
    "checkout.backToChat": "කතාබහට ආපසු",
    "checkout.checkingDelivery": "බෙදාහැරීම පරීක්ෂා කරමින්…",
    "checkout.deliveryOk": "{city} වෙත බෙදාහැරීම තිබේ",
    "checkout.deliveryFee": "බෙදාහැරීම් ගාස්තුව: LKR {fee}",
    "checkout.deliveryBad": "මෙම නගරයට/දිනයට බෙදාහැරීම ලබා ගත නොහැකි විය හැක.",

    "lang.label": "භාෂාව",
    "lang.en": "English",
    "lang.si": "සිංහල",

    "login.welcome": "Kapruka Kiki වෙත සාදරයෙන් පිළිගනිමු",
    "login.sub": "ඔබේ ගතික AI සාප්පු සහායකයා",
    "login.name": "ඔබේ නම",
    "login.namePlaceholder": "උදා: John Doe",
    "login.email": "ඊමේල් ලිපිනය",
    "login.emailPlaceholder": "උදා: john@example.com",
    "login.start": "සාප්පු යාම අරඹමු",
    "login.or": "හෝ",
    "login.guest": "අමුත්තෙකු ලෙස ඉදිරියට",
    "login.errName": "කරුණාකර ඔබේ නම ඇතුළත් කරන්න.",
    "login.errEmail": "කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
  },
};

// Localized prompts the agent receives (so the user's own bubble matches the
// UI language). Kiki's reply language is enforced server-side too.
export const localizedPrompts: Record<Lang, Record<string, string>> = {
  en: {
    explore: "Show me popular Kapruka gifts and hampers right now.",
    gifts: "Help me find a thoughtful gift for someone special.",
    shop: "I want to shop for something for myself.",
    track: "I'd like to track my order.",
    quickGift: "Help me find a thoughtful gift under LKR 5000.",
    quickCake: "Show me birthday cakes you can deliver in Colombo.",
    quickFlowers: "I want to send fresh flowers for an anniversary.",
    onbGift: "I'd like to send a gift to someone!",
    onbShop: "I want to shop for something!",
    onbTrack: "I'd like to track my order",
    festAvurudu: "Show me Avurudu (Sinhala & Tamil New Year) gift hampers and sweets.",
    festVesak: "Show me Vesak gifts, lanterns and treats.",
    festChristmas: "Show me Christmas gift hampers and cakes.",
    festBirthday: "Show me birthday cakes and gift ideas.",
  },
  si: {
    explore: "මේ වෙලාවේ ජනප්‍රිය Kapruka තෑගි සහ හැම්පර් පෙන්වන්න.",
    gifts: "විශේෂ කෙනෙකුට හොඳ තෑග්ගක් සොයාගන්න උදව් කරන්න.",
    shop: "මට මට්ටම් දෙයක් මිලදී ගන්න ඕන.",
    track: "මට මගේ ඇණවුම සොයන්න ඕන.",
    quickGift: "LKR 5000ට අඩු හොඳ තෑග්ගක් සොයාගන්න උදව් කරන්න.",
    quickCake: "කොළඹ බෙදාහැරිය හැකි උපන්දින කේක් පෙන්වන්න.",
    quickFlowers: "සංවත්සරයකට අලුත් මල් යවන්න ඕන.",
    onbGift: "මට කෙනෙකුට තෑග්ගක් යවන්න ඕන!",
    onbShop: "මට යමක් මිලදී ගන්න ඕන!",
    onbTrack: "මට මගේ ඇණවුම සොයන්න ඕන",
    festAvurudu: "අවුරුදු තෑගි හැම්පර් සහ රසකැවිලි පෙන්වන්න.",
    festVesak: "වෙසක් තෑගි, කූඩු සහ රසකැවිලි පෙන්වන්න.",
    festChristmas: "නත්තල් තෑගි හැම්පර් සහ කේක් පෙන්වන්න.",
    festBirthday: "උපන්දින කේක් සහ තෑගි අදහස් පෙන්වන්න.",
  },
};

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

export function useT() {
  const lang = (useChatStore((s) => s.language) || "en") as Lang;
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
  const p = (key: string) => localizedPrompts[lang]?.[key] ?? localizedPrompts.en[key] ?? key;
  return { t, p, lang };
}
