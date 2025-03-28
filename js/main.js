/**
 * UCLA 3D Osteology Collection - Main JavaScript
 * 
 * This file contains the core functionality for the UCLA 3D Osteology Collection website,
 * including navigation, interactive elements, and 3D model viewer integration.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initTabs();
    initAccordions();
    init3DViewer();
    initSearchFunctionality();
    initScrollAnimations();
});

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', 
                mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && navMenu.classList.contains('active') && 
            !event.target.closest('.nav-menu') && 
            !event.target.closest('.mobile-menu-btn')) {
            navMenu.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Add active class to current page in navigation
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
}

/**
 * Tab System
 */
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const tabNavItems = container.querySelectorAll('.tab-nav-item');
        const tabContents = container.querySelectorAll('.tab-content');
        
        tabNavItems.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                tabNavItems.forEach(item => item.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                tabContents[index].classList.add('active');
            });
        });
    });
}

/**
 * Accordion System
 */
function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = header.nextElementSibling;
            
            // Toggle active class
            accordionContent.classList.toggle('active');
            
            // Update aria attributes
            const isExpanded = accordionContent.classList.contains('active');
            header.setAttribute('aria-expanded', isExpanded);
            
            // Update icon if present
            const icon = header.querySelector('.accordion-icon');
            if (icon) {
                icon.textContent = isExpanded ? '−' : '+';
            }
        });
    });
}

/**
 * 3D Model Viewer Integration
 */
function init3DViewer() {
    const modelViewers = document.querySelectorAll('.model-viewer');
    
    if (modelViewers.length === 0) return;
    
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        // Load Three.js dynamically if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
        script.onload = initializeViewers;
        document.head.appendChild(script);
    } else {
        initializeViewers();
    }
    
    function initializeViewers() {
        modelViewers.forEach(viewer => {
            const modelUrl = viewer.dataset.model;
            if (!modelUrl) return;
            
            // Create scene, camera, renderer
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f5f5);
            
            const camera = new THREE.PerspectiveCamera(
                45, viewer.clientWidth / viewer.clientHeight, 0.1, 1000
            );
            camera.position.z = 5;
            
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(viewer.clientWidth, viewer.clientHeight);
            viewer.appendChild(renderer.domElement);
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            
            // Load model
            const loader = new THREE.OBJLoader();
            loader.load(
                modelUrl,
                function(object) {
                    scene.add(object);
                    
                    // Center model
                    const box = new THREE.Box3().setFromObject(object);
                    const center = box.getCenter(new THREE.Vector3());
                    object.position.sub(center);
                    
                    // Adjust camera distance
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    camera.position.z = maxDim * 2.5;
                    
                    // Animation loop
                    function animate() {
                        requestAnimationFrame(animate);
                        object.rotation.y += 0.005;
                        renderer.render(scene, camera);
                    }
                    animate();
                },
                function(xhr) {
                    const loadingProgress = Math.floor((xhr.loaded / xhr.total) * 100);
                    const loadingIndicator = viewer.querySelector('.loading-indicator');
                    if (loadingIndicator) {
                        loadingIndicator.textContent = `Loading: ${loadingProgress}%`;
                    }
                },
                function(error) {
                    console.error('Error loading 3D model:', error);
                    viewer.innerHTML = '<p class="error">Error loading 3D model</p>';
                }
            );
            
            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = viewer.clientWidth / viewer.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(viewer.clientWidth, viewer.clientHeight);
            });
        });
    }
}

/**
 * Search Functionality
 */
function initSearchFunctionality() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            if (searchResults) {
                searchResults.innerHTML = '<p>Please enter at least 2 characters</p>';
                searchResults.style.display = 'block';
            }
            return;
        }
        
        // In a real implementation, this would call an API or search a local index
        // For demonstration, we'll use a simple array of items
        const items = [
            { title: 'Frontal Bone', category: 'Cranial', url: '/collections/axial/cranial/frontal' },
            { title: 'Humerus', category: 'Appendicular', url: '/collections/appendicular/upper-limb/humerus' },
            { title: 'Cervical Vertebra C1', category: 'Axial', url: '/collections/axial/vertebral/c1' },
            { title: 'Ethical Considerations', category: 'Resources', url: '/ethical-framework' },
            { title: '3D Scanning Methodology', category: 'Resources', url: '/methodology' }
        ];
        
        const results = items.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query)
        );
        
        if (searchResults) {
            if (results.length > 0) {
                let html = '<ul class="search-results-list">';
                results.forEach(result => {
                    html += `
                        <li class="search-result-item">
                            <a href="${result.url}">
                                <span class="result-title">${result.title}</span>
                                <span class="result-category">${result.category}</span>
                            </a>
                        </li>
                    `;
                });
                html += '</ul>';
                searchResults.innerHTML = html;
            } else {
                searchResults.innerHTML = '<p>No results found</p>';
            }
            searchResults.style.display = 'block';
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (searchResults && 
            !searchResults.contains(e.target) && 
            !searchForm.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Add animation class when element is in viewport
    function checkVisibility() {
        animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('animated');
            }
        });
    }
    
    // Check on scroll
    window.addEventListener('scroll', checkVisibility);
    
    // Check on page load
    checkVisibility();
}

/**
 * Citation Generator
 * 
 * Generates proper citation for 3D models
 */
function generateCitation(modelId, modelName, collectionType) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleString('default', { month: 'long' });
    const day = today.getDate();
    
    return `UCLA 3D Osteology Collection. (${year}). ${modelName} [3D Model]. ${collectionType} Collection. Retrieved ${month} ${day}, ${year}, from https://ucla3dosteology.edu/collections/${collectionType.toLowerCase()}/${modelId}`;
}

/**
 * Download Model (for authorized users)
 */
function downloadModel(modelId, modelName, fileFormat) {
    // In a real implementation, this would check user authorization
    // and initiate a download from the server
    
    // For demonstration purposes
    alert(`Downloading ${modelName} in ${fileFormat} format. In a production environment, this would verify your credentials before initiating the download.`);
}
