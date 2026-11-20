import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Search, Map as MapIcon, Plane, ShoppingCart, FolderOpen } from 'lucide-react';
import Folder from '../Folder/Folder';
import TicketsModal from '../TicketsModal/TicketsModal';
import styles from './SidebarAnimated.module.css';

const SidebarAnimated = ({ activeView, onViewChange }) => {
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const wrapperRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || !sidebarRef.current) return;

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const sidebarHeight = sidebarRef.current.offsetHeight;
      
      const wrapperTop = wrapperRect.top;
      const wrapperBottom = wrapperRect.bottom;
      const viewportHeight = window.innerHeight;
      
      // Centro de la pantalla
      const center = viewportHeight / 2;
      
      // Límites del wrapper con margen de seguridad
      const topMargin = 20;
      const minTop = topMargin; // Límite superior del wrapper con margen
      const maxTop = wrapperRect.height - sidebarHeight - topMargin; // Límite inferior del wrapper con margen
      
      // Posición ideal del sidebar: centrado en pantalla
      const idealSidebarTop = center - sidebarHeight / 2;
      const idealSidebarBottom = center + sidebarHeight / 2;
      
      // Verificar si el sidebar centrado se saldría por arriba del wrapper
      if (wrapperTop > idealSidebarTop - topMargin) {
        // El wrapper todavía no ha subido lo suficiente, fijar al inicio con margen
        setSidebarStyle({ position: 'absolute', top: `${minTop}px`, transform: 'none' });
      } 
      // Verificar si el sidebar centrado se saldría por abajo del wrapper
      else if (wrapperBottom < idealSidebarBottom + topMargin) {
        // El wrapper ya subió demasiado, fijar al final con margen
        setSidebarStyle({ position: 'absolute', top: `${maxTop}px`, transform: 'none' });
      } 
      // El sidebar puede estar centrado sin salirse del wrapper
      else {
        setSidebarStyle({ position: 'fixed', top: '50%', transform: 'translateY(-50%)' });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Llamar inicialmente
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: Search, label: 'Búsqueda' },
    { id: 'map', icon: MapIcon, label: 'Mapa en Vivo' },
    { id: 'shop', icon: ShoppingCart, label: 'Comprar Billetes', separator: true },
  ];

  const handleTicketsClick = () => {
    setIsTicketsModalOpen(true);
  };

  // Gradiente de capas (prelayers) - estilo StaggeredMenu
  const colors = ['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)'];

  return (
    <div className={styles.sidebarAnimatedWrapper} ref={wrapperRef} data-sidebar="true">
      {/* Prelayers con gradiente */}
      <div className={styles.sidebarPrelayers} aria-hidden="true">
        {colors.map((c, i) => (
          <div key={i} className={styles.sidebarPrelayer} style={{ background: c }} />
        ))}
      </div>

      {/* Contenedor sticky que sigue el scroll pero respeta límites del wrapper */}
      <div className={styles.sidebarStickyContainer}>
        {/* Panel principal del sidebar - fixed para estar centrado en pantalla */}
        <aside className={styles.sidebarAnimated} ref={sidebarRef} style={sidebarStyle}>
          {/* Header con logo */}
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarLogoWrapper}>
              <svg className={styles.sidebarLogo} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <h2>Flight Tracker</h2>
            </div>
          </div>

          {/* Nav items */}
          <nav className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.separator && <div className={styles.navSeparator}></div>}
                <button
                  className={`${styles.sidebarNavItem} ${activeView === item.id ? styles.active : ''}`}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon size={24} />
                  <span className={styles.sidebarNavItemLabel}>{item.label}</span>
                </button>
              </div>
            ))}
            
            {/* Folder para Mis Billetes */}
            <div className={styles.sidebarFolderContainer}>
              <Folder 
                color="#667eea" 
                size={0.6} 
                items={[]} 
                className={styles.sidebarFolder}
                onClick={handleTicketsClick}
              />
              <div className={styles.folderLabel}>Mis Billetes</div>
            </div>
          </nav>
        </aside>
      </div>
      
      {/* Modal de Billetes */}
      <TicketsModal 
        isOpen={isTicketsModalOpen} 
        onClose={() => setIsTicketsModalOpen(false)}
        onViewWallet={() => {
          setIsTicketsModalOpen(false);
          onViewChange('wallet');
        }}
      />
    </div>
  );
};

export default SidebarAnimated;
