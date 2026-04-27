import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DailyLogPage } from './components/screens/daily-log/DailyLogPage'
import { BarcodeScannerPage } from './components/screens/barcode-scanner/BarcodeScannerPage'
import { FoodDetailPage } from './components/screens/food-detail/FoodDetailPage'
import { RecipeListPage } from './components/screens/recipe-list/RecipeListPage'
import { RecipeBuilderPage } from './components/screens/recipe-builder/RecipeBuilderPage'
import { ProfilePage } from './components/screens/profile/ProfilePage'
import { GoalsPage } from './components/screens/goals/GoalsPage'
import { SearchPage } from './components/screens/search/SearchPage'

const router = createBrowserRouter([
  { path: '/', element: <DailyLogPage /> },
  { path: '/scan', element: <BarcodeScannerPage /> },
  { path: '/food/:foodId', element: <FoodDetailPage /> },
  { path: '/food-detail', element: <FoodDetailPage /> },
  { path: '/recipes', element: <RecipeListPage /> },
  { path: '/recipes/new', element: <RecipeBuilderPage key="new" /> },
  { path: '/recipes/:recipeId/edit', element: <RecipeBuilderPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/goals', element: <GoalsPage /> },
  { path: '/profile', element: <ProfilePage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
