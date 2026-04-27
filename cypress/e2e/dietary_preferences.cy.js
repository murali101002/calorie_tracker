/// <reference types="cypress" />

function seedProfile(preferences = []) {
  return {
    state: {
      profile: {
        name: 'Alex Chen',
        avatarUrl: '',
        height: 175,
        weight: 72,
        age: 30,
        gender: 'male',
        goalWeight: 70,
        activityLevel: 'moderately_active',
        preferences,
      },
      goals: {
        calories: 2200,
        protein: 120,
        carbs: 250,
        fat: 65,
        fiber: 25,
        tdee: 0,
        targetCalories: 0,
      },
      settings: { theme: 'light', useMetric: true, favoriteProducts: [] },
    },
    version: 0,
  }
}

describe('Dietary Preferences', () => {
  describe('Happy path', () => {
    it('renders all 12 dietary preference tags', () => {
      cy.visit('/profile')
      cy.contains('Dietary Preferences').should('be.visible')

      const allTags = [
        'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free',
        'Keto', 'Paleo', 'Halal', 'Kosher', 'Nut Allergy', 'Low Sodium', 'Diabetic-Friendly',
      ]
      allTags.forEach((tag) => {
        cy.contains('button', tag).should('be.visible')
      })
    })

    it('starts with no tags selected by default', () => {
      cy.visit('/profile')
      cy.contains('button', 'Vegetarian').should('not.have.class', 'bg-primary-container')
      cy.contains('button', 'Vegan').should('not.have.class', 'bg-primary-container')
      cy.contains('button', 'Keto').should('not.have.class', 'bg-primary-container')
    })

    it('can toggle a single tag on', () => {
      cy.visit('/profile')
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')
    })

    it('can toggle a single tag off', () => {
      cy.visit('/profile')
      // Select first
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')
      // Deselect
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('not.have.class', 'bg-primary-container')
    })

    it('can select multiple tags across different categories', () => {
      cy.visit('/profile')
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Gluten-Free').click()
      cy.contains('button', 'Dairy-Free').click()
      cy.contains('button', 'Nut Allergy').click()
      cy.contains('button', 'Halal').click()

      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Gluten-Free').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Dairy-Free').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Nut Allergy').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Halal').should('have.class', 'bg-primary-container')

      // Unselected ones should remain outlined
      cy.contains('button', 'Vegan').should('not.have.class', 'bg-primary-container')
      cy.contains('button', 'Keto').should('not.have.class', 'bg-primary-container')
    })

    it('visual style toggles between selected and unselected', () => {
      cy.visit('/profile')
      // Unselected: outlined style (no bg-primary-container)
      cy.contains('button', 'Keto').should('not.have.class', 'bg-primary-container')

      // Selected: filled style
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Keto').should('have.class', 'bg-primary-container')

      // Toggle off: back to outlined
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Keto').should('not.have.class', 'bg-primary-container')
    })

    it('persists selected preferences on save', () => {
      cy.visit('/profile')
      cy.contains('button', 'Vegan').click()
      cy.contains('button', 'Gluten-Free').click()
      cy.contains('button', 'Low Sodium').click()

      cy.contains('Save Profile').click()
      cy.contains('Profile saved').should('be.visible')

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        expect(raw).to.be.a('string')
        const parsed = JSON.parse(raw)
        expect(parsed.state.profile.preferences).to.deep.equal([
          'Vegan', 'Gluten-Free', 'Low Sodium',
        ])
      })
    })

    it('preserves tag selection order', () => {
      cy.visit('/profile')
      cy.contains('button', 'Halal').click()
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Vegan').click()

      cy.contains('Save Profile').click()

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        const parsed = JSON.parse(raw)
        expect(parsed.state.profile.preferences).to.deep.equal([
          'Halal', 'Keto', 'Vegan',
        ])
      })
    })

    it('loads persisted preferences on page reload', () => {
      const savedPrefs = ['Vegetarian', 'Pescatarian', 'Kosher']
      cy.visit('/profile', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedProfile(savedPrefs))
          )
        },
      })

      savedPrefs.forEach((tag) => {
        cy.contains('button', tag).should('have.class', 'bg-primary-container')
      })

      // Tags not in the saved list should be unselected
      cy.contains('button', 'Vegan').should('not.have.class', 'bg-primary-container')
      cy.contains('button', 'Dairy-Free').should('not.have.class', 'bg-primary-container')
    })

    it('can save an empty preferences array', () => {
      const savedPrefs = ['Vegetarian', 'Gluten-Free']
      cy.visit('/profile', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedProfile(savedPrefs))
          )
        },
      })

      // Deselect all
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Gluten-Free').click()

      cy.contains('Save Profile').click()

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        const parsed = JSON.parse(raw)
        expect(parsed.state.profile.preferences).to.deep.equal([])
      })
    })

    it('saving preferences does not affect other profile fields', () => {
      cy.visit('/profile')
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Paleo').click()
      cy.contains('Save Profile').click()

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        const parsed = JSON.parse(raw)
        const p = parsed.state.profile
        // Other fields should remain at their default values
        expect(p.name).to.equal('Alex Chen')
        expect(p.age).to.equal(30)
        expect(p.height).to.equal(175)
        expect(p.weight).to.equal(72)
        expect(p.goalWeight).to.equal(70)
        expect(p.gender).to.equal('male')
        expect(p.activityLevel).to.equal('moderately_active')
        // Preferences should be saved
        expect(p.preferences).to.deep.equal(['Keto', 'Paleo'])
      })
    })

    it('all 12 tags can be selected simultaneously', () => {
      cy.visit('/profile')

      const allTags = [
        'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free',
        'Keto', 'Paleo', 'Halal', 'Kosher', 'Nut Allergy', 'Low Sodium', 'Diabetic-Friendly',
      ]
      allTags.forEach((tag) => {
        cy.contains('button', tag).click()
      })

      // Verify all are selected
      allTags.forEach((tag) => {
        cy.contains('button', tag).should('have.class', 'bg-primary-container')
      })

      cy.contains('Save Profile').click()

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        const parsed = JSON.parse(raw)
        expect(parsed.state.profile.preferences).to.have.length(12)
      })
    })
  })

  describe('Negative', () => {
    it('handles missing preferences field gracefully (undefined)', () => {
      cy.visit('/profile', {
        onBeforeLoad(win) {
          const store = seedProfile()
          // Remove preferences entirely from the saved profile
          delete store.state.profile.preferences
          win.localStorage.setItem('user-store', JSON.stringify(store))
        },
      })
      // Page should render without crash
      cy.contains('Dietary Preferences').should('be.visible')
      // No tags should be selected
      cy.contains('button', 'Vegetarian').should('not.have.class', 'bg-primary-container')
    })

    it('handles corrupted preferences field gracefully (non-array)', () => {
      cy.visit('/profile', {
        onBeforeLoad(win) {
          const store = seedProfile()
          store.state.profile.preferences = 'not-an-array'
          win.localStorage.setItem('user-store', JSON.stringify(store))
        },
      })

      // App should still render without crash
      cy.contains('Dietary Preferences').should('be.visible')

      // Clicking a tag should still work — fallback handles it
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')

      // After toggling, we should be able to save
      cy.contains('Save Profile').click()
      cy.contains('Profile saved').should('be.visible')
    })

    it('rapid toggle does not lose state', () => {
      cy.visit('/profile')

      // Toggle quickly multiple times
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Keto').click()
      cy.contains('button', 'Keto').click()

      // Should end up selected (odd number of clicks)
      cy.contains('button', 'Keto').should('have.class', 'bg-primary-container')
    })

    it('preferences survive profile save without modification', () => {
      const savedPrefs = ['Diabetic-Friendly', 'Low Sodium']
      cy.visit('/profile', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedProfile(savedPrefs))
          )
        },
      })

      // Verify they load correctly
      cy.contains('button', 'Diabetic-Friendly').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Low Sodium').should('have.class', 'bg-primary-container')

      // Save without making any changes
      cy.contains('Save Profile').click()

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        const parsed = JSON.parse(raw)
        expect(parsed.state.profile.preferences).to.deep.equal([
          'Diabetic-Friendly', 'Low Sodium',
        ])
      })
    })
  })
})
