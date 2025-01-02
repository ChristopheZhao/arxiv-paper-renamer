console.log('arXiv Paper Renamer: Content script starting...');

// Capture title when downloading PDF
if (window.location.pathname.includes('/pdf/')) {
    // Extract arXiv ID from URL
    const arxivId = window.location.pathname.split('/').pop().replace('.pdf', '');
    const abstractUrl = `https://arxiv.org/abs/${arxivId}`;
    
    console.log('Processing arXiv ID:', arxivId);
    console.log('Fetching abstract from:', abstractUrl);
    
    // Fetch title from abstract page
    fetch(abstractUrl)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const title = doc.querySelector('h1.title').textContent.replace('Title:', '').trim();
            
            console.log('Found paper title:', title);
            
            // Save title for download processing
            chrome.storage.local.set({
                pendingTitle: {
                    title: title,
                    timestamp: Date.now()
                }
            }).then(() => {
                console.log('Successfully saved paper title');
            }).catch(error => {
                console.error('Error saving title:', error);
            });
        })
        .catch(error => {
            console.error('Error fetching paper title:', error);
        });
}