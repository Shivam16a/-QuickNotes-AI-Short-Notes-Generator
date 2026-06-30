// Microsoft Word DOCX Generation Module (With Inline Bold Support)
async function downloadDOCX() {
    if (!window.generatedNotes) {
        alert("Please generate notes first.");
        return;
    }

    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docx;
    const structuredData = parseMarkdownToJSON(window.generatedNotes);
    const docChildren = [];

    structuredData.forEach(item => {
        if (item.type === "bullet") {
            item.items.forEach(bulletSegments => {
                // Bullet text runs create karein
                const runs = bulletSegments.map(seg => new TextRun({
                    text: seg.text,
                    bold: seg.bold
                }));

                docChildren.push(new Paragraph({
                    children: runs,
                    bullet: { level: 0 }
                }));
            });
        } else {
            // Title, Headings aur Paragraphs ke runs create karein
            const runs = item.segments.map(seg => new TextRun({
                text: seg.text,
                bold: seg.bold
            }));

            let headingStyle = undefined;
            if (item.type === "title") headingStyle = HeadingLevel.TITLE;
            else if (item.type === "heading") headingStyle = HeadingLevel.HEADING_1;
            else if (item.type === "subheading") headingStyle = HeadingLevel.HEADING_2;

            docChildren.push(new Paragraph({
                children: runs,
                heading: headingStyle
            }));
        }
    });

    const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
    });

    const time = new Date;
    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `QuickNotes${time.toLocaleTimeString('en-IN',{hour12:true})}.docx`;
    link.click();
}