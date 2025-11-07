# Enhanced LLM Chat with Google Drive Document Reference

## Overview

This version of the chatbot integrates Google Drive to reference your company documents in real-time. When users ask questions, the system:

1. Searches your designated Google Drive folder
2. Finds relevant documents based on the question
3. Extracts content from those documents
4. Provides context to the LLM for accurate, document-based responses

## Features

✅ Real-time document access from secure Google Drive folder
✅ Supports Google Docs, PDFs (converted to Docs), and text files
✅ Intelligent document search and relevance ranking
✅ Automatic text extraction and chunking
✅ Maintains all existing chat functionality
✅ Documents always up-to-date (reads live from Drive)

---

## Complete Apps Script Code

**Replace your ENTIRE Google Apps Script with this:**

```javascript
// ============================================
// CONFIGURATION
// ============================================
const EMAIL_RECIPIENT = 'roklah@x-tech.tv';
const SHEET_NAME = 'Sheet1';
const OPENAI_MODEL = 'gpt-4o-mini';

// ⭐ NEW: Google Drive Folder Configuration
// You'll set this AFTER creating your folder (Step 3 below)
const DRIVE_FOLDER_ID = ''; // Leave empty for now, we'll add this later

// Maximum characters to extract from documents (to stay within token limits)
const MAX_DOCUMENT_CHARS = 3000;

// ============================================
// System Prompt - Controls LLM Behavior
// ============================================
const SYSTEM_PROMPT = `You are the AI assistant for X-Tech Enterprises, a business transformation company.

STRICT RULES - FOLLOW EXACTLY:
1. Answer questions using information from the provided documents when available
2. If documents don't contain the answer, use your general X-Tech knowledge
3. If asked about anything unrelated to X-Tech, politely decline
4. Keep responses under 100 words
5. Be friendly, professional, and helpful
6. If you don't know something, admit it and offer to schedule a call
7. Always format responses clearly with line breaks
8. When citing document information, be confident but don't mention "according to documents"

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
// Handle CORS Preflight (OPTIONS request)
// ============================================
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

// ============================================
// Main POST Handler
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

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
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// ============================================
// 🆕 GOOGLE DRIVE INTEGRATION
// ============================================

/**
 * Search Google Drive folder for relevant documents
 */
function searchRelevantDocuments(userQuestion) {
  try {
    // Check if folder ID is configured
    if (!DRIVE_FOLDER_ID || DRIVE_FOLDER_ID === '') {
      Logger.log('No Drive folder configured, skipping document search');
      return [];
    }

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const files = folder.getFiles();

    const relevantDocs = [];
    const questionLower = userQuestion.toLowerCase();

    // Keywords to search for in filenames
    const keywords = extractKeywords(questionLower);

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName().toLowerCase();
      const mimeType = file.getMimeType();

      // Only process supported file types
      if (!isSupportedFileType(mimeType)) {
        continue;
      }

      // Calculate relevance score based on filename match
      let relevanceScore = 0;
      keywords.forEach(keyword => {
        if (fileName.includes(keyword)) {
          relevanceScore += 1;
        }
      });

      // Add file if it seems relevant
      if (relevanceScore > 0 || keywords.length === 0) {
        relevantDocs.push({
          file: file,
          score: relevanceScore,
          name: file.getName()
        });
      }
    }

    // Sort by relevance score (highest first)
    relevantDocs.sort((a, b) => b.score - a.score);

    // Return top 3 most relevant documents
    return relevantDocs.slice(0, 3);

  } catch (error) {
    Logger.log('Error searching documents: ' + error.toString());
    return [];
  }
}

/**
 * Extract keywords from user question
 */
