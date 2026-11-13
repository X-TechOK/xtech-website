# How to Post on the X-Tech Blog ("Insights")

Your blog lives at **https://x-tech.tv/blog/**. Every post is one small text file in the
`_posts` folder. When a new file lands on GitHub, the site rebuilds itself in about
1–2 minutes and the post appears — no extra steps.

There are three ways to post. Pick whichever fits the moment.

---

## Option 1 — Visual editor (easiest, no code)

Uses **Pages CMS**, a free editor that works like a simple word processor and saves
straight to this GitHub repo.

**One-time setup (about 2 minutes):**
1. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.
2. Approve access to the `X-TechOK/xtech-website` repository.
3. Open the repo. You'll see **Blog Posts** in the left menu.

**Every time you post:**
1. Click **Blog Posts → Add an entry**.
2. Fill in Title, Summary, Topic, and (optional) a cover image.
3. Write the post in the big editor box. Use the toolbar for headings, bold, lists, links, and pictures.
4. Leave **Published** switched on to go live, or off to save it as a hidden draft.
5. Click **Save**. The post is live in 1–2 minutes.

To edit or unpublish later, open the post in Pages CMS, change it, and Save.

---

## Option 2 — Directly on GitHub.com (no extra tools)

1. Open `BLOG-POST-TEMPLATE.md` in the repo on GitHub and copy everything.
2. Go into the `_posts` folder and click **Add file → Create new file**.
3. Name it `YEAR-MONTH-DAY-short-title.md` — e.g. `2026-11-20-why-paper-still-costs-you.md`.
4. Paste the template, fill in the top section, replace the sample text with your post.
5. Click **Commit changes**. Live in 1–2 minutes.

**Adding pictures:** upload them to `assets/images/blog/` (Add file → Upload files), then
refer to them as `/assets/images/blog/your-picture.jpg`.

---

## Option 3 — With Claude

Tell Claude something like:

> "Write a blog post for the X-Tech site about how scanning paper invoices into Laserfiche
> saves AP time. Audience: owners of 20–200 person companies. ~800 words."

Claude will draft it in the right format (top section included), and can save it into
your local `xtech-website/_posts` folder for you to review in GitHub Desktop and push —
or you can paste the draft into Pages CMS.

---

## Rules that keep things working

| Do | Why |
|---|---|
| File name starts with the date: `2026-11-20-...md` | Jekyll ignores posts without a date in the name |
| Use lowercase-and-dashes for the short title | It becomes the web address |
| Keep the `---` lines at the top of the file | They separate the settings from the post text |
| Put quotes around titles that contain a colon `:` | A bare colon confuses the settings section |
| Future dates won't appear until that day **and** the next site rebuild | GitHub Pages doesn't publish future-dated posts |

**Hiding a post:** set `published: false` (or flip the switch off in Pages CMS).
**Deleting a post:** delete its file from `_posts`.

## What each post gets automatically
- A page at `x-tech.tv/blog/short-title/` styled to match the site
- Reading-time estimate, date, and topic
- "Book a Free Consultation" box at the end
- LinkedIn and email share links
- Listing on the blog page, the sitemap (for Google), and the RSS feed (`/feed.xml`)
- Proper preview card when the link is shared on LinkedIn (uses the cover image if you set one)
