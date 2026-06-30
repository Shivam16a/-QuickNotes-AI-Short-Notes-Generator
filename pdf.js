// PDF Generation Module (With Inline Bold Support)
function downloadPDF() {
    if (!window.generatedNotes) {
        alert("Please generate notes first.");
        return;
    }

    const structuredData = parseMarkdownToJSON(window.generatedNotes);
    const pdfContent = [];

    structuredData.forEach(item => {
        if (item.type === "bullet") {
            const listItems = [];
            item.items.forEach(bulletSegments => {
                // Har bullet point ke andar ke segments ko pdfMake format me badlein
                const pdfInlineSegments = bulletSegments.map(seg => ({
                    text: stripEmojis(seg.text),
                    bold: seg.bold
                }));
                listItems.push({ text: pdfInlineSegments });
            });
            pdfContent.push({ ul: listItems, style: "docBullet" });
        } else {
            // Title, Heading, Subheading aur Paragraphs ke liye segments create karein
            const pdfInlineSegments = item.segments.map(seg => ({
                text: stripEmojis(seg.text),
                bold: seg.bold
            }));

            let currentStyle = "docParagraph";
            if (item.type === "title") currentStyle = "docTitle";
            else if (item.type === "heading") currentStyle = "docHeading";
            else if (item.type === "subheading") currentStyle = "docSubheading";

            pdfContent.push({ text: pdfInlineSegments, style: currentStyle });
        }
    });

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [45, 60, 45, 60],
        content: pdfContent,
        styles: {
            docTitle: { fontSize: 24, bold: true, color: "#4F46E5", margin: [0, 0, 0, 15] },
            docHeading: { fontSize: 16, bold: true, color: "#1E1B4B", margin: [0, 15, 0, 6] },
            docSubheading: { fontSize: 13, bold: true, color: "#7C3AED", margin: [0, 10, 0, 4] },
            docParagraph: { fontSize: 11, color: "#334155", lineHeight: 1.5, margin: [0, 0, 0, 10] },
            docBullet: { fontSize: 11, color: "#334155", margin: [10, 2, 0, 8], lineHeight: 1.4 }
        }
    };

    const time = new Date;
    pdfMake.createPdf(docDefinition).download(`QuickNotes${time.toLocaleTimeString('en-IN',{hour12:true})}.pdf`);
}