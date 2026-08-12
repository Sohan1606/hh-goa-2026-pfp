"use client";

import React, { useRef, useCallback } from "react";
import { Upload, Trash2, Plus, User, Code, Loader2 } from "lucide-react";
import { TeamMember, BuilderClass } from "@/types/builder";
import { BuilderClassBadge } from "./builder-class-badge";
import { alternativeBuilderClass } from "@/lib/builder-class";
import { cn } from "@/lib/utils";

interface Props {
  members: TeamMember[];
  busyMemberId: string | null;
  onFileSelected: (id: string, file: File) => void;
  onUpdate: (id: string, patch: Partial<TeamMember>) => void;
  onSetClass: (id: string, cls: BuilderClass) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  maxMembers: number;
}

export function TeamBuilderForm(props: Props) {
  const {
    members,
    busyMemberId,
    onFileSelected,
    onUpdate,
    onSetClass,
    onAdd,
    onRemove,
    maxMembers,
  } = props;

  return (
    <div className="space-y-4">
      {members.map((m, idx) => (
        <MemberCard
          key={m.id}
          index={idx}
          member={m}
          busy={busyMemberId === m.id}
          canRemove={members.length > 1}
          onFileSelected={(f) => onFileSelected(m.id, f)}
          onUpdate={(patch) => onUpdate(m.id, patch)}
          onRegenerateClass={() =>
            onSetClass(m.id, alternativeBuilderClass(m.stack, m.builderClass))
          }
          onRemove={() => onRemove(m.id)}
        />
      ))}

      {members.length < maxMembers && (
        <button
          onClick={onAdd}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-4 py-3 rounded-xl border border-dashed border-zinc-700",
            "text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:border-orange-500/60 hover:bg-orange-500/5",
            "transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
        >
          <Plus className="w-4 h-4" />
          Add Builder ({members.length}/{maxMembers})
        </button>
      )}
    </div>
  );
}

interface MemberCardProps {
  index: number;
  member: TeamMember;
  busy: boolean;
  canRemove: boolean;
  onFileSelected: (f: File) => void;
  onUpdate: (patch: Partial<TeamMember>) => void;
  onRegenerateClass: () => void;
  onRemove: () => void;
}

function MemberCard({
  index,
  member,
  busy,
  canRemove,
  onFileSelected,
  onUpdate,
  onRegenerateClass,
  onRemove,
}: MemberCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ""; // allow re-selecting same file
      inputRef.current.click();
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFileSelected(f);
      e.target.value = "";
    },
    [onFileSelected]
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Builder {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-zinc-600 hover:text-red-400 transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            aria-label={`Remove builder ${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePick}
          disabled={busy}
          className={cn(
            "relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0",
            "border-2 border-dashed border-zinc-700 hover:border-orange-500/60",
            "bg-zinc-950 flex items-center justify-center",
            "transition-all duration-150 active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label={`Upload photo for builder ${index + 1}`}
        >
          {member.imageObjectUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.imageObjectUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : busy ? (
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          onChange={handleChange}
          className="sr-only"
        />

        <div className="flex-1 space-y-2 min-w-0">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input
              type="text"
              value={member.name}
              onChange={(e) => onUpdate({ name: e.target.value.slice(0, 30) })}
              placeholder="Name"
              maxLength={30}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg text-sm",
                "bg-zinc-950 border border-zinc-800",
                "text-zinc-100 placeholder:text-zinc-600",
                "focus:outline-none focus:border-orange-500/60"
              )}
            />
          </div>
          <div className="relative">
            <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input
              type="text"
              value={member.stack}
              onChange={(e) => onUpdate({ stack: e.target.value.slice(0, 60) })}
              placeholder="Stack (e.g. React • Node)"
              maxLength={60}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg text-sm",
                "bg-zinc-950 border border-zinc-800",
                "text-zinc-100 placeholder:text-zinc-600",
                "focus:outline-none focus:border-orange-500/60"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <BuilderClassBadge
          builderClass={member.builderClass}
          onRegenerate={onRegenerateClass}
          compact
        />
      </div>
    </div>
  );
}