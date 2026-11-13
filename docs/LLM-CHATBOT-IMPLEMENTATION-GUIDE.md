# LLM Chatbot with Calendar Scheduling - Implementation Guide

This guide will help you upgrade your chatbot to use AI (OpenAI GPT) for natural conversations with tight control, plus integrated calendar scheduling.

## What You're Getting

### Smart AI Conversations
- Users ask questions in natural language
- AI responds intelligently about X-Tech services, pricing, contact info
- Tightly controlled to ONLY answer X-Tech questions
- Maintains conversation context

### Intelligent Escalation
- When AI detects user needs human help, it offers:
  - **📅 Schedule a Call** - Opens your Google Calendar booking
  - **✉️ Send Message** - Shows contact form for async follow-up
- All conversations saved to Google Sheets
- Email notifications with full conversation history

## Total Time: ~2 hours
## Total Cost: ~$5-10/month for typical usage

---

## Part 1: Set Up OpenAI API (30 minutes)

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up with email
3. Verify your email address

### Step 2: Add Payment Method
1. Go to https://platform.openai.com/account/billing
2. Click **"Add payment method"**
3. Enter credit card info
4. Add at least **$5 credit** (will last months)

### Step 3: Get API Key
1. Go to https://platform.openai.com/api-keys
2. Click **"+ Create new secret key"**
3. Name it: "X-Tech Chatbot"
4. Click **"Create secret key"**
5. **COPY THE KEY** - starts with `sk-proj-...`
6. **Save it safely** - you can't see it again!

---

## Part 2: Update Google Apps Script (30 minutes)

### Step 1: Open Your Apps Script
1. Open your Google Sheet with chat submissions
2. Go to **Extensions → Apps Script**

### Step 2: Add API Key to Script Properties
1. In Apps Script, click **Settings** (gear icon) on the left
2. Scroll to **"Script Properties"**
3. Click **"Add script property"**
4. Name: `OPENAI_API_KEY`
5. Value: Paste your OpenAI API key (the one that starts with `sk-proj-...`)
6. Click **"Save script properties"**

### Step 3: Replace Script Code
1. Go back to **Editor** (< > icon on left)
2. **Delete ALL existing code**
3. Open the file: `APPS-SCRIPT-LLM-VERSION.md` (in your project)
4. Copy the entire JavaScript code from that file
5. Paste into Apps Script editor
6. **Update line 5**: Change email if needed:
   ```javascript
   const EMAIL_RECIPIENT = 'roklah@x-tech.tv';
   ```
7. **Update line 6**: Change if your sheet tab has a different name:
   ```javascript
   const SHEET_NAME = 'Sheet1';
   ```
8. Click **Save** (disk icon or Ctrl+S)

### Step 4: Test the LLM
1. Select `testLLMChat` from the function dropdown (top center)
2. Click **Run** ▶️
3. First time: You'll need to authorize (click Review Permissions → Allow)
4. Check **Execution log** (bottom of screen)
5. You should see a JSON response with an intelligent answer about services!

Example output:
```json
{"status":"success","message":"We offer three main services...[intelligent response]","needsHuman":false}
```

### Step 5: Test Form Submission
1. Select `testFormSubmission` from dropdown
2. Click **Run** ▶️
3. Check your Google Sheet - new row should appear
4. Check your email (roklah@x-tech.tv in All Mail) - should receive notification

### Step 6: Deploy New Version
1. Click **Deploy** → **Manage deployments**
2. Click the **Edit** icon (pencil) next to your existing deployment
3. Click **Deploy**
4. Click **Done**

**Important**: The URL stays the same! Your website will automatically use the new version.

---

## Part 3: Update Your Website (30 minutes)

### Step 1: Backup Current Chat Widget
Just in case, let's keep the old version:
```bash
cp _includes/chat-widget.html _includes/chat-widget-old-backup.html
```

### Step 2: Replace Chat Widget
1. Delete the current `_includes/chat-widget.html`
2. Rename `_includes/chat-widget-llm.html` to `_includes/chat-widget.html`

Or simply replace the contents:
```bash
cp _includes/chat-widget-llm.html _includes/chat-widget.html
```

