document.addEventListener('DOMContentLoaded', function() {
    // Animación inicial del header
    setTimeout(() => {
      document.querySelector('.header-bg').style.opacity = '1';
    }, 300);
  
    // Animaciones al hacer scroll
    const animateOnScroll = function() {
      const elements = document.querySelectorAll('.animate');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if(elementPosition < screenPosition) {
          element.classList.add('fade-in');
        }
      });
    };
  
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar al cargar para elementos visibles
  
    // Contador animado para estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const animateStats = () => {
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const count = stat.textContent;
        const increment = target / speed;
        
        const updateCount = () => {
          const current = parseInt(stat.textContent.replace(/,/g, ''));
          
          if(current < target) {
            stat.textContent = Math.ceil(current + increment).toLocaleString();
            setTimeout(updateCount, 1);
          } else {
            stat.textContent = target.toLocaleString();
          }
        };
        
        // Solo animar cuando el elemento sea visible
        const observer = new IntersectionObserver((entries) => {
          if(entries[0].isIntersecting) {
            updateCount();
            observer.unobserve(stat);
          }
        });
        
        observer.observe(stat);
      });
    };
  
    // Efecto hover para las tarjetas de beneficios
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });
      
      card.addEventListener('mouseleave', () => {
        if(card.classList.contains('fade-in')) {
          card.style.transform = 'translateY(0)';
        }
      });
    });
  
    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });
  
    // Iniciar animación de estadísticas cuando sean visibles
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  
    const statsSection = document.querySelector('.stats');
    if(statsSection) {
      statsObserver.observe(statsSection);
    }
  });