import AppBar from './components/AppBar'
import TabsBar from './components/TabsBar/TabsBar'
import GroceryScroll from './components/GroceryScroll/GroceryScroll'
import Banner from './components/Banner/Banner'
import Products from './components/Products/Products'

function App() {
  return (
    <>
      <AppBar />

      <GroceryScroll
        targetId="products"
        tabs={<TabsBar />}
      />

      <Banner />


      <section id="products">
        <Products />
      </section>
    </>
  )
}

export default App