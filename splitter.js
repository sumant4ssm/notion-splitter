import { getH1Title, createPage, getPageBlocks } from './notionApi.js';
import { updateStatus, createSectionPreview } from './ui.js';

let sections = [];
let currentPageId = '';

// Function to create a page for a single section
async function createPageForSection(section, index) {
    const statusElement = document.getElementById(`section-status-${index}`);
    statusElement.className = 'px-4 py-2 text-sm bg-yellow-50 border-t';
    try {
        statusElement.textContent = '⏳ Creating page...';
        statusElement.style.display = 'block';

        const pageData = await createPage(currentPageId, section.title, section.blocks);
        
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

// Main function to analyze the page
async function analyzePage(pageId) {
    try {
        currentPageId = pageId;
        updateStatus('Loading page content...');
        
        const allBlocks = await getPageBlocks(pageId);
        
        // Split content by H1 headers
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
            sectionsList.appendChild(createSectionPreview(section, index, createPageForSection));
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