# TODO: Blog Tag Filtering System

## Overview
Add filtering functionality to the blog interface to allow visitors to view posts by specific tags (e.g., "showcase", "work", "education").

## Implementation Plan

### 1. Add Tags to Blog Posts
Add `tags` front matter to each blog post:

```yaml
---
title: "My Project"
excerpt: "Description"
date: 2024-10-20
tags: ["showcase", "technical"]
---
```

**Example tags for existing posts:**
- `website.md`: `["showcase", "personal"]`
- `mediacloud.md`: `["work", "product-management"]`
- `creative-coding.md`: `["education", "curriculum"]`

### 2. Generate Filter Buttons
Add filter buttons to the blog layout using Jekyll liquid:

```liquid
{% assign all_tags = site.blog | map: 'tags' | flatten | uniq | sort %}
<div class="filter-buttons">
  <button class="filter-btn active" data-tag="all">All</button>
  {% for tag in all_tags %}
  <button class="filter-btn" data-tag="{{ tag }}">{{ tag | capitalize }}</button>
  {% endfor %}
</div>
```

### 3. Add Data Attributes to Cards
Modify the blog card generation to include tag data:

```liquid
<div class="project-card" data-tags="{% for tag in item.tags %}{{ tag }} {% endfor %}">
```

### 4. JavaScript Filtering Logic
Add client-side filtering functionality:

```javascript
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tag = this.dataset.tag;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    // Show/hide cards
    document.querySelectorAll('.project-card').forEach(card => {
      if (tag === 'all' || card.dataset.tags.includes(tag)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
```

### 5. CSS Styling
Add styles for filter buttons:

```css
.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  background: var(--bg-content);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background: var(--accent-primary);
  color: white;
}
```

## Benefits
- **No server needed**: Pure client-side filtering
- **Fast**: Instant show/hide
- **Persistent**: Can remember last filter using localStorage
- **Extensible**: Easy to add more tags
- **Professional**: Adds polish to the blog interface

## Effort Estimate
- **Basic filtering**: 1-2 hours
- **Polish and UX**: 1 hour
- **Testing**: 30 minutes
- **Total**: 2-3 hours

## UI Options
- **Toggle buttons**: "All", "Showcase", "Work", etc.
- **Checkboxes**: Multiple tag selection
- **Search box**: Type to filter
- **Dropdown**: Clean, compact interface

## Future Enhancements
- Multiple tag selection
- Search functionality
- Tag-based RSS feeds
- Tag cloud visualization
- Filter persistence across page loads

---

# TODO: Blog Pagination System

## Overview
Add pagination to the blog to limit the number of posts shown per page, improving performance and user experience as the blog grows.

## Implementation Options

### Option 1: Jekyll Pagination (Recommended)
Use Jekyll's built-in pagination with the `jekyll-paginate` plugin.

#### Configuration (_config.yml):
```yaml
plugins:
  - jekyll-paginate

paginate: 5
paginate_path: "/blog/page:num/"
```

#### Layout Changes:
```liquid
<!-- Show paginated posts -->
{% for item in paginator.posts %}
  <div class="project-card expandable-card" data-index="{{ forloop.index0 }}">
    <!-- existing card content -->
  </div>
{% endfor %}

<!-- Pagination navigation -->
{% if paginator.total_pages > 1 %}
<div class="pagination">
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path }}" class="pagination-btn prev">← Previous</a>
  {% endif %}
  
  <span class="pagination-info">
    Page {{ paginator.page }} of {{ paginator.total_pages }}
  </span>
  
  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path }}" class="pagination-btn next">Next →</a>
  {% endif %}
</div>
{% endif %}
```

#### File Structure:
```
/blog/
├── index.html          # Page 1
├── page2/
│   └── index.html      # Page 2
├── page3/
│   └── index.html      # Page 3
└── ...
```

### Option 2: Client-Side Pagination
Keep all posts on one page but use JavaScript to show/hide them.

#### Implementation:
```javascript
const postsPerPage = 5;
let currentPage = 1;
const allPosts = document.querySelectorAll('.project-card');

function showPage(page) {
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  
  allPosts.forEach((post, index) => {
    if (index >= startIndex && index < endIndex) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none';
    }
  });
  
  updatePaginationControls();
}
```

## Pagination UI Design

### Navigation Controls:
```css
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.pagination-btn {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.pagination-btn:hover {
  background: var(--accent-hover);
}

.pagination-info {
  font-family: 'Syne Mono', monospace;
  color: var(--text-primary);
}
```

### Page Numbers (Advanced):
```liquid
<!-- Show page numbers -->
<div class="page-numbers">
  {% for page_num in (1..paginator.total_pages) %}
    {% if page_num == paginator.page %}
      <span class="page-number current">{{ page_num }}</span>
    {% else %}
      <a href="{% if page_num == 1 %}/blog/{% else %}/blog/page{{ page_num }}/{% endif %}" 
         class="page-number">{{ page_num }}</a>
    {% endif %}
  {% endfor %}
</div>
```

## Benefits of Pagination

### Performance:
- **Faster loading**: Only loads posts for current page
- **Reduced DOM**: Fewer elements to render
- **Better SEO**: Each page has focused content

### User Experience:
- **Manageable content**: Not overwhelming with too many posts
- **Clear navigation**: Easy to browse through content
- **Mobile friendly**: Better performance on mobile devices

## Considerations

### When to Implement:
- **10+ posts**: Start considering pagination
- **Performance issues**: If page loads slowly
- **User feedback**: If visitors find too many posts overwhelming

### Posts Per Page:
- **Desktop**: 5-10 posts
- **Mobile**: 3-5 posts
- **Consider**: Mix of short and long posts

## Effort Estimate
- **Jekyll pagination**: 2-3 hours
- **Client-side pagination**: 1-2 hours
- **UI polish**: 1 hour
- **Testing**: 30 minutes

## Future Enhancements
- **Infinite scroll**: Load more posts as user scrolls
- **Search with pagination**: Filter results across pages
- **Category pagination**: Paginate within specific tags
- **Archive pages**: Group posts by month/year
