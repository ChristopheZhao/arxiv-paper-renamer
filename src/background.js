console.log('arXiv Paper Renamer: Background script loaded');

function sanitizeFileName(title) {
    return title
        .replace(/[<>:"/\\|?*]/g, '-')  // Replace invalid characters
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .replace(/_+/g, '_')            // Combine multiple underscores
        .replace(/^[-_]+|[-_]+$/g, '')  // Remove leading/trailing dashes and underscores
        .substring(0, 240);             // Limit length
}

// Handle file downloads
function handleDownload(downloadItem, suggest) {
    console.log('Intercepted download:', downloadItem);
    
    // Check if it's an arXiv PDF download
    if (!downloadItem.finalUrl.includes('arxiv.org/pdf/')) {
        console.log('Not an arXiv PDF, skipping');
        suggest({filename: downloadItem.filename});
        return true;
    }

    // Retrieve saved paper title
    chrome.storage.local.get(['pendingTitle'], function(result) {
        console.log('Retrieved stored title data:', result);
        
        if (result.pendingTitle) {
            const { title, timestamp } = result.pendingTitle;
            const now = Date.now();
            
            console.log('Title info:', { title, timestamp, timeDiff: now - timestamp });
            
            // Check if the title is still valid (within 30 seconds)
            if (now - timestamp < 30000) {
                const newFilename = `${sanitizeFileName(title)}.pdf`;
                console.log('Renaming file to:', newFilename);
                
                // Show notification before suggesting filename
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'File Renamed',
                    message: `Paper will be downloaded as: ${newFilename}`
                });
                
                // Set the new filename
                suggest({filename: newFilename});
                
                // Clean up stored title
                chrome.storage.local.remove('pendingTitle', () => {
                    console.log('Cleared stored title');
                });
            } else {
                console.log('Title has expired');
                suggest({filename: downloadItem.filename});
            }
        } else {
            console.log('No stored title found');
            suggest({filename: downloadItem.filename});
        }
    });
    
    return true;
}

// Listen for download events
chrome.downloads.onDeterminingFilename.addListener(handleDownload);