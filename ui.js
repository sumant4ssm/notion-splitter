import { formatBlockContent, resetListIndex } from './formatters/blocks.js';

// Helper function to update status
function updateStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    console.log(message);
}

// Helper function to create section preview
function createSectionPreview(section, index, createPageForSection) {
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
    content.className = 'p-4 space-y-2';
    
    // Reset list index before formatting content
    resetListIndex();
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

export { updateStatus, createSectionPreview, togglePreview };