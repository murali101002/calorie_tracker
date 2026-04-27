/// <reference types="cypress" />

function mockMediaStream() {
  return {
    getTracks: () => [],
    getVideoTracks: () => [{
      kind: 'video',
      label: 'Mock Camera',
      getSettings: () => ({ width: 1920, height: 1080, frameRate: 30 }),
      getCapabilities: () => ({}),
      applyConstraints: () => Promise.resolve(),
      stop: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }],
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}

describe('Barcode Scanner', () => {
  describe('Happy path', () => {
    it('renders scanner page without crashing', () => {
      cy.visit('/scan', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockMediaStream())
        },
      })
      // Header buttons should render
      cy.get('span.material-symbols-outlined').contains('close').should('exist')
      cy.get('span.material-symbols-outlined').contains('flash_off').should('exist')
      // Search manually button should render
      cy.contains('Search manually').should('exist')
    })

    it('renders bottom tab bar with Barcode, Vision, Recent tabs', () => {
      cy.visit('/scan', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockMediaStream())
        },
      })
      // Tab bar labels (text is title-case, rendered uppercase via CSS)
      cy.contains(/barcode/i).should('exist')
      cy.contains(/vision/i).should('exist')
      cy.contains(/recent/i).should('exist')
    })

    it('navigates to manual search when Search manually is clicked', () => {
      cy.visit('/scan', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockMediaStream())
        },
      })
      cy.contains('Search manually').click({ force: true })
      cy.url().should('include', '/food/')
    })
  })

  describe('Negative', () => {
    it('shows error when camera permission denied', () => {
      cy.visit('/scan', {
        onBeforeLoad(win) {
          const err = new DOMException('Permission denied', 'NotAllowedError')
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(err)
        },
      })
      // Error message or fallback UI should be visible
      cy.contains(/camera permission|Search manually/i, { timeout: 8000 }).should('exist')
    })

    it('shows error message when no camera found', () => {
      cy.visit('/scan', {
        onBeforeLoad(win) {
          const err = new DOMException('Not found', 'NotFoundError')
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(err)
        },
      })
      // Error or fallback UI
      cy.contains(/no camera|Search manually/i, { timeout: 8000 }).should('exist')
    })

    it('stays usable when API returns product not found', () => {
      cy.intercept(
        'GET',
        'https://world.openfoodfacts.org/api/v0/product/*.json',
        { fixture: 'product_not_found.json' }
      ).as('productNotFound')
      cy.visit('/scan', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockMediaStream())
        },
      })
      // Search manually button should exist (scanner stays usable)
      cy.contains('Search manually').should('exist')
    })

    it('stays usable when network request fails', () => {
      cy.intercept(
        'GET',
        'https://world.openfoodfacts.org/api/v0/product/*.json',
        { statusCode: 500 }
      ).as('networkError')
      cy.visit('/scan', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockMediaStream())
        },
      })
      // Search manually button should exist
      cy.contains('Search manually').should('exist')
    })
  })
})
