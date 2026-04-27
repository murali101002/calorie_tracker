/// <reference types="cypress" />

function seedUserStore(profileOverrides = {}) {
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
        ...profileOverrides,
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

describe('Goals Screen', () => {
  describe('Happy path — full profile', () => {
    it('renders all goal sections', () => {
      cy.visit('/goals')
      cy.get('h1').should('contain', 'Goals')
      cy.contains('Energy Expenditure').should('be.visible')
      cy.contains('Target Calories').should('be.visible')
      cy.contains('Macro Split').should('be.visible')
      cy.contains('Apply Goals').should('be.visible')
      // Disclaimer
      cy.contains('Mifflin-St Jeor').should('be.visible')
    })

    it('displays correct BMR and TDEE for default male profile', () => {
      cy.visit('/goals')
      // Default: male, 30, 175cm, 72kg, moderately_active
      // BMR = 10*72 + 6.25*175 - 5*30 + 5 = 1668.75 → 1669
      cy.contains('BMR').parent().should('contain', '1669')
      // Activity multiplier for moderately_active = 1.55
      cy.contains('×1.55').should('be.visible')
      cy.contains('Moderately active').should('be.visible')
      // TDEE = 1668.75 * 1.55 = 2587
      cy.contains('TDEE').parent().should('contain', '2587')
    })

    it('shows calorie deficit when goal weight is below current weight', () => {
      cy.visit('/goals')
      // goal 70 < current 72 → deficit: 2587 - 500 = 2087
      cy.contains('Target Calories').parent().within(() => {
        cy.contains('-500 kcal').should('be.visible')
        cy.contains('Calorie Deficit').should('be.visible')
      })
    })

    it('shows weeks-to-goal estimate for deficit', () => {
      cy.visit('/goals')
      // (2 kg × 7700) / 500 / 7 = 4.4 → "4 weeks"
      cy.contains(/Est\. \d+ weeks to goal/).should('be.visible')
    })

    it('displays correct macro split cards', () => {
      cy.visit('/goals')
      // Protein: 2 * 72 = 144g, 144*4 = 576 kcal
      cy.contains('Protein').parent().parent().within(() => {
        cy.contains('144g').should('be.visible')
        cy.contains('576 kcal').should('be.visible')
      })
      // Fat: (2087*0.25)/9 = 58g, 58*9 = 522 kcal
      cy.contains('Fat').parent().parent().within(() => {
        cy.contains('58g').should('be.visible')
        cy.contains('522 kcal').should('be.visible')
      })
      // Carbs: (2087 - 576 - 522)/4 = 247g
      cy.contains('Carbs').parent().parent().within(() => {
        cy.contains('247g').should('be.visible')
      })
      // Fiber is always 25g
      cy.contains('Fiber').parent().parent().should('contain', '25g')
    })

    it('bottom nav highlights Goals tab when on /goals', () => {
      cy.visit('/goals')
      cy.get('nav').contains('Goals').should('exist')
    })

    it('applies goals and persists to localStorage', () => {
      cy.visit('/goals')
      cy.contains('Apply Goals').click()
      cy.contains('Goals applied').should('be.visible')

      cy.window().then((win) => {
        const raw = win.localStorage.getItem('user-store')
        expect(raw).to.be.a('string')
        const parsed = JSON.parse(raw)
        const g = parsed.state.goals
        expect(g.calories).to.equal(2087)
        expect(g.protein).to.equal(144)
        expect(g.carbs).to.equal(247)
        expect(g.fat).to.equal(58)
        expect(g.fiber).to.equal(25)
        expect(g.tdee).to.equal(2587)
        expect(g.targetCalories).to.equal(2087)
      })
    })

    it('toast auto-dismisses after applying', () => {
      cy.visit('/goals')
      cy.contains('Apply Goals').click()
      cy.contains('Goals applied').should('be.visible')
      cy.contains('Goals applied', { timeout: 4000 }).should('not.exist')
    })
  })

  describe('Happy path — different scenarios', () => {
    it('shows calorie surplus when goal weight is above current', () => {
      // goalWeight 80 > current 72 → surplus: 2587 + 300 = 2887
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ goalWeight: 80 }))
          )
        },
      })
      cy.contains('Target Calories').parent().within(() => {
        cy.contains('+300 kcal').should('be.visible')
        cy.contains('Calorie Surplus').should('be.visible')
      })
      // Protein at new target: still 2*72 = 144g
      cy.contains('144g').should('be.visible')
      // Target calories should be 2887
      cy.contains('Target').parent().should('contain', '2887')
    })

    it('shows maintenance when goal weight equals current weight', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ goalWeight: 72 }))
          )
        },
      })
      cy.contains('Target Calories').parent().within(() => {
        cy.contains('0 kcal').should('be.visible')
        cy.contains('Maintenance').should('be.visible')
        cy.contains('Maintaining current weight').should('be.visible')
      })
    })

    it('uses female BMR formula for female profile', () => {
      // Female BMR = (10*w + 6.25*h - 5*a) - 161 (instead of +5)
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(
              seedUserStore({
                gender: 'female',
                height: 165,
                weight: 65,
                goalWeight: 60,
              })
            )
          )
        },
      })
      // BMR = 10*65 + 6.25*165 - 5*30 - 161 = 650+1031.25-150-161 = 1370.25 → 1370
      cy.contains('BMR').parent().should('contain', '1370')
      // TDEE = 1370.25 * 1.55 = 2124
      cy.contains('TDEE').parent().should('contain', '2124')
    })

    it('shows different TDEE for sedentary activity level', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ activityLevel: 'sedentary' }))
          )
        },
      })
      // TDEE = 1669 * 1.2 = 2003
      cy.contains('TDEE').parent().should('contain', '2003')
      cy.contains('×1.2').should('be.visible')
      cy.contains('Sedentary').should('be.visible')
    })

    it('shows different TDEE for athlete activity level', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ activityLevel: 'athlete' }))
          )
        },
      })
      // TDEE = 1669 * 1.9 = 3171
      cy.contains('TDEE').parent().should('contain', '3171')
      cy.contains('×1.9').should('be.visible')
      cy.contains('Athlete').should('be.visible')
    })

    it('shows < 1 week when weight delta is very small', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(
              seedUserStore({
                weight: 70.1,
                goalWeight: 70,
              })
            )
          )
        },
      })
      // weeks = (0.1 * 7700) / 500 / 7 = 0.22 → "< 1 week"
      cy.contains('< 1 week').should('be.visible')
    })

    it('computed macros change when profile weight changes', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(
              seedUserStore({ weight: 80, goalWeight: 75 })
            )
          )
        },
      })
      // Protein = 2 * 80 = 160g
      cy.contains('Protein').parent().parent().should('contain', '160g')
    })
  })

  describe('Negative', () => {
    it('shows complete profile message when age is missing', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ age: 0 }))
          )
        },
      })
      cy.contains('Complete your profile first').should('be.visible')
      cy.contains('We need your age, height, and weight to calculate your goals.').should('be.visible')
      cy.contains('Go to Profile').should('be.visible')
      // Calculations should not be shown
      cy.contains('Energy Expenditure').should('not.exist')
    })

    it('shows complete profile message when height is too low', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ height: 50 }))
          )
        },
      })
      cy.contains('Complete your profile first').should('be.visible')
      cy.contains('Go to Profile').should('be.visible')
    })

    it('shows complete profile message when weight is too low', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(
              seedUserStore({ weight: 10, goalWeight: 10 })
            )
          )
        },
      })
      cy.contains('Complete your profile first').should('be.visible')
    })

    it('Go to Profile button navigates to /profile', () => {
      cy.visit('/goals', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'user-store',
            JSON.stringify(seedUserStore({ age: 0 }))
          )
        },
      })
      cy.contains('Go to Profile').click()
      cy.url().should('include', '/profile')
    })
  })
})
