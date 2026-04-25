import { Person, Union, PersonUnionLink, AddContext, PersonFormData, AddFamilyMemberPayload } from './types';

/** Generates a unique ID based on timestamp and random string */
export function uid(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function executeAddFamilyMember(
    state: { persons: Person[]; unions: Union[]; links: PersonUnionLink[]; addContext: AddContext },
    payload: AddFamilyMemberPayload
) {
    let newPersons = [...state.persons];
    let newUnions = [...state.unions];
    let newLinks = [...state.links];
    const addContext = state.addContext;

    const resolvePerson = (form: PersonFormData): string => {
        if (form.existingPersonId) return form.existingPersonId;
        const newPerson: Person = {
            id: uid('person'),
            fullName: form.fullName,
            birthYear: form.birthYear,
            isAlive: form.isAlive,
            gender: form.gender,
            ...(form.maidenName && { maidenName: form.maidenName }),
            ...(form.birthDate && { birthDate: form.birthDate }),
            ...(form.birthPlace && { birthPlace: form.birthPlace }),
            ...(form.deathYear && { deathYear: form.deathYear }),
            ...(form.deathDate && { deathDate: form.deathDate }),
            ...(form.deathPlace && { deathPlace: form.deathPlace }),
            ...(form.burialPlace && { burialPlace: form.burialPlace }),
            ...(form.photoUrl && { photoUrl: form.photoUrl }),
            ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
            ...(form.email && { email: form.email }),
            ...(form.address && { address: form.address }),
            ...(form.occupation && { occupation: form.occupation }),
            ...(form.bio && { bio: form.bio }),
            ...(form.socialLinks && { socialLinks: form.socialLinks }),
        };
        newPersons.push(newPerson);
        return newPerson.id;
    };

    let primaryNewId: string | null = null;

    if (addContext.action === 'add_partner') {
        const sourceId = addContext.sourcePersonId;
        primaryNewId = resolvePerson(payload.primary);

        const existingLinks = newLinks.filter(l => l.personId === sourceId && l.role === 'partner');
        const singleParentUnionLink = existingLinks.find(l => {
            const unionPartners = newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner');
            return unionPartners.length === 1;
        });

        if (singleParentUnionLink) {
            newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: singleParentUnionLink.unionId, role: 'partner' });
        } else {
            const newUnion: Union = {
                id: uid('union'),
                status: payload.unionStatus ?? 'married',
                ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
            };
            newUnions.push(newUnion);
            newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
            newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: newUnion.id, role: 'partner' });
        }
    } else if (addContext.action === 'add_child') {
        primaryNewId = resolvePerson(payload.primary);
        newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: addContext.sourceUnionId, role: 'child' });
    } else if (addContext.action === 'add_parent') {
        const childId = addContext.sourcePersonId;
        primaryNewId = resolvePerson(payload.primary);

        const newUnion: Union = {
            id: uid('union'),
            status: payload.unionStatus ?? 'married',
            ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
        };
        newUnions.push(newUnion);
        newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: newUnion.id, role: 'partner' });

        if (payload.secondParent && (payload.secondParent.existingPersonId || payload.secondParent.fullName.trim())) {
            const parent2Id = resolvePerson(payload.secondParent);
            newLinks.push({ id: uid('link'), personId: parent2Id, unionId: newUnion.id, role: 'partner' });
        }

        newLinks.push({ id: uid('link'), personId: childId, unionId: newUnion.id, role: 'child' });
    } else if (addContext.action === 'add_root') {
        primaryNewId = resolvePerson(payload.primary);
    }

    return { newPersons, newUnions, newLinks, primaryNewId };
}

export function executeConnectNodes(
    state: { unions: Union[]; links: PersonUnionLink[] },
    intent: 'spouse' | 'child_to_union',
    sourceId: string,
    targetId: string
) {
    let newUnions = [...state.unions];
    let newLinks = [...state.links];

    if (intent === 'spouse') {
        const alreadyConnected = newLinks.some(l1 =>
            l1.personId === sourceId && l1.role === 'partner' &&
            newLinks.some(l2 => l2.personId === targetId && l2.role === 'partner' && l2.unionId === l1.unionId)
        );
        if (alreadyConnected) return { newUnions, newLinks, changed: false };

        const sourceExistingLinks = newLinks.filter(l => l.personId === sourceId && l.role === 'partner');
        const targetExistingLinks = newLinks.filter(l => l.personId === targetId && l.role === 'partner');

        let singleParentUnionLink = sourceExistingLinks.find(l =>
            newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner').length === 1
        );

        if (!singleParentUnionLink) {
            singleParentUnionLink = targetExistingLinks.find(l =>
                newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner').length === 1
            );
        }

        if (singleParentUnionLink) {
            const unionId = singleParentUnionLink.unionId;
            const personToAdd = singleParentUnionLink.personId === sourceId ? targetId : sourceId;
            newLinks.push({ id: uid('link'), personId: personToAdd, unionId, role: 'partner' });
        } else {
            const newUnion: Union = { id: uid('union'), status: 'married' };
            newUnions.push(newUnion);
            newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
            newLinks.push({ id: uid('link'), personId: targetId, unionId: newUnion.id, role: 'partner' });
        }
    } else if (intent === 'child_to_union') {
        const alreadyConnected = newLinks.some(l => l.personId === sourceId && l.unionId === targetId && l.role === 'child');
        if (!alreadyConnected) {
            newLinks.push({ id: uid('link'), personId: sourceId, unionId: targetId, role: 'child' });
        }
    }

    return { newUnions, newLinks, changed: true };
}