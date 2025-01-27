// Helper function to format rich text
function formatRichText(richText) {
    if (!richText || !Array.isArray(richText)) return '';
    
    return richText.map(text => {
        if (!text) return '';
        
        let content = text.plain_text || '';
        if (!text.annotations) return content;
        
        const { annotations } = text;
        if (annotations.bold) content = `<strong>${content}</strong>`;
        if (annotations.italic) content = `<em>${content}</em>`;
        if (annotations.code) content = `<code>${content}</code>`;
        if (annotations.strikethrough) content = `<del>${content}</del>`;
        if (annotations.underline) content = `<u>${content}</u>`;
        if (text.href) content = `<a href="${text.href}" target="_blank" class="text-blue-500 hover:underline">${content}</a>`;
        
        return content;
    }).join('');
}

export { formatRichText };