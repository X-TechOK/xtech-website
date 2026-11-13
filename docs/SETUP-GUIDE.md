# 🚀 Quick Setup Guide - Jekyll is Ready!

## What I Just Built For You

Your website now uses **Jekyll templates** - this means your header and footer are in ONE place!

### ✅ Files Created:

**Layout & Structure:**
- `_layouts/default.html` - Main page template (wrapper for all pages)
- `_includes/header.html` - Navigation menu (appears on all pages)
- `_includes/footer.html` - Footer (appears on all pages)
- `assets/css/main.css` - All your CSS styles in one place
- `_config.yml` - Jekyll configuration file

**Updated Pages:**
- `index.html` - Now uses the Jekyll layout
- `careers.html` - Now uses the Jekyll layout

## 🎯 What This Means For You

### BEFORE (The Old Way):
- Want to change phone number? Edit index.html ✏️
- Also edit careers.html ✏️
- Also edit services.html ✏️
- Also edit story.html ✏️
- Miss one? Your site looks inconsistent! 😓

### AFTER (The New Way):
- Want to change phone number? Edit `_includes/footer.html` ✏️
- Push to GitHub
- **Every page updates automatically!** 🎉

## 📋 Next Steps

1. **Upload all files to your GitHub repository**
   - Include the folders: `_layouts`, `_includes`, `assets`
   - Include the config: `_config.yml`
   - Include your pages: `index.html`, `careers.html`, etc.

2. **Make sure GitHub Pages is enabled**
   - Go to your repository settings
   - Find "Pages" section
   - Select your branch (usually `main`)
   - Save

3. **Wait 2-3 minutes**
   - GitHub will automatically build your site with Jekyll
   - Visit your URL to see it live!

## 🧪 Test It Out!

Try making a change:

1. Go to `_includes/footer.html`
2. Change the phone number to something silly like "(555) 123-4567"
3. Commit and push
4. Wait 2 minutes
5. Check BOTH index.html and careers.html
6. Both pages will show the new number! 🎉

## 💡 Common Tasks

### Change Phone Number Everywhere:
- Edit `_includes/footer.html` (line with phone number)

### Change Email Everywhere:
- Edit `_includes/footer.html` (line with email)

### Add New Menu Item:
- Edit `_includes/header.html` 
- Add a new `<li>` with your link

### Update Company Colors:
- Edit `assets/css/main.css`
- Search for color codes like `#1C888E`

### Add New Page:
- Create `newpage.html`
- Add front matter at top:
```
---
layout: default
title: New Page
---
```
- Add your content
- Header and footer automatically included!

## 🎨 File Locations Quick Reference

| What You Want to Change | File to Edit |
|------------------------|--------------|
| Navigation menu | `_includes/header.html` |
| Footer | `_includes/footer.html` |
| Styles/colors | `assets/css/main.css` |
| Homepage content | `index.html` |
| Careers content | `careers.html` |
| Site title | `_config.yml` |

## ✨ Pro Tips

1. **Always use the "front matter"** (the stuff between `---` marks) on new pages
2. **Clear your cache** if changes don't show up (Ctrl+Shift+R)
3. **Wait 2-3 minutes** after pushing for GitHub to rebuild
4. **Test in incognito mode** to see fresh version
5. **Keep the folder structure** - Jekyll needs `_layouts` and `_includes` folders

## 🤔 Questions?

- Check README.md for detailed documentation
- See your files in the outputs folder
- Everything is ready to upload to GitHub!

**You're all set! Upload these files and enjoy never having to update headers/footers in multiple places again!** 🎉
