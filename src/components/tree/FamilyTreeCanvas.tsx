"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FamilyNode } from "./FamilyNode";
import type { FamilyNodeData } from "@/lib/utils/tree-transformer";

interface FamilyTreeCanvasProps {
  initialNodes: Node<FamilyNodeData>[];
  initialEdges: Edge[];
}

export function FamilyTreeCanvas({ initialNodes, initialEdges }: FamilyTreeCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      style: { stroke: "#4ff7d1", strokeWidth: 2 },
    }),
    []
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#4a5568"
        />
        <Controls
          className="!bg-card !border-border !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as FamilyNodeData;
            if (data.isPending) return "#d946ef";
            if (data.gender === "Laki-laki") return "#60a5fa";
            if (data.gender === "Perempuan") return "#f472b6";
            return "#9ca3af";
          }}
          maskColor="rgba(22, 33, 41, 0.8)"
          className="!bg-card !border-border"
        />
      </ReactFlow>
    </div>
  );
}
