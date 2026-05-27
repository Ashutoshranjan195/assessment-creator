import clsx from 'clsx';
import type { Difficulty } from '@vedaai/shared';

const styles: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  Challenging: 'bg-red-100 text-red-700 border-red-200',
};

export function DifficultyBadge({ value }: { value: Difficulty }): JSX.Element {
  return (
    <span
      className={clsx(
        'inline-block text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-full border transition-colors duration-150',
        styles[value],
      )}
    >
      {value}
    </span>
  );
}
