# :wave: hey.js

hey.js is a simple dependency-free modal written in JavaScript.

## Why should I use hey.js

- Accessible (TODO).
- Lightweight.
- Flexible - works with inline content, dynamic content or AJAX'd content (TODO).
- No jQuery dependency.
- Great default styles that gracefully take care of scrollbar shifting and overflow issues.

### Go on...

There are loads of great modals out there, such as [Modaal](http://www.humaan.com/modaal/).

However most don't address the little UI annoyances that plague modals, such as the 'scrollbar shift' when applying `overflow: hidden` to body.

## How to use

All below methods require manual initialization by passing in the trigger (link/button), like so:

    heyModal(document.querySelector('.modal-trigger'))
    
If you have multiple modals with the same class you'll need to loop over and initialize each:

    var myModals = document.querySelectorAll('.js-modal-trigger');

    for (var i = 0; i < myModals.length; i++) {
        heyModal(myModals[i]);
    }

### Inline
`hey.js` generates the markup it needs to create accessible modals, without you having to worry about copying and pasting markup.

As long as you use the appropriate `data` attributes, `hey.js` will dynamically create a modal with your in-page content, then remove the old version from the DOM.

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


### Confirm prompt
You may want to use `hey.js` as a confirm prompt for a link - for instance, clicking on link that performs a dangerous action:

    <a href="/delete-post">Delete</a>

You can do this by creating an inline modal and using the data-hey attribute:

    <!-- The modal trigger -->
    <a
        data-hey="#great-modal"
        href="/delete"
        class="modal-trigger button"
    >
        Delete post
    </a>
    
    <!-- The modal target -->
    <div id="great-modal" style="display: none;">
        <h3 data-hey-title>Delete post</h3>
        <div data-hey-body>
            <p>This is a modal and the contents</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis metus est, eu aliquet arcu
                interdum eu. Mauris in tortor semper, pulvinar nunc et, tincidunt lectus. Donec erat ex, ultricies sit</p>
                
            <!-- Manually include a confirm link in the body --> 
            <a href="/delete">Delete</a>
            
            <!-- Include a close button by adding the 'data-hey-close' attribute -->
            <button data-hey-close>Cancel</button>
        </div>
    </div>

However, `hey.js` also provides a simpler alternative. You can omit the modal target altogether, and have `hey.js` generate it:

    <!-- The modal trigger, no need to provide a target -->
    <a
        data-hey-confirm
        data-hey-title="Confirm"
        data-hey-body="Are you sure?"
        href="/delete"
        class="modal-trigger button"
    >
        Delete post
    </a>

Simply add the `data-hey-confirm` attribute along with `data-hey-title` and `data-hey-body`. The confirm link will automatically be the target link.

This works well when there are a lot of links on the page that would need modals, and where it is impractical to produce the markup manually. The downside is that this approach is less flexible - there is no way to include HTML in the body of the modal.

#### Modal link attributes:

If you're using an inline modal, only the `data-hey` attribute is required.

If you're generating a confirm modal, the `data-hey-title`, `data-hey-body` and `data-hey-confirm` attributes are all required.

| Attribute          | Description                                                     |
|--------------------|-----------------------------------------------------------------|
| data-hey           | The class/id of the modal target (optional).                    |
| data-hey-title     | The title of the modal (optional).                              |
| data-hey-body      | The main content of the modal (optional).                       |
| data-hey-confirm   | Generates confirm yes/no actions based on a link (optional).    |

#### Modal attributes

| Attribute       | Description                                                         |
|-----------------|---------------------------------------------------------------------|
| data-hey-title  | The title of the modal, appearing in the header.                    |
| data-hey-body   | The main content/body of the modal.                                 |
| data-hey-close  | If this element is clicked it will close the modal (optional).      |

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
