<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Family Tree Project - Developer Guidelines

You are assisting in the development of a **premium, organic family tree visualization platform**. This project prioritizes an illustrated, hand-painted aesthetic over a technical diagram look.

## 🛠 Tech Stack
- **Framework**: Next.js (App Router) - *Note breaking changes above*.
- **Canvas/Graph**: `@xyflow/react` (React Flow).
- **State Management**: Zustand (`src/lib/store.ts`).
- **Styling**: Tailwind CSS + Custom Vanilla CSS for organic assets.
- **Language**: Hebrew (Primary UI), RTL support is mandatory.

## 🎨 Organic Aesthetic Guidelines
- **Branches**: Do not use standard lines. Use the `FamilyEdge` component with custom branch textures (`branch_union_one_child.png`, etc.).
- **Hierarchy**: Vertical flow (Ancestors at the top, descendants at the bottom, but the "root" is actually the ground/trunk at the bottom in some views).
- **Nodes**: Use `FamilyNode` which utilizes parchment-style assets (`card_male.png`, `card_female.png`).
- **Alignment**: Handles are aligned to "wax seals" on the cards (approx 25px offset from edges).
- **Decorations**: Use `massive-tree-roots`, `crown`, and `ground` nodes to create the "Tree" environment.

## 📊 Data Model & Logic
- **Persons & Unions**: The tree is built on `Person` and `Union` entities.
- **Connections**: 
    - Partners are linked via a `Union` hub.
    - Children are linked to the `Union` hub, not directly to parents.
- **Layout**: Uses a custom recursive layout algorithm in `store.ts` (`buildInitialGraph`) to calculate subtree widths and positions.

## 🇮🇱 Hebrew & RTL
- All user-facing text must be in **Hebrew**.
- Ensure `dir="rtl"` is respected in layouts.
- Use `Inter` or professional Hebrew fonts.
- Standard labels: "ז״ל" for deceased, birth/death years formatting.

## ⚠️ Critical Rules
- **Maintain Organic Feel**: If adding UI elements, they should feel "physical" (parchment, wood, paper, ink).
- **No Jumpiness**: Ensure node dimensions are fixed/predicted to prevent React Flow measurement jumps.
- **Handle IDs**: Use specific IDs like `left-out`, `right-in`, `top-source`, `bottom-target` as defined in `FamilyNode.tsx`.
