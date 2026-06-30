// Global App Orchestrator Engine
window.generatedNotes = "";

// 1. पेज लोड होते ही पुरानी सेव की हुई Key को चेक करें (लेकिन इनपुट बॉक्स में नहीं दिखाएंगे)
window.addEventListener('load', () => {
    const topicInput = document.getElementById("topic");
    const customWordsInput = document.getElementById("customWords");
    const apiKeyInput = document.getElementById("userApiKey");
    const statusMsg = document.getElementById("apiStatusMessage");

    // इनपुट्स को रीलोड पर खाली करें
    if (topicInput) topicInput.value = "";
    if (customWordsInput) customWordsInput.value = "";

    // लोकल स्टोरेज से की (Key) ढूँढें
    const savedKey = localStorage.getItem("QUICKNOTES_GEMINI_KEY");
    if (savedKey && apiKeyInput) {
        apiKeyInput.value = ""; 
        statusMsg.textContent = "🔑 API Key loaded from secure storage.";
        statusMsg.className = "status-msg success";
    }
});

// 2. यूज़र की API Key को सेव करने और इनपुट खाली करने का अपडेटेड फ़ंक्शन
function saveUserKey() {
    const apiKeyInput = document.getElementById("userApiKey");
    const statusMsg = document.getElementById("apiStatusMessage");
    const keyVal = apiKeyInput.value.trim();

    if (!keyVal) {
        alert("Please enter a valid API Key first!");
        return;
    }

    // लोकल स्टोरेज में असली की (Key) सेव करें
    localStorage.setItem("QUICKNOTES_GEMINI_KEY", keyVal);
    statusMsg.textContent = "✅ API Key saved successfully!";
    statusMsg.className = "status-msg success";

    // 1.5 सेकंड के बाद इनपुट बॉक्स को खाली कर दें और स्टेटस बदलें
    setTimeout(() => {
        apiKeyInput.value = ""; // इनपुट बॉक्स खाली (Clean UI)
        statusMsg.textContent = "🔑 API Key loaded from secure storage.";
    }, 1500);
}

// Font Awesome आइकॉन के साथ पासवर्ड देखने/छुपाने का फ़ंक्शन
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById("userApiKey");
    const toggleBtn = document.getElementById("togglePasswordBtn");
    const eyeIcon = document.getElementById("eyeIcon");

    if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        // क्लास बदलकर आँख काटने वाला (Slash) आइकॉन लगाएं
        eyeIcon.className = "fas fa-eye-slash";
        toggleBtn.setAttribute("title", "Hide API Key");
    } else {
        apiKeyInput.type = "password";
        // वापस नॉर्मल आँख वाला आइकॉन लगाएं
        eyeIcon.className = "fas fa-eye";
        toggleBtn.setAttribute("title", "Show API Key");
    }
}

// 3. नोट्स जनरेट करने का मुख्य लॉजिक
document.getElementById("generate").onclick = async () => {
    const topicInput = document.getElementById("topic");
    const notesBox = document.getElementById("notes");
    const loader = document.getElementById("loader");
    const btnText = document.querySelector(".btn-text");
    // const apiKeyInput = document.getElementById("userApiKey");
    const savedKey = localStorage.getItem("QUICKNOTES_GEMINI_KEY");

    let topic = topicInput.value.trim();
    let length = document.getElementById("length").value;
    let customWords = document.getElementById("customWords").value;
    // let userKey = apiKeyInput.value.trim();
    let userKey = savedKey;

    if (customWords) {
        length = customWords;
    }

    if (!userKey) {
        alert("🚨 API Key is required! Please enter your Gemini API key to proceed.");
        apiKeyInput.focus();
        return;
    }

    if (!topic) {
        alert("Please enter a topic before generating!");
        topicInput.focus();
        return;
    }

    // अगर यूज़र ने बिना 'Save Key' बटन दबाए सीधे जनरेट किया है, तो ऑटो-सेव कर दें
    localStorage.setItem("QUICKNOTES_GEMINI_KEY", userKey);

    // UI Loading State एक्टिव करें
    loader.style.display = "block";
    btnText.textContent = "Generating...";
    document.getElementById("generate").disabled = true;

    const prompt = `
Create high-quality educational short notes.
Topic: ${topic}
Target Length: ${length} words

Format Blueprint Rules:
- Use clear emojis for headings.
- Strictly include hierarchy: Title (#), Headings (##), Sub-headings (###).
- Deeply cover: 1. Definition, 2. Key Points, 3. Practical Examples, 4. Strategic Conclusion.
- Use bullet points for structured data processing.
- Return RAW Markdown format output only. Avoid wrap code blocks.
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        window.generatedNotes = data.candidates[0].content.parts[0].text;

        // लाइव प्रिव्यू स्क्रीन पर रेंडर करें
        notesBox.innerHTML = renderMarkdownToHTML(window.generatedNotes);
    } catch (error) {
        console.error("API Fetch Error:", error);
        notesBox.innerHTML = "<span style='color: #ef4444; font-weight: bold;'>⚠️ Failed to generate notes. Please make sure your API Key is valid and active.</span>";
    } finally {
        // लोड स्टेट को रिसेट करें
        loader.style.display = "none";
        btnText.textContent = "Generate Notes";
        document.getElementById("generate").disabled = false;
    }
};