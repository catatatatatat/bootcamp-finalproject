'use client';
import React from 'react';

export default function ConfirmModal({
  open,
  title,
  children,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">{title ?? 'Confirm'}</h3>
        <div className="my-3">{children}</div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-3 rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
}
