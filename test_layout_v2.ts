import { buildGraphLayout } from './src/lib/layoutEngine';
import { initialPersons, initialUnions, initialLinks } from './src/lib/mockData';

const { nodes, edges } = buildGraphLayout(initialPersons, initialUnions, initialLinks);

console.log(`Nodes count: ${nodes.length}`);

const CARD_WIDTH = 280;
const personNodes = nodes.filter(n => n.type === 'familyMember');

let overlapCount = 0;

for (let i = 0; i < personNodes.length; i++) {
    for (let j = i + 1; j < personNodes.length; j++) {
        const n1 = personNodes[i];
        const n2 = personNodes[j];
        
        if (n1.position.y === n2.position.y) {
            const left1 = n1.position.x;
            const right1 = n1.position.x + CARD_WIDTH;
            const left2 = n2.position.x;
            const right2 = n2.position.x + CARD_WIDTH;
            
            // Check for range overlap
            if (left1 < right2 && right1 > left2) {
                console.error(`OVERLAP! ${n1.id} and ${n2.id} at y=${n1.position.y}. X1:[${left1},${right1}] X2:[${left2},${right2}]`);
                overlapCount++;
            }
        }
    }
}

console.log(`Total overlaps found: ${overlapCount}`);
