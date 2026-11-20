import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import FlightCard from '../FlightCard/FlightCard';
import FlightDetails from '../FlightDetails/FlightDetails';
import { useScrollLock } from '../../hooks';
import styles from './FlipCard.module.css';

const FlipCard = ({ flight, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);
  const timeoutRef = useRef(null);

  // Bloquear scroll cuando la tarjeta está abierta
  useScrollLock(isOpen);

  // Cleanup de timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCardClick = useCallback(() => {
    setIsOpen(true);
    setIsAnimating(true);
    
    // Activar flip después de montar
    timeoutRef.current = setTimeout(() => {
      setIsFlipped(true);
      setIsAnimating(false);
    }, 50);
  }, []);

  const handleClose = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(false);
    
    // Cerrar después del flip
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating]);

  if (!flight) return null;

  return (
    <>
      {/* Overlay - Solo renderizar cuando está abierto */}
      {isOpen && (
        <div 
          className={`${styles.modalOverlay} ${styles.overlayVisible}`}
          onClick={handleClose}
        />
      )}

      {/* Modal expandido - Solo renderizar cuando está abierto */}
      {isOpen && (
        <div 
          className={`${styles.flipCardContainer} ${styles.expanded} ${styles.modalVisible}`}
        >
          <div className={`${styles.flipCardInner} ${isFlipped ? styles.flipped : ''}`}>
            <div className={styles.flipCardFront}>
              <FlightCard flight={flight} onSelect={handleCardClick} />
            </div>
            <div className={styles.flipCardBack}>
              <FlightDetails flight={flight} onClose={handleClose} isFlipped={isFlipped} />
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta en el grid */}
      <motion.div
        ref={cardRef}
        className={styles.flipCardContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        style={{ 
          visibility: isOpen ? 'hidden' : 'visible',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
      >
        <div className={styles.flipCardInner}>
          <div className={styles.flipCardFront}>
            <FlightCard flight={flight} onSelect={handleCardClick} />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FlipCard;
