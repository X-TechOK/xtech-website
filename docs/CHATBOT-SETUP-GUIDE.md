# Intelligent Chatbot Setup Guide

This guide will help you set up the Google Sheets integration and email notifications for your chatbot.

## Overview

The chatbot is configured to:
1. Answer common questions intelligently (contact info, services, hours, etc.)
2. Collect contact form submissions
3. Save all submissions to a Google Sheet
4. Send email notifications when someone submits the form
5. Track conversation history

## Setup Steps

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"X-Tech Chat Submissions"** (or your preferred name)
4. In the first row, add these column headers:
   - `Timestamp`
   - `Name`
   - `Email`
   - `Phone`
   - `Message`
   - `Page URL`
   - `Conversation History`
   - `Source`

### Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any code in the editor
3. Copy and paste the script below
4. **IMPORTANT**: Update the `EMAIL_RECIPIENT` variable with your email address

### Step 3: Deploy the Script

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "Chat Widget Backend"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Authorize the script when prompted
7. **Copy the Web app URL** - you'll need this!

### Step 4: Update Your Website

1. Open `xtech-website/_includes/chat-widget.html`
2. Find line 86: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your Web app URL
4. Save and deploy your website

---

## Google Apps Script Code

Copy this entire code into your Apps Script editor:

```javascript
// ============================================
// CONFIGURATION
// ============================================
const EMAIL_RECIPIENT = 'sales@x-tech.tv'; // CHANGE THIS to your email
const SHEET_NAME = 'Sheet1'; // Change if you renamed your sheet

// ============================================
// Main Function - Handles POST Requests
// ============================================
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Format conversation history for sheet
    let conversationText = '';
    if (data.conversationHistory && data.conversationHistory.length > 0) {
      conversationText = data.conversationHistory
        .map(item => `${item.sender.toUpperCase()}: ${item.message}`)
        .join('\n');
    }

    // Add row to sheet
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

    // Send email notification
    sendEmailNotification(data, conversationText);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log error
    Logger.log('Error: ' + error.toString());

    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
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
          .conversation { background: white; padding: 15px; margin-top: 15px; border: 1px solid #ddd; border-radius: 4px; }
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
                <div class="conversation-title">💭 Conversation History:</div>
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

${conversationText ? `Conversation History:\n${conversationText}` : ''}

---
View all submissions: https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}
  `;

  // Send the email
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  });
}

// ============================================
// Test Function (Optional)
// ============================================
function testScript() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    message: 'This is a test submission',
    conversationHistory: [
      { sender: 'bot', message: 'Hi there! How can I help?' },
      { sender: 'user', message: 'I need help with pricing' },
      { sender: 'bot', message: 'I can connect you with someone!' }
    ],
    timestamp: new Date().toISOString(),
    source: 'Test',
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

---

## Testing the Setup

### Test 1: Run Test Function
1. In Apps Script editor, select `testScript` from the function dropdown
2. Click **Run**
3. Check your Google Sheet - you should see a test row
4. Check your email - you should receive a test notification

### Test 2: Test from Website
1. Open your website
2. Click the chat widget
3. Ask a question (bot should respond)
4. Click "Talk to Human" or type "I need help"
5. Fill out the contact form
6. Submit
7. Check Google Sheet and email

## Troubleshooting

### Email Not Sending
- **Check email address**: Make sure `EMAIL_RECIPIENT` is correct
- **Check authorization**: Re-authorize the script (Deploy → Manage deployments → Edit → Redeploy)
- **Check spam folder**: Gmail might filter it

### Sheet Not Updating
- **Check sheet name**: Make sure `SHEET_NAME` matches your sheet tab name
- **Check permissions**: Script must have "Execute as: Me"
- **Check logs**: In Apps Script, go to Executions to see errors

### Website Error "URL not configured"
- **Update chat-widget.html**: Make sure you replaced `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual Web app URL
- **Clear cache**: Hard refresh your browser (Ctrl+Shift+R)

### CORS Issues
- **Check deployment**: Make sure "Who has access" is set to "Anyone"
- **Use no-cors mode**: The script uses `mode: 'no-cors'` which is correct for Apps Script

## Viewing Submissions

### Google Sheet
Direct link: Your Google Sheet URL
- Sort by timestamp to see latest first
- Use filters to find specific submissions
- Export to CSV/Excel for reporting

### Email Notifications
- Real-time notifications to your inbox
- Includes full conversation history
- Quick reply directly from email

## Customization

### Changing Email Template
Edit the `sendEmailNotification` function in the Apps Script to customize:
- Email subject line
- HTML styling
- What information is included

### Adding More Fields
1. Add column to Google Sheet
2. Update `sheet.appendRow()` in script
3. Update email template if needed
4. Update chat-widget.html to send new field

### Changing Response Messages
Edit the `knowledgeBase` object in `chat-widget.html` (lines 112-173) to:
- Add new Q&A topics
- Update existing responses
- Add more keywords

---

## Security Notes

- The Apps Script runs under your Google account
- Only you can access the spreadsheet (unless you share it)
- The web app endpoint is public but can only append data
- No sensitive data is stored in the client-side code
- Use HTTPS only (GitHub Pages provides this automatically)

## Need Help?

If you run into issues:
1. Check the Executions log in Apps Script for errors
2. Test with the `testScript()` function
3. Make sure all permissions are granted
4. Verify the Web app URL is correct in chat-widget.html

---

**Setup Complete!** Your chatbot is now intelligent and saves all conversations to Google Sheets with email notifications.
