export class DOMUtils {
    static createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    static createTechStackItem(tech, isSelected = false) {
        return `
            <div class="tech-item ${isSelected ? 'selected' : ''}" data-id="${tech.id}">
                <img src="${tech.icon}" alt="${tech.name}" class="tech-icon">
                <div>${tech.name}</div>
            </div>
        `;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}