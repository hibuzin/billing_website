import styles from "./TabsBar.module.css";

function TabsBar() {
  return (
    <nav className={styles.tabsBar}>
      <button className={styles.active}>Dashboard</button>
      <button>Products</button>
      <button>Sales</button>
      <button>Purchases</button>
      <button>Reports</button>
    </nav>
  );
}

export default TabsBar;