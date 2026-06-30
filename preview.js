// Live HTML Preview Renderer
function renderMarkdownToHTML(markdownText) {
    let html = markdownText
        .replace(/^### (.*$)/gim, "<h3>📌 $1</h3>")
        .replace(/^## (.*$)/gim, "<h2>📚 $1</h2>")
        .replace(/^# (.*$)/gim, "<h1>📝 $1</h1>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Process lists properly
    const lines = html.split('\n');
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('- ')) {
            lines[i] = (inList ? '' : '<ul>') + `<li>${lines[i].trim().substring(2)}</li>`;
            inList = true;
        } else if (inList && !lines[i].trim().startsWith('- ')) {
            lines[i] = '</ul>' + lines[i];
            inList = false;
        }
    }
    if (inList) html += '</ul>';

    return lines.join('\n').replace(/\n/g, "<br>");
}

function copyNotes() {
    if (!window.generatedNotes) {
        alert("Please generate notes first.");
        return;
    }
    navigator.clipboard.writeText(window.generatedNotes);
    alert("Copied to clipboard! 📋");
}