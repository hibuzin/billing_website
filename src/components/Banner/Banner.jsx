import styles from "./Banner.module.css";
import bannerImage from "../../assets/banner1.png";

function Banner() {
  return (
    <section className={styles.banner}>
      <img src={bannerImage} alt="Banner" />
    </section>
  );
}

export default Banner;
