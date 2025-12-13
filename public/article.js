'use strict'

function main() {
	document.getElementById('article-title').textContent = getArticleTitle();
	const text = getTextTagesschau();
	if (!text) {
		document.getElementById('article-detail').innerHTML = 
			'<p>Article not found. <a href="/">Return to homepage</a></p>';
		return;
	}

	const sentences = splitToSentences(text, 'de');
	const articleDiv = document.getElementById('article-content');
	articleDiv.append(sentencesToArticleDiv(sentences));
	articleDiv.addEventListener('click', handleClickInArticle);
}

async function handleClickInArticle(event) {
	const button = event.target.closest('button');
	if (!button && !this.contains(button)) {
		console.error("Clicked button doesn't exist or doesn't belong to the class");
		return;
	}
	const translation = await translateWithMyMemory(button.textContent, "de", "en");
	console.log(translation);
	alert(translation);
}

function sentencesToArticleDiv(sentences) {
	const articleDiv = document.createElement("div");
	sentences.forEach(sentence => { 
		const sentenceDiv = sentenceToButtonDiv(sentence);
		articleDiv.appendChild(sentenceDiv);
	});
	return articleDiv;
}

/**
 * Creates a DIV containing buttons for each word in the sentence.
 * @param {string} sentence - The sentence string to process.
 * @returns {HTMLElement} A div element containing the word buttons.
 */
function sentenceToButtonDiv(sentence) {
	const sentenceDiv = document.createElement("div");
	sentenceDiv.classList.add("sentence");
	const rawWords = sentence.split(/\s+/);

	rawWords.forEach(word => {
		if (!word.trim()) return;
		const btn = document.createElement("button");
		btn.textContent = word;
		sentenceDiv.appendChild(btn);
	});
	return sentenceDiv;
}

/**
 * Retrieves the current article based on the URL ID.
 * @returns {Object|null} The article object, or null if not found/invalid.
 */
function getCurrentArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (!idParam || isNaN(idParam)) {
        console.warn("getCurrentArticle: Invalid or missing 'id' in URL.");
        return null;
    }

    try {
        const storedData = localStorage.getItem('articlesTagesschau');
        if (!storedData) return null;
        
        const articles = JSON.parse(storedData);
        const articleId = parseInt(idParam, 10);
        const article = articles[articleId];

        if (!article) {
            console.warn(`getCurrentArticle: Article ID ${articleId} not found.`);
            return null;
        }

        return article;

    } catch (e) {
        console.error("getCurrentArticle: Data retrieval failed.", e);
        return null;
    }
}

// Retrieves article text from Tagesschau object.
function getTextTagesschau() {
	const article = getCurrentArticle();
	if (!article) return null;

	const parser = new DOMParser();
	let fullArticleText = '';
	article.content.forEach(item => {
		if (item.type !== 'text' || !item.value)
			return;
		const doc = parser.parseFromString(item.value, 'text/html');
		fullArticleText += (doc.body.textContent || '') + ' ';
	});

	return fullArticleText.trim();
}

function getArticleTitle() {
    const article = getCurrentArticle();
    return article ? article.title : null;
}

/**
 * Segments a text string into an array of sentences using Intl.Segmenter.
 * @param {string} text - The full text to split.
 * @param {string} lang - The language code (e.g., 'de', 'en').
 * @returns {string[]} An array of sentence strings.
 */
function splitToSentences(text, lang) {
	const sentenceSeg = new Intl.Segmenter(lang, { granularity: 'sentence' });
	const sentences = Array.from(sentenceSeg.segment(text), s => s.segment);
	return sentences;
}

/**
 * Iterates through buttons in a sentenceDiv and applies category classes.
 * Assumes 'sets' is globally available.
 * @param {HTMLElement} sentenceDiv - The div containing word buttons.
 */
