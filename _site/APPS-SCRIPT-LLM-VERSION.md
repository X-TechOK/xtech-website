# Google Apps Script - LLM-Powered Chatbot

This is the upgraded version of your chatbot that uses OpenAI's API for natural conversation.

## Prerequisites

1. **OpenAI API Key**: Sign up at https://platform.openai.com/api-keys
2. **Billing**: Add payment method (costs ~$0.02-0.05 per conversation)
3. **Your Google Sheet**: Must have the same columns as before

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create account and verify email
3. Go to https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. **Save it somewhere safe** - you can't see it again!

### Step 2: Add API Key to Apps Script

1. Open your Google Apps Script editor
2. Click the **Settings** (gear icon) on the left
3. Scroll to **Script Properties**
4. Click **Add script property**
5. Name: `OPENAI_API_KEY`
6. Value: Paste your API key
7. Click **Save script properties**

### Step 3: Replace Apps Script Code

Delete everything in your Apps Script and paste this:

```javascript
// ============================================
// CONFIGURATION
// ============================================
const EMAIL_RECIPIENT = 'roklah@x-tech.tv';
const SHEET_NAME = 'Sheet1';  // Update if different
const OPENAI_MODEL = 'gpt-3.5-turbo';  // or 'gpt-4' for better quality (but more expensive)

// ============================================
// System Prompt - Controls LLM Behavior
// ============================================
const SYSTEM_PROMPT = `You are the AI assistant for X-Tech Enterprises, a business transformation company.

STRICT RULES - FOLLOW EXACTLY:
1. Only answer questions about X-Tech Enterprises
2. If asked about anything else, politely say "I can only help with X-Tech questions"
3. Keep responses under 80 words
4. Be friendly, professional, and helpful
5. If you don't know something, admit it and offer to schedule a call
6. Always format responses clearly with line breaks

KNOWLEDGE BASE:

CONTACT INFORMATION:
- Phone: (405) 247-0083
- Email: sales@x-tech.tv
- Location: Oklahoma City, Oklahoma (serve clients nationwide)
- Business Hours: Monday-Friday, 8:00 AM - 6:00 PM Central Time

SERVICES (Three main areas):

1. SMB SUPPORT
- Digital transformation for small/medium businesses
- Legacy system modernization
- Change management and process optimization
- Google Workspace migration, management, and training
- Fractional CTO/Technology leadership

2. CONSULTANT CONSULTATION (Consulting for Consultants)
- Methodology development
- Sales enablement and proposal support
- Project pricing and scoping guidance
- Technical architecture reviews
- AI strategy consulting

3. PRODUCT SERVICES (Implementation Partners)
- Google Workspace (expert partner)
- Laserfiche (document management)
- OneSpan Sign (e-signatures)
- Grooper (intelligent document processing)
- Hyland OnBase (ECM platform)
- DocuSign (e-signatures)
- Power BI (business intelligence)
- AI platform integrations

PRICING:
- Custom pricing based on specific needs
- Free initial consultation
- Transparent pricing, no hidden fees
- Flexible engagement models (project-based, retainer, hourly)
- Say "I recommend scheduling a call to discuss your specific needs and pricing"

COMPANY:
- Founded: 1997 (transforming businesses for 25+ years)
- Mission: Partner with SMBs to transform legacy operations into competitive advantages
- Led by seasoned business transformation executives
- Full-stack expertise: strategy, execution, and sustained adoption
- Philosophy: Custom-tailored solutions, not one-size-fits-all

WHEN TO ESCALATE:
If the user needs:
- Specific pricing quotes
- Technical support for existing clients
- Complex project discussion
- To speak with a human

Then say: "I'd be happy to connect you with our team! You can schedule a call at your convenience or fill out a quick contact form."

