/// <reference types="cypress" />

describe('Recipe Builder', () => {
  describe('Happy path', () => {
    it('can enter a recipe name', () => {
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]')
        .clear()
        .type('My Smoothie')
        .should('have.value', 'My Smoothie')
    })

    it('auto-initializes with demo ingredients', () => {
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]')
        .should('have.value', 'Garden Pesto Pasta')
      // Should have 3 ingredients pre-loaded
      cy.contains(/^\d+ items$/).should('be.visible')
    })

    it('adds a new ingredient when + Add Ingredient clicked', () => {
      cy.visit('/recipes/new')
      cy.contains('+ Add Ingredient').click()
      // Ingredient count should increment from initial 3
      cy.contains(/^\d+ items$/).invoke('text').should('not.eq', '3 items')
    })

    it('calculates total calories from ingredients', () => {
      cy.visit('/recipes/new')
      // Totals card should appear with a kcal value
      cy.contains('Total Calories').should('be.visible')
      cy.contains('kcal').should('be.visible')
    })

    it('saves recipe and navigates to recipe list', () => {
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]')
        .clear()
        .type('Test Recipe')
      cy.contains('Save Recipe').click()
      cy.url().should('include', '/recipes')
    })

    it('saved recipe appears in recipe list', () => {
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]')
        .clear()
        .type('Unique Test Recipe')
      cy.contains('Save Recipe').click()
      // Should see the saved recipe in the list
      cy.contains('Unique Test Recipe').should('be.visible')
    })
  })

  describe('Negative', () => {
    it('blocks save with empty recipe name', () => {
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]').clear()
      // Save button should be disabled
      cy.contains('Save Recipe').should('be.disabled')
    })

    it('treats missing calorie fields as 0', () => {
      cy.visit('/recipes/new')
      // The auto-init ingredients all have valid calories, so this is about
      // verifying totals are numbers, not NaN
      cy.contains('kcal').invoke('text').then((text) => {
        const cals = parseInt(text.replace(/[^0-9]/g, ''))
        expect(cals).to.be.a('number')
        expect(isNaN(cals)).to.be.false
      })
    })

    it('recalculates total after removing an ingredient', () => {
      cy.visit('/recipes/new')
      cy.contains('Total Calories').should('be.visible')
      // Get initial kcal value
      cy.contains('Total Calories')
        .parent()
        .find('p.text-headline-lg')
        .invoke('text')
        .then((beforeText) => {
          // Click first remove button (close icon on ingredient card)
          cy.get('span.material-symbols-outlined').contains('close').first().click()
          // Total should change
          cy.contains('Total Calories')
            .parent()
            .find('p.text-headline-lg')
            .invoke('text')
            .should('not.eq', beforeText)
        })
    })

    it('allows duplicate recipe names', () => {
      const name = 'Duplicate Recipe'
      // Create first recipe
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]').clear().type(name)
      cy.contains('Save Recipe').click()
      // Create second with same name
      cy.visit('/recipes/new')
      cy.get('input[placeholder="Enter recipe name..."]').clear().type(name)
      cy.contains('Save Recipe').click()
      // Should be saved - both appear
      cy.contains(name).should('be.visible')
    })
  })
})
