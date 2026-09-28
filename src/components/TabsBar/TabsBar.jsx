import styles from "./AppBar.module.css";

function AppBar() {
  return (
    <header className={styles.appBar}>
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          <h2>Tesco Super Market</h2>
          <h2 aria-hidden="true">Tesco Super Market</h2>
          <h2 aria-hidden="true">Tesco Super Market</h2>
          <h2 aria-hidden="true">Tesco Super Market</h2>
        </div>
      </div>
    </header>
  );
}

export default AppBar;