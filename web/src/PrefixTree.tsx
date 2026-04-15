import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { Order } from "./algomap.ts";

interface PrefixTreeProps {
  treeRoot: TreeNode | null; // Received pre-built from worker via App.tsx
  order: Order;
}

interface TreeNode {
  id: string;
  prefix: number[];
  rank: number | null;
  children: TreeNode[];
  rankFirst: number;
  rankLast: number;
}

interface NodeData {
  prefix: number[];
  rank: number | null;
  isLeaf: boolean;
  isRoot: boolean;
  collapsed: boolean;
  rankFirst: number;
  rankLast: number;
  onToggle: (id: string) => void;
  [key: string]: unknown;
}

const NODE_W = 110;
const NODE_H = 34;

function layoutTree(
  treeRoot: TreeNode,
  collapsed: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 15,
    ranksep: 50,
    marginx: 20,
    marginy: 20
  });
  g.setDefaultEdgeLabel(() => ({}));

  const rawNodes: Array<{ id: string; data: NodeData }> = [];
  const rawEdges: Array<{ id: string; source: string; target: string }> = [];

  function walk(node: TreeNode, parentId: string | null) {
    const isLeaf = node.children.length === 0;
    const isRoot = node.id === "root";

    const data: NodeData = {
      prefix: node.prefix,
      rank: node.rank,
      isLeaf,
      isRoot,
      collapsed: collapsed.has(node.id),
      rankFirst: node.rankFirst,
      rankLast: node.rankLast,
      onToggle: () => {},
    };

    g.setNode(node.id, { width: NODE_W, height: NODE_H });
    rawNodes.push({ id: node.id, data });

    if (parentId !== null) {
      rawEdges.push({ id: `${parentId}->${node.id}`, source: parentId, target: node.id });
      g.setEdge(parentId, node.id);
    }

    if (!collapsed.has(node.id)) {
      for (const child of node.children) walk(child, node.id);
    }
  }

  walk(treeRoot, null);
  dagre.layout(g);

  const nodes: Node[] = rawNodes.map(({ id, data }) => {
    const nodeWithPos = g.node(id);
    return {
      id,
      type: "prefixNode",
      position: {
        x: nodeWithPos.x - NODE_W / 2,
        y: nodeWithPos.y - NODE_H / 2
      },
      data,
    };
  });

  const edges: Edge[] = rawEdges.map(({ id, source, target }) => ({
    id,
    source,
    target,
    animated: false,
    style: { stroke: "#aaa", strokeWidth: 1 },
  }));

  return { nodes, edges };
}

function PrefixNode({ id, data }: NodeProps) {
  const d = data as NodeData;
  const label = d.isRoot ? "∅" : `[${JSON.stringify(d.prefix || []).slice(1, -1)}]`;
  const hasChildren = !d.isLeaf;
  const isCollapsed = d.collapsed;
  const bg = d.isLeaf ? "#fff8ed" : d.isRoot ? "#e8e8e8" : "#ffffff";
  const border = d.isLeaf ? "1.5px solid #b45309" : "1.5px solid #ccc";

  return (
    <div
      onClick={(e) => {
        if (hasChildren) {
          e.stopPropagation();
          d.onToggle(id);
        }
      }}
      className="nodrag"
      style={{
        width: NODE_W, height: NODE_H, background: bg, border,
        borderRadius: 4, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", fontFamily: "monospace",
        fontSize: "0.7rem", cursor: hasChildren ? "pointer" : "default",
        userSelect: "none", position: "relative", boxSizing: "border-box", padding: "2px",
      }}
    >
      {hasChildren && (
        <span style={{ position: "absolute", top: 1, right: 3, fontSize: "0.6rem", color: "#999" }}>
          {isCollapsed ? "▶" : "▼"}
        </span>
      )}
      <span style={{ fontWeight: 600, marginTop: d.isLeaf ? 0 : -4 }}>{label}</span>
      {d.isLeaf && d.rank !== null && <span style={{ color: "#b45309" }}>r={d.rank}</span>}
      {!d.isLeaf && isCollapsed && (
        <span style={{ color: "#888", fontSize: "0.65rem" }}>r∈[{d.rankFirst}, {d.rankLast}]</span>
      )}
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}

const nodeTypes = { prefixNode: PrefixNode };

export default function PrefixTree({ treeRoot, order }: PrefixTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!treeRoot) {
      setCollapsed(new Set());
      return;
    }

    const initialCollapsed = new Set<string>();
    const DEPTH_THRESHOLD = 2;
    const CHILD_COUNT_THRESHOLD = 3;

    function walk(node: TreeNode, currentDepth: number) {
      const isWide = node.children.length > CHILD_COUNT_THRESHOLD;
      const isDeep = currentDepth >= DEPTH_THRESHOLD;

      if (node.id !== "root" && isDeep && isWide) {
        initialCollapsed.add(node.id);
      }

      for (const child of node.children) walk(child, currentDepth + 1);
    }

    walk(treeRoot, 0);
    setCollapsed(initialCollapsed);
  }, [treeRoot]);

  const onToggle = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!treeRoot) return { nodes: [], edges: [] };
    const { nodes: n, edges: e } = layoutTree(treeRoot, collapsed);
    return {
      nodes: n.map(node => ({ ...node, data: { ...node.data, onToggle } })),
      edges: e
    };
  }, [treeRoot, collapsed, onToggle]);

  if (!treeRoot) return null;

  return (
    <div style={{ width: "100%", height: 560, marginTop: "1rem", border: "1px solid #ddd", borderRadius: 6, background: "#fafafa", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0.4rem 0.7rem", borderBottom: "1px solid #e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", color: "#555", background: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
        <span>Prefix Tree ({order === Order.LEX ? "Lexicographic" : "Combinatorial"})</span>
        <span style={{ color: "#999" }}>click node to toggle</span>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView nodesDraggable={false} panOnDrag={true}>
          <Background color="#e0e0e0" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
