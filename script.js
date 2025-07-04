// Window dragging functionality
let isDragging = false;
let activeWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let wireframe = null;
// Global z-index counter so we only elevate the clicked/opened window
let zCounter = 1000;

function bringToFront(win) {
    zCounter += 1;
    win.style.zIndex = zCounter;
}

function dragStart(e) {
    // Handle both mouse and touch events
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    // Only allow dragging from title bar
    if (!e.target.closest('.window-titlebar')) return;
    
    // Prevent dragging when clicking on window controls
    if (e.target.closest('.window-controls')) return;
    
    isDragging = true;
    activeWindow = e.target.closest('.mac-window');
    
    // Calculate offset from pointer to window corner
    const rect = activeWindow.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    
    // Add dragging class for visual feedback
    activeWindow.style.cursor = 'move';
    
    e.preventDefault();
}

function dragEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    if (activeWindow) {
        activeWindow.style.cursor = 'default';
        activeWindow = null;
    }
}

function drag(e) {
    if (!isDragging || !activeWindow) return;
    
    e.preventDefault();
    
    // Handle both mouse and touch events
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    // Calculate new position directly
    let newX = event.clientX - dragOffsetX;
    let newY = event.clientY - dragOffsetY;
    
    // Prevent dragging above the menu bar
    const menuBarHeight = document.querySelector('.menu-bar').offsetHeight;
    if (newY < menuBarHeight) {
        newY = menuBarHeight;
    }
    
    // Allow windows to be dragged off screen in other directions
    activeWindow.style.left = newX + 'px';
    activeWindow.style.top = newY + 'px';
}

// Add event listeners for both mouse and touch
document.addEventListener('mousedown', dragStart);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('mousemove', drag);

// Touch event listeners for mobile
document.addEventListener('touchstart', dragStart, { passive: false });
document.addEventListener('touchend', dragEnd, { passive: false });
document.addEventListener('touchmove', drag, { passive: false });

// Close window function
function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        windowElement.style.display = 'none';
    }
}

// Add touch support for close buttons
document.querySelectorAll('.window-control.close').forEach(closeBtn => {
    // Mouse click support
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const windowElement = this.closest('.mac-window');
        if (windowElement) {
            closeWindow(windowElement.id);
        }
    });
    
    // Touch support
    closeBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const windowElement = this.closest('.mac-window');
        if (windowElement) {
            closeWindow(windowElement.id);
        }
    });
});

// Open window function
function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        windowElement.style.display = 'block';
        bringToFront(windowElement);
        
                        // Auto-scroll About window to text on mobile
        if (windowId === 'about-window' && window.innerWidth <= 768) {
            setTimeout(() => {
                const windowContent = windowElement.querySelector('.window-content');
                const profileName = windowElement.querySelector('.profile-name');
                if (windowContent && profileName) {
                    // Scroll to show the profile name at the top with some padding
                    windowContent.scrollTop = profileName.offsetTop - 40;
                }
            }, 100);
        }
    }
}

// Desktop icon interactions - handle both mouse and touch
document.querySelectorAll('.desktop-icon').forEach(icon => {
    let clickCount = 0;
    let clickTimer = null;
    let lastTapTime = 0;
    
    // Handle mouse double-click
    icon.addEventListener('dblclick', function(e) {
        e.preventDefault();
        handleIconAction(this);
    });
    
    // Handle touch events for mobile
    icon.addEventListener('touchend', function(e) {
        e.preventDefault();
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 500 && tapLength > 0) {
            clearTimeout(clickTimer);
            clickCount = 0;
            this.classList.remove('active');
            handleIconAction(this);
        } else {
            clickCount++;
            this.classList.add('active');
            clickTimer = setTimeout(() => {
                clickCount = 0;
                this.classList.remove('active');
            }, 300);
        }
        lastTapTime = currentTime;
    });
    
    // Handle mouse click for visual feedback
    icon.addEventListener('mousedown', function(e) {
        this.classList.add('active');
    });
    icon.addEventListener('mouseup', function(e) {
        this.classList.remove('active');
    });
    icon.addEventListener('mouseleave', function(e) {
        this.classList.remove('active');
    });
});

