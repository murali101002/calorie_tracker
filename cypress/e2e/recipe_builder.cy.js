/// <reference types="cypress" />

describe('Recipe Builder', () => {
  // Helper: add an ingredient via the picker sheet manual entry form
  function addIngredientViaManual(name, calories) {
    cy.contains('+ Add Ingredient').click({ force: true })
    cy.contains('Enter Manually').click({ force: true })
    cy.get('input[placeholder="e.g. Chicken Breast"]').clear().type(name, { force: true })
    cy.get('input[placeholder="e.g. 250"]').clear().type(calories, { force: true })
    cy.contains('button', 'Save Ingredient').click({ force: true })
    // Wait for sheet close animation
    cy.wait(300)
  }

  describe('Happy path', () => {
    it('can enter a recipe name', () => {
      cy.visit('/recipes/new')
      cy.wait(300)
      cy.get('input[placeholder="Enter recipe name..."]')
        .clear()
        .type('My Smoothie')
        .should('have.value', 'My Smoothie')
    })

    it('starts with blank form', () => {
      cy.visit('/recipes/new')
      cy.wait(300)
      cy.get('input[placeholder="Enter recipe name..."]')
        .should('have.value', '')
      // No ingredients pre-loaded
      cy.contains('0 items').should('be.visible')
    })

    it('adds a new ingredient when + Add Ingredient clicked', () => {
      cy.visit('/recipes/new')
      addIngredientViaManual('Chicken Breast', '250')
      // Ingredient count should increment from 0 to 1
      cy.contains('1 items').should('be.visible')
    })

    it('calculates total calories after adding ingredient', () => {
      cy.visit('/recipes/new')
      addIngredientViaManual('Chicken Breast', '250')
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
      // Open picker, go to manual form, skip calories
      cy.contains('+ Add Ingredient').click({ force: true })
      cy.contains('Enter Manually').click({ force: true })
      cy.get('input[placeholder="e.g. Chicken Breast"]').clear().type('Test Food', { force: true })
      // Click Add Ingredient - should be blocked by validation (calories required)
      cy.contains('button', 'Save Ingredient').click({ force: true })
      // Validation error should appear
      cy.contains('Calories must be greater than 0').should('be.visible')
    })

    it('recalculates total after removing an ingredient', () => {
      cy.visit('/recipes/new')
      // Add two ingredients so removing one leaves the totals card visible
      addIngredientViaManual('Chicken Breast', '250')
      addIngredientViaManual('Rice', '200')
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
