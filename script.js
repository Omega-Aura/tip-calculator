// script.js

// ===========================================
//           DOM ELEMENTS
// ===========================================
const billInput = document.getElementById('bill-input');
const tipButtons = document.querySelectorAll('.tip-percent-btn');
const customTipInput = document.getElementById('custom-tip-input');
const peopleInput = document.getElementById('num-people');
const tipAmountDisplay = document.getElementById('tip-amount-display');
const totalAmountDisplay = document.getElementById('total-amount-display');
const resetButton = document.getElementById('reset-button');

// ===========================================
//           PLATFORM DETECTION
// ===========================================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isMac = /Mac/.test(navigator.platform);
const isWindows = /Win/.test(navigator.platform);

// iOS Safari specific setup
if (isIOS) {
    // Create a global function for iOS tip selection
    window.selectTip = function(tipValue, buttonElement) {
        console.log('iOS selectTip called with:', tipValue, buttonElement);
        
        // Check if the clicked button is already active
        const isAlreadyActive = buttonElement.classList.contains('active');

        if (isAlreadyActive) {
            // If already active, deactivate it (toggle off)
            buttonElement.classList.remove('active');
            delete buttonElement.dataset.tip;
        } else {
            // Remove active class from all buttons
            const allButtons = document.querySelectorAll('.tip-percent-btn');
            allButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            buttonElement.classList.add('active');
            buttonElement.dataset.tip = tipValue;
        }

        // Clear custom tip input when any button is clicked
        const customInput = document.getElementById('custom-tip-input');
        if (customInput) {
            customInput.value = '';
        }
        
        // Recalculate tip
        calculateTip();
    };
    
    // Force iOS Safari to recognize buttons as interactive immediately
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const buttons = document.querySelectorAll('.tip-percent-btn');
            buttons.forEach((button, index) => {
                // Multiple approaches for iOS Safari
                button.setAttribute('onclick', `window.selectTip(${button.value}, this); return false;`);
                button.setAttribute('role', 'button');
                button.setAttribute('aria-label', `Select ${button.textContent} tip`);
                button.setAttribute('tabindex', '0');
                
                // Force iOS to recognize as interactive element
                button.style.cursor = 'pointer';
                button.style.webkitUserSelect = 'none';
                button.style.webkitTouchCallout = 'none';
                
                // Add direct event listener as backup
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('iOS backup click handler triggered for button:', this.value);
                    window.selectTip(this.value, this);
                }, true);
                
                // Add touch events as additional backup
                button.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('iOS touchend handler triggered for button:', this.value);
                    window.selectTip(this.value, this);
                }, true);
            });
        }, 100);
    });
}

// ===========================================
//           EVENT LISTENERS
// ===========================================

// Listen for input changes
billInput.addEventListener('input', calculateTip);
customTipInput.addEventListener('input', calculateTip);
peopleInput.addEventListener('input', calculateTip);

// Handle tip button clicks
tipButtons.forEach(button => {
    // Primary click event handler
    const handleTipSelection = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if the clicked button is already active
        const isAlreadyActive = button.classList.contains('active');

        if (isAlreadyActive) {
            // If already active, deactivate it (toggle off)
            button.classList.remove('active');
            // Clear the data-tip attribute
            delete button.dataset.tip;
        } else {
            // Remove active class from all buttons
            tipButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Set data-tip attribute for easier access
            button.dataset.tip = button.value;
        }

        // Clear custom tip input when any button is clicked
        customTipInput.value = '';
        // Recalculate tip
        calculateTip();
    };

    // iOS Safari specific handling - use onclick attribute approach
    if (isIOS) {
        // For iOS, we rely primarily on the onclick attribute set earlier
        // Add minimal event listeners for visual feedback only
        button.addEventListener('mousedown', (e) => {
            button.classList.add('ios-pressed');
        });
        
        button.addEventListener('mouseup', (e) => {
            setTimeout(() => {
                button.classList.remove('ios-pressed');
            }, 100);
        });
        
        button.addEventListener('touchstart', (e) => {
            button.classList.add('ios-pressed');
        }, { passive: true });
        
        button.addEventListener('touchend', (e) => {
            setTimeout(() => {
                button.classList.remove('ios-pressed');
            }, 100);
        }, { passive: true });
        
    } else {
        // For all other platforms (Android, Windows, etc.)
        button.addEventListener('click', handleTipSelection);

        // Add touch events for mobile devices (non-iOS)
        if (isMobile) {
            let touchHandled = false;
            let touchStartTime = 0;
            
            button.addEventListener('touchstart', (e) => {
                touchHandled = false;
                touchStartTime = Date.now();
                button.style.transform = 'translateY(1px)';
            }, { passive: true });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const touchDuration = Date.now() - touchStartTime;
                
                // Only handle if it's a tap (not a long press) and not already handled
                if (!touchHandled && touchDuration < 500) {
                    touchHandled = true;
                    handleTipSelection(e);
                }
                
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });

            // Handle touch cancel
            button.addEventListener('touchcancel', () => {
                touchHandled = false;
                button.style.transform = '';
            });
        }
    }
});

