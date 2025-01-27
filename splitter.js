// Helper function to get title from H1 block
function getH1Title(block) {
    if (block.type !== 'heading_1') return null;
    const richText = block.heading_1.rich_text;
    if (!richText || richText.length === 0) return null;
    return richText[0].plain_text;
}

// Helper function to format rich text
function formatRichText(richText) {
    if (!richText || richText.length === 0) return '';
    return richText.map(text => {
        let content = text.plain_text;
        if (text.annotations.bold) content = `<strong>${content}</strong>`;
        if (text.annotations.italic) content = `<em>${content}</em>`;
        if (text.annotations.code) content = `<code>${content}</code>`;
        if (text.annotations.strikethrough) content = `<del>${content}</del>`;
        if (text.annotations.underline) content = `<u>${content}</u>`;
        if (text.href) content = `<a href="${text.href}" target="_blank" class="text-blue-500 hover:underline">${content}</a>`;
        return content;
    }).join('');
}

// Helper function to format table
function formatTable(block) {
    if (!block.children) return '<div>Loading table...</div>';
    
    const rows = block.children;
    let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200">';
    
    // Add rows
    html += '<tbody class="bg-white divide-y divide-gray-200">';
    rows.forEach(row => {
        html += '<tr>';
        row.table_row.cells.forEach(cell => {
            html += `<td class="px-6 py-4 whitespace-nowrap text-sm">
                ${formatRichText(cell)}
            </td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

// Helper function to format block content
function formatBlockContent(block) {
    switch (block.type) {
        case 'paragraph':
            return `<p class="text-gray-700">${formatRichText(block.paragraph.rich_text)}</p>`;
        
        case 'heading_1':
            return `<h1 class="text-2xl font-bold mt-6 mb-4">${formatRichText(block[block.type].rich_text)}</h1>`;
        
        case 'heading_2':
            return `<h2 class="text-xl font-bold mt-4 mb-2">${formatRichText(block[block.type].rich_text)}</h2>`;
        
        case 'heading_3':
            return `<h3 class="text-lg font-bold mt-3 mb-2">${formatRichText(block[block.type].rich_text)}</h3>`;
        
        case 'bulleted_list_item':
            return `<div class="flex items-start space-x-2">
                <span class="mt-1">•</span>
                <span>${formatRichText(block[block.type].rich_text)}</span>
            </div>`;
        
        case 'numbered_list_item':
            return `<div class="flex items-start space-x-2">
                <span class="font-medium mr-2">•</span>
                <span>${formatRichText(block[block.type].rich_text)}</span>
            </div>`;
        
        case 'quote':
            return `<blockquote class="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-700">
                ${formatRichText(block.quote.rich_text)}
            </blockquote>`;
        
        case 'code':
            return `<pre class="bg-gray-100 p-3 rounded my-2 overflow-x-auto">
                <code>${formatRichText(block.code.rich_text)}</code>
            </pre>`;
        
        case 'callout':
            return `<div class="bg-gray-50 p-4 rounded-lg my-2">
                ${block.callout.icon ? block.callout.icon.emoji : ''}
                ${formatRichText(block.callout.rich_text)}
            </div>`;
        
        case 'toggle':
            return `<details class="my-2">
                <summary class="cursor-pointer">${formatRichText(block.toggle.rich_text)}</summary>
                <div class="pl-4 mt-2">${block.children ? block.children.map(child => formatBlockContent(child)).join('') : ''}</div>
            </details>`;
        
        case 'divider':
            return '<hr class="my-4 border-t border-gray-200">';
        
        case 'table':
            return formatTable(block);

        default:
            console.log('Unknown block type:', block.type, block);
            return `<div class="text-gray-500 text-sm">[${block.type}] ${
                block[block.type]?.rich_text ? formatRichText(block[block.type].rich_text) : JSON.stringify(block[block.type])
            }</div>`;
    }
}

// Helper function to update status
function updateStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    console.log(message);
}

// Helper function to create section preview
function createSectionPreview(section, index) {
    const div = document.createElement('div');
    div.className = 'border rounded-lg bg-white shadow-sm';

    // Header with toggle button
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50';
    header.onclick = () => togglePreview(index);
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'flex-1';
    titleDiv.innerHTML = `
        <h3 class="font-medium">${section.title}</h3>
        <p class="text-sm text-gray-500">${section.blocks.length} blocks</p>
    `;
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex items-center space-x-2';
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200';
    toggleButton.textContent = 'Toggle Preview';
    
    const createButton = document.createElement('button');
    createButton.className = 'px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600';
    createButton.textContent = 'Create Page';
    createButton.onclick = (e) => {
        e.stopPropagation();
        createPageForSection(section, index);
    };

    buttonGroup.appendChild(toggleButton);
    buttonGroup.appendChild(createButton);
    
    header.appendChild(titleDiv);
    header.appendChild(buttonGroup);
    
    // Content preview (collapsed by default)
    const preview = document.createElement('div');
    preview.className = 'content-preview border-t';
    preview.id = `preview-${index}`;
    
    const content = document.createElement('div');
    content.className = 'p-4 space-y-2 text-sm';
    content.innerHTML = section.blocks.map(block => formatBlockContent(block)).join('');
    
    preview.appendChild(content);
    
    // Status indicator
    const status = document.createElement('div');
    status.className = 'px-4 py-2 text-sm hidden';
    status.id = `section-status-${index}`;
    
    div.appendChild(header);
    div.appendChild(preview);
    div.appendChild(status);
    
    return div;
}

// Toggle preview visibility
function togglePreview(index) {
    const preview = document.getElementById(`preview-${index}`);
    preview.classList.toggle('expanded');
}

// Function to create a page for a single section
async function createPageForSection(section, index) {
    const statusElement = document.getElementById(`section-status-${index}`);
    statusElement.className = 'px-4 py-2 text-sm bg-yellow-50 border-t';
    try {
        statusElement.textContent = '⏳ Creating page...';
        statusElement.style.display = 'block';

        // Create new page
        const newPage = await fetch('/api/notion/pages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: { page_id: currentPageId },
                properties: {
                    title: {
                        title: [{ text: { content: section.title } }]
                    }
                },
                children: section.blocks
            })
        });
        
        const pageData = await newPage.json();
        
        if (pageData.error) {
            throw new Error(pageData.error);
        }

        statusElement.className = 'px-4 py-2 text-sm bg-green-50 border-t';
        statusElement.innerHTML = `
            ✅ Page created! 
            <a href="https://notion.so/${pageData.id.replace(/-/g, '')}" 
               target="_blank" 
               class="text-blue-500 hover:underline">
                View new page
            </a>
            (verify content before deleting from main page)
        `;
        
    } catch (error) {
        statusElement.className = 'px-4 py-2 text-sm bg-red-50 border-t';
        statusElement.textContent = `❌ Error: ${error.message}`;
        console.error('Error creating page:', error);
    }
}

let sections = [];
let currentPageId = '';

// Main function to analyze the page
async function analyzePage(pageId) {
    try {
        currentPageId = pageId;
        updateStatus('Loading page content...');
        
        // Step 1: Get all blocks from the page
        let allBlocks = [];
        let hasMore = true;
        let startCursor = undefined;
        
        while (hasMore) {
            const response = await fetch(`/api/notion/blocks/${pageId}/children?start_cursor=${startCursor || ''}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            allBlocks = [...allBlocks, ...data.results];
            hasMore = data.has_more;
            startCursor = data.next_cursor;
        }
        
        // Step 2: Split content by H1 headers
        let currentSection = [];
        let currentTitle = 'Main Content';
        sections = [];
        
        allBlocks.forEach(block => {
            if (block.type === 'heading_1') {
                if (currentSection.length > 0) {
                    sections.push({
                        title: currentTitle,
                        blocks: [...currentSection]
                    });
                }
                currentTitle = getH1Title(block) || 'Untitled Section';
                currentSection = [block];
            } else {
                currentSection.push(block);
            }
        });
        
        // Add the last section
        if (currentSection.length > 0) {
            sections.push({
                title: currentTitle,
                blocks: currentSection
            });
        }
        
        // Update UI with sections
        const sectionsList = document.getElementById('sectionsList');
        sectionsList.innerHTML = '';
        sections.forEach((section, index) => {
            sectionsList.appendChild(createSectionPreview(section, index));
        });
        
        updateStatus(`Found ${sections.length} sections. Click on each section to preview content.`);
        
    } catch (error) {
        updateStatus(`Error: ${error.message}`);
        console.error('Error analyzing page:', error);
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyzeButton');
    const pageIdInput = document.getElementById('pageId');
    
    analyzeButton.addEventListener('click', () => {
        const pageId = pageIdInput.value.trim();
        if (pageId) {
            analyzePage(pageId);
        } else {
            updateStatus('Please enter a valid page ID');
        }
    });
});