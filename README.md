# X-Tech Enterprises Website

This website uses **Jekyll** with GitHub Pages, which means the header and footer are now in ONE place and automatically appear on every page!

## 🎯 How It Works (Simple Explanation)

Think of your website like a book:
- **Layout (_layouts/default.html)** = The book cover and binding (same for every page)
- **Includes (_includes/)** = Reusable pieces like header and footer
- **Pages (index.html, careers.html)** = The actual content of each page
- **Styles (assets/css/main.css)** = How everything looks

When GitHub sees your files, it automatically combines them into complete web pages!

## 📁 File Structure

```
your-repo/
├── _config.yml              # Site settings (title, description, etc.)
├── _layouts/
│   └── default.html         # Main page template
├── _includes/
│   ├── header.html         # Navigation menu (edit ONCE, updates ALL pages!)
│   └── footer.html         # Footer (edit ONCE, updates ALL pages!)
├── assets/
│   └── css/
│       └── main.css        # All your styles
├── index.html              # Homepage content
├── careers.html            # Careers page content
└── (your other files like logo.png, etc.)
```

## ✏️ How to Make Changes

### To Update Header or Footer (Best Part!)

1. Go to `_includes/header.html` or `_includes/footer.html`
2. Make your changes
3. Commit and push to GitHub
4. **That's it!** The change appears on ALL pages automatically!

### To Update Phone Number, Email, or Links

**For Navigation/Header:**
- Edit `_includes/header.html`

**For Footer:**
- Edit `_includes/footer.html`

**Example:** Changing phone number
1. Open `_includes/footer.html`
2. Find: `<p>Phone: (405) 247-0083</p>`
3. Change to your new number
4. Save, commit, push
5. Done! Updates everywhere.

### To Add a New Page

1. Create a new file like `about.html`
2. Add this at the top:
```
---
layout: default
title: About Us
---
```
3. Add your page content below the `---`
4. The header and footer will automatically appear!

### To Change Styles (Colors, Fonts, Spacing)

- Edit `assets/css/main.css`
- All pages will update automatically

### To Update Page Content

Just edit the HTML files directly (index.html, careers.html, etc.)
The part after the `---` markers is your content.

## 🚀 How to Publish

1. Make your changes locally or in GitHub web editor
2. Commit your changes
3. Push to GitHub
4. GitHub Pages automatically builds and publishes (takes 1-2 minutes)
5. Visit your site to see the changes!

## 📝 Understanding the --- Markers

At the top of each page file, you'll see:
```
---
layout: default
title: Page Title
---
```

This is called "front matter" - it tells Jekyll:
- Which layout to use (default.html)
- What the page title should be

**Everything below the second `---` is your page content.**

## 🔧 Troubleshooting

**Site not updating?**
- Wait 2-3 minutes (GitHub Pages needs time to build)
- Check your GitHub repository settings → Pages section
- Make sure Jekyll is enabled

**Changes not showing?**
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Try incognito/private browsing mode

**Header or footer looks weird?**
- Check that `_includes/header.html` and `footer.html` are in the `_includes` folder
- Make sure the layout file references them correctly

## 💡 Benefits of This Setup

✅ Edit header/footer ONCE → updates ALL pages
✅ Consistent design across entire site
✅ Less repetitive code
✅ Easier to maintain
✅ Built into GitHub Pages (no extra tools needed!)
✅ Professional structure for future growth

## 📚 Need Help?

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

Remember: You don't need to install Jekyll locally. GitHub Pages does all the work automatically when you push your changes!
