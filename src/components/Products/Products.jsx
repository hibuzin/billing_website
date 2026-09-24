import styles from "./Products.module.css";
import bannerImage from "../../assets/banner1.png";

function Products() {
  return (
    <section className={styles.products}>
      <h2>Our Products</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
         <img src={bannerImage} alt="Product" />
          <h3>products</h3>
          <p>₹199</p>
        </div>

        <div className={styles.card}>
          <img src="/product/softdrink.png" alt="Product" />
          <h3>Rice</h3>
          <p>₹249</p>
        </div>

         <div className={styles.card}>
          <img src="/product/milk.png" alt="Product" />
          <h3>Product Name</h3>
          <p>₹199</p>
        </div>

        <div className={styles.card}>
          <img src="/product/brownrice.png" alt="Product" />
          <h3>Product Name</h3>
          <p>₹249</p>
        </div>

         <div className={styles.card}>
          <img src="/product/whiterice.png" alt="Product" />
          <h3>Product Name</h3>
          <p>₹199</p>
        </div>

        <div className={styles.card}>
          <img src="/product/sunflowerseeds.png" alt="Product" />
          <h3>Product Name</h3>
          <p>₹249</p>
        </div>

        {/* 25 cards */}
      </div>
    </section>
  );
}

export default Products;