# Google Drive Chatbot Integration - Quick Start

## 🚀 5-Minute Setup

### 1. Create Google Drive Folder (2 min)

1. Go to [Google Drive](https://drive.google.com)
2. Click **New** → **New folder**
3. Name it: `X-Tech Chatbot Docs`
4. Open the folder and copy the ID from the URL:
   ```
   https://drive.google.com/drive/folders/[COPY_THIS_ID]
   ```
   Example: `1ABC123def456GHI789jkl`

### 2. Upload Documents (1 min)

Upload your 10-20 files:
- PDFs → Right-click → "Open with Google Docs" (converts to searchable format)
- Word docs → Auto-converts to Google Docs
- Use clear names: `pricing.pdf`, `services-faq.pdf`, etc.

### 3. Update Apps Script (2 min)

1. Open your [Google Apps Script](https://script.google.com)
2. Open the **X-Tech chatbot** project
3. Replace ALL code with code from `APPS-SCRIPT-GOOGLE-DRIVE-LLM.md`
4. Line 7: Add your folder ID:
   ```javascript
   const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
   ```
5. Click **Services** (+) → Add **"Drive API"** → Add
6. Save (Ctrl+S)

### 4. Deploy (1 min)

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon)
3. Click **Deploy**
4. Done! URL stays the same.

### 5. Test

**In Apps Script:**
- Select function: `testDriveSearch`
- Click **Run**
- Check logs for document content

**On Website:**
- Open chat widget
- Ask: "What are your pricing options?"
- Should reference your documents! 🎉

---

## How to Update Documents

Just edit or replace files in your Google Drive folder. Changes appear instantly - no code changes needed!

---

## Supported File Types

| Type | Support | Recommendation |
|------|---------|----------------|
| Google Docs | ✅ Perfect | Best option |
| Text files | ✅ Perfect | Great for FAQs |
| PDF | ⚠️ Limited | Convert to Google Docs |
| Word | ⚠️ Okay | Upload as Google Doc |
| PPT | ❌ Not supported | Convert to Google Docs/Slides |

---

## Example Document Names

✅ Good:
- `pricing-plans-2024.pdf`
- `faq-services.pdf`
- `onboarding-process.pdf`
- `product-features-grooper.pdf`
- `company-overview.pdf`

❌ Avoid:
- `document1.pdf`
- `untitled.pdf`
- `final-final-v2.pdf`

---

## Troubleshooting

**Chat doesn't reference docs?**
- Verify DRIVE_FOLDER_ID is correct (line 7 in Apps Script)
- Check you enabled Drive API (Services → Drive API)
- Ensure documents are directly in folder (not subfolders)

**PDF content not extracted?**
- Right-click PDF → "Open with" → "Google Docs"
- This creates a searchable version

**Slow responses?**
- Convert all PDFs to Google Docs
- Reduce document count to 10 or fewer
- Keep documents under 10 pages

---

## Need Help?

Check the full documentation: `APPS-SCRIPT-GOOGLE-DRIVE-LLM.md`
