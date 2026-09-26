import AppBar from './components/AppBar'
import TabsBar from './components/TabsBar/TabsBar'
import GroceryScroll from './components/GroceryScroll/GroceryScroll'
import Banner from './components/Banner/Banner'
import Products from './components/Products/Products'

function App() {
  return (
    <>
      <AppBar />
      <TabsBar />

      <GroceryScroll targetId="products" />

      

      <section id="products">
        <Products />
        <Banner />
      </section>
    </>
  )
}

export default App