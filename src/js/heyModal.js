module.exports = (() => {
  let id = 0;

  const heyModal = {
    body: null,
    elem: null,
    target: null,
    events: {
      open: new Event('heyOpen'),
      close: new Event('heyClose'),
    },
    content: {
      title: null,
      body: null,
    },
    visibleClass: 'modal--is-visible',
    bodyOverflowClass: 'modal-body-no-scroll',
    init() {
      this.body = document.querySelector('body');
      this.setTarget();

      this.id = id;

      // Only proceed if we have a valid target
      if (this.checkTarget()) {
        this.build();
        this.removeTarget();
        this.setMaxHeight();
        this.bindEvents();
      }
    },
    on(event, action) {
      this.comp.wrapper.addEventListener(event, action);
    },
    build() {
      const c = {};

      // Wrapper
      c.wrapper = document.createElement('div');
      c.wrapper.classList.add('modal');
      c.wrapper.setAttribute('aria-hidden', 'true');

      // Dialog
      c.dialog = document.createElement('div');
      c.dialog.classList.add('modal__dialog');
      c.dialog.setAttribute('role', 'dialog');
      c.dialog.setAttribute('aria-labelledby', `modal__title-${this.id}`);

      // Header
      c.header = document.createElement('div');
      c.header.classList.add('modal__header');

      // Title
      c.title = document.createElement('h3');
      c.title.classList.add('modal__title');
      c.title.id = `modal__title-${this.id}`;

      // Body
      c.body = document.createElement('div');
      c.body.classList.add('modal__body');
      c.body.style.overflow = 'auto';

      // Close button
      c.closeBtn = document.createElement('button');
      c.closeBtn.classList.add('modal__close');
      c.closeBtn.setAttribute('type', 'button');
      c.closeBtn.setAttribute('aria-label', 'Close');

      // Build modal
      c.header.appendChild(c.title);
      c.header.appendChild(c.closeBtn);
      c.dialog.appendChild(c.header);
      c.dialog.appendChild(c.body);
      c.wrapper.appendChild(c.dialog);

      this.comp = c;

      // Update content
      this.populate();

      // Add to DOM
      this.body.appendChild(c.wrapper);
    },
    populate() {
      const self = this;

      // TODO could probably be re-written to accommodate mix of JS/non-js content, or just made simpler
      for (const el in this.content) {
        if (!this.content[el]) {
          const domElem = self.target.querySelector(`[data-hey-${el}]`);

          if (domElem) {
            self.content[el] = domElem.innerHTML;
          }
        }

        this.comp[el].innerHTML = this.content[el];
      }
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
        console.log(e);
      }

      return hasTarget;
    },
    // Remove the original target
    removeTarget() {
      this.target.remove();
    },
    setMaxHeight() {
      const wrapperStyles = getComputedStyle(this.comp.wrapper);
      const headerHeight = this.comp.header.offsetHeight;

      // We can't use 100vh since mobile device support causes issues
      const wrapperHeight = this.comp.wrapper.offsetHeight;

      const maxHeight = `calc(${wrapperHeight}px - (${wrapperStyles.paddingTop} + ${wrapperStyles.paddingTop}) - ${headerHeight}px)`;

      this.comp.body.style.maxHeight = maxHeight;
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
      this.comp.wrapper.classList.add(this.visibleClass);
      this.setPageScroll(false);
      this.body.style.marginRight = this.measureScrollbar();
      this.comp.wrapper.setAttribute('aria-hidden', 'false');
      this.setLastFocusedElem();
      this.setFocus();
      this.comp.wrapper.dispatchEvent(this.events.open);
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
      this.comp.wrapper.classList.remove(this.visibleClass);
      this.lastFocused.focus();

      const closeOver = () => {
        this.setPageScroll(true);
        this.body.style.marginRight = 0;
        this.comp.wrapper.removeEventListener('transitionend', closeOver);
        this.comp.wrapper.setAttribute('aria-hidden', 'true');
        this.comp.wrapper.dispatchEvent(this.events.close);
      };

      this.comp.wrapper.addEventListener('transitionend', closeOver);
    },
    setPageScroll(scrollable = false) {
      if (scrollable) {
        this.body.classList.remove(this.bodyOverflowClass);
      } else {
        this.body.classList.add(this.bodyOverflowClass);
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

  return (elem, options) => {
    id += 1;

    // Create a new modal object
    const newModal = Object.assign(Object.create(heyModal), {
      elem,
    }, options);

    // Run initialisation
    newModal.init();

    // Return our new modal
    return newModal;
  };
})();