// Function to handle icon actions
function handleIconAction(icon) {
    const action = icon.getAttribute('data-action');
    const url = icon.getAttribute('data-url');
    const message = icon.getAttribute('data-message');
    const windowId = icon.getAttribute('data-window');
    
    switch(action) {
        case 'url':
            if (url) {
                window.open(url, '_blank');
            }
            break;
        case 'alert':
            if (message) {
                alert(message);
            }
            break;
        case 'window':
            if (windowId) {
                openWindow(windowId);
            }
            break;
    }
}

// Info button interactions for mobile
document.querySelectorAll('.info-item').forEach(infoBtn => {
    // Handle mouse click
    infoBtn.addEventListener('click', function(e) {
        // Add visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Handle touch events for mobile
    infoBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        
        // Add visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Get the href and open the link
        const href = this.getAttribute('href');
        if (href) {
            if (href.startsWith('mailto:')) {
                window.location.href = href;
            } else {
                window.open(href, '_blank');
            }
        }
    });
});

// Menu bar item feedback
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('touchstart', function() {
        this.classList.add('active');
    });
    item.addEventListener('touchend', function() {
        this.classList.remove('active');
    });
    item.addEventListener('mousedown', function() {
        this.classList.add('active');
    });
    item.addEventListener('mouseup', function() {
        this.classList.remove('active');
    });
    item.addEventListener('mouseleave', function() {
        this.classList.remove('active');
    });
});

// Menu bar interactions
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        if (this.classList.contains('about-menu')) {
            openWindow('about-window');
        }
    });
});

// Prevent text selection during dragging
document.addEventListener('selectstart', function(e) {
    if (isDragging) {
        e.preventDefault();
    }
});

// Prevent zoom on double tap for mobile
document.addEventListener('touchend', function(e) {
    // Allow textarea interaction
    if (e.target.closest('.notes-textarea')) {
        return;
    }
    
    // Allow desktop icon interactions
    if (e.target.closest('.desktop-icon')) {
        return;
    }
    
    // Allow info button interactions
    if (e.target.closest('.info-item')) {
        return;
    }
    
    // Prevent zoom on other interactive elements
    if (e.target.closest('.mac-window')) {
        e.preventDefault();
    }
}, { passive: false });

// Add Classic Mac OS style animations
window.addEventListener('load', function() {
    const isMobile = window.innerWidth <= 768;

    // About window
    const aboutWindow = document.getElementById('about-window');
    aboutWindow.style.left = isMobile ? '5vw' : '10vw';
    aboutWindow.style.top  = isMobile ? '12vh' : '15vh';

    // Notes window
    const notesWindow = document.getElementById('notes-window');
    if (isMobile) {
        // Swap positions with Pokémon window
        notesWindow.style.left = '20vw';
        notesWindow.style.top  = '55vh';
    } else {
        notesWindow.style.left = 'calc(45vw - 200px)';
        notesWindow.style.top  = '66vh';
    }

    // Pokémon window
    const pokemonWindow = document.getElementById('pokemon-window');
    if (isMobile) {
        // Swap positions with Notes window
        pokemonWindow.style.left = '50vw';
        pokemonWindow.style.top  = '28vh';
    } else {
        pokemonWindow.style.left = 'calc(75vw - 350px)';
        pokemonWindow.style.top  = '35vh';
    }

    openWindow('pokemon-window');

    // Bring About window to front after others
    openWindow('about-window');
});

// Add window focus effect
document.querySelectorAll('.mac-window').forEach(windowElement => {
    windowElement.addEventListener('mousedown', function() {
        bringToFront(this);
    });
    
    // Touch support
    windowElement.addEventListener('touchstart', function() {
        bringToFront(this);
    });
});

// Clock in menu bar
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('clock').textContent = time;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

// Prevent all scrolling on desktop
document.addEventListener('touchmove', function(e) {
    // Allow scrolling only in specific elements
    if (e.target.closest('.notes-textarea') || 
        e.target.closest('.menu-bar') || 
        e.target.closest('.window-content')) {
        return;
    }
    // Prevent scrolling on desktop background
    e.preventDefault();
}, { passive: false });

// Prevent touchmove from propagating out of window-content (lock page, allow scroll in window)
document.querySelectorAll('.window-content').forEach(function(content) {
    content.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    }, { passive: false });
}); 