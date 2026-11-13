# Google Apps Script - FormData Version (No CORS Preflight)

This version uses FormData instead of JSON to avoid CORS preflight requests entirely.

## Copy This Entire Script to Your Apps Script Editor

```javascript
// ============================================
// CONFIGURATION
// ============================================
const EMAIL_RECIPIENT = 'roklah@x-tech.tv';
const SHEET_NAME = 'Sheet1';
const OPENAI_MODEL = 'gpt-4o-mini';

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
// Main POST Handler (Handles FormData)
// ============================================
function doPost(e) {
  try {
    // When using FormData, the JSON payload is in e.parameter.payload
    const payload = e.parameter.payload || e.postData.contents;
    const data = JSON.parse(payload);

    let result;
    if (data.action === 'chat') {
      result = handleChatMessage(data);
    } else if (data.action === 'submit_form') {
      result = handleFormSubmission(data);
    } else {
      throw new Error('Unknown action type');
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Handle Chat Message with LLM
// ============================================
function handleChatMessage(data) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (data.conversationHistory && data.conversationHistory.length > 0) {
      const recentHistory = data.conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });
    }

    messages.push({
      role: 'user',
      content: data.message
    });

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

    if (responseData.error) {
      throw new Error('OpenAI API Error: ' + responseData.error.message);
    }

    const botMessage = responseData.choices[0].message.content.trim();
    const needsHuman = checkIfNeedsHuman(botMessage, data.message);

    return {
      status: 'success',
      message: botMessage,
      needsHuman: needsHuman,
      tokensUsed: responseData.usage.total_tokens
    };

  } catch (error) {
    Logger.log('Chat error: ' + error.toString());
    return {
      status: 'success',
      message: "I'm having trouble connecting right now. Please call us at (405) 247-0083 or email sales@x-tech.tv for immediate assistance.",
      needsHuman: true,
      error: error.toString()
    };
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
// Handle Form Submission
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
    try {
      sendEmailNotification(data, conversationText);
    } catch (emailErr) {
      emailStatus = 'failed';
      Logger.log('Email error: ' + emailErr.toString());
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 9).setValue('Email failed: ' + emailErr.toString());
    }

    return {
      status: 'success',
      message: 'Form submitted successfully',
      emailStatus: emailStatus
    };

  } catch (error) {
    Logger.log('Form submission error: ' + error.toString());
    throw error;
  }
}

// ============================================
// Send Email Notification
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

  const result = handleChatMessage(testData);
  Logger.log(JSON.stringify(result));
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

  const result = handleFormSubmission(testData);
  Logger.log(JSON.stringify(result));
}
```

## Why This Works

**The Problem:** JSON requests with `Content-Type: application/json` trigger CORS preflight (OPTIONS request).

**The Solution:** FormData with POST is a "simple request" that doesn't trigger preflight.

**Key Change:** The Apps Script now reads from `e.parameter.payload` instead of `e.postData.contents`.

## Deployment Steps

1. **Replace ALL code** in your Apps Script with the code above
2. **Save** (Ctrl+S)
3. **Test** with `testLLMChat()` - should see AI response in logs
4. **Deploy**:
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (pencil icon) on your existing deployment
   - Click **Deploy**
5. **No need to change the URL** - it stays the same!

## Test After Deployment

1. Push the updated `chat-widget.html` to GitHub
2. Wait 2-3 minutes for GitHub Pages to rebuild
3. Open your live site
4. Try the chatbot - it should work without CORS errors!

## What Changed

- **Frontend:** Uses `FormData` instead of JSON
- **Backend:** Reads from `e.parameter.payload` (FormData location)
- **No more CORS preflight:** Browser treats it as a simple request
- **No `doOptions` needed:** Preflight never happens!
