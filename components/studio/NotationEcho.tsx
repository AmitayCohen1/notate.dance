"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BONES, type Dancer, ewOfBone, poseAt } from "@/lib/studio";

/**
 * The stance at the playhead written as an Eshkol-Wachman column: ten
 * segment directions in 45° units. This is the live translation — it
 * follows playback and scrubbing.
 */
export default function NotationEcho({ dancer, t }: { dancer: Dancer | undefined; t: number }) {
  if (!dancer) return null;
  const pose = poseAt(dancer, t);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="h-9">Segment</TableHead>
            <TableHead className="h-9 text-right">vertical / horizontal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BONES.map((b) => {
            const c = ewOfBone(pose, b.id);
            return (
              <TableRow key={b.id}>
                <TableCell className="py-1.5">{b.label}</TableCell>
                <TableCell className="py-1.5 text-right font-mono tabular-nums">
                  {c.v.toFixed(1)} / {c.h.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="text-muted-foreground border-t px-4 py-3 text-[0.9rem] leading-relaxed">
        {dancer.name} at beat {t.toFixed(1)}. Vertical 0 points straight down, 4 straight up; horizontal counts 45°
        units around the body from forward.
      </p>
    </div>
  );
}
