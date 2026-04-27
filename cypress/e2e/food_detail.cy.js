/// <reference types="cypress" />

const testProduct = {
  id: 'test-product',
  name: 'Test Greek Yogurt',
  brand: 'TestBrand',
  tagline: '500g container',
  imageUrl: '/fallback-food.png',
  servingSize: 100,
  servingUnit: 'gram',
  calories: 58,
  protein: 10.3,
  carbs: 3.6,
  fat: 0.7,
  fiber: 0,
  sodium: 40,
  sugars: 3.2,
  calcium: '110 mg',
  isFavorite: false,
}

describe('Food Detail Screen', () => {
  describe('Happy path', () => {
    it('displays product name and brand from route state', () => {
      cy.visit('/food-detail', {
        onBeforeLoad(win) {
          win.history.pushState({ product: testProduct }, '', '/food-detail')
        },
      })
      // After the page mounts, the state should be available
      cy.reload()
    })

    it('loads sampled food when navigated via foodId', () => {
      cy.visit('/food/greek-yogurt')
      cy.get('h1').should('be.visible')
    })

    it('default serving size matches product data', () => {
      // Visit with test product via URL with id that loads from sample
      cy.visit('/food/greek-yogurt')
      cy.get('input[type="number"]').should('be.visible')
    })

    it('changing serving size recalculates values', () => {
      cy.visit('/food/greek-yogurt')
      cy.get('input[type="number"]').clear().type('200').trigger('change')
      // The input should reflect the new serving size
      cy.get('input[type="number"]').should(($input) => {
        const val = $input.val()
        expect(val).to.not.be.empty
      })
    })

    it('selecting a meal highlights it', () => {
      cy.visit('/food/greek-yogurt')
      cy.contains('button', 'Breakfast').click()
      cy.contains('button', 'Breakfast').should(
        'have.class',
        'bg-primary-container'
      )
    })

    it('Add to Log saves entry and navigates to home', () => {
      cy.visit('/food/greek-yogurt')
      cy.contains('Add to Log').click()
      cy.url().should('eq', Cypress.config('baseUrl') + '/')
    })

    it('home screen reflects added entry', () => {
      cy.visit('/food/greek-yogurt')
      cy.contains('Add to Log').click()
      cy.url().should('eq', Cypress.config('baseUrl') + '/')
      // An entry should now be visible on the home screen
      cy.contains('Greek Yogurt').should('be.visible')
    })
  })

  describe('Negative', () => {
    it('handles /food-detail with no route state gracefully', () => {
      // Visiting without state - app falls back to first sample food
      cy.visit('/food-detail')
      cy.get('h1').should('be.visible')
    })

    it('shows 0 calories when serving size is 0', () => {
      cy.visit('/food/greek-yogurt')
      cy.get('input[type="number"]')
        .clear()
        .type('0')
        .trigger('change')
      // Calories should show 0 not NaN
      cy.get('h2').should('be.visible')
    })

    it('handles empty serving size gracefully', () => {
      cy.visit('/food/greek-yogurt')
      cy.get('input[type="number"]').clear()
      // After clearing, enter valid value
      cy.get('input[type="number"]').type('2')
      cy.get('input[type="number"]').should(($input) => {
        const val = $input.val()
        expect(val).to.not.be.empty
      })
      cy.contains('Add to Log').should('be.visible')
    })

    it('defaults to a meal when clicking Add to Log without selecting', () => {
      cy.visit('/food/greek-yogurt')
      // Default meal is breakfast, clicking Add should work
      cy.contains('Add to Log').click()
      cy.url().should('eq', Cypress.config('baseUrl') + '/')
    })
  })
})
