(() => {
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
    init () {
      this.body = document.querySelector('body');
      this.setTarget();
      this.build();
      this.removeTarget();
      this.bindEvents();
    },
    on (event, action) {
      this.comp.wrapper.addEventListener(event, action);
    },
    build () {
      const c = {};

      // Wrapper
      c.wrapper = document.createElement('div');
      c.wrapper.classList.add('modal');

      // Dialog
      c.dialog = document.createElement('div');
      c.dialog.classList.add('modal__dialog');

      // Header
      c.header = document.createElement('div');
      c.header.classList.add('modal__header');

      // Title
      c.title = document.createElement('h3');

      // Body
      c.body = document.createElement('div');
      c.body.classList.add('modal__body');

      // Close button
      c.closeBtn = document.createElement('button');
      c.closeBtn.classList.add('modal__close');

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
      const dataTarget = this.elem.getAttribute('data-hey');

      // If a data attribute is set with a target
      if (dataTarget) {
        this.target = document.querySelector(dataTarget);
      }
    },
    // Remove the original target
    removeTarget() {
      this.target.remove();
    },
    bindEvents() {
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

      // Close with the escape key
      window.addEventListener('keydown', e => {
        if (e.keyCode == '27') {
          this.close();
        }
      });
    },
    open() {
      this.comp.wrapper.classList.add(this.visibleClass);
      this.setPageScroll(false);
      this.comp.wrapper.dispatchEvent(this.events.open);
    },
    close() {
      this.comp.wrapper.classList.remove(this.visibleClass);

      const closeOver = () => {
        this.setPageScroll(true);
        this.comp.wrapper.removeEventListener('transitionend', closeOver);
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
  };

  window.heyModal = (elem, options) => {
    // Create a new modal object
    const newModal = Object.assign(Object.create(heyModal), {
      elem,
    }, options);

    // Run initialisation
    newModal.init();

    // Return our new modal
    return newModal;
  }
})();

const myModal = heyModal(document.querySelector('.modal-trigger'));

const lesserModal = heyModal(document.querySelector('.less-great-modal-trigger'), {
  content: {
    title: 'Lesser title override',
  },
});

// myModal.comp.wrapper.addEventListener('heyOpen', () => {
//   console.log('open!');
// });
//
// myModal.comp.wrapper.addEventListener('heyClose', () => {
//   console.log('close!');
// });

myModal.on('heyOpen', () => {
  console.log('opening!');
});

myModal.on('heyClose', () => {
  console.log('closing!');
});
