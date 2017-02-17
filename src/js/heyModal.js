// Avoid ES6 imports until this is solved:
// https://github.com/webpack/webpack/issues/3929
require('custom-event-polyfill');
require('core-js/fn/object/assign');
require('core-js/fn/object/keys');
require('classlist.js');
const merge = require('lodash/merge');

module.exports = (() => {
  let id = 0;

  const defaultOptions = {
    classes: {
      modal: ['modal'],
      modalDialog: ['modal__dialog'],
      modalHeader: ['modal__header'],
      modalBody: ['modal__body'],
      modalContent: ['modal__content'],
      modalClose: ['modal__close'],
      modalTitle: ['modal__title'],
      confirm: ['modal__confirm'],
      confirmYes: ['btn', 'btn--positive'],
      confirmCancel: ['btn', 'btn--negative'],
      visibleClass: ['modal--is-visible'],
      bodyOverflowClass: ['modal-body-no-scroll'],
    },
  };

  const heyModalProto = {
    options: defaultOptions,
    body: null,
    elem: null,
    target: null,
    confirm: false,
    events: {
      open: new CustomEvent('heyOpen'),
      close: new CustomEvent('heyClose'),
    },
    content: {
      title: null,
      body: null,
    },
    testResults: {
      transitions: null,
    },
    init() {
      this.body = document.querySelector('body');
      this.id = id;

      // Run browser tests
      this.tests();

      // Check if the classes passed in are valid
      this.checkClasses();

      // If it's a confirm we flip a switch
      if (this.elem.hasAttribute('data-hey-confirm')) {
        this.confirm = true;
      }

      // Don't check/set the target on confirms, since they don't have one
      if (!this.confirm) {
        this.setTarget();
        this.checkTarget();
      }

      this.build();
      this.removeTarget();
      this.setMaxHeight();
      this.bindEvents();
    },
    tests() {
      this.testResults.transitions = ('transition' in document.documentElement.style) || ('WebkitTransition' in document.documentElement.style);
    },
    on(event, action) {
      this.comp.wrapper.addEventListener(event, action);
    },
    checkClasses() {
      try {
        // Check if all classes are supplied as arrays
        const allArrays = Object.keys(this.options.classes)
          .every(c => this.options.classes[c] instanceof Array);

        if (!allArrays) {
          throw new Error('Classes must be set as arrays, e.g. confirm: [\'class-one\']');
        }
      } catch (e) {
        console.error(e);
      }
    },
    build() {
      const c = {};
      const classes = this.options.classes;

      // Wrapper
      c.wrapper = document.createElement('div');
      c.wrapper.classList.add('modal');
      c.wrapper.setAttribute('aria-hidden', 'true');

      // Dialog
      c.dialog = document.createElement('div');
      c.dialog.classList.add(...classes.modalDialog);
      c.dialog.setAttribute('role', 'dialog');
      c.dialog.setAttribute('aria-labelledby', `modal__title-${this.id}`);

      // Header
      c.header = document.createElement('div');
      c.header.classList.add(...classes.modalHeader);

      // Title
      c.title = document.createElement('h3');
      c.title.classList.add(...classes.modalTitle);
      c.title.id = `modal__title-${this.id}`;

      // Inner
      c.inner = document.createElement('div');
      c.inner.classList.add(...classes.modalBody);
      c.inner.style.overflow = 'auto';

      // Body
      c.body = document.createElement('div');
      c.body.classList.add(...classes.modalContent);
      c.inner.appendChild(c.body);

      // Close button
      c.closeBtn = document.createElement('button');
      c.closeBtn.classList.add(...classes.modalClose);
      c.closeBtn.setAttribute('type', 'button');
      c.closeBtn.setAttribute('aria-label', 'Close');

      // Add confirm buttons
      if (this.confirm) {
        c.confirm = document.createElement('div');
        c.confirm.classList.add(...classes.confirm);

        c.confirmYes = document.createElement('a');
        c.confirmYes.innerHTML = 'Proceed';
        c.confirmYes.setAttribute('href', this.elem.getAttribute('href'));
        c.confirmYes.classList.add(...classes.confirmYes);

        c.confirmCancel = document.createElement('button');
        c.confirmCancel.innerHTML = 'Cancel';
        c.confirmCancel.setAttribute('data-hey-close', true);
        c.confirmCancel.classList.add(...classes.confirmCancel);

        c.confirm.appendChild(c.confirmYes);
        c.confirm.appendChild(c.confirmCancel);

        c.inner.appendChild(c.confirm);
      }

      // Build modal
      c.header.appendChild(c.title);
      c.header.appendChild(c.closeBtn);
      c.dialog.appendChild(c.header);
      c.dialog.appendChild(c.inner);
      c.wrapper.appendChild(c.dialog);

      this.comp = c;

      // Update content
      this.populate();

      // Add to DOM
      this.body.appendChild(c.wrapper);
    },
    populate() {
      const self = this;
      const content = {};

      for (const el in this.content) {
        content[el] = this.content[el];

        // If the property is not already defined
        if (!this.content[el]) {
          // First check if we have a target
          if (self.target) {
            // If so, look for elements with data attributes that match inside it
            const domElem = self.target.querySelector(`[data-hey-${el}]`);

            // If found, assign them
            if (domElem) {
              content[el] = domElem.innerHTML;
            }
          // Otherwise, look for data attributes on the target
          } else if (self.elem.hasAttribute(`data-hey-${el}`)) {
            // If found, assign them
            content[el] = self.elem.getAttribute(`data-hey-${el}`);
          }
        }

        this.comp[el].innerHTML = content[el];
      }

      this.content = content;
    },
    setTarget() {
      // If a data attribute is set with a target
      if (this.elem.hasAttribute('data-hey')) {
        this.target = document.querySelector(this.elem.getAttribute('data-hey'));
      } else if (this.elem.hasAttribute('href') && this.elem.getAttribute('href').indexOf('#') >= 0) {
        // Otherwise try to use the ID in the link
        this.target = document.querySelector(this.elem.getAttribute('href'));
      }
    },
    checkTarget() {
      let hasTarget;

      try {
        // Is the target a valid node
        if (!(this.target && this.target.nodeType)) {
          hasTarget = false;
          throw new Error('No modal target given.');
        } else {
          hasTarget = true;
        }
      } catch (e) {
        console.error(e);
      }

      return hasTarget;
    },
    // Remove the original target
    removeTarget() {
      if (this.target) {
        this.target.parentElement.removeChild(this.target);
      }
    },
    setMaxHeight() {
      const wrapperStyles = getComputedStyle(this.comp.wrapper);
      const headerHeight = this.comp.header.offsetHeight;

      // We can't use 100vh since mobile device support causes issues
      const wrapperHeight = this.comp.wrapper.offsetHeight;

      const maxHeight = `calc(${wrapperHeight}px - (${wrapperStyles.paddingTop} + ${wrapperStyles.paddingTop}) - ${headerHeight}px)`;

      this.comp.inner.style.maxHeight = maxHeight;
    },
    bindEvents() {
      // Scrolling on the modal on mobile shouldn't scroll the bg
      this.comp.wrapper.addEventListener('touchmove', e => {
        e.preventDefault();
      }, false);

      // Allow mobile scrolling on the body
      this.comp.body.addEventListener('touchmove', e => {
        e.stopPropagation();
      }, false);

      window.addEventListener('resize', () => {
        this.setMaxHeight();
      });

      // Open on target click
      this.elem.addEventListener('click', e => {
        e.preventDefault();
        this.open();
      });

      // Close events on wrapper/close button
      this.comp.wrapper.addEventListener('click', this.close.bind(this));
      this.comp.closeBtn.addEventListener('click', this.close.bind(this));

      // Clicking inner modal components shouldn't close the modal
      this.comp.dialog.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      const userCloseBtn = this.comp.dialog.querySelector('[data-hey-close]');

      if (userCloseBtn) {
        // Allow a user to assign a close button inside the body with [data-hey-close]
        userCloseBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.close();
        });
      }

      // Keybindings
      this.comp.wrapper.addEventListener('keydown', e => {
        switch (e.keyCode) {
          // Escape
          case 27:
            this.close();
            break;
          // Tab
          case 9:
            // If we're tabbing backwards
            if (e.shiftKey) {
              // If (pre-event) we were focused on the first element...
              if (this.firstFocusable === document.activeElement) {
                e.preventDefault();
                // ... send us backwards to the last in the dialog
                this.lastFocusable.focus();
              }
              // If (pre-event) we were focused on the last element...
            } else if (this.lastFocusable === document.activeElement) {
              e.preventDefault();
              // ... send us to the first in the dialog
              this.firstFocusable.focus();
            }
            break;
          default:
            break;
        }
      });
    },
    open() {
      this.comp.wrapper.classList.add(this.options.classes.visibleClass);
      this.setPageScroll(false);
      this.body.style.marginRight = this.measureScrollbar();
      this.comp.wrapper.setAttribute('aria-hidden', 'false');
      this.setLastFocusedElem();
      this.comp.wrapper.dispatchEvent(this.events.open);

      // Visibility: hidden will stop us setting focus,
      // so we have to do it after the transition
      function transitionEnd() {
        this.setFocus();
        this.comp.wrapper.removeEventListener('transitionEnd', transitionEnd);
      }

      // We need to check, otherwise this will never fire in IE9
      if (this.testResults.transitions) {
        this.comp.wrapper.addEventListener('transitionend', transitionEnd.bind(this));
      }
    },
    setFocus() {
      // All elements in the dialog that can receive focus
      const elemsWithFocus = this.comp.dialog.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');

      this.firstFocusable = elemsWithFocus[0];
      this.lastFocusable = elemsWithFocus[elemsWithFocus.length - 1];

      // Focus on first element, probably the close button
      this.firstFocusable.focus();
    },
    setLastFocusedElem() {
      this.lastFocused = document.activeElement;
    },
    close() {
      this.comp.wrapper.classList.remove(this.options.classes.visibleClass);
      this.lastFocused.focus();

      const closeOver = () => {
        this.setPageScroll(true);
        this.body.style.marginRight = 0;
        this.comp.wrapper.removeEventListener('transitionend', closeOver);
        this.comp.wrapper.setAttribute('aria-hidden', 'true');
        this.comp.wrapper.dispatchEvent(this.events.close);
      };

      // We need to check, otherwise this will never fire in IE9
      if (this.testResults.transitions) {
        this.comp.wrapper.addEventListener('transitionend', closeOver);
      } else {
        closeOver();
      }
    },
    setPageScroll(scrollable = false) {
      if (scrollable) {
        this.body.classList.remove(this.options.classes.bodyOverflowClass);
      } else {
        this.body.classList.add(this.options.classes.bodyOverflowClass);
      }
    },
    measureScrollbar() {
      // Create box to measure scrollbar
      const measure = document.createElement('div');

      // Make sure it triggers overflow
      measure.style.width = 100;
      measure.style.height = 100;
      measure.style.overflow = 'scroll';
      measure.style.position = 'absolute';
      measure.style.top = -9999;

      // Add the measure element
      this.body.appendChild(measure);

      // Measure the difference between with/without the scrollbar
      const width = measure.offsetWidth - measure.clientWidth;

      // Remove from DOM
      this.body.removeChild(measure);

      // Return our best guess at the width
      return width;
    },
  };

  return (elem, customOptions) => {
    id += 1;

    // Use Lodash here, since we need to do a deep merge.
    // Allows for a single class to be passed in, without removing all the other classes.
    const options = merge({}, defaultOptions, customOptions);

    // Create a new modal object
    const newModal = Object.assign(Object.create(heyModalProto), {
      elem,
    }, { options });

    // Run initialisation
    newModal.init();

    // Return our new modal
    return newModal;
  };
})();
