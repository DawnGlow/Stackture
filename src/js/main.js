// src/js/main.js
import { TechStackSearch } from './components/TechStackSearch.js';
import { FloatingIcons } from './components/FloatingIcons.js';
import { DiagramDrawer } from './components/DiagramDrawer/DiagramDrawer.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 서비스 워커 등록
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            console.log('Service Worker registered successfully');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    const techStackSearch = new TechStackSearch();
    const floatingIcons = new FloatingIcons();
    
    // TechStackSearch 초기화가 완료된 후 FloatingIcons 설정
    await techStackSearch.init();
    techStackSearch.setFloatingIcons(floatingIcons);
    floatingIcons.setTechStackSearch(techStackSearch);
    
    const drawButton = document.querySelector('.draw-button');
    drawButton.addEventListener('click', () => {
        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = '';
        
        const diagramContainer = document.createElement('div');
        diagramContainer.classList.add('diagram-container');
        mainContainer.appendChild(diagramContainer);
        
        const selectedTechStacks = techStackSearch.getSelectedTechStacks();
        const diagramDrawer = new DiagramDrawer(diagramContainer, selectedTechStacks);
    });
});