### Step 3: Verify Configuration
Open `_includes/chat-widget.html` and check line 86-87:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_URL/exec';
const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/YOUR_CALENDAR_ID?gv=true';
```

Make sure:
- `GOOGLE_SCRIPT_URL` matches your deployed Apps Script URL
- `CALENDAR_URL` is your Google Calendar scheduling link

### Step 4: Test Locally (Optional)
If you have Jekyll installed:
```bash
cd /path/to/xtech-website
bundle exec jekyll serve
```

Visit `http://localhost:4000` and test the chatbot.

### Step 5: Commit and Push to GitHub
```bash
git add _includes/chat-widget.html
git commit -m "Upgrade chatbot to LLM with calendar scheduling"
git push origin main
```

GitHub Pages will rebuild in 2-3 minutes.

---

## Part 4: Testing the Live Site (30 minutes)

### Test 1: Basic Q&A
Open your live site and try these questions:
- "What services do you offer?"
- "How much do you charge?"
- "What are your business hours?"
- "Tell me about your company"
- "Do you work with Google Workspace?"

**Expected**: Natural, intelligent responses staying on X-Tech topics

### Test 2: Off-Topic Questions
Try asking about things NOT related to X-Tech:
- "What's the weather today?"
- "How do I bake a cake?"
- "Tell me about Apple products"

**Expected**: Bot should politely decline and stay on-topic

### Test 3: Human Escalation
Type: "I need to speak with someone about my project"

**Expected**:
- Bot acknowledges and offers two buttons:
  - 📅 Schedule a Call
  - ✉️ Send Message

### Test 4: Calendar Scheduling
1. Click **"📅 Schedule a Call"** button
2. Should open your Google Calendar booking page in new tab
3. Verify it shows available times
4. (Optional) Book a test appointment and verify it appears in your calendar

### Test 5: Contact Form
1. Continue a conversation with the bot
2. Click **"✉️ Send Message"**
3. Fill out the form
4. Submit
5. Check Google Sheet - should have new row with full conversation
6. Check email (roklah@x-tech.tv in All Mail) - should receive notification

### Test 6: Mobile Responsiveness
1. Open site on your phone
2. Click chat button
3. Ask a few questions
4. Try scheduling and form submission
5. Verify everything works smoothly

---

## Customizing Your Bot

### Update Knowledge Base
Edit the `SYSTEM_PROMPT` in your Apps Script (around line 14):

```javascript
const SYSTEM_PROMPT = `You are the AI assistant for X-Tech Enterprises...

KNOWLEDGE BASE:

[Add or update information here]
`;
```

Common updates:
- New services
- Updated pricing
- New team members
- Changed business hours
- New contact information

After updating:
1. **Save** the script
2. **Deploy** → Manage deployments → Edit → Deploy (creates new version)
3. Test with relevant questions

### Adjust Response Style

**More Concise**:
```javascript
3. Keep responses under 50 words
```

**More Detailed**:
```javascript
3. Keep responses under 150 words when detailed explanation needed
```

**More Formal**:
```javascript
4. Use formal business language
```

**More Casual**:
```javascript
4. Be friendly and conversational, use occasional emojis
```

### Change AI Model

**For Better Quality** (but more expensive):
```javascript
const OPENAI_MODEL = 'gpt-4';  // ~20-30x more expensive
```

**For Faster/Cheaper** (keep current):
```javascript
const OPENAI_MODEL = 'gpt-3.5-turbo';  // Recommended
```

### Update Calendar Link
If you change or update your scheduling calendar:
1. Get new calendar scheduling URL
2. Update `CALENDAR_URL` in `_includes/chat-widget.html` line 87
3. Commit and push to GitHub

---

## Monitoring & Maintenance

### Check Usage & Costs
1. Go to https://platform.openai.com/usage
2. View daily API usage and costs
3. Set up usage limits if desired

Typical costs with GPT-3.5-Turbo:
- 50 conversations/month: ~$0.25
- 200 conversations/month: ~$1.00
- 500 conversations/month: ~$2.50

### Review Conversations
1. Open your Google Sheet
2. Column G has full conversation history
3. Review what questions users are asking
4. Update SYSTEM_PROMPT knowledge base if you see common questions bot doesn't answer well

### Update Knowledge Base Regularly
Monthly maintenance:
1. Review submitted conversations
2. Identify knowledge gaps
3. Update SYSTEM_PROMPT with new information
4. Redeploy Apps Script

---

## Troubleshooting

