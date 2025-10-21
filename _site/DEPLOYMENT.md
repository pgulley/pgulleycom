# GitHub Pages Deployment Guide

## Quick Setup

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Convert to Jekyll site"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"

3. **Wait for deployment:**
   - GitHub will build your Jekyll site automatically
   - Your site will be available at: `https://pgulley.github.io/pgulleycom`

## What's Ready ✅

- ✅ Jekyll configuration optimized for GitHub Pages
- ✅ Compatible plugins (jekyll-feed, jekyll-sitemap)
- ✅ Proper asset structure (`assets/css/`, `assets/js/`, `assets/images/`)
- ✅ Blog collection with front matter
- ✅ Responsive three-column layout
- ✅ SVG wiggle system
- ✅ Expandable blog cards
- ✅ Google Fonts integration
- ✅ Font Awesome icons

## Optional: Custom Domain

If you want to use a custom domain later:
1. Add `CNAME` file with your domain
2. Update DNS settings
3. Update `url` in `_config.yml`

## Troubleshooting

- **Build fails**: Check GitHub Actions tab for error details
- **Assets not loading**: Verify `baseurl: "/pgulleycom"` matches your repo name
- **Styling issues**: Ensure CSS is in `assets/css/` directory

Your site is ready to deploy! 🚀
