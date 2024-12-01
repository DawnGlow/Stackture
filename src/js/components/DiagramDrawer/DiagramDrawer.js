// src/js/components/DiagramDrawer/DiagramDrawer.js

import { ToolbarManager } from './ToolbarManager.js';
import { ElementManager } from './ElementManager.js';
import { HistoryManager } from './HistoryManager.js';
import { GridManager } from './GridManager.js';
import './elements/index.js';

export class DiagramDrawer {
  constructor(container, techStacks) {
    this.container = container;
    this.techStacks = techStacks;
    this.canvas = null;
    this.ctx = null;

    // 상태 관리
    this.currentTool = 'select';
    this.isShiftPressed = false;

    // 매니저 초기화
    this.elementManager = new ElementManager(this);
    this.toolbarManager = new ToolbarManager(this);
    this.historyManager = new HistoryManager(this);
    this.gridManager = new GridManager(this);

    // 지원되는 도구 목록 생성
    this.supportedTools = ['select', 'text', 'arrow'];
    Object.keys(this.elementManager.elementFactory.categories).forEach(category => {
      Object.keys(this.elementManager.elementFactory.categories[category]).forEach(type => {
        if (!this.supportedTools.includes(type)) {
          this.supportedTools.push(type);
        }
      });
    });

    this.init();
    this.setupEventListeners();

    // 초기 상태 저장
    this.historyManager.saveState();
  }

  init() {
    const canvasContainer = document.createElement('div');
    canvasContainer.classList.add('canvas-container');

    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth - 40;
    this.canvas.height = window.innerHeight - 300;
    this.canvas.classList.add('diagram-canvas');
    this.canvas.style.zIndex = '500'; // CSS와 일치하도록 설정
    this.ctx = this.canvas.getContext('2d');

    canvasContainer.appendChild(this.canvas);
    this.container.appendChild(canvasContainer);

    this.toolbarManager.init();
    this.gridManager.init();

    // 캔버스 스타일 설정
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '500'; // 높은 z-index 설정
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.elementManager.handleMouseDown.bind(this.elementManager));
    this.canvas.addEventListener('mousemove', this.elementManager.handleMouseMove.bind(this.elementManager));
    this.canvas.addEventListener('mouseup', this.elementManager.handleMouseUp.bind(this.elementManager));

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (e) => {
      // Shift 키 상태 관리
      if (e.key === 'Shift') {
        this.isShiftPressed = true;
      }

      // 단축키 처리
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.historyManager.redo();
            } else {
              this.historyManager.undo();
            }
            break;

          case 'x':
            e.preventDefault();
            this.elementManager.deleteSelectedElement();
            break;
        }
      } else {
        // 일반 키 처리
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            this.elementManager.deleteSelectedElement();
            break;

          case 'Escape':
            this.elementManager.selectedElement = null;
            this.elementManager.elementResizer.resizeHandle = null;
            this.elementManager.diagram.redraw();
            break;
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = false;
      }
    });

    // 창 크기 변경 이벤트
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth - 40;
      this.canvas.height = window.innerHeight - 300;
      this.redraw();
    });
  }

  setTool(toolId) {
    if (!this.supportedTools.includes(toolId)) {
      throw new Error(`Unsupported tool: ${toolId}`);
    }
    this.currentTool = toolId;

    // select 모드가 아닌 다른 도구로 변경할 때는 선택 해제
    if (toolId !== 'select') {
      if (this.elementManager.selectedElement) {
        this.elementManager.selectedElement.isSelected = false;
        this.elementManager.selectedElement = null;
      }
    }

    this.toolbarManager.updateToolbarState(this.toolbarManager.getToolButton(toolId));
    this.redraw();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.gridManager.showGrid) {
      this.gridManager.drawGrid();
    }
    this.elementManager.drawElements();
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}
