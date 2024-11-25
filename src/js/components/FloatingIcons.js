import { mockTechStacks } from '../../data/mockData.js';

export class FloatingIcons {
    constructor() {
        this.container = document.querySelector('.floating-icons-container');
        this.init();
    }

    init() {
        const selectedIcons = this.shuffleArray(mockTechStacks).slice(0, 8);
        
        selectedIcons.forEach(tech => {
            const icon = this.createIcon(tech);
            this.setRandomPosition(icon);
            this.container.appendChild(icon);
            this.makeDraggable(icon);
        });
    }

    createIcon(tech) {
        const icon = document.createElement('img');
        icon.src = tech.icon;
        icon.className = 'floating-icon';
        icon.alt = tech.name;
        icon.draggable = false;
        return icon;
    }

    setRandomPosition(icon) {
        const mainTitle = document.querySelector('.main-title');
        const searchContainer = document.querySelector('.search-container');
        const selectedTechs = document.querySelector('.selected-techs');
        
        // 제외할 영역의 위치와 크기 계산
        const titleRect = mainTitle.getBoundingClientRect();
        const searchRect = searchContainer.getBoundingClientRect();
        const selectedRect = selectedTechs.getBoundingClientRect();
        
        // 안전 여백 증가
        const padding = 100;
        
        let x, y;
        let isValidPosition = false;
        
        while (!isValidPosition) {
            x = Math.random() * (window.innerWidth - 100);
            y = Math.random() * (window.innerHeight - 100);
            
            // 제외 영역과 겹치지 않는지 확인
            isValidPosition = !(
                (x >= titleRect.left - padding && x <= titleRect.right + padding &&
                 y >= titleRect.top - padding && y <= titleRect.bottom + padding) ||
                (x >= searchRect.left - padding && x <= searchRect.right + padding &&
                 y >= searchRect.top - padding && y <= searchRect.bottom + padding) ||
                (x >= selectedRect.left - padding && x <= selectedRect.right + padding &&
                 y >= selectedRect.top - padding && y <= selectedRect.bottom + padding)
            );
        }
        
        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
    }

    shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    makeDraggable(icon) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let velocityX = 0;
        let velocityY = 0;
        let lastX;
        let lastY;
        let lastTime;

        icon.addEventListener('mousedown', (e) => {
            isDragging = true;
            icon.classList.add('dragging');
            
            const rect = icon.getBoundingClientRect();
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;
            
            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = Date.now();
        });

        const moveHandler = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            
            const currentTime = Date.now();
            const timeElapsed = currentTime - lastTime;
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            if (timeElapsed > 0) {
                velocityX = (e.clientX - lastX) / timeElapsed * 10;
                velocityY = (e.clientY - lastY) / timeElapsed * 10;
            }

            icon.style.left = `${currentX}px`;
            icon.style.top = `${currentY}px`;

            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = currentTime;
        };

        const throwIcon = () => {
            currentX += velocityX * 0.5;
            currentY += velocityY * 0.5;

            velocityX *= 0.95;
            velocityY *= 0.95;

            currentX = Math.max(-100, Math.min(currentX, window.innerWidth + 100));
            currentY = Math.max(-100, Math.min(currentY, window.innerHeight + 100));

            icon.style.left = `${currentX}px`;
            icon.style.top = `${currentY}px`;

            if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                requestAnimationFrame(throwIcon);
            }
        };

        const upHandler = () => {
            if (isDragging) {
                isDragging = false;
                icon.classList.remove('dragging');

                const minVelocity = 3;
                const currentVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                
                if (currentVelocity < minVelocity) {
                    const angle = Math.atan2(velocityY, velocityX);
                    velocityX = Math.cos(angle) * minVelocity;
                    velocityY = Math.sin(angle) * minVelocity;
                }

                throwIcon();
            }
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
    }
}
