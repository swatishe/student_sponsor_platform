// src/components/common/Spinner.jsx
// Reusable loading spinner component.
//@author sshende
import styles from './Spinner.module.css'

export default function Spinner({ text = 'Loading…', size = 'md' }) {
  return (
    <div className={`${styles.wrap} ${styles[size]}`} role="status" aria-label={text}>
      <div className={styles.ring} />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}
