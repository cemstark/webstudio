import styles from "./experience.module.css";

export function RobotFallback() {
  return (
    <div className={styles.robotFallback} data-robot-fallback>
      <span className={styles.fallbackHalo} />
      <span className={styles.fallbackGrid} />
      <div className={styles.fallbackFigure}>
        <span className={styles.fallbackHead}><i /><i /></span>
        <span className={styles.fallbackNeck} />
        <span className={styles.fallbackTorso}><i /></span>
        <span className={`${styles.fallbackArm} ${styles.fallbackArmLeft}`} />
        <span className={`${styles.fallbackArm} ${styles.fallbackArmRight}`} />
      </div>
      <span className={styles.fallbackSignal}>C/W · 04</span>
    </div>
  );
}