// Handle reset button click
if (resetButton) {
    // Primary reset handler
    const handleReset = (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetCalculator();
    };

    // iOS Safari specific handling
    if (isIOS) {
        // For iOS, use simpler approach with click events and visual feedback
        resetButton.addEventListener('click', handleReset);
        
        // Add visual feedback for iOS
        resetButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            resetButton.classList.add('ios-pressed');
        });
        
        resetButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            setTimeout(() => {
                resetButton.classList.remove('ios-pressed');
            }, 100);
        });
        
        // Also handle touch for iOS
        resetButton.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            resetButton.classList.add('ios-pressed');
        }, { passive: false });
        
        resetButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
                resetButton.classList.remove('ios-pressed');
            }, 100);
            // Trigger reset manually for iOS
            handleReset(e);
        }, { passive: false });
        
        // Add onclick attribute for iOS Safari compatibility
        resetButton.setAttribute('onclick', 'void(0)');
        resetButton.setAttribute('role', 'button');
        resetButton.setAttribute('aria-label', 'Reset calculator');
        
    } else {
        // For all other platforms (Android, Windows, etc.)
        resetButton.addEventListener('click', handleReset);

        // Add touch events for mobile devices (non-iOS)
        if (isMobile) {
            let touchHandled = false;
            let touchStartTime = 0;
            
            resetButton.addEventListener('touchstart', (e) => {
                touchHandled = false;
                touchStartTime = Date.now();
                resetButton.style.transform = 'translateY(1px)';
            }, { passive: true });

            resetButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const touchDuration = Date.now() - touchStartTime;
                
                // Only handle if it's a tap and not already handled
                if (!touchHandled && touchDuration < 500) {
                    touchHandled = true;
                    handleReset(e);
                }
                
                setTimeout(() => {
                    resetButton.style.transform = '';
                }, 150);
            });

            // Handle touch cancel
            resetButton.addEventListener('touchcancel', () => {
                touchHandled = false;
                resetButton.style.transform = '';
            });
        }
    }
} else {
    console.error('Reset button not found');
}

// ===========================================
//             CORE FUNCTIONS
// ===========================================