function extractKeywords(question) {
  // Remove common words
  const stopWords = ['what', 'how', 'when', 'where', 'who', 'why', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'can', 'could', 'do', 'does', 'your', 'you', 'i', 'me', 'my'];

  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Check if file type is supported
 */
function isSupportedFileType(mimeType) {
  const supportedTypes = [
    'application/vnd.google-apps.document',  // Google Docs
    'text/plain',                            // Text files
    'application/pdf'                        // PDFs (limited support)
  ];

  return supportedTypes.includes(mimeType);
}

/**
 * Extract text content from a file
 */
function extractTextFromFile(file) {
  try {
    const mimeType = file.getMimeType();
    let text = '';

    if (mimeType === 'application/vnd.google-apps.document') {
      // Google Doc - best support
      const doc = DocumentApp.openById(file.getId());
      text = doc.getBody().getText();

    } else if (mimeType === 'text/plain') {
      // Plain text file
      text = file.getBlob().getDataAsString();

    } else if (mimeType === 'application/pdf') {
      // PDF - try to extract text (limited, may not work for all PDFs)
      try {
        // Create a temporary Google Doc from PDF
        const resource = {
          title: file.getName() + '_temp',
          mimeType: 'application/vnd.google-apps.document'
        };
        const tempDoc = Drive.Files.copy(resource, file.getId(), {ocr: true});
        const docId = tempDoc.id;

        // Get text from temporary doc
        const doc = DocumentApp.openById(docId);
        text = doc.getBody().getText();

        // Delete temporary doc
        Drive.Files.remove(docId);
      } catch (pdfError) {
        Logger.log('PDF extraction failed: ' + pdfError.toString());
        text = '[PDF content could not be extracted. Please convert to Google Docs for better results.]';
      }
    }

    // Limit text length to avoid token limits
    if (text.length > MAX_DOCUMENT_CHARS) {
      text = text.substring(0, MAX_DOCUMENT_CHARS) + '... [truncated]';
    }

    return text;

  } catch (error) {
    Logger.log('Error extracting text from ' + file.getName() + ': ' + error.toString());
    return '';
  }
}

/**
 * Build document context for LLM
 */
function buildDocumentContext(userQuestion) {
  try {
    const relevantDocs = searchRelevantDocuments(userQuestion);

    if (relevantDocs.length === 0) {
      return '';
    }

    let context = '\n\n--- RELEVANT COMPANY DOCUMENTS ---\n\n';

    relevantDocs.forEach((doc, index) => {
      const text = extractTextFromFile(doc.file);
      if (text && text.trim() !== '') {
        context += `Document ${index + 1}: ${doc.name}\n`;
        context += `${text}\n\n`;
        context += '---\n\n';
      }
    });

    return context;

  } catch (error) {
    Logger.log('Error building document context: ' + error.toString());
    return '';
  }
}

// ============================================
// Handle Chat Message with LLM (ENHANCED)
// ============================================
function handleChatMessage(data) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // 🆕 Build document context from Google Drive
    const documentContext = buildDocumentContext(data.message);

    // Build messages array with enhanced system prompt
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (documentContext) {
      enhancedSystemPrompt += documentContext;
    }

    const messages = [
      { role: 'system', content: enhancedSystemPrompt }
    ];

    // Add conversation history
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
        max_tokens: 300,  // Increased for document-based responses
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
      tokensUsed: responseData.usage.total_tokens,
      documentsReferenced: documentContext ? true : false
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
function testDriveSearch() {
  const question = 'What are your pricing options?';
  const context = buildDocumentContext(question);
  Logger.log('Document context for: ' + question);
  Logger.log(context);
}

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

---

## Setup Instructions

### Step 1: Create Your Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "X-Tech Chatbot Knowledge Base")
3. Click on the folder to open it
4. Look at the URL in your browser - it will look like:
   ```
   https://drive.google.com/drive/folders/1ABC123def456GHI789jkl
   ```
5. Copy the folder ID (the part after `/folders/`) - this is your `DRIVE_FOLDER_ID`
6. **Save this ID** - you'll need it in Step 3

### Step 2: Upload Your Documents

**Option A: Upload as Google Docs (Recommended)**
1. Go to your new folder
2. Click "New" → "File upload"
3. Select your PDFs, Word docs, PPTs
4. After upload, right-click each file → "Open with" → "Google Docs" (for Word/PDF) or "Google Slides" (for PPT)
5. This creates Google Docs versions that are easy to search

**Option B: Upload PDFs Directly (Limited Support)**
1. Upload PDFs to the folder
2. The script will attempt OCR conversion (may be slow or incomplete)
3. For best results, use Option A

**File Naming Tips:**
- Use descriptive names: `pricing-2024.pdf`, `faq-services.pdf`, `process-onboarding.pdf`
- Include keywords that users might search for
- Avoid generic names like `document1.pdf`

### Step 3: Update Apps Script

1. Go to your [Google Apps Script](https://script.google.com)
2. Open your existing X-Tech chatbot script
3. **Replace ALL code** with the code above
4. Find line 7: `const DRIVE_FOLDER_ID = '';`
5. Paste your folder ID between the quotes:
   ```javascript
   const DRIVE_FOLDER_ID = '1ABC123def456GHI789jkl';
   ```
6. Click **Save** (Ctrl+S)

### Step 4: Enable Google Drive API

1. In Apps Script, click on the **Services** "+" icon (left sidebar)
2. Find "Drive API" in the list
3. Click "Add"
4. Leave the identifier as "Drive"
5. Click "Add"

### Step 5: Test the Integration

1. In Apps Script, select the function `testDriveSearch` from the dropdown
2. Click **Run**
3. You may need to authorize permissions (click "Review Permissions" → Continue)
4. Check "Execution log" (View → Logs) - you should see extracted document content
5. If you see content, it's working! 🎉

### Step 6: Deploy

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon) on your existing deployment
3. Click **Deploy**
4. The URL stays the same - no changes needed to your website!

### Step 7: Test on Your Website

1. Go to your live website
2. Open the chat widget
3. Ask a question related to your documents (e.g., "What's your pricing?" or "Tell me about your process")
4. The chatbot should now reference your Google Drive documents!

---

## How It Works

```
User asks question
    ↓
Apps Script receives message
    ↓
Search Google Drive folder for relevant files
    ↓
Extract text from top 3 matching documents
    ↓
Add document content to LLM context
    ↓
Send to OpenAI with full context
    ↓
Return document-informed answer
```

---

## Tips for Best Results

### Document Organization
- Use clear, descriptive filenames
- Organize by topic if you have many files
- Keep documents under 20 pages for fast extraction

### Document Format
- **Best**: Google Docs (instant, perfect extraction)
- **Good**: Text files, simple PDFs
- **Okay**: Word docs (convert to Google Docs first)
- **Limited**: Complex PDFs, scanned images (requires OCR)

### Content Tips
- Write in FAQ format when possible
- Use clear headings and sections
- Keep language simple and direct
- Update documents monthly as planned

### Monitoring
- Check Apps Script execution logs regularly
- Test chatbot after uploading new documents
- Monitor token usage (visible in logs)

---

## Troubleshooting

**"No documents found"**
- Verify DRIVE_FOLDER_ID is correct
- Check folder permissions (script needs access)
- Ensure files are in the folder (not subfolders)

**"PDF content could not be extracted"**
- Convert PDF to Google Doc format
- Or use Google Drive's "Open with Google Docs" feature

**Slow responses**
- Reduce MAX_DOCUMENT_CHARS (line 9)
- Limit to fewer documents (adjust line 273 to return top 2 instead of 3)
- Convert all files to Google Docs format

**Wrong answers**
- Check document content for accuracy
- Update SYSTEM_PROMPT with clearer instructions
- Improve file naming for better search

---

## Cost Impact

**Before**: ~$0.002-0.005 per conversation
**After**: ~$0.003-0.008 per conversation (due to longer context)

**Monthly estimate** (100 conversations): ~$0.30-0.80

Still extremely affordable! 💰

---

## Next Steps

1. ✅ Create your Google Drive folder
2. ✅ Upload your 10-20 documents
3. ✅ Update the Apps Script with folder ID
4. ✅ Enable Drive API
5. ✅ Test and deploy
6. 🎉 Enjoy document-powered chatbot!

Need help with any step? Let me know!
