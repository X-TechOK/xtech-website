# Updated Apps Script with Better Error Handling

Replace your entire Apps Script with this version that has better error handling for email issues:

```javascript
// ============================================
// CONFIGURATION
// ============================================
const EMAIL_RECIPIENT = 'roklah@x-tech.tv';
const SHEET_NAME = 'Sheet1';  // Update if your sheet tab has a different name

// ============================================
// Main Function - Handles POST Requests
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    let conversationText = '';
    if (data.conversationHistory && data.conversationHistory.length > 0) {
      conversationText = data.conversationHistory
        .map(item => `${item.sender.toUpperCase()}: ${item.message}`)
        .join('\n');
    }

    // Add to sheet FIRST
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

    // Try to send email, but don't fail if it errors
    let emailStatus = 'success';
    let emailError = null;
    try {
      sendEmailNotification(data, conversationText);
    } catch (emailErr) {
      emailStatus = 'failed';
      emailError = emailErr.toString();
      Logger.log('Email error: ' + emailError);

      // Add email error to sheet in a new column
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 9).setValue('Email failed: ' + emailError);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      emailStatus: emailStatus,
      emailError: emailError
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
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

function testEmail() {
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: 'Test Email from Apps Script',
    body: 'If you receive this, email sending works!'
  });
  Logger.log('Email sent successfully');
}
```

## What Changed:

1. **Email errors won't break the submission** - Sheet still updates even if email fails
2. **Email errors logged to sheet** - If email fails, column 9 shows the error
3. **Better error separation** - Can now see if it's a sheet issue vs email issue

## After Updating:

1. **Save** the script
2. **Deploy** → Manage deployments → Edit (pencil icon) → **Deploy** (create new version)
3. Test from your website again
4. Check your Google Sheet:
   - If column 9 (I) has an error message, that's your email issue
   - If column 9 is empty, the email sent successfully

Let me know what you find in column 9 after testing!
