import { Node, Edge } from "@xyflow/react";

interface PersonRow {
  id: string;
  full_name: string;
  nickname: string | null;
  gender: string | null;
  birth_date: string | null;
  photo_path: string | null;
  life_status: string;
  data_status: string;
  nik?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  family_code?: string | null;
  family_status?: string | null;
}

interface RelationshipRow {
  id: string;
  person_id: string | null;
  related_person_id: string | null;
  relationship_type: string | null;
}

interface PendingPersonRow {
  id: string;
  name: string;
  gender: string | null;
  relationship_type: string | null;
  created_by_person_id: string | null;
  status: string;
}

export interface FamilyNodeData {
  label: string;
  fullName: string;
  nickname: string | null;
  gender: string | null;
  birthDate: string | null;
  photoPath: string | null;
  lifeStatus: string;
  dataStatus: string;
  isPending: boolean;
  personId: string;
  [key: string]: unknown;
}

/**
 * Represents a couple unit: one or two persons (husband+wife or single person).
 */
interface CoupleUnit {
  id: string; // unique couple id
  husband: PersonRow | null;
  wife: PersonRow | null;
  childCoupleIds: string[]; // couple IDs of children's families
  children: string[]; // person IDs of children
}

/**
 * Transforms database rows into React Flow nodes and edges.
 * Couple-centric hierarchical layout: oldest couple at top, children below.
 */
