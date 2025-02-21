/**
 * Main
 */

'use strict';

let isRtl = window.Helpers.isRtl(),
  isDarkStyle = window.Helpers.isDarkStyle(),
  menu,
  animate,
  isHorizontalLayout = false;

if (document.getElementById('layout-menu')) {
  isHorizontalLayout = document.getElementById('layout-menu').classList.contains('menu-horizontal');
}

(function () {
  if (typeof Waves !== 'undefined') {
    Waves.init();
    Waves.attach(".btn[class*='btn-']:not([class*='btn-outline-']):not([class*='btn-label-'])", ['waves-light']);
    Waves.attach("[class*='btn-outline-']");
    Waves.attach("[class*='btn-label-']");
    Waves.attach('.pagination .page-item .page-link');
  }

  // Initialize menu
  let layoutMenuEl = document.querySelectorAll('#layout-menu');
  layoutMenuEl.forEach(function (element) {
    menu = new Menu(element, {
      orientation: isHorizontalLayout ? 'horizontal' : 'vertical',
      closeChildren: isHorizontalLayout,
      showDropdownOnHover: localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover')
        ? localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover') === 'true'
        : window.templateCustomizer !== undefined
          ? window.templateCustomizer.settings.defaultShowDropdownOnHover
          : true
    });
    window.Helpers.scrollToActive((animate = false));
    window.Helpers.mainMenu = menu;
  });

  // Initialize menu togglers
  let menuToggler = document.querySelectorAll('.layout-menu-toggle');
  menuToggler.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      window.Helpers.toggleCollapsed();
      if (config.enableMenuLocalStorage && !window.Helpers.isSmallScreen()) {
        try {
          localStorage.setItem(
            'templateCustomizer-' + templateName + '--LayoutCollapsed',
            String(window.Helpers.isCollapsed())
          );
        } catch (e) { }
      }
    });
  });

  // Swipe gesture for menu
  const layoutMenu = document.querySelector('#layout-menu');
  if (layoutMenu) {
    window.Helpers.swipeIn('.drag-target', function () {
      window.Helpers.setCollapsed(false);
    });
    window.Helpers.swipeOut('#layout-menu', function () {
      if (window.Helpers.isSmallScreen()) window.Helpers.setCollapsed(true);
    });
  }

  // Menu scroll shadow
  let menuInnerContainer = document.getElementsByClassName('menu-inner'),
    menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
  if (menuInnerContainer.length > 0 && menuInnerShadow) {
    menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
      if (this.querySelector('.ps__thumb-y')?.offsetTop) {
        menuInnerShadow.style.display = 'block';
      } else {
        menuInnerShadow.style.display = 'none';
      }
    });
  }

  // Style Switcher (Light/Dark Mode)
  let styleSwitcherToggleEl = document.querySelector('.style-switcher-toggle');
  if (window.templateCustomizer) {
    if (styleSwitcherToggleEl) {
      styleSwitcherToggleEl.addEventListener('click', function () {
        if (window.Helpers.isLightStyle()) {
          window.templateCustomizer.setStyle('dark');
        } else {
          window.templateCustomizer.setStyle('light');
        }
      });
    }
    if (window.Helpers.isLightStyle()) {
      if (styleSwitcherToggleEl) {
        styleSwitcherToggleEl.querySelector('i').classList.add('ti-moon-stars');
        new bootstrap.Tooltip(styleSwitcherToggleEl, {
          title: 'Dark mode',
          fallbackPlacements: ['bottom']
        });
      }
      switchImage('light');
    } else {
      if (styleSwitcherToggleEl) {
        styleSwitcherToggleEl.querySelector('i').classList.add('ti-sun');
        new bootstrap.Tooltip(styleSwitcherToggleEl, {
          title: 'Light mode',
          fallbackPlacements: ['bottom']
        });
      }
      switchImage('dark');
    }
  } else if (styleSwitcherToggleEl?.parentElement) {
    styleSwitcherToggleEl.parentElement.remove();
  }

  function switchImage(style) {
    const switchImagesList = [].slice.call(document.querySelectorAll('[data-app-' + style + '-img]'));
    switchImagesList.map(function (imageEl) {
      const setImage = imageEl.getAttribute('data-app-' + style + '-img');
      imageEl.src = assetsPath + 'img/' + setImage;
    });
  }

  // Language Dropdown
  let languageDropdown = document.getElementsByClassName('dropdown-language');
  if (languageDropdown.length) {
    let dropdownItems = languageDropdown[0].querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        let currentLanguage = this.getAttribute('data-language'),
          selectedLangFlag = this.querySelector('.fi').getAttribute('class');

        [...this.parentNode.children].forEach(sibling => sibling.classList.remove('selected'));
        this.classList.add('selected');

        languageDropdown[0].querySelector('.dropdown-toggle .fi').className = selectedLangFlag;

        i18next.changeLanguage(currentLanguage, (err) => {
          if (err) console.error('Error loading language', err);
          localize();
        });
      });
    });
  }

  function localize() {
    let i18nList = document.querySelectorAll('[data-i18n]');
    i18nList.forEach(function (item) {
      item.innerHTML = i18next.t(item.dataset.i18n);
    });
  }

  // Notifications
  const notificationMarkAsReadAll = document.querySelector('.dropdown-notifications-all');
  const notificationMarkAsReadList = document.querySelectorAll('.dropdown-notifications-read');
  if (notificationMarkAsReadAll) {
    notificationMarkAsReadAll.addEventListener('click', () => {
      notificationMarkAsReadList.forEach(item => {
        item.closest('.dropdown-notifications-item')?.classList.add('marked-as-read');
      });
    });
  }

  notificationMarkAsReadList.forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.dropdown-notifications-item')?.classList.toggle('marked-as-read');
    });
  });

  const notificationArchiveMessageList = document.querySelectorAll('.dropdown-notifications-archive');
  notificationArchiveMessageList.forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.dropdown-notifications-item')?.remove();
    });
  });

  // Init helpers
  window.Helpers.setAutoUpdate(true);
  window.Helpers.initPasswordToggle();
  window.Helpers.initSpeechToText();
  window.Helpers.initNavbarDropdownScrollbar();

  // Responsive layout adjustments
  window.addEventListener('resize', function () {
    if (window.innerWidth >= window.Helpers.LAYOUT_BREAKPOINT) {
      const searchInputWrapper = document.querySelector('.search-input-wrapper');
      if (searchInputWrapper) {
        searchInputWrapper.classList.add('d-none');
        document.querySelector('.search-input').value = '';
      }
    }
  });
})();
