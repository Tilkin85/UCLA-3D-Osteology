// 3D Model Viewer Integration for UCLA 3D Osteology Collection
// This file contains the specific code for integrating with Sketchfab API

document.addEventListener('DOMContentLoaded', function() {
    initSketchfabViewers();
});

/**
 * Initialize Sketchfab viewers on the page
 */
function initSketchfabViewers() {
    const modelContainers = document.querySelectorAll('.model-viewer-container');
    
    if (modelContainers.length === 0) return;
    
    // Load Sketchfab API if not already loaded
    if (typeof window.Sketchfab === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
        script.onload = function() {
            initializeViewers(modelContainers);
        };
        document.head.appendChild(script);
    } else {
        initializeViewers(modelContainers);
    }
}

/**
 * Initialize each viewer with Sketchfab API
 */
function initializeViewers(containers) {
    containers.forEach(container => {
        const viewerElement = container.querySelector('.model-viewer');
        const loadingIndicator = container.querySelector('.loading-indicator');
        
        if (!viewerElement) return;
        
        // Get model URL or ID from data attribute
        let modelUrl = viewerElement.dataset.model;
        if (!modelUrl) return;
        
        // Extract model ID from URL if full URL is provided
        let modelId = modelUrl;
        if (modelUrl.includes('sketchfab.com')) {
            const urlParts = modelUrl.split('/');
            modelId = urlParts[urlParts.length - 1];
        }
        
        // Create iframe for Sketchfab viewer
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        viewerElement.appendChild(iframe);
        
        // Initialize Sketchfab client
        const client = new window.Sketchfab(iframe);
        
        client.init(modelId, {
            success: function onSuccess(api) {
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                api.start();
                api.addEventListener('viewerready', function() {
                    // Configure viewer settings
                    api.setBackground({
                        color: [0.95, 0.95, 0.95]
                    });
                    
                    // Set camera controls
                    api.setCameraEasing('easeInOutQuad');
                    
                    // Enable annotations if available
                    api.getAnnotationList(function(err, annotations) {
                        if (!err && annotations.length > 0) {
                            api.showAnnotationTooltips(true);
                        }
                    });
                    
                    // Add UI controls if container has specific controls
                    const controlsContainer = container.closest('.model-section').querySelector('.model-controls');
                    if (controlsContainer) {
                        setupModelControls(api, controlsContainer);
                    }
                });
            },
            error: function onError(error) {
                console.error('Sketchfab API Error:', error);
                if (loadingIndicator) {
                    loadingIndicator.textContent = 'Error loading model';
                }
            },
            ui_stop: 0,
            ui_controls: 1,
            ui_help: 0,
            ui_inspector: 0,
            ui_watermark: 0,
            ui_ar: 0,
            ui_vr: 0
        });
    });
}

/**
 * Setup custom model controls
 */
function setupModelControls(api, controlsContainer) {
    // Reset camera button
    const resetBtn = controlsContainer.querySelector('.reset-view-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            api.recenterCamera();
        });
    }
    
    // Toggle wireframe button
    const wireframeBtn = controlsContainer.querySelector('.wireframe-btn');
    if (wireframeBtn) {
        let wireframeActive = false;
        wireframeBtn.addEventListener('click', function() {
            wireframeActive = !wireframeActive;
            api.setWireframe(wireframeActive);
            wireframeBtn.textContent = wireframeActive ? 'Hide Wireframe' : 'Show Wireframe';
        });
    }
    
    // Toggle annotations button
    const annotationsBtn = controlsContainer.querySelector('.annotations-btn');
    if (annotationsBtn) {
        let annotationsActive = true;
        annotationsBtn.addEventListener('click', function() {
            annotationsActive = !annotationsActive;
            api.showAnnotationTooltips(annotationsActive);
            annotationsBtn.textContent = annotationsActive ? 'Hide Annotations' : 'Show Annotations';
        });
    }
    
    // Measurement tool button
    const measureBtn = controlsContainer.querySelector('.measure-btn');
    if (measureBtn) {
        let measureActive = false;
        measureBtn.addEventListener('click', function() {
            measureActive = !measureActive;
            if (measureActive) {
                api.startMeasureTool();
            } else {
                api.stopMeasureTool();
            }
            measureBtn.textContent = measureActive ? 'Stop Measuring' : 'Start Measuring';
        });
    }
}

/**
 * Generate citation for a model
 */
function generateModelCitation(modelId, modelName, collectionType) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleString('default', { month: 'long' });
    const day = today.getDate();
    
    const citation = `UCLA 3D Osteology Collection. (${year}). ${modelName} [3D Model]. ${collectionType} Collection. Retrieved ${month} ${day}, ${year}, from https://ucla3dosteology.edu/collections/${collectionType.toLowerCase()}/${modelId}`;
    
    // Create modal to display citation
    const modal = document.createElement('div');
    modal.className = 'citation-modal';
    modal.innerHTML = `
        <div class="citation-modal-content">
            <span class="close-modal">&times;</span>
            <h3>Citation</h3>
            <p>${citation}</p>
            <button class="copy-citation-btn">Copy to Clipboard</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal when clicking X
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Copy citation to clipboard
    const copyBtn = modal.querySelector('.copy-citation-btn');
    copyBtn.addEventListener('click', function() {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = citation;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        copyBtn.textContent = 'Copied!';
        setTimeout(function() {
            copyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    return citation;
}

// Add CSS for citation modal
const style = document.createElement('style');
style.textContent = `
.citation-modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.citation-modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border-radius: 4px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
}

.copy-citation-btn {
    background-color: #003b5c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.copy-citation-btn:hover {
    background-color: #002a41;
}
`;
document.head.appendChild(style);
