import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DailyLogPage } from './components/screens/daily-log/DailyLogPage'
import { BarcodeScannerPage } from './components/screens/barcode-scanner/BarcodeScannerPage'
import { FoodDetailPage } from './components/screens/food-detail/FoodDetailPage'
import { RecipeListPage } from './components/screens/recipe-list/RecipeListPage'
import { RecipeBuilderPage } from './components/screens/recipe-builder/RecipeBuilderPage'

const router = createBrowserRouter([
  { path: '/', element: <DailyLogPage /> },
  { path: '/scan', element: <BarcodeScannerPage /> },
  { path: '/food/:foodId', element: <FoodDetailPage /> },
  { path: '/recipes', element: <RecipeListPage /> },
  { path: '/recipes/new', element: <RecipeBuilderPage /> },
  { path: '/recipes/:recipeId/edit', element: <RecipeBuilderPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
