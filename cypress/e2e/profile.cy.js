/// <reference types="cypress" />

function defaultProfileStore(overrides = {}) {
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
        preferences: [],
        ...overrides,
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

describe('Profile Screen', () => {
  describe('Happy path', () => {
    it('renders profile page with pre-filled defaults', () => {
      cy.visit('/profile')
      cy.get('h1').should('contain', 'Profile')
      // Personal info section
      cy.contains('Personal Info').should('be.visible')
      // Name pre-filled with default
      cy.get('input[placeholder="Your name"]').should('have.value', 'Alex Chen')
      // Age pre-filled with default
      cy.get('input[placeholder="e.g. 30"]').should('have.value', '30')
      // Biological sex section
      cy.contains('Biological Sex').should('be.visible')
      // Height section
      cy.contains('Height').should('be.visible')
      // Current weight section
      cy.contains('Current Weight').should('be.visible')
      // Goal weight section
      cy.contains('Goal Weight').should('be.visible')
      // Activity level section
      cy.contains('Activity Level').should('be.visible')
      // Dietary preferences section
      cy.contains('Dietary Preferences').should('be.visible')
      // Save button
      cy.contains('Save Profile').should('be.visible')
    })

    it('top nav avatar navigates to profile', () => {
      cy.visit('/')
      // Click the avatar/name button in the top nav
      cy.get('header').find('button').first().click()
      cy.url().should('include', '/profile')
    })

    it('can change name', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="Your name"]').clear().type('Jane Doe')
      cy.get('input[placeholder="Your name"]').should('have.value', 'Jane Doe')
    })

    it('can change age', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 30"]').clear().type('35')
      cy.get('input[placeholder="e.g. 30"]').should('have.value', '35')
    })

    it('can toggle biological sex', () => {
      cy.visit('/profile')
      cy.contains('button', 'Female').click()
      // Female button should now be active
      cy.contains('button', 'Female').should('have.class', 'bg-primary-container')
      // Male button should no longer be active
      cy.contains('button', 'Male').should('not.have.class', 'bg-primary-container')
    })

    it('can toggle height units from cm to ft/in and back', () => {
      cy.visit('/profile')
      // Default is cm
      cy.contains('centimeters').should('be.visible')
      // Toggle to ft/in
      cy.contains('button', 'ft/in').click()
      cy.contains('feet').should('be.visible')
      cy.contains('inches').should('be.visible')
      // Default 175 cm should convert to ~5'9"
      cy.get('input[placeholder="5"]').should(($input) => {
        expect($input.val()).to.not.be.empty
      })
      // Toggle back
      cy.contains('button', 'cm').click()
      cy.contains('centimeters').should('be.visible')
    })

    it('can toggle weight units from kg to lbs and back', () => {
      cy.visit('/profile')
      // Default is kg
      cy.contains('kg').should('be.visible')
      // Toggle to lbs
      cy.contains('button', 'lbs').click()
      cy.contains('lbs').should('be.visible')
      // Default 72 kg should convert to ~159 lbs
      cy.get('input[placeholder="e.g. 158"]').should(($input) => {
        expect($input.val()).to.not.be.empty
      })
      // Toggle back
      cy.contains('button', 'kg').click()
    })

    it('can select a different activity level', () => {
      cy.visit('/profile')
      // Default is moderately_active - click sedentary
      cy.contains('button', 'Sedentary').click()
      // Verify it shows active styling (inner dot visible)
      cy.contains('button', 'Sedentary')
        .find('.bg-primary-container')
        .should('exist')
    })

    it('can toggle dietary preference chips on and off', () => {
      cy.visit('/profile')
      // Click Vegetarian chip
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')
      // Click Vegetarian again to deselect
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Vegetarian').should('not.have.class', 'bg-primary-container')
    })

    it('can select multiple dietary preferences', () => {
      cy.visit('/profile')
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Gluten-Free').click()
      cy.contains('button', 'Dairy-Free').click()
      // All three should be active
      cy.contains('button', 'Vegetarian').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Gluten-Free').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Dairy-Free').should('have.class', 'bg-primary-container')
    })

    it('shows toast and persists data on save', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="Your name"]').clear().type('Test User')
      cy.get('input[placeholder="e.g. 30"]').clear().type('28')
      cy.contains('button', 'Female').click()
      cy.contains('button', 'Vegetarian').click()
      cy.contains('button', 'Keto').click()
      cy.contains('Save Profile').click()

      // Toast should appear
      cy.contains('Profile saved').should('be.visible')

      // Verify data persisted in localStorage
      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        expect(raw).to.be.a('string')
        const parsed = JSON.parse(raw)
        const p = parsed.state.profile
        expect(p.name).to.equal('Test User')
        expect(p.age).to.equal(28)
        expect(p.gender).to.equal('female')
        expect(p.preferences).to.include.members(['Vegetarian', 'Keto'])
      })
    })

    it('retains saved data on reload', () => {
      // Seed with custom profile data
      const customProfile = {
        name: 'Persist Test',
        avatarUrl: '',
        height: 180,
        weight: 80,
        age: 25,
        gender: 'female',
        goalWeight: 75,
        activityLevel: 'very_active',
        preferences: ['Vegan', 'Halal'],
      }
      cy.visit('/profile', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(defaultProfileStore(customProfile))
          )
        },
      })
      // Form should show the persisted data
      cy.get('input[placeholder="Your name"]').should('have.value', 'Persist Test')
      cy.get('input[placeholder="e.g. 30"]').should('have.value', '25')
      // Female should be active
      cy.contains('button', 'Female').should('have.class', 'bg-primary-container')
      // Vegan and Halal chips should be selected
      cy.contains('button', 'Vegan').should('have.class', 'bg-primary-container')
      cy.contains('button', 'Halal').should('have.class', 'bg-primary-container')
    })
  })

  describe('Negative', () => {
    it('shows error for empty age', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 30"]').clear()
      cy.contains('Save Profile').click()
      cy.contains('Age must be between 10 and 100').should('be.visible')
    })

    it('shows error for age below 10', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 30"]').clear().type('5')
      cy.contains('Save Profile').click()
      cy.contains('Age must be between 10 and 100').should('be.visible')
    })

    it('shows error for age above 100', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 30"]').clear().type('150')
      cy.contains('Save Profile').click()
      cy.contains('Age must be between 10 and 100').should('be.visible')
    })

    it('shows error for height below 100 cm', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 175"]').clear().type('50')
      cy.contains('Save Profile').click()
      cy.contains('Height must be between 100 and 250 cm').should('be.visible')
    })

    it('shows error for empty height in cm', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 175"]').clear()
      cy.contains('Save Profile').click()
      cy.contains('Height must be between 100 and 250 cm').should('be.visible')
    })

    it('shows error for invalid height in ft/in', () => {
      cy.visit('/profile')
      cy.contains('button', 'ft/in').click()
      // Clear feet and inches inputs
      cy.get('input[placeholder="5"]').clear().type('9')
      cy.get('input[placeholder="10"]').clear().type('0')
      cy.contains('Save Profile').click()
      cy.contains('Enter a valid height').should('be.visible')
    })

    it('shows error for empty weight', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 72"]').clear()
      cy.contains('Save Profile').click()
      cy.contains(/Weight must be between/).should('be.visible')
    })

    it('shows error for weight below minimum', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 72"]').clear().type('10')
      cy.contains('Save Profile').click()
      cy.contains(/Weight must be between/).should('be.visible')
    })

    it('shows error for goal weight of 0', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 70"]').clear().type('0')
      cy.contains('Save Profile').click()
      cy.contains('Goal weight cannot be 0').should('be.visible')
    })

    it('shows error for goal weight below minimum', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 70"]').clear().type('5')
      cy.contains('Save Profile').click()
      cy.contains(/Goal weight must be between/).should('be.visible')
    })

    it('clears errors after fixing invalid fields and re-saving', () => {
      cy.visit('/profile')
      // Cause multiple errors
      cy.get('input[placeholder="e.g. 30"]').clear()
      cy.get('input[placeholder="e.g. 72"]').clear()
      cy.contains('Save Profile').click()
      cy.contains('Age must be between 10 and 100').should('be.visible')
      cy.contains(/Weight must be between/).should('be.visible')

      // Fix the errors
      cy.get('input[placeholder="e.g. 30"]').type('30')
      cy.get('input[placeholder="e.g. 72"]').type('72')
      cy.contains('Save Profile').click()

      // Errors should be gone, toast should appear
      cy.contains('Age must be between 10 and 100').should('not.exist')
      cy.contains(/Weight must be between/).should('not.exist')
      cy.contains('Profile saved').should('be.visible')
    })

    it('toast auto-dismisses after a few seconds', () => {
      cy.visit('/profile')
      cy.contains('Save Profile').click()
      cy.contains('Profile saved').should('be.visible')
      // Toast should disappear after auto-dismiss (max 3s timeout)
      cy.contains('Profile saved', { timeout: 4000 }).should('not.exist')
    })

    it('does not allow saving with all empty required fields', () => {
      cy.visit('/profile')
      cy.get('input[placeholder="e.g. 30"]').clear()
      cy.get('input[placeholder="e.g. 175"]').clear()
      cy.get('input[placeholder="e.g. 72"]').clear()
      cy.get('input[placeholder="e.g. 70"]').clear()
      cy.contains('Save Profile').click()

      // All error messages should appear
      cy.contains('Age must be between 10 and 100').should('be.visible')
      cy.contains('Height must be between 100 and 250 cm').should('be.visible')
      cy.contains(/Weight must be between/).should('be.visible')
      cy.contains('Goal weight cannot be 0').should('be.visible')
    })
  })
})
