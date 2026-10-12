"use client";

import { Button } from "@/components/Button";

export function PrintButton() {
  return (
    <div className="print:hidden">
      <Button variant="primary" onClick={() => window.print()}>
        طباعة
      </Button>
    </div>
  );
}
