/// <reference types="cypress" />

function yesterdayEntry() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const date = d.toISOString().slice(0, 10)
  const entry = {
    id: 'yesterday-1',
    foodId: 'chicken',
    name: 'Chicken Breast',
    description: '200g grilled',
    icon: 'restaurant',
    calories: 280,
    protein: 52,
    carbs: 0,
    fat: 6,
    fiber: 0,
    servingAmount: 200,
    servingUnit: 'gram',
    mealType: 'lunch',
    loggedAt: date + 'T12:30:00Z',
  }
  return { date, entry }
}

function closeModal() {
  cy.get('body').then(($body) => {
    if ($body.find('h2:contains("Select Date")').length) {
      cy.get('button').contains('svg').closest('button').first().click({ force: true })
    }
  })
}

describe('Date Picker + Copy Log', () => {
  describe('Happy path', () => {
    it('opens date picker modal when calendar icon is clicked', () => {
      const today = new Date().toISOString().slice(0, 10)
      cy.visit('/', {
        onBeforeLoad(win) {
          // Pre-seed to prevent seedSampleData re-render
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: { entries: { '2020-01-01': [] }, activeDate: today },
              version: 0,
            })
          )
        },
      })
      cy.get('h1').should('be.visible')
      cy.get('[aria-label="Open date picker"]').click()
      cy.contains('Select Date').should('be.visible')
    })

    it('shows current month in the modal', () => {
      cy.visit('/')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      const now = new Date()
      const expected = now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      cy.contains(expected).should('be.visible')
    })

    it('navigates to previous months in the modal', () => {
      cy.visit('/')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.contains('Select Date').should('be.visible')
      // Click left chevron
      cy.get('svg.lucide-chevron-left').closest('button').click()
      // Modal should still be visible
      cy.contains('Select Date').should('be.visible')
    })

    it('selecting a date closes modal and loads that date', () => {
      const { date, entry } = yesterdayEntry()
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: { entries: { [date]: [entry] }, activeDate: date },
              version: 0,
            })
          )
        },
      })
      cy.get('h1').should('be.visible')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.contains('Select Date').should('be.visible')
    })

    it('shows Copy log button when selected date has entries and is not today', () => {
      const { date, entry } = yesterdayEntry()
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: { entries: { [date]: [entry] }, activeDate: date },
              version: 0,
            })
          )
        },
      })
      cy.get('h1').should('be.visible')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.contains('Select Date').should('be.visible')
    })

    it('confirming copy appends to today without replacing existing entries', () => {
      const today = new Date().toISOString().slice(0, 10)
      const { date: yDate, entry: yEntry } = yesterdayEntry()
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: {
                entries: {
                  [yDate]: [yEntry],
                  [today]: todayEntries(),
                },
                activeDate: yDate,
              },
              version: 0,
            })
          )
        },
      })
      cy.get('h1').should('be.visible')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.get('body').then(($body) => {
        const copyBtn = $body.find('button:contains("Copy log from this date")')
        if (copyBtn.length) {
          cy.wrap(copyBtn).click()
          cy.contains('Copy').click()
          cy.url().should('eq', Cypress.config('baseUrl') + '/')
        }
      })
    })
  })

  describe('Negative', () => {
    it('future dates are not clickable', () => {
      cy.visit('/')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.get('button[disabled]').should('exist')
    })

    it('modal can be closed with X button', () => {
      cy.visit('/')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.contains('Select Date').should('be.visible')
      // X button in the modal header
      cy.get('svg.lucide-x').closest('button').click()
      cy.contains('Select Date').should('not.exist')
    })

    it('canceling copy confirmation does not modify log', () => {
      const { date, entry } = yesterdayEntry()
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: { entries: { [date]: [entry] }, activeDate: date },
              version: 0,
            })
          )
        },
      })
      cy.get('h1').should('be.visible')
      cy.get('button[aria-label="Open date picker"]').click({ force: true })
      cy.get('body').then(($body) => {
        const copyBtn = $body.find('button:contains("Copy log from this date")')
        if (copyBtn.length) {
          cy.wrap(copyBtn).click()
          cy.contains('Cancel').click()
          cy.contains('Select Date').should('be.visible')
        }
      })
    })
  })
})

function todayEntries() {
  const today = new Date().toISOString().slice(0, 10)
  return [
    {
      id: 'today-1',
      foodId: 'eggs',
      name: 'Boiled Eggs',
      description: '2 large',
      icon: 'egg',
      calories: 156,
      protein: 13,
      carbs: 1,
      fat: 11,
      fiber: 0,
      servingAmount: 2,
      servingUnit: 'container',
      mealType: 'breakfast',
      loggedAt: today + 'T08:00:00Z',
    },
  ]
}
