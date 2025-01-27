import { formatRichText } from './richText.js';

// Global counter for numbered lists
let currentListIndex = 0;
let isInNumberedList = false;

// Helper function to get rich text content safely
function getRichTextContent(block, type) {
    try {
        return block[type]?.rich_text ? formatRichText(block[type].rich_text) : '';
    } catch (error) {
        console.warn(`Error formatting rich text for ${type}:`, error);
        return '';
    }
}

// Helper function to format list children
function formatListChildren(children) {
    if (!children) return '';
    
    try {
        return `<div class="ml-4 mt-1">
            ${children.map(child => formatBlockContent(child)).join('')}
        </div>`;
    } catch (error) {
        console.warn('Error formatting list children:', error);
        return '';
    }
}

// Helper function to format numbered lists
function formatNumberedList(block) {
    try {
        if (!isInNumberedList) {
            currentListIndex = 0;
            isInNumberedList = true;
        }
        
        const index = currentListIndex++;
        const content = `<div class="flex items-start my-1">
            <span class="text-gray-500 w-6">${index + 1}.</span>
            <div class="flex-1">
                <div>${getRichTextContent(block, 'numbered_list_item')}</div>
                ${block.has_children && block.children ? formatListChildren(block.children) : ''}
            </div>
        </div>`;

        // If this is the last item in the list, reset the state
        if (!block.has_next) {
            isInNumberedList = false;
        }

        return content;
    } catch (error) {
        console.warn('Error formatting numbered list:', error);
        return '';
    }
}

// Helper function to format table
function formatTable(block) {
    if (!block.children) return '<div>Loading table...</div>';

    try {
        let html = '<div class="overflow-x-auto my-4"><table class="min-w-full divide-y divide-gray-200 border border-gray-200">';
        
        const rows = block.children;
        if (rows && rows.length > 0) {
            rows.forEach((row, rowIndex) => {
                if (!row.table_row?.cells) return;
                
                html += '<tr class="divide-x divide-gray-200">';
                row.table_row.cells.forEach((cell, cellIndex) => {
                    const isHeader = rowIndex === 0 && block.table?.has_column_header;
                    const cellTag = isHeader ? 'th' : 'td';
                    const cellClasses = isHeader 
                        ? 'px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        : 'px-4 py-2 text-sm text-gray-900';
                    
                    const cellContent = Array.isArray(cell) ? cell.map(text => formatRichText([text])).join(' ') : '';
                    html += `<${cellTag} class="${cellClasses}">${cellContent || '&nbsp;'}</${cellTag}>`;
                });
                html += '</tr>';
            });
        }
        
        html += '</table></div>';
        return html;
    } catch (error) {
        console.warn('Error formatting table:', error);
        return '<div class="text-red-500">Error displaying table</div>';
    }
}

// Main block formatter
function formatBlockContent(block) {
    if (!block || !block.type) {
        console.warn('Invalid block:', block);
        return '';
    }

    try {
        switch (block.type) {
            case 'paragraph':
                // Reset numbered list state when encountering a paragraph
                isInNumberedList = false;
                return `<p class="text-gray-700 my-2">${getRichTextContent(block, 'paragraph')}</p>`;
            
            case 'heading_1':
                isInNumberedList = false;
                return `<h1 class="text-2xl font-bold mt-6 mb-4">${getRichTextContent(block, 'heading_1')}</h1>`;
            
            case 'heading_2':
                isInNumberedList = false;
                return `<h2 class="text-xl font-bold mt-4 mb-2">${getRichTextContent(block, 'heading_2')}</h2>`;
            
            case 'heading_3':
                isInNumberedList = false;
                return `<h3 class="text-lg font-bold mt-3 mb-2">${getRichTextContent(block, 'heading_3')}</h3>`;
            
            case 'numbered_list_item':
                return formatNumberedList(block);
            
            case 'bulleted_list_item':
                isInNumberedList = false;
                return `<div class="flex items-start my-1">
                    <span class="text-gray-500 w-6">•</span>
                    <div class="flex-1">
                        <div>${getRichTextContent(block, 'bulleted_list_item')}</div>
                        ${block.has_children && block.children ? formatListChildren(block.children) : ''}
                    </div>
                </div>`;
            
            case 'quote':
                isInNumberedList = false;
                return `<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
                    ${getRichTextContent(block, 'quote')}
                    ${block.has_children && block.children ? formatListChildren(block.children) : ''}
                </blockquote>`;
            
            case 'code':
                isInNumberedList = false;
                return `<div class="my-4">
                    <pre class="bg-gray-50 p-4 rounded overflow-x-auto">
                        <code>${getRichTextContent(block, 'code')}</code>
                    </pre>
                </div>`;
            
            case 'callout':
                isInNumberedList = false;
                return `<div class="bg-gray-50 p-4 rounded-lg my-4 flex items-start space-x-3">
                    <div class="text-xl">${block.callout?.icon?.emoji || '💡'}</div>
                    <div class="flex-1">
                        ${getRichTextContent(block, 'callout')}
                        ${block.has_children && block.children ? formatListChildren(block.children) : ''}
                    </div>
                </div>`;
            
            case 'toggle':
                isInNumberedList = false;
                return `<details class="my-4">
                    <summary class="cursor-pointer font-medium">
                        ${getRichTextContent(block, 'toggle')}
                    </summary>
                    <div class="pl-4 mt-2">
                        ${block.has_children && block.children ? block.children.map(child => formatBlockContent(child)).join('') : ''}
                    </div>
                </details>`;
            
            case 'divider':
                isInNumberedList = false;
                return '<hr class="my-6 border-t border-gray-200">';
            
            case 'table':
                isInNumberedList = false;
                return formatTable(block);

            case 'table_of_contents':
                isInNumberedList = false;
                return `<div class="text-gray-500 text-sm my-4">
                    [Table of Contents - will be generated automatically in new page]
                </div>`;

            case 'child_page':
                isInNumberedList = false;
                return `<div class="bg-gray-50 p-4 rounded-lg my-4">
                    📄 Child Page: <span class="font-medium">${block.child_page?.title || 'Untitled'}</span>
                    <div class="text-sm text-gray-500 mt-1">
                        [Child pages will be linked automatically in the new page]
                    </div>
                </div>`;

            default:
                console.log('Unknown block type:', block.type, block);
                return `<div class="text-gray-500 text-sm my-2">
                    [${block.type}] ${block[block.type]?.rich_text ? getRichTextContent(block, block.type) : ''}
                </div>`;
        }
    } catch (error) {
        console.error('Error formatting block:', error, block);
        return `<div class="text-red-500">Error displaying ${block.type || 'unknown'} block</div>`;
    }
}

// Reset all state
function resetListIndex() {
    currentListIndex = 0;
    isInNumberedList = false;
}

export { formatBlockContent, resetListIndex };