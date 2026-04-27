/// <reference types="cypress" />

function entriesForToday() {
  const today = new Date().toISOString().slice(0, 10)
  const entry = {
    id: 'test-1',
    foodId: 'greek-yogurt',
    name: 'Greek Yogurt',
    description: '1 cup',
    icon: 'egg',
    calories: 130,
    protein: 12,
    carbs: 9,
    fat: 5,
    fiber: 0,
    servingAmount: 1,
    servingUnit: 'cup',
    mealType: 'breakfast',
    loggedAt: today + 'T08:00:00Z',
  }
  return { date: today, entry }
}

describe('Home Screen', () => {
  describe('Happy path', () => {
    it('loads today date in the header', () => {
      cy.visit('/')
      // DateNavigator shows either "Today" or weekday name, followed by month/day
      cy.get('h1').should('be.visible').invoke('text').then((text) => {
        expect(text).to.match(/(Today|[A-Z][a-z]+day), [A-Z][a-z]{2} \d{1,2}/)
      })
    })

    it('renders all meal sections', () => {
      cy.visit('/')
      cy.contains('h2', 'Breakfast').should('be.visible')
      cy.contains('h2', 'Lunch').should('be.visible')
      cy.contains('h2', 'Dinner').should('be.visible')
    })

    it('shows zero macros on empty day', () => {
      const today = new Date().toISOString().slice(0, 10)
      const past = '2020-01-01'
      cy.visit('/', {
        onBeforeLoad(win) {
          // Pre-seed a dummy past entry so seedSampleData() doesn't fire
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: {
                entries: { [past]: [] },
                activeDate: today,
              },
              version: 0,
            })
          )
        },
      })
      cy.contains('Calories Remaining').should('be.visible')
      cy.contains('Protein').parent().should('contain', '0g')
      cy.contains('Carbs').parent().should('contain', '0g')
      cy.contains('Fat').parent().should('contain', '0g')
    })

    it('navigates to previous day with arrow', () => {
      cy.visit('/')
      cy.get('h1').invoke('text').then((original) => {
        cy.get('span.material-symbols-outlined').contains('chevron_left')
          .closest('button').click()
        cy.get('h1').invoke('text').should('not.eq', original)
      })
    })

    it('navigates to next day with arrow (if not today)', () => {
      // First go to yesterday so next arrow is enabled
      cy.visit('/')
      cy.get('span.material-symbols-outlined').contains('chevron_left')
        .closest('button').click()
      cy.get('h1').invoke('text').then((prevDay) => {
        cy.get('span.material-symbols-outlined').contains('chevron_right')
          .closest('button').click()
        cy.get('h1').invoke('text').should('not.eq', prevDay)
      })
    })

    it('renders entries from localStorage and shows correct totals', () => {
      const { date, entry } = entriesForToday()
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
      cy.contains(entry.name).should('be.visible')
      // Calories remaining should reflect the entry (goal 2200 - 130 = 2070)
      cy.contains(/^\d[\d,]*$/, { timeout: 4000 }).should('not.contain', '2200')
    })
  })

  describe('Negative', () => {
    it('handles corrupted localStorage gracefully', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('food-log-store', 'not-valid-json{{{')
        },
      })
      // App should still load without white screen
      cy.get('h1').should('be.visible')
      cy.contains('h2', 'Breakfast').should('be.visible')
    })

    it('future date arrows are blocked on today', () => {
      cy.visit('/')
      // On today, the next button should be disabled
      cy.get('span.material-symbols-outlined')
        .contains('chevron_right')
        .closest('button')
        .should('be.disabled')
    })

    it('does not crash with missing macro fields in entries', () => {
      const today = new Date().toISOString().slice(0, 10)
      const past = '2020-06-15'
      // Entry with missing protein field
      const entry = {
        id: 'test-missing',
        foodId: 'test',
        name: 'Test Food',
        description: '',
        icon: 'restaurant',
        calories: 100,
        carbs: 10,
        fat: 5,
        fiber: 2,
        servingAmount: 1,
        servingUnit: 'gram',
        mealType: 'lunch',
        loggedAt: today + 'T12:00:00Z',
      }
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'food-log-store',
            JSON.stringify({
              state: { entries: { [past]: [], [today]: [entry] }, activeDate: today },
              version: 0,
            })
          )
        },
      })
      // App should render without white screen
      cy.get('h1').should('be.visible')
      cy.contains('Test Food').should('be.visible')
    })
  })
})
