import { buildGraphLayout } from './src/lib/layoutEngine';
import { initialPersons, initialUnions, initialLinks } from './src/lib/mockData';

const { nodes, edges } = buildGraphLayout(initialPersons, initialUnions, initialLinks);

console.log(`Nodes count: ${nodes.length}`);

const positions: Record<string, { x: number, y: number, id: string }> = {};

nodes.forEach(node => {
    if (node.type === 'familyMember') {
        const p = initialPersons.find(p => p.id === node.id);
        console.log(`Person ${p?.fullName} (${node.id}) at x=${node.position.x}, y=${node.position.y}`);
        
        // Check for overlaps
        const key = `${node.position.x},${node.position.y}`;
        if (positions[key]) {
            console.error(`OVERLAP DETECTED! ${node.id} and ${positions[key].id} at ${key}`);
        }
        positions[key] = { x: node.position.x, y: node.position.y, id: node.id };
    } else {
        console.log(`Union Hub ${node.id} at x=${node.position.x}, y=${node.position.y}`);
    }
});
