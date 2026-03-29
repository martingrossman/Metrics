// JavaScript Code for drag-drop, resize, layout persistence, and render logic

class Draggable {
    constructor(element) {
        this.element = element;
        this.offset = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    onMouseDown(event) {
        event.preventDefault();
        this.offset.x = event.clientX - this.element.getBoundingClientRect().left;
        this.offset.y = event.clientY - this.element.getBoundingClientRect().top;
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseMove(event) {
        const x = event.clientX - this.offset.x;
        const y = event.clientY - this.offset.y;
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }

    onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
}

class Resizable {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    onMouseDown(event) {
        event.preventDefault();
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        this.element.style.width = `${event.clientX - rect.left}px`;
        this.element.style.height = `${event.clientY - rect.top}px`;
    }

    onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
}

class LayoutPersistence {
    static saveLayout(layout) {
        try {
            localStorage.setItem('layout', JSON.stringify(layout));
        } catch (e) {
            console.error('Failed to save layout:', e);
        }
    }

    static loadLayout() {
        try {
            const layout = JSON.parse(localStorage.getItem('layout'));
            return layout || {};
        } catch (e) {
            console.error('Failed to load layout:', e);
            return {};
        }
    }
}

function render(elements, layout) {
    elements.forEach(element => {
        const id = element.id;
        if (layout[id]) {
            const { x, y, width, height } = layout[id];
            element.style.transform = `translate(${x}px, ${y}px)`;
            element.style.width = width + 'px';
            element.style.height = height + 'px';
        }
    });
}

// Initialize components
const draggableElements = document.querySelectorAll('.draggable');
const resizableElements = document.querySelectorAll('.resizable');

draggableElements.forEach(element => new Draggable(element));
resizableElements.forEach(element => new Resizable(element));

// Load saved layout
const savedLayout = LayoutPersistence.loadLayout();
render([...draggableElements, ...resizableElements], savedLayout);

// Auto-saving layout on drag or resize stop
draggableElements.forEach(element =>
    element.addEventListener('mouseup', () => {
        const layout = {};
        [...draggableElements, ...resizableElements].forEach(el => {
            const rect = el.getBoundingClientRect();
            layout[el.id] = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
            };
        });
        LayoutPersistence.saveLayout(layout);
    })
);

resizableElements.forEach(element =>
    element.addEventListener('mouseup', () => {
        const layout = {};
        [...draggableElements, ...resizableElements].forEach(el => {
            const rect = el.getBoundingClientRect();
            layout[el.id] = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
            };
        });
        LayoutPersistence.saveLayout(layout);
    })
);