function calculateTip() {
    // Get input values
    const billValueStr = billInput.value;
    const peopleValueStr = peopleInput.value;
    const customTipValueStr = customTipInput.value;

    // Convert to numbers
    const billAmount = parseFloat(billValueStr);
    const numberOfPeople = parseFloat(peopleValueStr);
    const customTipPercent = parseFloat(customTipValueStr);

    // Validate inputs
    const isBillValid = !isNaN(billAmount) && billAmount >= 0;
    const isPeopleValid = !isNaN(numberOfPeople) && numberOfPeople > 0 && Number.isInteger(numberOfPeople);
    const isCustomTipInputValid = customTipValueStr === '' || (!isNaN(customTipPercent) && customTipPercent >= 0);

    // Determine tip percentage to use
    let actualTipPercent = 0;
    if (customTipValueStr !== '' && !isNaN(customTipPercent) && customTipPercent >= 0) {
        actualTipPercent = customTipPercent;
    } else if (customTipValueStr === '') {
        const activeButton = document.querySelector('.tip-percent-btn.active');
        if (activeButton) {
            const selectedButtonTipPercent = parseFloat(activeButton.dataset.tip);
            if (!isNaN(selectedButtonTipPercent) && selectedButtonTipPercent >= 0) {
                actualTipPercent = selectedButtonTipPercent;
            }
        }
    }
    const isTipValid = !isNaN(actualTipPercent) && actualTipPercent >= 0;

    // Calculate total tip
    let totalTipAmount = 0;
    if (isBillValid && isTipValid) {
        totalTipAmount = billAmount * (actualTipPercent / 100);
    }

    // Calculate total bill
    let totalBillAmount = 0;
    if (isBillValid) {
        totalBillAmount = billAmount + totalTipAmount;
    }

    // Calculate per-person amounts
    let tipAmountPerPerson = 0;
    let totalAmountPerPerson = 0;
    if (isBillValid && isTipValid && isPeopleValid) {
        if (!isNaN(totalBillAmount)) {
            tipAmountPerPerson = totalTipAmount / numberOfPeople;
            totalAmountPerPerson = totalBillAmount / numberOfPeople;
        }
    }

    // Format results for display
    const formattedTipAmount = tipAmountPerPerson.toFixed(2);
    const formattedTotalAmount = totalAmountPerPerson.toFixed(2);
    const displayTipAmount = `$${formattedTipAmount}`;
    const displayTotalAmount = `$${formattedTotalAmount}`;

    // Update display
    if (tipAmountDisplay) {
        tipAmountDisplay.textContent = displayTipAmount;
    }
    if (totalAmountDisplay) {
        totalAmountDisplay.textContent = displayTotalAmount;
    }

    // Apply error styling (only for custom tip input)
    if (customTipInput) {
        const activeButton = document.querySelector('.tip-percent-btn.active');
        let showErrorForCustomTip = !isCustomTipInputValid;
        if (customTipInput.value === '' && activeButton) {
            showErrorForCustomTip = false;
        }
        customTipInput.classList.toggle('error', showErrorForCustomTip);
    }
}

// Reset calculator to initial state
function resetCalculator() {
    // Clear all input fields
    if (billInput) billInput.value = '';
    if (customTipInput) customTipInput.value = '';
    if (peopleInput) peopleInput.value = '';

    // Deselect all tip buttons
    if (tipButtons && tipButtons.length > 0) {
        tipButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    // Reset display values
    if (tipAmountDisplay) tipAmountDisplay.textContent = '$0.00';
    if (totalAmountDisplay) totalAmountDisplay.textContent = '$0.00';

    // Remove error styling (only for custom tip input)
    if (customTipInput) customTipInput.classList.remove('error');

    console.log('Calculator has been reset');
}

// ===========================================
//           INITIALIZE APP
// ===========================================
// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    calculateTip();
    setupPlatformSpecificFeatures();
});

// ===========================================
//           PLATFORM-SPECIFIC FEATURES
// ===========================================
function setupPlatformSpecificFeatures() {
    // iOS specific optimizations
    if (isIOS) {
        // Prevent zoom on input focus
        document.addEventListener('touchstart', () => { });

        // Handle iOS keyboard behavior
        const inputs = [billInput, customTipInput, peopleInput];
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Scroll to input on focus to prevent layout issues
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }

    // Android specific optimizations
    if (isAndroid) {
        // Handle Android keyboard behavior
        const inputs = [billInput, customTipInput, peopleInput];
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Ensure input is visible when keyboard appears
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            });
        });

        // Handle Android back button (if in PWA)
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            // Custom back button behavior
        });
    }

    // Desktop specific optimizations
    if (!isMobile) {
        // Add keyboard shortcuts for desktop
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts if no input field is focused
            const activeElement = document.activeElement;
            const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';

            if (!isInputFocused) {
                // Escape key resets calculator
                if (e.key === 'Escape') {
                    resetCalculator();
                }

                // Number keys 1-5 select tip percentages (only when not typing in inputs)
                if (e.key >= '1' && e.key <= '5') {
                    const index = parseInt(e.key) - 1;
                    if (tipButtons[index]) {
                        tipButtons[index].click();
                    }
                }
            }
        });

        // Focus first input on load
        billInput.focus();
    }

    // Add visual feedback for platform
    document.body.classList.add(
        isMobile ? 'mobile' : 'desktop',
        isIOS ? 'ios' : isAndroid ? 'android' : 'desktop-os'
    );
}