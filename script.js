

function escapeHtml(unsafe) {
  return String(unsafe).replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}




// === Obsługa UI strony (menu, sekcje, zakładki) ===
(function () {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('show');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const appearOnScroll = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

  // === KARUZELA NA KOMÓRKACH ===
  function setupCarousel(carousel) {
    const indicatorsContainer = carousel.nextElementSibling;
    if (!indicatorsContainer || !indicatorsContainer.classList.contains('carousel-indicators')) {
      return;
    }

    const slides = Array.from(carousel.children);
    slides.forEach((slide, i) => {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.dataset.slideTo = i;
      indicatorsContainer.appendChild(indicator);
    });

    const indicators = Array.from(indicatorsContainer.children);

    function updateIndicators() {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = slides[0].offsetWidth;
      const activeIndex = Math.round(scrollLeft / slideWidth);

      indicators.forEach((indicator, i) => {
        if (i === activeIndex) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }

    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const slideIndex = e.target.dataset.slideTo;
        const slide = slides[slideIndex];
        carousel.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth'
        });
      });
    });

    carousel.addEventListener('scroll', updateIndicators);
    updateIndicators();
  }

  document.querySelectorAll('.mobile-carousel').forEach(setupCarousel);

  document.querySelectorAll('.fade').forEach(f => appearOnScroll.observe(f));

  // === Obsługa wszystkich zestawów zakładek ===
  document.querySelectorAll('.tabs').forEach(tabsContainer => {
    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      const tabId = btn.dataset.tab;
      if (!tabId) return;

      // dezaktywuj wszystkie przyciski w tym zestawie
      tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

      // ukryj tylko treści należące do tej sekcji
      const parentSection = tabsContainer.closest('.section');
      parentSection.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-active'));

      // aktywuj wybraną
      btn.classList.add('active');
      const activeTab = document.getElementById(tabId);
      if (activeTab) {
        activeTab.classList.add('tab-active');

        // restart karuzeli w aktywnej zakładce
        activeTab.querySelectorAll('.carousel').forEach(carouselEl => {
          new Carousel(carouselEl, {
            slidesToShow: getSlidesToShow(),
            slidesToScroll: 1,
            infinite: true
          });
        });
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav a[href="#${id}"]`);
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          if (link) link.classList.add('active');
        }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -30% 0px" });

    sections.forEach(sec => sectionObserver.observe(sec));
  }
})();



document.addEventListener("DOMContentLoaded", () => {
  // === GOOGLE REVIEWS LOADER ===
  const reviewsContainer = document.getElementById('reviews-container');
  if (reviewsContainer) {
    fetch('get_reviews.php')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success' && data.reviews && data.reviews.length > 0) {
          const reviewsHtml = data.reviews.slice(0, 5).map(review => createReviewCard(review)).join('');
          reviewsContainer.innerHTML = `<div class="reviews-grid">${reviewsHtml}</div>`;
        } else {
          reviewsContainer.innerHTML = '<p>Nie udało się załadować opinii. Spróbuj ponownie później.</p>';
          console.error('Error loading reviews:', data.message || 'Unknown error');
        }
      })
      .catch(error => {
        reviewsContainer.innerHTML = '<p>Wystąpił błąd podczas ładowania opinii.</p>';
        console.error('Fetch error:', error);
      });
  }

  function createReviewCard(review) {
    return `
      <div class="review-card">
        <div class="review-header">
          <img src="${escapeHtml(review.profile_photo_url)}" alt="Avatar" class="review-avatar">
          <div class="review-author">
            <strong>${escapeHtml(review.author_name)}</strong>
            <span>${new Date(review.time * 1000).toLocaleDateString('pl-PL')}</span>
          </div>
        </div>
        <div class="review-rating">${renderStars(review.rating)}</div>
        <p class="review-text">${escapeHtml(review.text)}</p>
      </div>
    `;
  }

  function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<svg class="star ${i <= rating ? 'filled' : ''}" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    }
    return stars;
  }
  // Dane dla konfiguratora - głównie do obrazków i cen bazowych
  const computerSetsData = {
    1: {
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200",
      basePrice: 2500,
      components: {
        cpu: [{ name: "Intel Core i3-12100F", price: 0 }, { name: "AMD Ryzen 5 3600", price: 222 }],
        ram: [{ name: "8GB DDR4 3200MHz", price: -100 }, { name: "16GB DDR4 3200MHz", price: 0 }],
        disk: [{ name: "512GB NVMe SSD", price: 0 }, { name: "1TB SATA SSD", price: 100 }],
        psu: [{ name: "550W 80+ Bronze", price: 0 }, { name: "600W 80+", price: 50 }],
        gpu: [{ name: "NVIDIA GeForce GTX 1650", price: 0 }, { name: "AMD Radeon RX 6500 XT", price: 100 }],
        'case': [{ name: "Standard ATX", price: 0 }, { name: "SilentiumPC Signum SG1", price: 50 }],
        mobo: [{ name: "H610M (DDR4)", price: 0 }, { name: "B450M (AM4)", price: 0 }]
      }
    },
    2: {
      image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=1200",
      basePrice: 4500,
      components: {
        cpu: [{ name: "Intel Core i5-13400F", price: 0 }, { name: "AMD Ryzen 5 5600X", price: -502 }, { name: "Intel Core i5-12600K", price: 200 }],
        ram: [{ name: "16GB DDR4 3600MHz", price: 0 }, { name: "32GB DDR4 3600MHz", price: 200 }],
        disk: [{ name: "1TB NVMe SSD", price: 0 }, { name: "2TB NVMe SSD", price: 300 }],
        psu: [{ name: "650W 80+ Bronze", price: 0 }, { name: "750W 80+ Gold", price: 150 }],
        gpu: [{ name: "NVIDIA GeForce RTX 3060", price: 0 }, { name: "NVIDIA GeForce RTX 4060", price: 400 }, { name: "AMD Radeon RX 6700 XT", price: 100 }],
        'case': [{ name: "SilentiumPC Ventum VT4V", price: 0 }, { name: "be quiet! Pure Base 500DX", price: 200 }],
        mobo: [{ name: "B660M (DDR4)", price: 0 }, { name: "B550 (AM4)", price: 0 }]
      }
    },
    3: {
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200",
      basePrice: 7000,
      components: {
        cpu: [{ name: "Intel Core i7-13700K", price: 0 }, { name: "AMD Ryzen 7 5800X3D", price: -200 }, { name: "Intel Core i9-13900K", price: 800 }],
        ram: [{ name: "32GB DDR5 6000MHz", price: 0 }, { name: "64GB DDR5 5600MHz", price: 500 }],
        disk: [{ name: "2TB NVMe SSD", price: 0 }, { name: "1TB NVMe Gen4 SSD + 2TB HDD", price: 250 }],
        psu: [{ name: "850W 80+ Gold", price: 0 }, { name: "1000W 80+ Platinum", price: 400 }],
        gpu: [{ name: "NVIDIA GeForce RTX 4070", price: 0 }, { name: "NVIDIA GeForce RTX 4080", price: 2000 }, { name: "AMD Radeon RX 7900 XT", price: 500 }],
        'case': [{ name: "Fractal Design Meshify C", price: 0 }, { name: "Lian Li Lancool III", price: 300 }],
        mobo: [{ name: "Z790 (DDR5)", price: 0 }, { name: "X570 (AM4)", price: 0 }]
      }
    }
  };

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalPrice = document.getElementById("modal-price-value");
  let currentSetId = null;

  function updatePrice() {
    if (currentSetId === null) return;

    const basePrice = computerSetsData[currentSetId].basePrice;
    let totalPrice = basePrice;

    const configuratorForm = document.querySelector(".configurator-form");
    configuratorForm.querySelectorAll("select").forEach(select => {
      totalPrice += Number(select.value);
    });

    modalPrice.textContent = `~${totalPrice} zł`;
  }

  function openConfigurator(setId) {
    currentSetId = setId;
    const setData = computerSetsData[setId];
    if (!setData || !modal) return;

    if (modalImg) {
      modalImg.src = setData.image;
      modalImg.alt = `Zdjęcie zestawu komputerowego ${setId}`;
    }

    if (modalPrice) {
      modalPrice.textContent = `~${setData.basePrice} zł`;
    }

    // Wypełnij opcje konfiguratora
    if (setData.components) {
      for (const [component, options] of Object.entries(setData.components)) {
        const select = document.getElementById(`${component}-select`);
        if (select) {
          select.innerHTML = ''; // Wyczyść istniejące opcje
          options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.price;
            option.textContent = `${optionData.name} (${optionData.price >= 0 ? '+' : ''}${optionData.price} zł)`;
            select.appendChild(option);
          });
        }
      }
    }

    modal.classList.add("active");
    document.body.style.overflow = 'hidden'; // Zapobiegaj przewijaniu tła
    updatePrice();
  }

  function closeConfigurator() {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = ''; // Przywróć przewijanie tła
  }

  document.querySelectorAll(".configure-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const setId = Number(btn.dataset.setId);
      if (setId) {
        openConfigurator(setId);
      }
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeConfigurator);
  });

  // Zamykanie modala klawiszem Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeConfigurator();
    }
  });

  const configuratorForm = document.querySelector(".configurator-form");
  if (configuratorForm) {
    configuratorForm.addEventListener("change", updatePrice);
  }

  const configuratorContactBtn = document.getElementById("configurator-contact-btn");
  if (configuratorContactBtn) {
    configuratorContactBtn.addEventListener("click", () => {
      const contactForm = document.getElementById("contact-form");
      const messageField = document.getElementById("c-msg");
      let configuration = "Wybrana konfiguracja:\\n";

      configuratorForm.querySelectorAll("select").forEach(select => {
        const label = select.previousElementSibling.textContent;
        const option = select.options[select.selectedIndex];
        configuration += `- ${label}: ${option.textContent}\\n`;
      });

      configuration += `\\nSzacunkowa cena: ${modalPrice.textContent}`;
      messageField.value = configuration;

      closeConfigurator();
    });
  }

  // === OBSŁUGA FORMULARZA KONTAKTOWEGO ===
  const contactForm = document.getElementById('contact-form');
  const statusDiv = document.getElementById('contact-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Zatrzymaj domyślną wysyłkę formularza

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      // Prosta walidacja po stronie klienta
      const firstname = contactForm.querySelector('[name="firstname"]').value.trim();
      const email = contactForm.querySelector('[name="email"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();
      const terms = contactForm.querySelector('[name="terms"]').checked;

      if (!firstname || !email || !message) {
        showStatus('Proszę wypełnić wszystkie wymagane pola.', 'error');
        return;
      }

      if (!terms) {
        showStatus('Proszę zaakceptować regulamin.', 'error');
        return;
      }

      // Zablokuj przycisk i pokaż status ładowania
      submitButton.disabled = true;
      submitButton.textContent = 'Wysyłanie...';
      showStatus('Przetwarzanie...', 'loading');

      const formData = new FormData(contactForm);

      fetch('send_email.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          showStatus(data.message, 'success');
          contactForm.reset(); // Wyczyść formularz po sukcesie
        } else {
          showStatus(data.message || 'Wystąpił nieznany błąd.', 'error');
        }
      })
      .catch(error => {
        console.error('Błąd:', error);
        showStatus('Błąd połączenia z serwerem. Spróbuj ponownie.', 'error');
      })
      .finally(() => {
        // Odblokuj przycisk i przywróć tekst
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
    });
  }

  function showStatus(message, type) {
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.className = 'form-message'; // Reset klas
    statusDiv.classList.add(type); // Dodaj klasę 'success' lub 'error'
    statusDiv.style.display = 'block';

    // Opcjonalnie: ukryj komunikat po kilku sekundach
    setTimeout(() => {
      if (type !== 'loading') { // Nie ukrywaj komunikatu o ładowaniu
        statusDiv.style.display = 'none';
      }
    }, 5000);
  }
});