export function transformToFlowData(
  persons: PersonRow[],
  relationships: RelationshipRow[],
  pendingPersons: PendingPersonRow[]
): { nodes: Node<FamilyNodeData>[]; edges: Edge[] } {
  const nodes: Node<FamilyNodeData>[] = [];
  const edges: Edge[] = [];

  // ─── 1. MERGE DUPLICATE PERSONS BY NIK ───
  const nikMap = new Map<string, PersonRow[]>();
  const uniquePersons: PersonRow[] = [];
  const personIdMap = new Map<string, string>(); // anyId -> primaryId

  for (const person of persons) {
    if (person.nik && person.nik.trim() !== "") {
      const normalizedNik = person.nik.trim();
      const existing = nikMap.get(normalizedNik) ?? [];
      existing.push(person);
      nikMap.set(normalizedNik, existing);
    } else {
      uniquePersons.push(person);
      personIdMap.set(person.id, person.id);
    }
  }

  for (const [, group] of nikMap.entries()) {
    if (group.length === 1) {
      uniquePersons.push(group[0]);
      personIdMap.set(group[0].id, group[0].id);
    } else {
      const sorted = [...group].sort((a, b) => {
        const score = (p: PersonRow) => {
          let s = 0;
          if (p.photo_path) s += 10;
          if (p.data_status === "verified") s += 20;
          if (p.data_status === "submitted") s += 10;
          if (p.birth_date) s += 2;
          if (p.nickname) s += 1;
          if (p.phone) s += 5;
          if (p.email) s += 5;
          if (p.address) s += 5;
          if (p.family_code) s += 5;
          return s;
        };
        return score(b) - score(a);
      });

      const primary = sorted[0];
      const mergedPerson: PersonRow = { ...primary };

      for (const p of sorted) {
        if (!mergedPerson.nickname) mergedPerson.nickname = p.nickname;
        if (!mergedPerson.gender) mergedPerson.gender = p.gender;
        if (!mergedPerson.birth_date) mergedPerson.birth_date = p.birth_date;
        if (!mergedPerson.photo_path) mergedPerson.photo_path = p.photo_path;
        if (!mergedPerson.phone) mergedPerson.phone = p.phone;
        if (!mergedPerson.email) mergedPerson.email = p.email;
        if (!mergedPerson.address) mergedPerson.address = p.address;
        if (!mergedPerson.nik) mergedPerson.nik = p.nik;
        if (!mergedPerson.family_code) mergedPerson.family_code = p.family_code;
        if (!mergedPerson.family_status) mergedPerson.family_status = p.family_status;
      }

      uniquePersons.push(mergedPerson);
      for (const p of group) {
        personIdMap.set(p.id, primary.id);
      }
    }
  }

  // ─── 2. MAP AND DEDUPLICATE RELATIONSHIPS ───
  const mappedRelationships: RelationshipRow[] = [];
  const relSeen = new Set<string>();

  for (const rel of relationships) {
    const pId = rel.person_id ? (personIdMap.get(rel.person_id) ?? rel.person_id) : null;
    const rpId = rel.related_person_id ? (personIdMap.get(rel.related_person_id) ?? rel.related_person_id) : null;

    if (!pId || !rpId || pId === rpId) continue;

    const key = `${pId}-${rpId}-${rel.relationship_type}`;
    if (!relSeen.has(key)) {
      relSeen.add(key);
      mappedRelationships.push({
        ...rel,
        person_id: pId,
        related_person_id: rpId,
      });
    }
  }

  // ─── 3. BUILD ADJACENCY DATA ───
  const childrenOf = new Map<string, string[]>(); // parentId -> childIds
  const parentOf = new Map<string, string[]>();   // childId -> parentIds
  const spouseOf = new Map<string, string[]>();   // personId -> spouseIds
  const personMap = new Map(uniquePersons.map((p) => [p.id, p]));

  for (const rel of mappedRelationships) {
    if (!rel.person_id || !rel.related_person_id) continue;

    if (rel.relationship_type === "parent") {
      const parentId = rel.related_person_id;
      const childId = rel.person_id;
      addToListMap(childrenOf, parentId, childId);
      addToListMap(parentOf, childId, parentId);
    } else if (rel.relationship_type === "child") {
      const parentId = rel.person_id;
      const childId = rel.related_person_id;
      addToListMap(childrenOf, parentId, childId);
      addToListMap(parentOf, childId, parentId);
    } else if (rel.relationship_type === "spouse") {
      addToListMap(spouseOf, rel.person_id, rel.related_person_id);
      addToListMap(spouseOf, rel.related_person_id, rel.person_id);
    }
  }

  // ─── 4. BUILD COUPLE UNITS ───
  // A "couple" is a husband+wife pair, or a single person with no spouse.
  // Children belong to the couple (union of both parents' children).
  const visitedForCouples = new Set<string>();
  const couples: CoupleUnit[] = [];
  const personToCoupleId = new Map<string, string>(); // personId -> coupleId

  // First, create couples from spouse relationships
  for (const person of uniquePersons) {
    if (visitedForCouples.has(person.id)) continue;

    const spouses = spouseOf.get(person.id) ?? [];
    const spouseId = spouses.length > 0 ? spouses[0] : null;
    const spousePerson = spouseId ? personMap.get(spouseId) ?? null : null;

    visitedForCouples.add(person.id);
    if (spouseId) visitedForCouples.add(spouseId);

    // Determine husband/wife based on gender
    let husband: PersonRow | null = null;
    let wife: PersonRow | null = null;

    if (spousePerson) {
      if (person.gender === "Laki-laki") {
        husband = person;
        wife = spousePerson;
      } else if (person.gender === "Perempuan") {
        wife = person;
        husband = spousePerson;
      } else {
        husband = person;
        wife = spousePerson;
      }
    } else {
      // Single person
      if (person.gender === "Perempuan") {
        wife = person;
      } else {
        husband = person;
      }
    }

    const coupleId = husband ? husband.id : (wife ? wife.id : person.id);

    // Collect children from both parents
    const childSet = new Set<string>();
    if (husband) {
      for (const cid of (childrenOf.get(husband.id) ?? [])) childSet.add(cid);
    }
    if (wife) {
      for (const cid of (childrenOf.get(wife.id) ?? [])) childSet.add(cid);
    }

    const couple: CoupleUnit = {
      id: coupleId,
      husband,
      wife,
      childCoupleIds: [], // filled later
      children: [...childSet],
    };

    couples.push(couple);
    if (husband) personToCoupleId.set(husband.id, coupleId);
    if (wife) personToCoupleId.set(wife.id, coupleId);
  }

  // Map couple by ID for quick lookup
  const coupleMap = new Map(couples.map((c) => [c.id, c]));

  // Link children to their couple units
  for (const couple of couples) {
    const childCoupleSet = new Set<string>();
    for (const childId of couple.children) {
      const childCoupleId = personToCoupleId.get(childId);
      if (childCoupleId) {
        childCoupleSet.add(childCoupleId);
      }
    }
    couple.childCoupleIds = [...childCoupleSet];
  }

  // ─── 5. FIND ROOT COUPLES (no parents) ───
  const hasParents = new Set<string>();
  for (const [childId, parents] of parentOf.entries()) {
    if (parents.length > 0) hasParents.add(childId);
  }

  const rootCouples = couples.filter((c) => {
    const hHasParent = c.husband ? hasParents.has(c.husband.id) : false;
    const wHasParent = c.wife ? hasParents.has(c.wife.id) : false;
    return !hHasParent && !wHasParent;
  });

  // Fallback
  if (rootCouples.length === 0 && couples.length > 0) {
    rootCouples.push(couples[0]);
  }

  // ─── 6. ASSIGN GENERATION VIA BFS ON COUPLE TREE ───
  const coupleGeneration = new Map<string, number>();
  const bfsQueue: { coupleId: string; gen: number }[] = [];
  const visitedCouples = new Set<string>();

  for (const root of rootCouples) {
    bfsQueue.push({ coupleId: root.id, gen: 0 });
  }

  while (bfsQueue.length > 0) {
    const { coupleId, gen } = bfsQueue.shift()!;
    if (visitedCouples.has(coupleId)) continue;
    visitedCouples.add(coupleId);
    coupleGeneration.set(coupleId, gen);

    const couple = coupleMap.get(coupleId);
    if (!couple) continue;

    for (const childCoupleId of couple.childCoupleIds) {
      if (!visitedCouples.has(childCoupleId)) {
        bfsQueue.push({ coupleId: childCoupleId, gen: gen + 1 });
      }
    }
  }

  // Assign generation to any remaining unvisited couples
  for (const couple of couples) {
    if (!coupleGeneration.has(couple.id)) {
      coupleGeneration.set(couple.id, 0);
    }
  }

  // ─── 7. LAYOUT: POSITION COUPLE NODES ───
  const NODE_WIDTH = 240;
  const NODE_HEIGHT = 120;
  const SPOUSE_GAP = 40;       // horizontal gap between husband and wife
  const COUPLE_X_GAP = 80;     // horizontal gap between sibling couples
  const Y_GAP = 180;           // vertical gap between generations

  // Build generation groups of couples
  const genCoupleGroups = new Map<number, CoupleUnit[]>();
  for (const couple of couples) {
    const gen = coupleGeneration.get(couple.id) ?? 0;
    const group = genCoupleGroups.get(gen) ?? [];
    group.push(couple);
    genCoupleGroups.set(gen, group);
  }

  // Sort generations and couples within each generation by traversal order
  const sortedGens = [...genCoupleGroups.keys()].sort((a, b) => a - b);

  // Calculate subtree widths for proper centering
  const coupleWidth = (c: CoupleUnit): number => {
    const personCount = (c.husband ? 1 : 0) + (c.wife ? 1 : 0);
    return personCount * NODE_WIDTH + (personCount > 1 ? SPOUSE_GAP : 0);
  };

  // Calculate the total width needed by a couple subtree (recursive)
  const subtreeWidthCache = new Map<string, number>();
  function getSubtreeWidth(coupleId: string): number {
    if (subtreeWidthCache.has(coupleId)) return subtreeWidthCache.get(coupleId)!;

    const couple = coupleMap.get(coupleId);
    if (!couple) return NODE_WIDTH;

    const selfWidth = coupleWidth(couple);

    if (couple.childCoupleIds.length === 0) {
      subtreeWidthCache.set(coupleId, selfWidth);
      return selfWidth;
    }

    // Sort children by birth date / name for consistent ordering
    const sortedChildCouples = [...couple.childCoupleIds].sort((a, b) => {
      const cA = coupleMap.get(a);
      const cB = coupleMap.get(b);
      const personA = cA?.husband ?? cA?.wife;
      const personB = cB?.husband ?? cB?.wife;
      if (personA?.birth_date && personB?.birth_date) {
        return new Date(personA.birth_date).getTime() - new Date(personB.birth_date).getTime();
      }
      return (personA?.full_name ?? "").localeCompare(personB?.full_name ?? "");
    });
    couple.childCoupleIds = sortedChildCouples;

    let totalChildrenWidth = 0;
    for (let i = 0; i < sortedChildCouples.length; i++) {
      totalChildrenWidth += getSubtreeWidth(sortedChildCouples[i]);
      if (i < sortedChildCouples.length - 1) totalChildrenWidth += COUPLE_X_GAP;
    }

    const result = Math.max(selfWidth, totalChildrenWidth);
    subtreeWidthCache.set(coupleId, result);
    return result;
  }

  // Compute all subtree widths
  for (const couple of couples) {
    getSubtreeWidth(couple.id);
  }

  // Position couples recursively
  const nodePositions = new Map<string, { x: number; y: number }>();

  function layoutCouple(coupleId: string, centerX: number, y: number) {
    const couple = coupleMap.get(coupleId);
    if (!couple) return;

    const self = coupleWidth(couple);

    // Position the couple centered at centerX
    if (couple.husband && couple.wife) {
      // Husband on the left, wife on the right
      const husbandX = centerX - self / 2;
      const wifeX = husbandX + NODE_WIDTH + SPOUSE_GAP;

      nodePositions.set(couple.husband.id, { x: husbandX, y });
      nodePositions.set(couple.wife.id, { x: wifeX, y });
    } else {
      const person = couple.husband ?? couple.wife;
      if (person) {
        nodePositions.set(person.id, { x: centerX - NODE_WIDTH / 2, y });
      }
    }

    // Position children below
    if (couple.childCoupleIds.length > 0) {
      const childY = y + NODE_HEIGHT + Y_GAP;

      // Calculate total width of all children subtrees
      let totalChildrenWidth = 0;
      for (let i = 0; i < couple.childCoupleIds.length; i++) {
        totalChildrenWidth += getSubtreeWidth(couple.childCoupleIds[i]);
        if (i < couple.childCoupleIds.length - 1) totalChildrenWidth += COUPLE_X_GAP;
      }

      // Start from the left, centering the entire children row below the couple
      let childX = centerX - totalChildrenWidth / 2;

      for (const childCoupleId of couple.childCoupleIds) {
        const childSubtreeW = getSubtreeWidth(childCoupleId);
        const childCenterX = childX + childSubtreeW / 2;
        layoutCouple(childCoupleId, childCenterX, childY);
        childX += childSubtreeW + COUPLE_X_GAP;
      }
    }
  }

  // Layout root couples
  let totalRootWidth = 0;
  for (let i = 0; i < rootCouples.length; i++) {
    totalRootWidth += getSubtreeWidth(rootCouples[i].id);
    if (i < rootCouples.length - 1) totalRootWidth += COUPLE_X_GAP;
  }

  let rootX = -totalRootWidth / 2;
  for (const root of rootCouples) {
    const w = getSubtreeWidth(root.id);
    layoutCouple(root.id, rootX + w / 2, 0);
    rootX += w + COUPLE_X_GAP;
  }

  // ─── 8. CREATE FLOW NODES ───
  for (const person of uniquePersons) {
    const pos = nodePositions.get(person.id);
    if (!pos) continue;

    nodes.push({
      id: person.id,
      type: "familyNode",
      position: pos,
      data: {
        label: person.full_name,
        fullName: person.full_name,
        nickname: person.nickname,
        gender: person.gender,
        birthDate: person.birth_date,
        photoPath: person.photo_path,
        lifeStatus: person.life_status,
        dataStatus: person.data_status,
        isPending: false,
        personId: person.id,
      },
    });
  }

  // ─── 9. CREATE FLOW EDGES ───
  // For each couple:
  //   - One spouse edge (horizontal) between husband and wife
  //   - One parent→child edge from the HUSBAND (or wife if no husband) to each child
  //     (NOT from both parents — this prevents the messy double-edge pattern)
  const edgeSeen = new Set<string>();

  for (const couple of couples) {
    // Spouse edge
    if (couple.husband && couple.wife) {
      const spouseKey = `spouse-${couple.husband.id}-${couple.wife.id}`;
      if (!edgeSeen.has(spouseKey)) {
        edgeSeen.add(spouseKey);
        edges.push({
          id: spouseKey,
          source: couple.husband.id,
          target: couple.wife.id,
          type: "smoothstep",
          sourceHandle: null,
          targetHandle: null,
          style: { stroke: "#d946ef", strokeWidth: 2 },
          label: "pasangan",
        });
      }
    }

    // Parent → child edges (only from the primary parent)
    const primaryParent = couple.husband ?? couple.wife;
    if (primaryParent) {
      for (const childId of couple.children) {
        const edgeKey = `parent-child-${primaryParent.id}-${childId}`;
        if (!edgeSeen.has(edgeKey)) {
          edgeSeen.add(edgeKey);
          edges.push({
            id: edgeKey,
            source: primaryParent.id,
            target: childId,
            type: "smoothstep",
            style: { stroke: "#4ff7d1", strokeWidth: 2 },
            label: "anak",
          });
        }
      }
    }
  }

  // ─── 10. PENDING NODES ───
  const pendingByCreator = new Map<string, PendingPersonRow[]>();
  const unanchoredPending: PendingPersonRow[] = [];

  pendingPersons.forEach((pp) => {
    if (pp.created_by_person_id) {
      const primaryCreatorId = personIdMap.get(pp.created_by_person_id) ?? pp.created_by_person_id;
      const existing = pendingByCreator.get(primaryCreatorId) ?? [];
      existing.push(pp);
      pendingByCreator.set(primaryCreatorId, existing);
    } else {
      unanchoredPending.push(pp);
    }
  });

  for (const [creatorId, pps] of pendingByCreator.entries()) {
    const creatorPos = nodePositions.get(creatorId);
    if (creatorPos) {
      const N = pps.length;
      const totalWidth = N * (NODE_WIDTH + COUPLE_X_GAP) - COUPLE_X_GAP;
      const groupLeft = creatorPos.x + NODE_WIDTH / 2 - totalWidth / 2;
      const y = creatorPos.y + NODE_HEIGHT + Y_GAP;

      pps.forEach((pp, index) => {
        const x = groupLeft + index * (NODE_WIDTH + COUPLE_X_GAP);
        nodes.push({
          id: `pending-${pp.id}`,
          type: "familyNode",
          position: { x, y },
          data: {
            label: pp.name,
            fullName: pp.name,
            nickname: null,
            gender: pp.gender,
            birthDate: null,
            photoPath: null,
            lifeStatus: "alive",
            dataStatus: "pending",
            isPending: true,
            personId: pp.id,
          },
        });

        edges.push({
          id: `edge-pending-${pp.id}`,
          source: creatorId,
          target: `pending-${pp.id}`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#d946ef", strokeDasharray: "5 5" },
          label: pp.relationship_type ?? "relasi",
        });
      });
    } else {
      unanchoredPending.push(...pps);
    }
  }

  if (unanchoredPending.length > 0) {
    const maxGen = Math.max(...Array.from(coupleGeneration.values()), 0);
    const pendingY = (maxGen + 1) * (NODE_HEIGHT + Y_GAP);
    const totalWidth = unanchoredPending.length * (NODE_WIDTH + COUPLE_X_GAP) - COUPLE_X_GAP;
    const startX = -totalWidth / 2;

    unanchoredPending.forEach((pp, index) => {
      const x = startX + index * (NODE_WIDTH + COUPLE_X_GAP);
      nodes.push({
        id: `pending-${pp.id}`,
        type: "familyNode",
        position: { x, y: pendingY },
        data: {
          label: pp.name,
          fullName: pp.name,
          nickname: null,
          gender: pp.gender,
          birthDate: null,
          photoPath: null,
          lifeStatus: "alive",
          dataStatus: "pending",
          isPending: true,
          personId: pp.id,
        },
      });

      if (pp.created_by_person_id) {
        const creatorId = personIdMap.get(pp.created_by_person_id) ?? pp.created_by_person_id;
        edges.push({
          id: `edge-pending-${pp.id}`,
          source: creatorId,
          target: `pending-${pp.id}`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#d946ef", strokeDasharray: "5 5" },
          label: pp.relationship_type ?? "relasi",
        });
      }
    });
  }

  return { nodes, edges };
}

/** Helper to add a value to a Map<string, string[]> without duplicates */
function addToListMap(map: Map<string, string[]>, key: string, value: string) {
  const list = map.get(key) ?? [];
  if (!list.includes(value)) {
    list.push(value);
    map.set(key, list);
  }
}
