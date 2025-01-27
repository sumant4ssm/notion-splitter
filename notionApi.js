// Helper function to get title from H1 block
function getH1Title(block) {
    if (block.type !== 'heading_1') return null;
    const richText = block.heading_1.rich_text;
    if (!richText || richText.length === 0) return null;
    return richText[0].plain_text;
}

// Clean block for API submission
function cleanBlockForApi(block) {
    // Remove properties that Notion API doesn't accept
    const cleanBlock = {
        type: block.type,
        [block.type]: block[block.type]
    };

    // Remove object property if it exists
    if (cleanBlock[block.type]?.object) {
        delete cleanBlock[block.type].object;
    }

    // Handle children recursively if they exist
    if (block.has_children && block.children) {
        cleanBlock[block.type].children = block.children.map(child => cleanBlockForApi(child));
    }

    return cleanBlock;
}

// Function to fetch children blocks recursively with pagination
async function getBlockChildrenRecursive(blockId) {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await fetch(`/api/notion/blocks/${blockId}/children?start_cursor=${startCursor || ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (!data.results) {
            console.error('No results in response:', data);
            break;
        }

        // For each block that has children, fetch them recursively
        const blocksWithChildren = await Promise.all(
            data.results.map(async (block) => {
                if (block.has_children) {
                    console.log('Fetching children for block:', block.type, block.id);
                    const children = await getBlockChildrenRecursive(block.id);
                    return { ...block, children };
                }
                return block;
            })
        );

        allResults = [...allResults, ...blocksWithChildren];
        hasMore = data.has_more;
        startCursor = data.next_cursor;
    }

    return allResults;
}

// Function to create a new page
async function createPage(currentPageId, title, blocks) {
    console.log('Creating page:', title, 'with blocks:', blocks.length);
    
    // Clean blocks for API
    const cleanedBlocks = blocks.map(block => cleanBlockForApi(block));
    
    // Create the page first
    const pageResponse = await fetch('/api/notion/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: { page_id: currentPageId },
            properties: {
                title: {
                    title: [{ text: { content: title } }]
                }
            }
        })
    });
    
    const pageData = await pageResponse.json();
    if (!pageData.id) {
        throw new Error('Failed to create page: ' + JSON.stringify(pageData));
    }

    // Then append blocks in batches of 100
    const batchSize = 100;
    for (let i = 0; i < cleanedBlocks.length; i += batchSize) {
        const batch = cleanedBlocks.slice(i, i + batchSize);
        const appendResponse = await fetch('/api/notion/blocks/' + pageData.id + '/children', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                children: batch
            })
        });
        
        const appendData = await appendResponse.json();
        if (appendData.error) {
            console.error('Error appending blocks:', appendData.error);
            throw new Error('Failed to append blocks: ' + appendData.error);
        }
    }
    
    return pageData;
}

// Function to get all blocks from a page with their children
async function getPageBlocks(pageId) {
    console.log('Fetching blocks for page:', pageId);
    const blocks = await getBlockChildrenRecursive(pageId);
    console.log('Total blocks fetched:', blocks.length);
    
    // Add a has_next property to help with list formatting
    blocks.forEach((block, index, array) => {
        if (block.type === 'numbered_list_item' || block.type === 'bulleted_list_item') {
            block.has_next = index < array.length - 1 && 
                            array[index + 1].type === block.type;
        }
    });
    
    return blocks;
}

export { getH1Title, createPage, getPageBlocks };