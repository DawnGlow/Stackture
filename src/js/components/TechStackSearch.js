import { DOMUtils } from '../utils/DOMUtils.js';
import { TechStackService } from '../services/TechStackService.js';

export class TechStackSearch {
    constructor() {
        this.techStacks = [];
        this.selectedTechs = new Set();
        this.techStackService = new TechStackService();
        
        this.searchInput = document.querySelector('.search-box');
        this.techStackGrid = document.querySelector('.tech-stack-grid');
        this.selectedGrid = document.querySelector('.selected-grid');
        
        this.init();
    }

    async init() {
        try {
            this.techStacks = await this.techStackService.getTechStacks();
            this.setupEventListeners();
            this.renderTechStacks(this.techStacks);
        } catch (error) {
            console.error('초기화 중 오류가 발생했습니다:', error);
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', 
            DOMUtils.debounce(this.handleSearch.bind(this), 300)
        );
    }

    handleSearch(event) {
        const searchTerm = event.target.value;
        const filteredTechs = this.techStackService.filterTechStacks(this.techStacks, searchTerm);
        this.renderTechStacks(filteredTechs);
    }

    renderTechStacks(techStacks) {
        this.techStackGrid.innerHTML = techStacks.length ? 
            techStacks.map(tech => DOMUtils.createTechStackItem(tech, this.selectedTechs.has(tech.id))).join('') :
            '<div class="no-results">검색 결과가 없습니다.</div>';

        this.addTechStackListeners();
    }

    addTechStackListeners() {
        this.techStackGrid.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleTechSelection(e, item.dataset.id));
        });
    }

    handleTechSelection(event, techId) {
        const tech = this.techStacks.find(t => t.id === Number(techId));
        if (!tech) return;

        if (this.selectedTechs.has(tech.id)) {
            this.selectedTechs.delete(tech.id);
        } else {
            this.selectedTechs.add(tech.id);
        }

        event.currentTarget.classList.toggle('selected');
        this.updateSelectedGrid();
    }

    updateSelectedGrid() {
        const selectedTechStacks = this.techStacks.filter(tech => 
            this.selectedTechs.has(tech.id)
        );
        this.selectedGrid.innerHTML = selectedTechStacks.map(tech => 
            DOMUtils.createTechStackItem(tech, true)
        ).join('');
    }
}