# Update: Services & Story Pages Converted to Jekyll

## ✅ What's New:

I've converted your **services.html** and **story.html** pages to use the Jekyll layout system!

### Pages Updated:
1. **services.html** - Now uses Jekyll layout with all 3 service sections
2. **story.html** - Now uses Jekyll layout with interactive timeline

### CSS Updated:
Added the following styles to `assets/css/main.css`:
- Service section styles (`.service-section`, `.services-grid`, `.service-card`)
- Timeline styles (`.timeline-section`, `.timeline-bubble`, etc.)

### What This Means:

**All 4 pages now use shared header/footer:**
- ✅ index.html
- ✅ careers.html  
- ✅ services.html (NEW!)
- ✅ story.html (NEW!)

### Automatic Updates:

Since these pages now use the Jekyll includes, they automatically get:
- ✅ Updated phone number: **(405) 247-0083**
- ✅ Careers link in navigation
- ✅ Company section in footer with Careers, Our Story, and Mission links
- ✅ Consistent styling across all pages

### Old vs New Comparison:

**services.html:**
- Before: 468 lines (with embedded CSS, header, footer)
- After: 195 lines (just content + Jekyll front matter)
- **Reduction: 58% smaller!**

**story.html:**
- Before: 572 lines (with embedded CSS, header, footer, JavaScript)
- After: 185 lines (just content + Jekyll front matter + JavaScript)
- **Reduction: 68% smaller!**

## 🎯 Benefits:

1. **Consistency:** All pages share the same header/footer automatically
2. **Easy Updates:** Change phone number once, updates everywhere
3. **Maintainability:** Much less code to manage
4. **Professional:** Industry-standard approach to multi-page sites

## 🚀 Next Steps:

1. Download the updated zip file
2. Extract and upload ALL files to your GitHub repository
3. Make sure to include:
   - `_includes/` folder
   - `_layouts/` folder  
   - `assets/` folder
   - All .html files (index, careers, services, story)
   - `_config.yml`

GitHub Pages will automatically:
- Detect Jekyll
- Build your site
- Apply the layouts to all pages
- Serve your complete site!

## 🧪 Test It:

After uploading, try this:
1. Edit `_includes/header.html` - add a new menu item
2. Push to GitHub
3. Wait 2 minutes
4. Check ALL four pages - they'll all have the new menu item! 🎉

---

**All 4 pages are now fully integrated with Jekyll!**