### "API key not configured" Error
**Solution**:
- Go to Apps Script → Settings → Script Properties
- Verify `OPENAI_API_KEY` exists and is correct
- No spaces before/after the key

### "Insufficient quota" Error
**Solution**:
- Go to https://platform.openai.com/account/billing
- Add more credit (minimum $5)
- Check if you have usage limits set too low

### Bot Gives Off-Topic Responses
**Solution**:
- Make SYSTEM_PROMPT stricter
- Add more explicit "FORBIDDEN TOPICS" section
- Lower temperature value (line ~104 in Apps Script):
  ```javascript
  temperature: 0.5,  // More consistent (was 0.7)
  ```

### Responses Are Too Slow
**Current model (GPT-3.5-Turbo) typically responds in 1-3 seconds**

If slower:
- Check your internet connection
- Check OpenAI status: https://status.openai.com
- Consider reducing `max_tokens` (line ~103):
  ```javascript
  max_tokens: 150,  // Shorter responses = faster
  ```

### Calendar Link Not Working
**Solution**:
- Verify `CALENDAR_URL` is correct in chat-widget.html
- Test the URL directly in a browser
- Make sure calendar is set to "public" or "anyone with link"

### Form Submissions Not Saving
**Solution**:
- Check Apps Script Executions log for errors
- Verify sheet name matches `SHEET_NAME` constant
- Test with `testFormSubmission()` function

### Email Notifications Not Arriving
**Solution**:
- Check "All Mail" view in Gmail (not just Primary)
- Check spam folder
- Verify `EMAIL_RECIPIENT` is correct
- Make sure Google account has permission to send emails

---

## Cost Management

### Set Spending Limits
1. Go to https://platform.openai.com/account/limits
2. Set **Hard limit**: $10/month (or your preference)
3. Set **Soft limit**: $5/month (get email warning)

### Monitor Usage
- Check dashboard weekly: https://platform.openai.com/usage
- Review costs in Google Sheet conversations
- Average conversation: $0.002-0.005 with GPT-3.5-Turbo

### Reduce Costs If Needed
1. Lower `max_tokens` to 100-150
2. Keep using GPT-3.5-Turbo (don't upgrade to GPT-4)
3. Make SYSTEM_PROMPT shorter (fewer tokens)
4. Add rate limiting if getting spam

---

## Security Best Practices

✅ **DO:**
- Keep OpenAI API key in Script Properties (not code)
- Regularly review conversation logs
- Monitor usage for suspicious patterns
- Update knowledge base to prevent misuse

❌ **DON'T:**
- Never put API key in client-side code (it's in Apps Script, which is correct)
- Don't share your Apps Script web app URL publicly beyond your website
- Don't leave unlimited spending on OpenAI account

---

## Success Checklist

Before going live, verify:

- [ ] OpenAI API key configured in Script Properties
- [ ] testLLMChat() runs successfully
- [ ] testFormSubmission() saves to sheet and sends email
- [ ] Apps Script redeployed
- [ ] Chat widget updated on website
- [ ] GOOGLE_SCRIPT_URL is correct
- [ ] CALENDAR_URL is correct
- [ ] Pushed to GitHub and site rebuilt
- [ ] Tested Q&A on live site
- [ ] Tested off-topic questions (bot stays on-topic)
- [ ] Tested calendar scheduling button
- [ ] Tested contact form submission
- [ ] Verified Google Sheet receives data
- [ ] Verified email arrives
- [ ] Tested on mobile device
- [ ] Set OpenAI spending limits

---

## What You've Built

🎉 **Congratulations!** You now have:

✅ Natural AI-powered conversations
✅ Tight control - only answers X-Tech questions
✅ Smart escalation to humans when needed
✅ Integrated calendar scheduling
✅ Async contact form option
✅ Full conversation tracking
✅ Email notifications
✅ Mobile-responsive design
✅ Professional user experience

**Cost**: ~$5-10/month for typical small business traffic

**Maintenance**: ~30 minutes/month to review and update knowledge base

---

## Next Steps

1. **Follow this guide step-by-step**
2. **Test thoroughly** before announcing
3. **Monitor first week** of conversations
4. **Refine knowledge base** based on actual questions
5. **Enjoy automated, intelligent customer engagement!**

Need help? Review the troubleshooting section or check the Apps Script execution logs for detailed error messages.
