'use strict';

const modalWindow = document.querySelector('.modal-window');
const overlay = document.querySelector('.overlay');
const btnCloseModalWindow = document.querySelector('.btn--close-modal-window');
const btnsOpenModalWindow = document.querySelectorAll(
  '.btn--show-modal-window'
);
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const tabs = document.querySelectorAll('.operations__tab');
const tabContainer = document.querySelector('.operations__tab-container');
const tabContents = document.querySelectorAll('.operations__content');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section');
const lazyImages = document.querySelectorAll('img[data-src]');
const slides = document.querySelectorAll('.slide');
const slider = document.querySelector('.slider');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');

// Модальное окно для открытия счета
const openModalWindow = function (e) {
  e.preventDefault();
  modalWindow.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModalWindow = function () {
  modalWindow.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModalWindow.forEach(button => {
  button.addEventListener('click', openModalWindow);
});

btnCloseModalWindow.addEventListener('click', closeModalWindow);
overlay.addEventListener('click', closeModalWindow);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalWindow.classList.contains('hidden')) {
    closeModalWindow();
  }
});

// Плавный прокрут (старый способ, работает во всех браузерах)

// btnScrollTo.addEventListener('click', function (e) {
//   const section1Coords = section1.getBoundingClientRect(); // Метод, который позволяет получить местоположение секции в координтах
//   window.scrollTo({
//     left: section1Coords.left + window.pageXOffset,
//     top: section1Coords.top + window.pageYOffset,
//     behavior: 'smooth', // плавность добавит
//   });
// });

// Плавный прокрут (новый способ, работает только в современных браузерах)
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Добавление плавности прокрута ко всему меню навигации (используем Event Delegation)
// 1. Добавили слушатель событий для ОБЩЕГО родителя
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  // 2. Определить таргет элемент
  if (e.target.classList.contains('nav__link')) {
    const href = e.target.getAttribute('href');
    document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
  }
});

// Реализация вкладок
tabContainer.addEventListener('click', function (e) {
  e.preventDefault();
  const clickedButton = e.target.closest('.operations__tab');

  // Guard clause - Пункт охраны (проверка на null, если клтикнем в другое место)
  if (!clickedButton) return;

  // Устанавливаем активную вкладку
  tabs.forEach(tab => tab.classList.remove('operations__tab--active'));
  clickedButton.classList.add('operations__tab--active');

  // Активный контент
  tabContents.forEach(content =>
    content.classList.remove('operations__content--active')
  );
  document
    .querySelector(`.operations__content--${clickedButton.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Делаем серыми другие вкладки навигации при наведении на какую-либо из них
const navLinksHoverAnimation = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const linkOver = e.target;
    const siblingLinks = linkOver
      .closest('.nav__links')
      .querySelectorAll('.nav__link');
    const logo = linkOver.closest('.nav').querySelector('img');
    const logoText = linkOver.closest('.nav').querySelector('.nav__text');

    siblingLinks.forEach(el => {
      if (el != linkOver) el.style.opacity = this;
    });
    logo.style.opacity = this;
    logoText.style.opacity = this;
  }
};

// Мы не можем в callback функции указывать аргументы для внешней функции, поэтому мы создаем новую callback функцию, и уже в ней передаем нужные нам аргументы
// Но в нашем случае мы можем передать аргумент в качестве ключевого слова this для opacity, с помощью bind

// Эффект при наведении
nav.addEventListener('mouseover', navLinksHoverAnimation.bind(0.4));

// Убираем эффект, когда курсор убрали с пункта навигации
nav.addEventListener('mouseout', navLinksHoverAnimation.bind(1));

// Sticky Navigation
// Через событие прокручивания (старый способ - тормозит работу приложения, потому что постоянно происходит scroll событие)
// const section1Coords = section1.getBoundingClientRect();

// window.addEventListener('scroll', function (e) {
//   if (window.scrollY > section1Coords.top) {
//     nav.classList.add('sticky');
//   } else {
//     nav.classList.remove('sticky');
//   }
// });

// Новый способ (Intersection Observer API - более оптимальный)
const navHeight = nav.getBoundingClientRect().height;
const getSctickyNav = function (entries) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      // Вызываем, когда нет пересечения с viewport, поэтому проверяем на false
      nav.classList.add('sticky');
    } else {
      nav.classList.remove('sticky');
    }
  });
};
const observerOptions = {
  root: null, // Элемент, который будет пересекаться с нашим таргетом (если null, то будет смотреться пересечение viewport'ом нашей секции)
  threshold: 0, // Порог, когда будет вызвана у нас функция (вызываем, когда видно 0 процентов header'а)
  rootMargin: `-${navHeight}px`, // Отступ в пикселях (или в процентах) до таргет элемента
};
const headerObserver = new IntersectionObserver(getSctickyNav, observerOptions);
headerObserver.observe(header);

// Показ элементов при прокручивании
const appearanceSection = function (entries, observer) {
  const entry = entries[0];
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target); // Перестаем следить за пересечением для улучшения производительности
};

const sectionObserver = new IntersectionObserver(appearanceSection, {
  root: null,
  threshold: 0.2,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

// Lazy loading
const loadImages = function (entries, observer) {
  const entry = entries[0];
  if (!entry.isIntersecting) return;
  // Change to high quality img
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', () =>
    entry.target.classList.remove('lazy-img')
  ); // Для медленного интернета, блюр убирается только после загрузки
  observer.unobserve(entry.target);
};
const lazyImagesObserver = new IntersectionObserver(loadImages, {
  root: null,
  threshold: 0.5,
  // rootMargin: '300px', // Можно сделать так и тогда изображения будут сразу четкими
});

lazyImages.forEach(image => lazyImagesObserver.observe(image));

// Создание слайдера
let currentSlide = 0;
const slidesNumber = slides.length;

const createDots = function () {
  slides.forEach(function (_, index) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${index}"></button>`
    );
  });
};
createDots();

const activateCurrentDot = function (slide) {
  document
    .querySelectorAll('.dots__dot')
    .forEach(dot => dot.classList.remove('dots__dot--active'));
  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add('dots__dot--active');
};

const moveToSlide = function (slide) {
  slides.forEach((s, index) => {
    s.style.transform = `translateX(${(index - slide) * 100}%)`;
  });
};

const nextSlide = function () {
  if (currentSlide === slidesNumber - 1) {
    currentSlide = 0;
  } else {
    currentSlide++;
  }
  moveToSlide(currentSlide);
  activateCurrentDot(currentSlide);
};

const previousSlide = function () {
  if (currentSlide === 0) {
    currentSlide = slidesNumber - 1;
  } else {
    currentSlide--;
  }
  moveToSlide(currentSlide);
  activateCurrentDot(currentSlide);
};

moveToSlide(0);
activateCurrentDot(0);

btnRight.addEventListener('click', nextSlide);

btnLeft.addEventListener('click', previousSlide);

document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') previousSlide();
});

dotContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const slide = e.target.dataset.slide;
    moveToSlide(slide);
    activateCurrentDot(slide);
  }
});
