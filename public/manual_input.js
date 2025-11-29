const body = document.getElementById('body');
const inputArea = document.getElementById('inputArea');
const inputText = document.getElementById('inputText');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');

const outputArea = document.getElementById('outputArea');
const outputText = document.getElementById('outputText');
const resetBtn = document.getElementById('resetBtn');

outputArea.classList.add('hidden');

async function translateWithMyMemory(text, sourceLang, targetLang) {
	const url = `https://mymemory.translated.net/api/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
	const response = await fetch(url);
	const data = await response.json();
	return data.responseData.translatedText;
}

const sets = new Map([
	["Definitive article", {
		words: new Set(["der", "die", "das", "dem", "den", "des"]),
		className: "article"
	}],
	["Indefinitive article", {
		words: new Set(["ein", "eine", "einen", "einem", "einer", "eines"]),
		className: "article"
	}],
	["Negative article", {
		words: new Set(["kein", "keine", "keinen", "keiner"]),
		className: "article"
	}],
	["Akkusative preposition", {
		words: new Set(["durch", "für", "gegen", "ohne", "um", "bis", "entlang"]),
		className: "preposition"
	}],
	["Dative preposition", {
		words: new Set(["aus", "bei", "mit", "nach", "seit", "von", "zu", "gegenüber", "außer"]),
		className: "preposition"
	}],
	["Genitive preposition", {
		words: new Set(["während", "wegen", "trotz", "statt", "anstatt", "außerhalb", "innerhalb", "oberhalb", "unterhalb", "diesseits", "jenseits", "unweit", "angesichts", "aufgrund", "infolge"]),
		className: "preposition"
	}],
	["Akkusative/Dative preposition", {
		words: new Set(["an", "auf", "hinter", "in", "neben", "über", "unter", "vor", "zwischen"]),
		className: "preposition"
	}]
]);

inputText.addEventListener('input', () => {
	localStorage.setItem('input', inputText.value);
})

window.addEventListener('load', () => {
	const saved_input = localStorage.getItem('input');
	if (saved_input) {
		inputText.value = saved_input;
	}
});

submitBtn.addEventListener('click', () => {
	const text = inputText.value.trim();
	if (!text) {
		event.preventDefault();
		alert("Please enter a text for processing!");
		return ;
	}

	const sentenceSeg = new Intl.Segmenter('de', { granularity: 'sentence' });
	const sentences = Array.from(sentenceSeg.segment(text), s => s.segment);

	sentences.forEach(sentence => {
		const sentenceDiv = document.createElement("div");
		sentenceDiv.classList.add("sentence");
		const rawWords = sentence.split(/\s+/);

		rawWords.forEach(word => {
			const btn = document.createElement("button");
			btn.textContent = word;

			let matchedCategory = null;
			let categoryClass = null;
			for (const [category, { words: setWords, className }] of sets.entries()) {
				if (setWords.has(word.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, ''))) {
					matchedCategory = category;
					categoryClass = className;
					break;
				}
			}

			if (matchedCategory) {
				btn.textContent = categoryClass.slice(0, 3);
				btn.classList.add("word-hidden", categoryClass);
				btn.addEventListener("click", function handleClick() {
					btn.textContent = word;
					btn.classList.remove("word-hidden");
					btn.classList.add("word-visible");
					btn.removeEventListener("click", handleClick);
				});
			} else if (word === ' ') {
				return;
			} else {
				btn.textContent = word;
				btn.classList.add("word-visible");
				btn.addEventListener("click", async () => {
					const translation = await translateWithMyMemory(btn.textContent, "de", "en");
					console.log(translation);
					alert(translation);
				});

				<!-- btn.addEventListener("click", async function translateText() { -->
				<!-- 	if ('Translator' in self) { -->
				<!-- 		console.log("in translator"); -->
				<!-- 		const translator = await Translator.create({ -->
				<!-- 			sourceLanguage: "de", -->
				<!-- 			targetLanguage: "en" -->
				<!-- 		}); -->
				<!-- 		const translation = await translator.translate(btn.textContent); -->
				<!-- 		console.log(translation); -->
				<!-- 		alert(translation); -->
				<!-- 	} -->
				<!-- }); -->

			}
			sentenceDiv.appendChild(btn);
		});
		outputText.appendChild(sentenceDiv);
	});

	localStorage.setItem("output", outputText.innerHTML);
	outputArea.classList.remove('hidden');
	inputArea.classList.add('hidden');
});

clearBtn.addEventListener('click', () => {
	inputText.value = '';
});

resetBtn.addEventListener('click', () => {
	outputText.replaceChildren();
	outputArea.classList.add('hidden');
	inputArea.classList.remove('hidden');
})