RESPONSE FORMAT:
- Use natural conversation
- Break into short paragraphs
- Use bullet points when listing things
- End with helpful follow-up question or action`;

// ============================================
// Main Function - Handles Chat Requests
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Handle different request types
    if (data.action === 'chat') {
      return handleChatMessage(data);
    } else if (data.action === 'submit_form') {
      return handleFormSubmission(data);
    }

    throw new Error('Unknown action type');

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Handle Chat Message with LLM
// ============================================
function handleChatMessage(data) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Script Properties.');
    }

    // Build conversation history for context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (last 10 messages for context)
    if (data.conversationHistory && data.conversationHistory.length > 0) {
      const recentHistory = data.conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: data.message
    });

    // Call OpenAI API
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      }),
      muteHttpExceptions: true
    });

    const responseData = JSON.parse(response.getContentText());

    // Check for API errors
    if (responseData.error) {
      throw new Error('OpenAI API Error: ' + responseData.error.message);
    }

    const botMessage = responseData.choices[0].message.content.trim();

    // Check if response suggests human escalation
    const needsHuman = checkIfNeedsHuman(botMessage, data.message);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: botMessage,
      needsHuman: needsHuman,
      tokensUsed: responseData.usage.total_tokens
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Chat error: ' + error.toString());

    // Fallback to basic response if LLM fails
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: "I'm having trouble connecting right now. Please call us at (405) 247-0083 or email sales@x-tech.tv for immediate assistance.",
      needsHuman: true,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Check if Response Suggests Human Escalation
// ============================================
function checkIfNeedsHuman(botMessage, userMessage) {
  const escalationPhrases = [
    'schedule a call',
    'speak with',
    'contact form',
    'team member',
    'connect you with',
    'one of our',
    'human'
  ];

  const messageLower = (botMessage + ' ' + userMessage).toLowerCase();

  return escalationPhrases.some(phrase => messageLower.includes(phrase));
}

// ============================================
// Handle Form Submission (Same as Before)
// ============================================
function handleFormSubmission(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    let conversationText = '';
    if (data.conversationHistory && data.conversationHistory.length > 0) {
      conversationText = data.conversationHistory
        .map(item => `${item.sender.toUpperCase()}: ${item.message}`)
        .join('\n');
    }

    sheet.appendRow([
      new Date(data.timestamp),
      data.name,
      data.email,
      data.phone || 'Not provided',
      data.message,
      data.pageUrl,
      conversationText,
      data.source
    ]);

    let emailStatus = 'success';
    let emailError = null;
    try {
      sendEmailNotification(data, conversationText);
    } catch (emailErr) {
      emailStatus = 'failed';
      emailError = emailErr.toString();
      Logger.log('Email error: ' + emailError);
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 9).setValue('Email failed: ' + emailError);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      emailStatus: emailStatus
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Form submission error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Send Email Notification (Same as Before)
// ============================================
function sendEmailNotification(data, conversationText) {
  const subject = `🔔 New Chat Submission from ${data.name}`;

  const htmlBody = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1C888E 0%, #BA764C 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: bold; color: #1C888E; }
          .field-value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #1C888E; }
          .conversation { background: white; padding: 15px; margin-top: 15px; border: 1px solid #ddd; border-radius: 4px; max-height: 300px; overflow-y: auto; }
          .conversation-title { font-weight: bold; margin-bottom: 10px; color: #1C888E; }
          .conversation-text { white-space: pre-wrap; font-size: 0.9em; color: #555; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.85em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">New Chat Submission</h2>
            <p style="margin: 5px 0 0 0;">X-Tech Enterprises Website</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">👤 Name:</div>
              <div class="field-value">${data.name}</div>
            </div>
            <div class="field">
              <div class="field-label">📧 Email:</div>
              <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            <div class="field">
              <div class="field-label">📞 Phone:</div>
              <div class="field-value">${data.phone || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="field-value">${data.message}</div>
            </div>
            <div class="field">
              <div class="field-label">🌐 Page URL:</div>
              <div class="field-value"><a href="${data.pageUrl}">${data.pageUrl}</a></div>
            </div>
            <div class="field">
              <div class="field-label">🕐 Timestamp:</div>
              <div class="field-value">${new Date(data.timestamp).toLocaleString()}</div>
            </div>
            ${conversationText ? `
              <div class="conversation">
                <div class="conversation-title">💭 Full Conversation History:</div>
                <div class="conversation-text">${conversationText}</div>
              </div>
            ` : ''}
            <div class="footer">
              <strong>Quick Actions:</strong><br>
              <a href="mailto:${data.email}">Reply via Email</a> |
              <a href="https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}">View All Submissions</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const plainBody = `
