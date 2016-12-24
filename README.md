# hey.js

hey.js is a simple dependency-free modal written in JavaScript.

## Why should I use hey.js
- Accessible (TODO).
- Lightweight.
- Flexible - works with inline content, dynamic content or AJAX'd content (TODO).
- No jQuery dependency.
- Great default styles that gracefully take care of scrollbar shifting and overflow issues.

## How to use

### Inline
`hey.js` generates the markup it needs to create accessible modals, without you having to worry about copying and pasting markup.

As long as you use the appropriate `data` attributes, `hey.js` will dynamically create a modal with your in-page content, then remove the old version from the DOM.

#### Modal link attributes:

| Attribute       | Description                                          |
|-----------------|------------------------------------------------------|
| data-hey        | The class/id of the modal target.                    |

#### Modal attributes

| Attribute       | Description                                          |
|-----------------|------------------------------------------------------|
| data-hey-title  | The title of the modal, appearing in the header.     |
| data-hey-body   | The main content/body of the modal.                  |
| data-hey-footer | Any content you'd like in the 'footer' of the modal. |

#### Example

You can include an 'inline' modal on the page like so:

    <!-- This is the 'link' that will open the modal -->
    <a class="great-modal-trigger" data-hey=".great-modal">Modal link</a>
    
    <!-- This is the modal itself -->
    <div class="great-modal" style="display: none;">
        <h3 data-hey-title>Modal title</h3>
        <div data-hey-body>This is a modal and the contents</div>
        <div data-hey-footer></div>
    </div>
    
Then initialise it like so:

    const myModal = heyModal(document.querySelector('.great-modal-trigger'));

## Methods
Your `hey.js` modal has several methods once initialised (like so):

    const myModal = heyModal(document.querySelector('.great-modal-trigger'));

### Open
Opens the modal manually:
    
    myModal.open();

### Close
Closes the modal manually:
    
    myModal.close();
    
### Destroy
Removes the modal and cleans up (TODO):
    
    myModal.destroy();
    
## Events
`hey.js` fires two custom events (`heyOpen` and `heyClose`) on the main modal element. 

You can either add an event listener to the generated wrapper, e.g.:

    myModal.comp.wrapper.addEventListener('heyOpen', () => {
        console.log('open!');
    });

Or you can use the included `.on` helper method, which defaults to the `wrapper`:

    myModal.on('heyOpen', () => {
        console.log('opening!');
    });
