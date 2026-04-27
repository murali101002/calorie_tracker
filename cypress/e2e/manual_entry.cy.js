/// <reference types="cypress" />

function seedEmptyToday() {
  const today = new Date().toISOString().slice(0, 10)
  const past = '2020-01-01'
  return {
    state: {
      entries: { [past]: [], [today]: [] },
      activeDate: today,
    },
    version: 0,
  }
}

function seedWithEntry(overrides = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const entry = {
    id: 'existing-entry',
    foodId: 'existing-food',
    name: 'Existing Food',
    description: '1 cup',
    icon: 'restaurant',
    calories: 200,
    protein: 10,
    carbs: 20,
    fat: 5,
    fiber: 2,
    servingAmount: 1,
    servingUnit: 'cup',
    mealType: 'breakfast',
    loggedAt: today + 'T08:00:00Z',
    ...overrides,
  }
  return {
    state: {
      entries: { [today]: [entry] },
      activeDate: today,
    },
    version: 0,
  }
}

function openManualEntry(meal = 'Breakfast') {
  // Click the + button on the specified meal section
  cy.contains('h2', meal)
    .parent()
    .find('button')
    .click()
  // Click "Add Manually" in the options sheet
  cy.contains('Add Manually').click({ force: true })
}

describe('Manual Food Entry', () => {
  describe('Happy path', () => {
    it('opens options sheet when + button is clicked on a meal section', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      // Click + on Breakfast section
      cy.contains('h2', 'Breakfast')
        .parent()
        .find('button')
        .click()

      // Options sheet should appear with the correct meal heading
      cy.contains('Add to Breakfast').should('be.visible')
      cy.contains('Scan Barcode').should('exist')
      cy.contains('Add Manually').should('exist')
    })

    it('opens for the correct meal type', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      cy.contains('h2', 'Lunch')
        .parent()
        .find('button')
        .click()

      cy.contains('Add to Lunch').should('be.visible')
    })

    it('"Scan Barcode" navigates to /scan', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      cy.contains('h2', 'Breakfast')
        .parent()
        .find('button')
        .click()

      cy.contains('Scan Barcode').click()
      cy.url().should('include', '/scan')
    })

    it('"Add Manually" opens the manual entry form', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      cy.contains('h2', 'Breakfast')
        .parent()
        .find('button')
        .click()

      cy.contains('Add Manually').click({ force: true })

      // Form should be visible
      cy.contains('Manual Entry').should('be.visible')
      cy.contains('Food Name').should('be.visible')
      cy.contains('Serving Size').should('be.visible')
      cy.contains('Calories').should('be.visible')
      cy.contains('Protein (g)').should('be.visible')
      cy.contains('Carbs (g)').should('be.visible')
      cy.contains('Fat (g)').should('be.visible')
      cy.contains('Meal').should('be.visible')
      cy.contains('Add to Log').should('exist')
    })

    it('back button returns to options sheet', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Click back arrow
      cy.contains('Manual Entry')
        .parent()
        .find('button')
        .first()
        .click()

      // Back to options
      cy.contains('Add to Breakfast').should('be.visible')
      cy.contains('Scan Barcode').should('be.visible')
    })

    it('adds a complete entry to today log and closes sheet', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Fill form
      cy.get('input[placeholder="e.g. Protein Shake"]').type('Protein Shake')
      cy.get('input[placeholder="100"]').clear().type('250')
      cy.get('input[placeholder="g"]').clear().type('ml')
      cy.get('input[placeholder="e.g. 250"]').type('300')
      cy.get('input[placeholder="0"]').first().type('25')    // Protein
      cy.get('input[placeholder="0"]').eq(1).type('10')      // Carbs
      cy.get('input[placeholder="0"]').eq(2).type('5')       // Fat

      cy.contains('Add to Log').click({ force: true })

      // Sheet should be closed, entry should appear on home screen
      cy.contains('Manual Entry').should('not.exist')
      cy.contains('Protein Shake').should('be.visible')
    })

    it('displays entry description from serving size', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('Oat Bowl')
      cy.get('input[placeholder="100"]').clear().type('1')
      cy.get('input[placeholder="g"]').clear().type('cup')
      cy.get('input[placeholder="e.g. 250"]').type('350')

      cy.contains('Add to Log').click({ force: true })

      // Entry description should be "1 cup"
      cy.contains('Oat Bowl').should('be.visible')
      cy.contains('1 cup').should('be.visible')
    })

    it('defaults serving description when serving amount is empty', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('Plain Food')
      cy.get('input[placeholder="e.g. 250"]').type('100')

      cy.contains('Add to Log').click({ force: true })

      // Description should default to "1 g"
      cy.contains('Plain Food').should('be.visible')
      cy.contains('1 g').should('be.visible')
    })

    it('saves entry with source: "manual"', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('Manual Food')
      cy.get('input[placeholder="e.g. 250"]').type('150')

      cy.contains('Add to Log').click({ force: true })

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('food-log-store')
        const parsed = JSON.parse(raw)
        const today = new Date().toISOString().slice(0, 10)
        const entries = parsed.state.entries[today]
        expect(entries).to.have.length(1)
        expect(entries[0].source).to.equal('manual')
        expect(entries[0].name).to.equal('Manual Food')
        expect(entries[0].calories).to.equal(150)
      })
    })

    it('saves to the selected meal type', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Dinner')

      // Select Lunch meal instead of Dinner (the default)
      cy.contains('button', 'Lunch').click({ force: true })
      cy.contains('button', 'Lunch').should('have.class', 'bg-primary-container')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('Lunch Item')
      cy.get('input[placeholder="e.g. 250"]').type('400')
      cy.contains('Add to Log').click({ force: true })

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('food-log-store')
        const parsed = JSON.parse(raw)
        const today = new Date().toISOString().slice(0, 10)
        const entries = parsed.state.entries[today]
        expect(entries).to.have.length(1)
        expect(entries[0].mealType).to.equal('lunch')
      })
    })

    it('does not clear existing entries when adding a new one', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedWithEntry()))
        },
      })

      // Existing entry should be visible
      cy.contains('Existing Food').should('be.visible')

      // Add another entry
      openManualEntry('Breakfast')
      cy.get('input[placeholder="e.g. Protein Shake"]').type('Second Entry')
      cy.get('input[placeholder="e.g. 250"]').type('200')
      cy.contains('Add to Log').click({ force: true })

      // Both entries should be visible
      cy.contains('Existing Food').should('be.visible')
      cy.contains('Second Entry').should('be.visible')
    })

    it('backdrop click closes the sheet', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      cy.contains('h2', 'Breakfast')
        .parent()
        .find('button')
        .click()

      cy.contains('Add to Breakfast').should('be.visible')

      // Click backdrop (black overlay)
      cy.get('.fixed.inset-0 > .bg-black\\/40').click({ force: true })

      cy.contains('Add to Breakfast').should('not.exist')
    })
  })

  describe('Negative', () => {
    it('shows error for empty food name', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Leave name empty, fill calories
      cy.get('input[placeholder="e.g. 250"]').type('200')
      cy.contains('Add to Log').click({ force: true })

      cy.contains('Food name is required').should('be.visible')
    })

    it('shows error for empty calories', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Fill name, leave calories empty
      cy.get('input[placeholder="e.g. Protein Shake"]').type('Test Food')
      cy.contains('Add to Log').click({ force: true })

      cy.contains('Calories must be greater than 0').should('be.visible')
    })

    it('shows error for calories equal to 0', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('Zero Cal Food')
      cy.get('input[placeholder="e.g. 250"]').type('0')
      cy.contains('Add to Log').click({ force: true })

      cy.contains('Calories must be greater than 0').should('be.visible')
    })

    it('shows both name and calorie errors simultaneously', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Leave both empty, click save
      cy.contains('Add to Log').click({ force: true })

      cy.contains('Food name is required').should('be.visible')
      cy.contains('Calories must be greater than 0').should('be.visible')
    })

    it('errors clear after fixing and re-submitting', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Trigger errors
      cy.contains('Add to Log').click({ force: true })
      cy.contains('Food name is required').should('be.visible')
      cy.contains('Calories must be greater than 0').should('be.visible')

      // Fix errors
      cy.get('input[placeholder="e.g. Protein Shake"]').type('Fixed Food')
      cy.get('input[placeholder="e.g. 250"]').type('300')
      cy.contains('Add to Log').click({ force: true })

      // Errors should be gone, entry should be added
      cy.contains('Food name is required').should('not.exist')
      cy.contains('Calories must be greater than 0').should('not.exist')
      cy.contains('Fixed Food').should('be.visible')
    })

    it('macro fields default to 0 when left empty', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      cy.get('input[placeholder="e.g. Protein Shake"]').type('No Macro Food')
      cy.get('input[placeholder="e.g. 250"]').type('100')
      // Leave all macro fields empty

      cy.contains('Add to Log').click({ force: true })

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('food-log-store')
        const parsed = JSON.parse(raw)
        const today = new Date().toISOString().slice(0, 10)
        const entry = parsed.state.entries[today][0]
        expect(entry.protein).to.equal(0)
        expect(entry.carbs).to.equal(0)
        expect(entry.fat).to.equal(0)
        expect(entry.fiber).to.equal(0)
      })
    })

    it('going back from form to options clears validation errors', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', JSON.stringify(seedEmptyToday()))
        },
      })

      openManualEntry('Breakfast')

      // Trigger errors
      cy.contains('Add to Log').click({ force: true })
      cy.contains('Food name is required').should('be.visible')

      // Go back
      cy.contains('Manual Entry')
        .parent()
        .find('button')
        .first()
        .click()

      // Re-open form
      cy.contains('Add Manually').click({ force: true })

      // Errors should be cleared
      cy.contains('Food name is required').should('not.exist')
    })
  })
})
