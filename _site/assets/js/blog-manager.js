// Blog filtering and pagination system
class BlogManager {
  constructor() {
    this.posts = [];
    this.allTags = [];
    this.currentFilter = 'showcase';
    this.currentPage = 1;
    this.postsPerPage = 5;
    this.filteredPosts = [];
    this.paginatedPosts = [];
    
    this.init();
  }
  
  async init() {
    try {
      console.log('BlogManager initializing...');
      await this.loadBlogData();
      console.log('Blog data loaded:', this.posts);
      this.populateFilterOptions();
      this.setupEventListeners();
      this.render();
      console.log('BlogManager initialized successfully');
    } catch (error) {
      console.error('Failed to load blog data:', error);
    }
  }
  
  async loadBlogData() {
    const response = await fetch('/pgulleycom/blog-index.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch blog data: ${response.status}`);
    }
    const data = await response.json();
    
    this.posts = data.posts;
    this.allTags = data.meta.all_tags;
    
    // Initialize filtered posts with showcase posts
    this.filteredPosts = this.posts.filter(post => 
      post.tags && post.tags.includes('showcase')
    );
  }
  
  populateFilterOptions() {
    const filterSelect = document.querySelector('.filter-select');
    if (!filterSelect) return;
    
    // Clear existing options except "All Posts"
    filterSelect.innerHTML = '<option value="all">All Posts</option>';
    
    // Add options for each tag
    this.allTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ');
      filterSelect.appendChild(option);
    });
    
    // Set default selection to showcase
    filterSelect.value = 'showcase';
  }
  
  setupEventListeners() {
    // Filter select changes
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.setFilter(e.target.value);
      });
    }
    
    // Pagination clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pagination-btn')) {
        const action = e.target.dataset.action;
        if (action === 'prev' && this.currentPage > 1) {
          this.setPage(this.currentPage - 1);
        } else if (action === 'next' && this.currentPage < this.getTotalPages()) {
          this.setPage(this.currentPage + 1);
        }
      }
    });
  }
  
  setFilter(tag) {
    this.currentFilter = tag;
    this.currentPage = 1; // Reset to first page when filtering
    
    // Update filter select
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
      filterSelect.value = tag;
    }
    
    // Filter posts
    if (tag === 'all') {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post => 
        post.tags && post.tags.includes(tag)
      );
    }
    
    this.render();
  }
  
  setPage(page) {
    this.currentPage = page;
    this.render();
  }
  
  getTotalPages() {
    return Math.ceil(this.filteredPosts.length / this.postsPerPage);
  }
  
  getPaginatedPosts() {
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    return this.filteredPosts.slice(startIndex, endIndex);
  }
  
  render() {
    this.renderPosts();
    this.renderPagination();
  }
  
  renderPosts() {
    const container = document.querySelector('.featured-projects');
    if (!container) {
      console.error('Featured projects container not found');
      return;
    }
    
    // Clear existing posts
    container.innerHTML = '';
    
    // Get posts for current page
    const postsToShow = this.getPaginatedPosts();
    console.log('Rendering posts:', postsToShow);
    
    // Render each post
    if (postsToShow.length === 0) {
      container.innerHTML = '<div class="project-card"><p>No posts found for the selected filter.</p></div>';
      return;
    }
    
    postsToShow.forEach((post, index) => {
      const postElement = this.createPostElement(post, index);
      container.appendChild(postElement);
    });
  }
  
  createPostElement(post, index) {
    const link = document.createElement('a');
    link.href = post.url;
    link.className = 'project-card blog-card-link';
    
    link.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <h3>${post.title}</h3>
          <div class="card-meta">
            <span class="post-date">${new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          
          </div>
        </div>
        <div class="card-text-container">
          <p class="card-excerpt">${post.excerpt}</p>
        </div>
      </div>
    `;
    
    return link;
  }
  
  renderPagination() {
    const totalPages = this.getTotalPages();
    if (totalPages <= 1) {
      // Hide pagination if only one page
      const existingPagination = document.querySelector('.pagination');
      if (existingPagination) {
        existingPagination.style.display = 'none';
      }
      return;
    }
    
    // Create or update pagination
    let pagination = document.querySelector('.pagination');
    if (!pagination) {
      pagination = document.createElement('div');
      pagination.className = 'pagination';
      
      // Insert after featured-projects
      const container = document.querySelector('.featured-projects');
      container.parentNode.insertBefore(pagination, container.nextSibling);
    }
    
    pagination.style.display = 'flex';
    
    const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
    const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
    
    pagination.innerHTML = `
      <button class="pagination-btn prev" data-action="prev" ${prevDisabled}>
        ← Previous
      </button>
      
      <span class="pagination-info">
        Page ${this.currentPage} of ${totalPages}
      </span>
      
      <button class="pagination-btn next" data-action="next" ${nextDisabled}>
        Next →
      </button>
    `;
  }
  
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing BlogManager...');
  try {
    window.blogManager = new BlogManager();
  } catch (error) {
    console.error('Error initializing BlogManager:', error);
    // Fallback: show a message if BlogManager fails
    const container = document.querySelector('.featured-projects');
    if (container) {
      container.innerHTML = '<div class="project-card"><p>Error loading blog posts. Please refresh the page.</p></div>';
    }
  }
});
