"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TeamMember, BuilderClass } from "@/types/builder";
import { validateFile, isHEICFile } from "@/lib/validation";
import { convertHEICToJPEG } from "@/lib/heic";
import { loadImageFromFile, downscaleImageIfHuge } from "@/lib/image";
import { detectBuilderClass } from "@/lib/builder-class";

const MAX_MEMBERS = 5;

// Monotonic counter for stable IDs — avoids Math.random collisions and
// eliminates any hydration mismatch risk on the client.
let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return `mem-${idCounter}-${Date.now().toString(36)}`;
}

function emptyMember(): TeamMember {
  return {
    id: makeId(),
    image: null,
    imageObjectUrl: null,
    name: "",
    stack: "",
    builderClass: "SYSTEM BUILDER",
  };
}

export function useTeamProcessor() {
  const [members, setMembers] = useState<TeamMember[]>(() => [
    emptyMember(),
    emptyMember(),
  ]);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const trackUrl = useCallback((url: string) => {
    if (url?.startsWith("blob:")) urlsRef.current.add(url);
  }, []);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        // URL may already be revoked; ignore
      }
    });
    urlsRef.current.clear();
  }, []);

  useEffect(() => () => revokeAll(), [revokeAll]);

  const addMember = useCallback(() => {
    setMembers((prev) => {
      if (prev.length >= MAX_MEMBERS) return prev;
      return [...prev, emptyMember()];
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const updateMember = useCallback(
    (id: string, patch: Partial<TeamMember>) => {
      if (!mountedRef.current) return;
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const merged = { ...m, ...patch };
          if (patch.stack !== undefined) {
            merged.builderClass = detectBuilderClass(patch.stack);
          }
          return merged;
        })
      );
    },
    []
  );

  const setMemberClass = useCallback((id: string, cls: BuilderClass) => {
    if (!mountedRef.current) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, builderClass: cls } : m))
    );
  }, []);

  const processMemberFile = useCallback(
    async (id: string, file: File) => {
      if (!mountedRef.current) return;
      setError(null);
      setBusyMemberId(id);

      const validation = validateFile(file);
      if (!validation.valid) {
        if (mountedRef.current) {
          setError(validation.error || "Invalid file.");
          setBusyMemberId(null);
        }
        return;
      }

      try {
        let processed = file;
        if (isHEICFile(file)) {
          try {
            processed = await convertHEICToJPEG(file);
          } catch {
            if (mountedRef.current) {
              setError("Could not convert HEIC. Please try JPG or PNG.");
              setBusyMemberId(null);
            }
            return;
          }
        }

        const img = await loadImageFromFile(processed);
        trackUrl(img.src);

        const optimized = await downscaleImageIfHuge(img, 2000).catch(() => img);
        if (optimized !== img) trackUrl(optimized.src);

        // Verify member still exists before updating (may have been removed)
        if (mountedRef.current) {
          setMembers((prev) => {
            const stillExists = prev.some((m) => m.id === id);
            if (!stillExists) return prev;
            return prev.map((m) =>
              m.id === id
                ? { ...m, image: optimized, imageObjectUrl: optimized.src }
                : m
            );
          });
        }
      } catch (err) {
        if (mountedRef.current) {
          setError((err as Error).message || "Failed to load photo.");
        }
      } finally {
        if (mountedRef.current) {
          setBusyMemberId(null);
        }
      }
    },
    [trackUrl]
  );

  const resetAll = useCallback(() => {
    revokeAll();
    if (mountedRef.current) {
      setMembers([emptyMember(), emptyMember()]);
      setError(null);
      setBusyMemberId(null);
    }
  }, [revokeAll]);

  const canGenerate =
    members.length >= 1 &&
    members.every((m) => m.image !== null && m.name.trim().length > 0);

  return {
    members,
    busyMemberId,
    error,
    addMember,
    removeMember,
    updateMember,
    setMemberClass,
    processMemberFile,
    resetAll,
    canGenerate,
    MAX_MEMBERS,
  };
}