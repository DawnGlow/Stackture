import { mockTechStacks } from '../../data/mockData.js';

export class TechStackService {
    async getTechStacks() {
        try {
            const response = await fetch('/api/tech-stacks');
            return await response.json();
        } catch (error) {
            console.warn('API 연결 실패, 목업 데이터를 사용합니다:', error);
            return mockTechStacks;
        }
    }

    filterTechStacks(techStacks, searchTerm) {
        return techStacks.filter(tech => 
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}