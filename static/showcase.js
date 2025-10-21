// Showcase Content Loader
// Loads markdown files and renders them as expandable cards

class ShowcaseLoader {
	constructor(containerSelector, contentFiles) {
		this.container = document.querySelector(containerSelector);
		this.contentFiles = contentFiles;
		
		// Configure marked for better styling
		marked.setOptions({
			breaks: true,
			gfm: true
		});
		
		this.init();
	}
	
	async init() {
		if (!this.container) {
			console.error('Showcase container not found');
			return;
		}
		
		await this.loadAllContent();
	}
	
	async loadAllContent() {
		try {
			const contentPromises = this.contentFiles.map(async (file) => {
				try {
					const response = await fetch(`showcase/${file}`);
					if (!response.ok) {
						throw new Error(`Failed to load ${file}`);
					}
					const markdown = await response.text();
					return { file, markdown, success: true };
				} catch (error) {
					console.error(`Error loading ${file}:`, error);
					return { file, error: error.message, success: false };
				}
			});
			
			const results = await Promise.all(contentPromises);
			this.renderContent(results);
			
		} catch (error) {
			console.error('Error loading showcase content:', error);
			this.renderError();
		}
	}
	
	renderContent(results) {
		const successfulResults = results.filter(r => r.success);
		
		if (successfulResults.length === 0) {
			this.renderError();
			return;
		}
		
		const cardsHtml = successfulResults.map((result, index) => {
			const html = marked.parse(result.markdown);
			const preview = this.extractPreview(result.markdown);
			
			return `
				<div class="project-card expandable-card" data-index="${index}">
					<div class="card-content">
						<div class="card-header">
							<h3>${preview.heading}</h3>
							<button class="expand-btn" onclick="showcaseLoader.toggleCard(${index})">
								<i class="fas fa-chevron-down"></i>
							</button>
						</div>
						<div class="card-text-container">
							<div class="card-text-preview">
								<p>${preview.text}</p>
							</div>
							<div class="card-text-full" style="display: none;">
								${html.replace(`<h1>${preview.heading}</h1>`, '').trim()}
							</div>
						</div>
					</div>
				</div>
			`;
		}).join('');
		
		this.container.innerHTML = cardsHtml;
	}
	
	extractPreview(markdown) {
		// Extract the first heading and first paragraph for preview
		const lines = markdown.split('\n');
		let heading = '';
		let preview = '';
		
		for (const line of lines) {
			if (line.startsWith('# ')) {
				heading = line.replace('# ', '');
				break;
			}
		}
		
		// Find first paragraph after heading
		let foundHeading = false;
		for (const line of lines) {
			if (line.startsWith('# ')) {
				foundHeading = true;
				continue;
			}
			if (foundHeading && line.trim() && !line.startsWith('#')) {
				preview = line.trim();
				break;
			}
		}
		
		return { heading, text: preview };
	}
	
	toggleCard(index) {
		const card = document.querySelector(`[data-index="${index}"]`);
		const preview = card.querySelector('.card-text-preview');
		const fullContent = card.querySelector('.card-text-full');
		const expandBtn = card.querySelector('.expand-btn i');
		
		if (fullContent.style.display === 'none') {
			// Expanding - just show full content, hide preview
			preview.style.display = 'none';
			fullContent.style.display = 'block';
			fullContent.style.maxHeight = fullContent.scrollHeight + 'px';
			fullContent.style.opacity = '1';
			expandBtn.className = 'fas fa-chevron-up';
			card.classList.add('expanded');
		} else {
			// Collapsing - hide full content, show preview
			fullContent.style.maxHeight = '0';
			fullContent.style.opacity = '0';
			setTimeout(() => {
				fullContent.style.display = 'none';
				preview.style.display = 'block';
			}, 300);
			expandBtn.className = 'fas fa-chevron-down';
			card.classList.remove('expanded');
		}
	}
	
	renderError() {
		this.container.innerHTML = `
			<div class="project-card">
				<h3>Content Loading Error</h3>
				<p>Unable to load showcase content. Please refresh the page or check your server setup.</p>
				<p><strong>Note:</strong> This site needs to be served via HTTP (not opened as a file) to load markdown content.</p>
			</div>
		`;
	}
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
	// List of markdown files to load
	const contentFiles = [
		'website.md',
		'mediacloud.md',
		'creative-coding.md'
	];
	
	// Create global instance
	window.showcaseLoader = new ShowcaseLoader('.featured-projects', contentFiles);
});
