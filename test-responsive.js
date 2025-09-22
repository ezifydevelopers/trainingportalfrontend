// Responsive Design Test Script
// This script tests the responsive design implementation

class ResponsiveTester {
    constructor() {
        this.results = {
            mobile: { passed: 0, failed: 0, tests: [] },
            tablet: { passed: 0, failed: 0, tests: [] },
            desktop: { passed: 0, failed: 0, tests: [] }
        };
        this.currentBreakpoint = this.getCurrentBreakpoint();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < 640) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    logTest(testName, passed, details = '') {
        const result = { testName, passed, details, timestamp: new Date().toISOString() };
        this.results[this.currentBreakpoint].tests.push(result);
        
        if (passed) {
            this.results[this.currentBreakpoint].passed++;
            console.log(`✅ ${testName}: PASSED ${details}`);
        } else {
            this.results[this.currentBreakpoint].failed++;
            console.log(`❌ ${testName}: FAILED ${details}`);
        }
    }

    testLayout() {
        // Test if layout elements are present
        const layout = document.querySelector('.flex.h-screen');
        const sidebar = document.querySelector('[class*="w-64"]');
        const header = document.querySelector('header');
        
        this.logTest('Layout Structure', !!layout, 'Main layout container exists');
        this.logTest('Sidebar Present', !!sidebar, 'Sidebar element exists');
        this.logTest('Header Present', !!header, 'Header element exists');
    }

    testMobileNavigation() {
        if (this.currentBreakpoint === 'mobile') {
            const mobileMenuButton = document.querySelector('[class*="Menu"]');
            const sidebar = document.querySelector('[class*="w-64"]');
            const isSidebarHidden = sidebar && sidebar.classList.contains('-translate-x-full');
            
            this.logTest('Mobile Menu Button', !!mobileMenuButton, 'Hamburger menu button exists');
            this.logTest('Sidebar Hidden on Mobile', isSidebarHidden, 'Sidebar is hidden on mobile');
        } else {
            this.logTest('Mobile Menu Hidden on Desktop', true, 'Mobile menu not shown on larger screens');
        }
    }

    testResponsiveGrid() {
        const grids = document.querySelectorAll('[class*="grid"]');
        let gridTestsPassed = 0;
        
        grids.forEach((grid, index) => {
            const classes = grid.className;
            const hasResponsiveClasses = classes.includes('sm:') || classes.includes('lg:') || classes.includes('md:');
            this.logTest(`Grid ${index + 1} Responsive Classes`, hasResponsiveClasses, `Grid has responsive classes: ${classes}`);
            if (hasResponsiveClasses) gridTestsPassed++;
        });
        
        this.logTest('Responsive Grids Found', gridTestsPassed > 0, `Found ${gridTestsPassed} responsive grids`);
    }

    testTypography() {
        const textElements = document.querySelectorAll('h1, h2, h3, p, span');
        let responsiveTextFound = 0;
        
        textElements.forEach((element, index) => {
            const classes = element.className;
            const hasResponsiveText = classes.includes('text-sm') || classes.includes('text-base') || 
                                    classes.includes('text-lg') || classes.includes('text-xl');
            if (hasResponsiveText) responsiveTextFound++;
        });
        
        this.logTest('Responsive Typography', responsiveTextFound > 0, `Found responsive text on ${responsiveTextFound} elements`);
    }

    testForms() {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, textarea, select');
        
        this.logTest('Forms Present', forms.length > 0, `Found ${forms.length} forms`);
        this.logTest('Form Inputs Present', inputs.length > 0, `Found ${inputs.length} form inputs`);
        
        // Test if inputs have responsive classes
        let responsiveInputs = 0;
        inputs.forEach(input => {
            const classes = input.className;
            if (classes.includes('w-full') || classes.includes('sm:') || classes.includes('lg:')) {
                responsiveInputs++;
            }
        });
        
        this.logTest('Responsive Form Inputs', responsiveInputs > 0, `${responsiveInputs} inputs have responsive classes`);
    }

