export class TechStackSearch {
    constructor() {
        this.techStacks = [];
        this.selectedTechs = new Set();
        this.searchInput = document.querySelector('.search-box');
        this.searchResults = document.querySelector('.search-results');
        this.selectedGrid = document.querySelector('.selected-grid');
        
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/api/tech-stacks');
            this.techStacks = await response.json();
        } catch (error) {
            console.warn('API 연결 실패, 목업 데이터를 사용합니다:', error);
            const { mockTechStacks } = await import('../../data/mockData.js');
            this.techStacks = mockTechStacks;
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 검색어 입력할 때마다 실시간으로 결과 표시
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            this.showSearchResults(searchTerm);
        });

        // 검색창 포커스 시 마지막 검색 결과 다시 표시
        this.searchInput.addEventListener('focus', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm) {
                this.showSearchResults(searchTerm);
            }
        });

        // 검색창 외부 클릭 시 결과 숨김
        document.addEventListener('click', (e) => {
            if (!this.searchResults.contains(e.target) && 
                !this.searchInput.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    showSearchResults(searchTerm) {
        if (!searchTerm) {
            this.hideSearchResults();
            return;
        }

        const filteredTechs = this.techStacks.filter(tech => 
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredTechs.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
        } else {
            this.searchResults.innerHTML = filteredTechs.map(tech => `
                <div class="tech-item" data-id="${tech.id}">
                    <img src="${tech.icon}" alt="${tech.name}" class="tech-icon">
                    <span>${tech.name}</span>
                </div>
            `).join('');
            
            // 검색 결과 클릭 이벤트
            this.searchResults.querySelectorAll('.tech-item').forEach(item => {
                item.addEventListener('click', () => {
                    const techId = Number(item.dataset.id);
                    this.addTechStack(techId);
                    this.hideSearchResults();
                    this.searchInput.value = '';
                });
            });
        }

        this.searchResults.classList.add('active');
    }

    hideSearchResults() {
        this.searchResults.classList.remove('active');
    }

    addTechStack(techId) {
        const tech = this.techStacks.find(t => t.id === techId);
        if (!tech || this.selectedTechs.has(techId)) return;

        this.selectedTechs.add(techId);
        this.updateSelectedGrid();
    }

    updateSelectedGrid() {
        const selectedTechStacks = this.techStacks.filter(tech => 
            this.selectedTechs.has(tech.id)
        );

        // 모든 카테고리 목록 가져오기
        const allCategories = [...new Set(this.techStacks.map(tech => tech.category))];

        // 카테고리 한글 매핑
        const categoryNames = {
            frontend: '프론트엔드',
            backend: '백엔드',
            database: '데이터베이스',
            devops: '데브옵스',
            language: '프로그래밍 언어',
            cloud: '클라우드'
        };

        // 각 카테고리별 영역 생성
        this.selectedGrid.innerHTML = allCategories.map(category => {
            const techsInCategory = selectedTechStacks.filter(tech => tech.category === category);
            
            if (techsInCategory.length === 0) return ''; // 해당 카테고리에 선택된 기술이 없으면 건너뜀

            return `
                <div class="category-section">
                    <h4 class="category-title">${categoryNames[category] || category}</h4>
                    <div class="category-items">
                        ${techsInCategory.map(tech => `
                            <div class="tech-item selected" data-id="${tech.id}">
                                <img src="${tech.icon}" alt="${tech.name}" class="tech-icon">
                                <span>${tech.name}</span>
                                <button class="remove-btn" data-tech-id="${tech.id}">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // 제거 버튼에 이벤트 리스너 추가
        this.selectedGrid.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = Number(e.target.dataset.techId);
                this.removeTechStack(techId);
            });
        });
    }

    removeTechStack(techId) {
        this.selectedTechs.delete(techId);
        this.updateSelectedGrid();
    }
}