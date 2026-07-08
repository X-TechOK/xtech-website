# Setup Guide: Tracking, SEO & Chatbot Upgrades

Your site now has all the wiring built in — you just need to plug in a few account IDs and paste one code block. Everything here is free and takes about 30 minutes total.

---

## 1. Google Analytics 4 (visitor counts, traffic sources, conversions) — ~10 min

1. Go to **analytics.google.com** and sign in with your Google account.
2. Click **Admin** (gear icon, bottom left) → **Create** → **Property**.
3. Name it "X-Tech Website", set your time zone (Oklahoma City = Central), currency USD.
4. For business details, pick your industry and size, then choose **"Generate leads"** as your objective.
5. Choose platform **Web**, enter `https://x-tech.tv`, name the stream "X-Tech Website".
6. You'll see a **Measurement ID** that looks like `G-ABC123XYZ`. Copy it.
7. Open `_config.yml` in your site folder and paste it between the quotes:
   ```yaml
   ga4_id: "G-ABC123XYZ"
   ```
8. Commit and push to GitHub. Done — the site injects the tracking code automatically.

**What you get:** Within 24 hours, GA4 shows visitors, where they came from (Google, LinkedIn, direct), and which pages they viewed. Your site also automatically fires these custom events so you can see what converts: `phone_click`, `email_click`, `schedule_click`, `chat_open`, `chat_message`, `chat_lead_submit`, `dna_briefing_request`, `exit_intent_shown`.

**Mark conversions:** In GA4, go to Admin → Events, find `schedule_click`, `chat_lead_submit`, and `dna_briefing_request` (after they've fired at least once) and toggle **"Mark as key event"**. Now GA4 reports which traffic sources produce actual leads, not just visits.

---

## 2. Microsoft Clarity (heatmaps + session recordings) — ~5 min

1. Go to **clarity.microsoft.com** and sign in (Google account works).
2. Click **New project**, name it "X-Tech Website", enter `x-tech.tv`.
3. On the setup page, choose **"Install manually"** and look at the code snippet — you only need the short ID inside it (looks like `abcd1234ef`, it also appears in your project's URL).
4. Paste it into `_config.yml`:
   ```yaml
   clarity_id: "abcd1234ef"
   ```
5. Commit and push. Done.

**What you get:** Recordings of real visitor sessions (anonymized) and heatmaps showing where people click and how far they scroll. This is how you'll learn whether people actually see your DNA section, where they hesitate, and what they ignore.

---

## 3. Google Search Console (how Google sees your site) — ~10 min

1. Go to **search.google.com/search-console**.
2. Click **Add property** → choose **Domain** → enter `x-tech.tv`.
3. It gives you a TXT record to add to your DNS (wherever your domain is registered). Follow its instructions, then click Verify. (If DNS feels intimidating, use the **URL prefix** option with `https://x-tech.tv` instead — you can verify through your Google Analytics account since you just set that up.)
4. Once verified, go to **Sitemaps** in the left menu, enter `sitemap.xml`, and click Submit.

**What you get:** Google now knows exactly what to index. Within a couple of weeks you'll see which search terms bring people to your site, and get alerts if anything breaks.

---

## 4. Chatbot transcript emails (one paste in Apps Script) — ~5 min

The chat widget now sends the full conversation to your backend when a visitor leaves after a meaningful chat (2+ messages) — even if they never fill out the contact form. Your Apps Script needs one new handler to receive it.

1. Open your Apps Script project (script.google.com — the one powering the chatbot).
2. Find the `doPost` function. Inside it there's a section that routes actions, like:
   ```javascript
   if (data.action === 'chat') {
     return handleChatMessage(data);
   } else if (data.action === 'submit_form') {
     return handleFormSubmission(data);
   }
   ```
3. Add one more branch:
   ```javascript
   } else if (data.action === 'save_transcript') {
     return handleTranscriptSave(data);
   }
   ```
4. Paste this new function anywhere in the file:
   ```javascript
   // ============================================
   // Save abandoned-chat transcripts (lead rescue)
   // ============================================
   function handleTranscriptSave(data) {
     try {
       let conversationText = '';
       if (data.conversationHistory && data.conversationHistory.length > 0) {
         conversationText = data.conversationHistory
           .map(item => item.sender.toUpperCase() + ': ' + item.message)
           .join('\n');
       }

       // Log to the same spreadsheet
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
       sheet.appendRow([
         new Date(data.timestamp),
         'ANONYMOUS (left without form)',
         '',
         '',
         (data.leadProfile && data.leadProfile.interest) ? 'Interest: ' + data.leadProfile.interest : 'No interest selected',
         data.pageUrl,
         conversationText,
         'Chat transcript — ' + (data.reason || 'unknown')
       ]);

       // Email you a summary
       MailApp.sendEmail({
         to: 'sales@x-tech.tv',
         subject: '💬 Chat transcript: visitor left without submitting',
         htmlBody: '<p><strong>Page:</strong> ' + data.pageUrl + '</p>' +
                   '<p><strong>Interest:</strong> ' + ((data.leadProfile && data.leadProfile.interest) || 'not selected') + '</p>' +
                   '<hr><pre style="white-space:pre-wrap;font-family:Arial">' + conversationText + '</pre>'
       });

       return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (error) {
       Logger.log('Transcript save error: ' + error.toString());
       return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```
5. Click **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. (This step matters — changes don't go live until you create a new version.)

**Optional but recommended — smarter qualification:** In the same Apps Script, find the system prompt inside `handleChatMessage` (the text that tells the AI how to behave) and add:

> "Early in the conversation, naturally learn three things: what industry the visitor is in, what problem brought them here, and how soon they want to act. Weave these questions in conversationally — never as a form. If they show buying interest, offer to schedule a call. If asked about Corporate DNA, describe outcomes only (a visual diagnostic of their operation that becomes a transformation roadmap) and offer a private briefing — never explain how it works internally."

---

## 5. What changed on the site (reference)

- **New files:** `sitemap.xml`, `robots.txt`, `llms.txt` (tells AI assistants like ChatGPT/Perplexity about your business), `404.html`, `og-image.png` (social share image), `_includes/analytics.html`, `.webp` versions of all images.
- **Every page** now has meta descriptions, social preview cards, canonical URLs, and structured data (Schema.org) so Google and AI tools understand your business.
- **Homepage** was rewritten for owners/executives, with a real headline, a Corporate DNA™ teaser + briefing form, a process section, and an FAQ (which feeds AI search results).
- **Chatbot** now greets visitors differently per page, shows quick-reply buttons that qualify leads, catches visitors leaving the site (exit intent, once per session), and saves transcripts of abandoned conversations.
- **Design** was fully rebuilt: modern typography (Manrope), your teal/copper brand, card hover effects, sticky glass navigation, dark gradient hero.
- Your original images are backed up in Claude's session outputs; original CSS is at `main.css.backup` there too.

## 6. Publishing

Commit and push everything to GitHub as usual. GitHub Pages will rebuild the site automatically (1–2 minutes). Then:

1. Visit x-tech.tv in a private/incognito window and click through every page.
2. Test the chatbot, the DNA form, and the mobile menu on your phone.
3. Share the homepage link in a LinkedIn message to yourself to see the new social preview card.
