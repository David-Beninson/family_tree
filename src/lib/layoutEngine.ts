import { Edge, Node } from '@xyflow/react';
import { Person, Union, PersonUnionLink } from './types';
import { SPACING, FAMILY_COLORS } from './layoutConstants';
import {
    getPartnerLinks,
    getUnionPartners,
    getUnionChildren,
    getParentUnion,
} from './layoutHelpers';

export function buildGraphLayout(
    persons: Person[],
    unions: Union[],
    links: PersonUnionLink[],
    roleMap?: Map<string, 'focus' | 'blood' | 'entry-point'>
): { nodes: Node[], edges: Edge[] } {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    // Simple list layout for reset state
    persons.forEach((p, index) => {
        rfNodes.push({
            id: p.id,
            type: 'familyMember',
            position: { x: 0, y: index * 150 },
            data: {
                person: p,
                nodeRole: roleMap?.get(p.id) || 'blood',
                parentCount: links.filter(l => l.personId === p.id && l.role === 'child').length,
                isMarried: links.some(l => l.personId === p.id && l.role === 'partner'),
            }
        });
    });

    unions.forEach((u, index) => {
        // Place union hubs near their partners if possible, or just in a separate column
        rfNodes.push({
            id: `union-hub-${u.id}`,
            type: 'union',
            position: { x: 400, y: index * 150 },
            data: { unionId: u.id }
        });

        // Basic edges
        const partners = links.filter(l => l.unionId === u.id && l.role === 'partner');
        partners.forEach(l => {
            rfEdges.push({
                id: `edge-${l.personId}-${u.id}`,
                source: l.personId,
                target: `union-hub-${u.id}`,
                type: 'familyEdge',
                data: { routing: 'straight', isDivorced: u.status === 'divorced' }
            });
        });

        const children = links.filter(l => l.unionId === u.id && l.role === 'child');
        children.forEach(l => {
            rfEdges.push({
                id: `edge-${u.id}-${l.personId}`,
                source: `union-hub-${u.id}`,
                target: l.personId,
                type: 'familyEdge',
                data: { routing: 'smoothstep' }
            });
        });
    });

    return { nodes: rfNodes, edges: rfEdges };
}