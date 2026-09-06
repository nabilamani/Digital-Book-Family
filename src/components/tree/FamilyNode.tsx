"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { User, Clock } from "lucide-react";
import type { FamilyNodeData } from "@/lib/utils/tree-transformer";

type FamilyNodeType = Node<FamilyNodeData, "familyNode">;

function FamilyNodeComponent({ data }: NodeProps<FamilyNodeType>) {
  const isMale = data.gender === "Laki-laki";
  const isFemale = data.gender === "Perempuan";
  const isPending = data.isPending;
  const isDeceased = data.lifeStatus === "deceased";

  const borderColor = isPending
    ? "border-secondary/60"
    : isMale
    ? "border-blue-400/60"
    : isFemale
    ? "border-pink-400/60"
    : "border-border";

  const bgColor = isPending ? "bg-secondary/10" : "bg-card";

  return (
    <div
      className={`relative rounded-md border-2 ${borderColor} ${bgColor} shadow-lg min-w-[200px] max-w-[240px] px-4 py-3 transition-all hover:shadow-xl hover:scale-[1.02]`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
            isPending
              ? "bg-secondary/20 text-secondary"
              : isMale
              ? "bg-blue-500/20 text-blue-400"
              : isFemale
              ? "bg-pink-500/20 text-pink-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {data.photoPath ? (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${data.photoPath}`}
              alt={data.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {data.fullName}
          </p>
          {data.nickname && (
            <p className="text-xs text-muted-foreground truncate">
              &quot;{data.nickname}&quot;
            </p>
          )}
          <div className="flex items-center gap-1 mt-1">
            {isPending && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-medium">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
            {isDeceased && (
              <span className="inline-flex text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                Almarhum
              </span>
            )}
            {data.birthDate && !isPending && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(data.birthDate).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const FamilyNode = memo(FamilyNodeComponent);
