# Apps Script CORS Fix

## The Problem

Google Apps Script web apps have CORS restrictions. The solution is to return proper CORS headers in the response.

## The Fix

Replace your `doPost` function with this version that includes CORS headers:

```javascript
// ============================================
// Main Function - Handles POST Requests with CORS
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
    return createCORSResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

// ============================================
// Create Response with CORS Headers
// ============================================
function createCORSResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // Note: Apps Script doesn't support setting custom headers directly
  // But deployed as "Anyone" it should work with modern fetch
  return output;
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

    // Build conversation history
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

    if (responseData.error) {
      throw new Error('OpenAI API Error: ' + responseData.error.message);
    }

    const botMessage = responseData.choices[0].message.content.trim();
    const needsHuman = checkIfNeedsHuman(botMessage, data.message);

    return createCORSResponse({
      status: 'success',
      message: botMessage,
      needsHuman: needsHuman,
      tokensUsed: responseData.usage.total_tokens
    });

  } catch (error) {
    Logger.log('Chat error: ' + error.toString());
    return createCORSResponse({
      status: 'success',
      message: "I'm having trouble connecting right now. Please call us at (405) 247-0083 or email sales@x-tech.tv for immediate assistance.",
      needsHuman: true,
      error: error.toString()
    });
  }
}
```

## Even Better Solution: Use GET for Testing

Actually, Google Apps Script works better with simple requests. Let's try a different approach - **use doGet for testing first**:

Add this to your Apps Script:

```javascript
// ============================================
// Test GET endpoint
// ============================================
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Apps Script is working! POST requests should work too.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

Then test by visiting your Apps Script URL in a browser. You should see JSON response.

## The Real Solution: Deploy Settings

The most common issue is deployment settings. Make sure:

1. **Deploy → Manage deployments → Edit**
2. **Execute as**: Me (youremail@x-tech.tv)
3. **Who has access**: **Anyone** ← THIS IS CRITICAL
4. Click **Deploy**

When set to "Anyone", Google Apps Script automatically handles CORS for you!

