// src/js/components/DiagramDrawer/ZoomManager.js
export class ZoomManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.scale = 1;
      this.minScale = 0.1;
      this.maxScale = 5;
      this.translateX = 0;
      this.translateY = 0;
      this.isDragging = false;
      this.lastX = 0;
      this.lastY = 0;
      this.padding = 1000; // 캔버스 확장을 위한 여백
  
      this.init();
      this.setupEventListeners();
    }
  
    init() {
      this.updateCanvasSize();
      this.applyTransform();
    }
  
    updateCanvasSize() {
      const minWidth = window.innerWidth + 2 * this.padding;
      const minHeight = window.innerHeight + 2 * this.padding;
      
      this.diagram.canvas.width = Math.max(minWidth, this.diagram.canvas.width);
      this.diagram.canvas.height = Math.max(minHeight, this.diagram.canvas.height);
    }
  
    setupEventListeners() {
      // 마우스 휠 줌 및 팬
      this.diagram.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          const zoomSpeed = 0.05;
          const delta = e.deltaY < 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);
          
          // 마우스 포인터 위치를 중심점으로 사용
          const rect = this.diagram.canvas.getBoundingClientRect();
          const centerX = e.clientX - rect.left;
          const centerY = e.clientY - rect.top;
          
          this.zoom(delta, centerX, centerY);
        } else {
          // 팬 처리
          const panSensitivity = 1; // 팬 민감도 조절 가능
          this.translateX -= e.deltaX * panSensitivity;
          this.translateY -= e.deltaY * panSensitivity;
          
          this.limitTranslation();
          this.applyTransform();
        }
      });
  
      // 기존의 팬 이벤트 처리 유지
      this.diagram.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.getModifierState('Space')) {
          e.preventDefault();
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.diagram.canvas.style.cursor = 'grabbing';
        }
      });
  
      this.diagram.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.diagram.canvas.style.cursor = 'grabbing';
      });
  
      this.diagram.canvas.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          const dx = e.clientX - this.lastX;
          const dy = e.clientY - this.lastY;
          
          this.translateX += dx;
          this.translateY += dy;
          
          this.lastX = e.clientX;
          this.lastY = e.clientY;
  
          this.limitTranslation();
          this.applyTransform();
        }
      });
  
      document.addEventListener('mouseup', (e) => {
        if (this.isDragging) {
          this.isDragging = false;
          if (e.getModifierState('Space')) {
            this.diagram.canvas.style.cursor = 'grab';
          } else {
            this.diagram.canvas.style.cursor = 'default';
          }
        }
      });
  
      // 키보드 이벤트
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !this.isDragging) {
          this.diagram.canvas.style.cursor = 'grab';
        }
      });
  
      document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          this.diagram.canvas.style.cursor = 'default';
        }
      });
  
      // 두 손가락 터치 이벤트 처리
      let lastTouchDistance = 0;
      let lastTouchCenter = { x: 0, y: 0 };

      this.diagram.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          this.isDragging = true;
          
          // 두 손가락 사이의 중심점 계산
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          lastTouchCenter = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
          };
          
          // 두 손가락 사이의 거리 계산
          lastTouchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
        }
      });

      this.diagram.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && this.isDragging) {
          e.preventDefault();
          
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          
          // 현재 두 손가락의 중심점 계산
          const currentCenter = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
          };
          
          // 이동 거리 계산
          const dx = currentCenter.x - lastTouchCenter.x;
          const dy = currentCenter.y - lastTouchCenter.y;
          
          // 캔버스 이동
          this.translateX += dx;
          this.translateY += dy;
          
          // 중심점 업데이트
          lastTouchCenter = currentCenter;
          
          // 현재 두 손가락 사이의 거리 계산
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          
          // 핀치 줌 처리
          if (Math.abs(currentDistance - lastTouchDistance) > 10) {
            const scale = currentDistance / lastTouchDistance;
            this.zoom(scale, currentCenter.x, currentCenter.y);
            lastTouchDistance = currentDistance;
          }
          
          this.limitTranslation();
          this.applyTransform();
        }
      });

      this.diagram.canvas.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
          this.isDragging = false;
        }
      });

      this.diagram.canvas.addEventListener('touchcancel', (e) => {
        this.isDragging = false;
      });
    }
  
    zoom(delta, centerX, centerY) {
      const newScale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);
      
      if (newScale !== this.scale) {
        // 현재 마우스 위치의 캔버스 상의 실제 좌표 계산
        const mouseX = (centerX - this.translateX) / this.scale;
        const mouseY = (centerY - this.translateY) / this.scale;
        
        // 새로운 scale 적용
        this.scale = newScale;
        
        // 마우스 위치를 기준으로 새로운 translate 값 계산
        this.translateX = centerX - mouseX * this.scale;
        this.translateY = centerY - mouseY * this.scale;
        
        this.limitTranslation();
        this.applyTransform();
      }
    }
  
    limitTranslation() {
      const viewportWidth = this.diagram.canvas.width;
      const viewportHeight = this.diagram.canvas.height;
      
      // 캔버스 이동 제한
      const maxTranslateX = viewportWidth * 0.5;
      const maxTranslateY = viewportHeight * 0.5;
      
      this.translateX = Math.max(Math.min(this.translateX, maxTranslateX), -maxTranslateX);
      this.translateY = Math.max(Math.min(this.translateY, maxTranslateY), -maxTranslateY);
    }
  
    applyTransform() {
      this.diagram.ctx.setTransform(
        this.scale, 0,
        0, this.scale,
        this.translateX,
        this.translateY
      );
      this.diagram.redraw();
    }
  
    // 실제 캔버스 좌표를 변환된 좌표로 변환
    transformPoint(x, y) {
      return {
        x: (x - this.translateX) / this.scale,
        y: (y - this.translateY) / this.scale
      };
    }
}