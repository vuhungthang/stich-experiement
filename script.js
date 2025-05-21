const searchInput = document.querySelector('input[placeholder="Search for a word"]');
const dictionaryResultsContainer = document.getElementById('dictionary-results');
const welcomeMessageElement = document.querySelector('.layout-content-container > h2');

searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const word = searchInput.value.trim();
    if (word) {
      fetchAndDisplayDefinition(word);
    }
  }
});

async function fetchAndDisplayDefinition(word) {
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    let resultsHtml = '';

    if (response.ok && Array.isArray(data) && data.length > 0) {
      const wordData = data[0];

      // Hide the welcome message
      if (welcomeMessageElement) {
        welcomeMessageElement.style.display = 'none';
      }

      resultsHtml += `
        <h2 class="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">${wordData.word}</h2>
        <p class="text-[#5c748a] text-sm font-normal leading-normal pb-3 pt-1 px-4">${wordData.phonetic || 'N/A'}</p>
      `;

      // Find an audio link in the phonetics array
      const audioUrl = wordData.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;

      // Add play button if audio is available
      if (audioUrl) {
        resultsHtml += `
          <div id="play-audio-container" class="flex px-4 py-3 justify-start">
            <button
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf4] text-[#0d151c] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d0d4d8]"
            >
              <div class="text-[#0d151c]" data-icon="Play" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"
                  ></path>
                </svg>
              </div>
              <span class="truncate">Play</span>
            </button>
          </div>
        `;
      }

      wordData.meanings.forEach(meaning => {
        resultsHtml += `
          <h2 class="text-[#101518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">${meaning.partOfSpeech}</h2>
        `;
        meaning.definitions.forEach(def => {
          resultsHtml += `
            <p class="text-[#101518] text-base font-normal leading-normal pb-3 pt-1 px-4">${def.definition}</p>
          `;
        });

        if (meaning.synonyms && meaning.synonyms.length > 0) {
          resultsHtml += `
            <h3 class="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Synonyms</h3>
            <div class="flex gap-3 p-3 flex-wrap pr-4">
          `;
          meaning.synonyms.forEach(syn => {
            resultsHtml += `
              <div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#eaedf1] pl-4 pr-4">
                <p class="text-[#101518] text-sm font-medium leading-normal">${syn}</p>
              </div>
            `;
          });
          resultsHtml += `
            </div>
          `;
        }

        if (meaning.antonyms && meaning.antonyms.length > 0) {
            resultsHtml += `
              <h3 class="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Antonyms</h3>
              <div class="flex gap-3 p-3 flex-wrap pr-4">
            `;
            meaning.antonyms.forEach(ant => {
              resultsHtml += `
                <div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#eaedf1] pl-4 pr-4">
                  <p class="text-[#101518] text-sm font-medium leading-normal">${ant}</p>
                </div>
              `;
            });
            resultsHtml += `
              </div>
            `;
          }
      });

    } else {
      resultsHtml += `
        <h2 class="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">Word not found</h2>
        <p class="text-[#5c748a] text-sm font-normal leading-normal pb-3 pt-1 px-4">Could not find a definition for "${word}". Please try another word.</p>
      `;
    }

    dictionaryResultsContainer.innerHTML = resultsHtml;

    // Add event listener to the play button after rendering
    const playAudioContainer = document.getElementById('play-audio-container');
    if (playAudioContainer) {
      const playButton = playAudioContainer.querySelector('button');
      // Re-find the audio URL from the original data since resultsHtml is temporary
      const currentAudioUrl = data[0]?.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;
      if (playButton && currentAudioUrl) {
        playButton.addEventListener('click', () => {
          const audio = new Audio(currentAudioUrl);
          audio.play();
        });
      }
    }

  } catch (error) {
    console.error('Error fetching the dictionary data:', error);
    dictionaryResultsContainer.innerHTML = `
      <h2 class="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">Error</h2>
      <p class="text-[#5c748a] text-sm font-normal leading-normal pb-3 pt-1 px-4">An error occurred while fetching the definition. Please try again later.</p>
    `;
  }
} 