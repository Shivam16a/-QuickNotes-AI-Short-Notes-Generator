// Markdown Parser Module (With Inline Bold Segmentation Support)
function parseMarkdownToJSON(text) {
    const lines = text.split("\n");
    const parsedData = [];
    let activeBulletList = [];

    function flushBullets() {
        if (activeBulletList.length > 0) {
            parsedData.push({ type: "bullet", items: activeBulletList });
            activeBulletList = [];
        }
    }

    // Helper function to split a string into text segments with bold flags
    function parseInlineFormatting(inputText) {
        const regex = /\*\*(.*?)\*\*/g;
        const segments = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(inputText)) !== null) {
            // Match se pehle ka normal text add karein
            if (match.index > lastIndex) {
                segments.push({ text: inputText.substring(lastIndex, match.index), bold: false });
            }
            // Bold text add karein
            segments.push({ text: match[1], bold: true });
            lastIndex = regex.lastIndex;
        }

        // Bacha hua baaki text add karein
        if (lastIndex < inputText.length) {
            segments.push({ text: inputText.substring(lastIndex), bold: false });
        }

        // Agar koi match nahi mila, toh poora text as single normal segment return karein
        if (segments.length === 0) {
            segments.push({ text: inputText, bold: false });
        }

        return segments;
    }

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Headers checking (Headers ko bhi inline parse kar sakte hain)
        if (trimmed.startsWith("# ")) {
            flushBullets();
            parsedData.push({ type: "title", segments: parseInlineFormatting(trimmed.replace("# ", "")) });
        } else if (trimmed.startsWith("## ")) {
            flushBullets();
            parsedData.push({ type: "heading", segments: parseInlineFormatting(trimmed.replace("## ", "")) });
        } else if (trimmed.startsWith("### ")) {
            flushBullets();
            parsedData.push({ type: "subheading", segments: parseInlineFormatting(trimmed.replace("### ", "")) });
        }
        // Bullets checking
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const bulletText = trimmed.substring(2);
            activeBulletList.push(parseInlineFormatting(bulletText));
        }
        // Standard Paragraphs
        else {
            flushBullets();
            parsedData.push({ type: "paragraph", segments: parseInlineFormatting(trimmed) });
        }
    });

    flushBullets();
    return parsedData;
}

// Utility to clean emojis for PDF compatibility
function stripEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
}