// function setButtons(sentenceDiv) {
// 	const buttons = sentenceDiv.querySelectorAll("button");
// 	buttons.forEach(btn => {
// 		let matchedCategory = null;
// 		let categoryClass = null;
// 		for (const [category, { words: setWords, className }] of sets.entries()) {
// 			if (setWords.has(btn.textContent.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, ''))) {
// 				matchedCategory = category;
// 				categoryClass = className;
// 				break;
// 			}
// 		}
// // // 			if (matchedCategory) {
// //
// // // 				btn.classList.add("word-hidden", categoryClass);
// // // 				btn.addEventListener("click", function handleClick() {
// // // 					btn.textContent = word;
// // // 					btn.classList.remove("word-hidden");
// // // 					btn.classList.add("word-visible");
// // // 					btn.removeEventListener("click", handleClick);
// // // 				});
// // // 			} else if (word === ' ') {
// // // 				return;
// // // 			} else {
// // // 				btn.textContent = word;
// // // 				btn.classList.add("word-visible");
// // // 				btn.addEventListener("click", async () => {
// // // 					const translation = await translateWithMyMemory(btn.textContent, "de", "en");
// // // 					console.log(translation);
// // // 					alert(translation);
// // // 				});
// // 	});
// }

/**
 * Translates text using the MyMemory API.
 * @returns {Promise<string|null>} The translated text or null on failure.
 */
async function translateWithMyMemory(text, sourceLang, targetLang) {
	const url = `https://mymemory.translated.net/api/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
	const response = await fetch(url);
	const data = await response.json();
	return data.responseData.translatedText;
}

const sets = new Map([
    // Artikel
    ["Bestimmter Artikel", {
        words: new Set(["der", "die", "das", "dem", "den", "des"]),
        partOfSpeech: ["artikel", "bestimmter-artikel"]
    }],

    ["Unbestimmter Artikel", {
        words: new Set(["ein", "eine", "einen", "einem", "einer", "eines"]),
        partOfSpeech: ["artikel", "unbestimmter-artikel"]
    }],

    ["Negativartikel", {
        words: new Set(["kein", "keine", "keinen", "keiner", "keines", "keinem"]),
        partOfSpeech: ["artikel", "negativartikel"]
    }],
    
    // Präpositionen
    ["Präposition mit Akkusativ", {
        words: new Set(["durch", "für", "gegen", "ohne", "um", "bis", "entlang"]),
        partOfSpeech: ["präposition", "akkusativ-präposition"]
    }],

    ["Präposition mit Dativ", {
        words: new Set(["aus", "bei", "mit", "nach", "seit", "von", "zu", "gegenüber", "außer"]),
        partOfSpeech: ["präposition", "dativ-präposition"]
    }],

    ["Präposition mit Genitiv", {
        words: new Set(["während", "wegen", "trotz", "statt", "anstatt", "außerhalb", "innerhalb", "oberhalb", "unterhalb", "diesseits", "jenseits", "unweit", "angesichts", "aufgrund", "infolge", "dank", "bezüglich", "anlässlich", "mithilfe", "mittels", "anhand", "laut", "zufolge", "hinsichtlich"]),
        partOfSpeech: ["präposition", "genitiv-präposition"]
    }],

    ["Wechselpräposition", {
        words: new Set(["an", "auf", "hinter", "in", "neben", "über", "unter", "vor", "zwischen"]),
        partOfSpeech: ["präposition", "wechselpräposition"]
    }],
    
    // Konjunktionen
    ["Subjunktion", {
        words: new Set(["dass", "weil", "da", "obwohl", "wenn", "als", "bevor", "nachdem", "während", "bis", "seit", "sobald", "solange", "falls", "sofern", "ob", "damit", "sodass", "indem", "ohne dass", "anstatt dass"]),
        partOfSpeech: ["konjunktion", "subjunktion"]
    }],

    ["Konjunktion", {
        words: new Set(["und", "oder", "aber", "denn", "sondern", "doch"]),
        partOfSpeech: ["konjunktion", "nebenordnende-konjunktion"]
    }],

    ["Konjunktionaladverb", {
        words: new Set(["deswegen", "deshalb", "daher", "darum", "folglich", "trotzdem", "dennoch", "allerdings", "außerdem", "zudem", "sonst", "andernfalls", "dann", "danach", "vorher", "zuerst", "schließlich"]),
        partOfSpeech: ["konjunktion", "konjunktionaladverb"]
    }],

    ["Mehrteilige Konjunktion", {
        words: new Set(["entweder", "oder", "weder", "noch", "sowohl", "als", "nicht", "nur", "sondern", "auch", "zwar", "je", "desto"]),
        partOfSpeech: ["konjunktion", "mehrteilige-konjunktion"]
    }]
]);

main();