New Chat Submission from X-Tech Website

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Message: ${data.message}
Page URL: ${data.pageUrl}
Timestamp: ${new Date(data.timestamp).toLocaleString()}

${conversationText ? `Full Conversation:\n${conversationText}` : ''}

---
View all submissions: https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}
  `;

  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  });
}

// ============================================
// Test Functions
// ============================================
function testLLMChat() {
  const testData = {
    action: 'chat',
    message: 'What services do you offer?',
    conversationHistory: []
  };

  const testEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(testEvent);
  Logger.log(result.getContent());
}

function testFormSubmission() {
  const testData = {
    action: 'submit_form',
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    message: 'Test message after LLM conversation',
    conversationHistory: [
      { sender: 'bot', message: 'Hi! How can I help?' },
      { sender: 'user', message: 'What are your services?' },
      { sender: 'bot', message: 'We offer digital transformation...' }
    ],
    timestamp: new Date().toISOString(),
    source: 'LLM Chat Widget',
    pageUrl: 'https://test.com'
  };

  const testEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(testEvent);
  Logger.log(result.getContent());
}
```

### Step 4: Deploy New Version

1. **Save** the script (Ctrl+S)
2. Click **Deploy** → **Manage deployments**
3. Click the **Edit** (pencil) icon on your existing deployment
4. Click **Deploy**
5. **Important**: The URL stays the same! No need to update your website

### Step 5: Test the LLM

1. Select `testLLMChat` from the function dropdown
2. Click **Run**
3. Check the execution log - you should see an intelligent response about services
4. If you see an error about API key, check Script Properties setup

## Cost Estimates

### OpenAI Pricing (as of 2024):

**GPT-3.5-Turbo** (Recommended to start):
- Input: $0.50 per 1M tokens (~$0.0005 per conversation)
- Output: $1.50 per 1M tokens (~$0.0015 per conversation)
- **Average cost per conversation: $0.002-0.005**

**GPT-4** (Higher quality, more expensive):
- Input: $30 per 1M tokens (~$0.03 per conversation)
- Output: $60 per 1M tokens (~$0.06 per conversation)
- **Average cost per conversation: $0.10-0.15**

### Monthly Estimates (using GPT-3.5-Turbo):
- 100 conversations: **~$0.50/month**
- 500 conversations: **~$2.50/month**
- 1,000 conversations: **~$5/month**
- 5,000 conversations: **~$25/month**

**Recommendation**: Start with GPT-3.5-Turbo. It's excellent quality for this use case and very affordable.

## Customizing the Bot

### Update Knowledge Base
Edit the `SYSTEM_PROMPT` constant to:
- Add new services
- Update contact information
- Change response style
- Add new business rules

### Change Model
```javascript
const OPENAI_MODEL = 'gpt-4';  // For higher quality (but 20-30x more expensive)
```

### Adjust Response Length
```javascript
max_tokens: 300,  // Longer responses (costs more)
```

### Make More/Less Creative
```javascript
temperature: 0.5,  // More consistent (0.0-1.0, lower = more predictable)
```

## Troubleshooting

### "API key not configured" error
- Check Script Properties has `OPENAI_API_KEY`
- Make sure there are no extra spaces in the key

### "Insufficient credits" error
- Add billing info at https://platform.openai.com/account/billing
- Load at least $5 credit

### Responses are off-topic
- Make SYSTEM_PROMPT stricter
- Add more examples of what NOT to answer
- Lower temperature value

### Responses are too short
- Increase `max_tokens`
- Adjust SYSTEM_PROMPT wording

## Security Notes

- API key stored in Script Properties (encrypted by Google)
- Never exposed to client-side code
- Rate limiting handled by OpenAI
- Consider adding usage limits in script if needed

---

**Ready to go!** Once deployed, your chatbot will have natural conversations while staying strictly on-topic about X-Tech.