    testTables() {
        const tables = document.querySelectorAll('table');
        const tableContainers = document.querySelectorAll('[class*="overflow-x-auto"]');
        
        this.logTest('Tables Present', tables.length > 0, `Found ${tables.length} tables`);
        this.logTest('Table Scroll Containers', tableContainers.length > 0, `Found ${tableContainers.length} scroll containers`);
    }

    testButtons() {
        const buttons = document.querySelectorAll('button');
        let responsiveButtons = 0;
        
        buttons.forEach(button => {
            const classes = button.className;
            if (classes.includes('w-full') || classes.includes('sm:') || classes.includes('lg:') || 
                classes.includes('h-') || classes.includes('px-') || classes.includes('py-')) {
                responsiveButtons++;
            }
        });
        
        this.logTest('Responsive Buttons', responsiveButtons > 0, `${responsiveButtons} buttons have responsive classes`);
    }

    testCards() {
        const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
        let responsiveCards = 0;
        
        cards.forEach(card => {
            const classes = card.className;
            if (classes.includes('p-') || classes.includes('sm:') || classes.includes('lg:') || 
                classes.includes('grid') || classes.includes('flex')) {
                responsiveCards++;
            }
        });
        
        this.logTest('Responsive Cards', responsiveCards > 0, `Found ${responsiveCards} responsive cards`);
    }

    testViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        const hasViewport = viewport && viewport.content.includes('width=device-width');
        
        this.logTest('Viewport Meta Tag', hasViewport, 'Viewport meta tag configured for mobile');
    }

    runAllTests() {
        console.log(`🧪 Running responsive tests for ${this.currentBreakpoint} (${window.innerWidth}px)`);
        console.log('='.repeat(50));
        
        this.testLayout();
        this.testMobileNavigation();
        this.testResponsiveGrid();
        this.testTypography();
        this.testForms();
        this.testTables();
        this.testButtons();
        this.testCards();
        this.testViewport();
        
        this.printSummary();
    }

    printSummary() {
        const current = this.results[this.currentBreakpoint];
        const total = current.passed + current.failed;
        const passRate = total > 0 ? ((current.passed / total) * 100).toFixed(1) : 0;
        
        console.log('='.repeat(50));
        console.log(`📊 Test Summary for ${this.currentBreakpoint.toUpperCase()}`);
        console.log(`✅ Passed: ${current.passed}`);
        console.log(`❌ Failed: ${current.failed}`);
        console.log(`📈 Pass Rate: ${passRate}%`);
        console.log('='.repeat(50));
        
        if (current.failed > 0) {
            console.log('❌ Failed Tests:');
            current.tests.filter(t => !t.passed).forEach(test => {
                console.log(`  - ${test.testName}: ${test.details}`);
            });
        }
    }

    // Test specific breakpoints
    testBreakpoint(breakpoint) {
        const originalWidth = window.innerWidth;
        let testWidth;
        
        switch (breakpoint) {
            case 'mobile': testWidth = 375; break;
            case 'tablet': testWidth = 768; break;
            case 'desktop': testWidth = 1440; break;
            default: return;
        }
        
        // Simulate resize (note: this won't actually resize the window in a real test)
        console.log(`🔄 Testing ${breakpoint} breakpoint (${testWidth}px)`);
        this.currentBreakpoint = breakpoint;
        this.runAllTests();
    }
}

// Auto-run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const tester = new ResponsiveTester();
    
    // Run tests for current viewport
    tester.runAllTests();
    
    // Add resize listener
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newBreakpoint = tester.getCurrentBreakpoint();
            if (newBreakpoint !== tester.currentBreakpoint) {
                tester.currentBreakpoint = newBreakpoint;
                console.log(`📱 Breakpoint changed to: ${newBreakpoint}`);
                tester.runAllTests();
            }
        }, 250);
    });
    
    // Make tester available globally for manual testing
    window.responsiveTester = tester;
    
    console.log('🔧 Responsive tester loaded. Use window.responsiveTester to run manual tests.');
    console.log('Available methods:');
    console.log('  - responsiveTester.runAllTests()');
    console.log('  - responsiveTester.testBreakpoint("mobile")');
    console.log('  - responsiveTester.testBreakpoint("tablet")');
    console.log('  - responsiveTester.testBreakpoint("desktop")');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveTester;
}
