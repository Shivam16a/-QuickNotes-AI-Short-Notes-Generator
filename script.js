let generatedNotes = "";



const generateBtn =
    document.getElementById("generate");


const topicInput =
    document.getElementById("topic");


const notesBox =
    document.getElementById("notes");


const loader =
    document.getElementById("loader");





generateBtn.onclick = async () => {


    let topic =
        topicInput.value.trim();



    let length =
        document.getElementById("length").value;


    let custom =
        document.getElementById("customWords").value;



    if (custom) {

        length = custom;

    }



    if (!topic) {

        alert("Enter topic");

        return;

    }



    loader.style.display = "block";



    let prompt = `


Create educational short notes.


Topic:
${topic}


Length:
${length} words


Format rules:

Use emojis.

Use headings.

Use bullet points.

Use simple English.

Add:
1. Definition
2. Key Points
3. Examples
4. Conclusion


Return Markdown only.


`;

    try {


        let res =
            await fetch(

                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,

                {


                    method: "POST",


                    headers: {

                        "Content-Type": "application/json"

                    },


                    body: JSON.stringify({

                        contents: [

                            {

                                parts: [

                                    {
                                        text: prompt
                                    }

                                ]

                            }

                        ]

                    })


                }

            );




        let data =
            await res.json();



        generatedNotes =
            data.candidates[0]
                .content
                .parts[0]
                .text;



        notesBox.innerHTML =
            markdownToHTML(generatedNotes);
    }

    catch (e) {

        notesBox.innerHTML =
            "Error generating notes";
    }

    loader.style.display = "none";


};

function markdownToHTML(text) {


    return text


        .replace(/^### (.*$)/gim,
            "<h2>📌 $1</h2>")


        .replace(/^## (.*$)/gim,
            "<h2>📚 $1</h2>")


        .replace(/^# (.*$)/gim,
            "<h1>📝 $1</h1>")


        .replace(
            /\*\*(.*?)\*\*/g,
            "<b>$1</b>"
        )


        .replace(/^- (.*$)/gim, "<li>$1</li>")


        .replace(
            /\n/g,
            "<br>"
        );


}

// let generatedNotes = "";



// ===============================
// MARKDOWN PARSER
// ===============================


function parseNotes(text) {


    let result = [];

    let lines =
        text.split("\n");


    let bullets = [];

    let paragraph = [];



    function pushParagraph() {

        if (paragraph.length) {

            result.push({

                type: "text",

                text:
                    paragraph.join(" ")

            });

            paragraph = [];

        }

    }



    function pushBullets() {

        if (bullets.length) {

            result.push({

                type: "bullet",

                items: bullets

            });


            bullets = [];

        }

    }




    lines.forEach(line => {


        line = line.trim();


        if (!line) {
            pushParagraph();
            pushBullets();
            return;
        }



        // Emoji heading

        if (
            line.startsWith("📌") ||
            line.startsWith("📚") ||
            line.startsWith("📝")
        ) {


            pushParagraph();
            pushBullets();



            result.push({

                type: "heading",

                text:
                    line

            });


        }



        // bullet

        else if (

            line.startsWith("*") ||
            line.startsWith("-")

        ) {


            pushParagraph();


            bullets.push(

                line
                    .replace(/^[*-]\s*/, "")

            );


        }



        else {


            pushBullets();


            paragraph.push(line);

        }
    });

    pushParagraph();
    pushBullets();
    return result;
}

// ===============================
// PDF GENERATOR
// ===============================


function downloadPDF() {



    if (!generatedNotes) {

        alert("Generate notes first");

        return;

    }



    let parsed = parseNotes(generatedNotes);

    let body = [];

    parsed.forEach(item => {

        if (item.type === "heading") {

            body.push({
                text: item.text,
                style: "heading"
            });
        }

        else if (item.type === "bullet") {

            body.push({

                ul: item.items,

                style: "bullet"

            });
        }

        else {

            body.push({

                text: item.text,

                style: "normal"

            });
        }

    });





    let docDefinition = {



        pageSize: "A4",


        pageMargins: [
            40,
            70,
            40,
            60
        ],




        header: function () {


            return {

                text: "🤖 AI Short Note Generator",

                alignment: "center",

                color: "#4F46E5",

                fontSize: 14,

                margin: 20


            };


        },





        footer: function (currentPage, pageCount) {


            return {

                text:
                    `Page ${currentPage} of ${pageCount}`,

                alignment: "center",

                fontSize: 10,

                color: "#666"

            };


        },





        content: [



            {

                text: "📚 AI Generated Notes",

                style: "title"


            },



            {

                canvas: [{

                    type: "line",

                    x1: 0,
                    y1: 5,

                    x2: 515,
                    y2: 5,

                    lineWidth: 1,

                    lineColor: "#4F46E5"

                }]


            },



            {

                text:
                    "📑 Table of Contents",

                style: "toc"


            },



            {

                ul: [

                    "Definition",

                    "Key Points",

                    "Examples",

                    "Conclusion"

                ]

            },



            ...body




        ],




        styles: {



            title: {


                fontSize: 22,

                bold: true,

                color: "#4F46E5",

                margin: [0, 0, 0, 20]


            },



            heading: {


                fontSize: 16,

                bold: true,

                color: "#7C3AED",

                margin: [0, 15, 0, 8]


            },



            normal: {


                fontSize: 11,

                lineHeight: 1.5

            },



            bullet: {


                fontSize: 11,

                color: "#111827",

                margin: [10, 5]

            },



            toc: {


                fontSize: 14,

                bold: true,

                color: "#059669",

                margin: [0, 10]

            }



        }


    };




    pdfMake
        .createPdf(docDefinition)
        .download(
            "AI_Short_Notes.pdf"
        );



}







// ===============================
// DOCX GENERATOR
// ===============================


async function downloadDOCX() {



    if (!generatedNotes) {

        alert("Generate notes first");

        return;

    }



    const {

        Document,

        Paragraph,

        TextRun,

        HeadingLevel,

        BulletLevel,

        Packer


    } = docx;





    let children = [];



    children.push(


        new Paragraph({

            text: "🤖 AI Short Note Generator",

            heading:
                HeadingLevel.TITLE

        })


    );




    children.push(

        new Paragraph({

            text: "📚 AI Generated Notes",

            heading:
                HeadingLevel.HEADING_1

        })

    );

    let parsed =
        parseNotes(generatedNotes);

    parsed.forEach(item => {


        if (item.type === "heading") {



            children.push(

                new Paragraph({

                    text: "📌 " + item.text,

                    heading:
                        HeadingLevel.HEADING_2

                })

            );



        }



        else if (item.type === "bullet") {



            item.items.forEach(b => {


                children.push(

                    new Paragraph({

                        text: b,

                        bullet: {
                            level: 0
                        }

                    })

                );



            });


        }



        else {



            children.push(

                new Paragraph({

                    children: [

                        new TextRun({

                            text: item.text

                        })

                    ]

                })

            );



        }



    });





    const doc =
        new Document({


            sections: [

                {

                    properties: {},

                    children: children

                }

            ]

        });




    const blob =
        await Packer.toBlob(doc);



    let a =
        document.createElement("a");



    a.href =
        URL.createObjectURL(blob);



    a.download =
        "AI_Short_Notes.docx";



    a.click();



}

function copyNotes() {


    navigator.clipboard.writeText(
        generatedNotes
    );


    alert("Copied");

}