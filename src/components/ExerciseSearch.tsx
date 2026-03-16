import { useState, useMemo, useRef, useEffect } from 'react';
import { DEFAULT_EXERCISES } from '../utils/exercises';
import { getUserExerciseNames } from '../store';

interface Props {
  onSelect: (name: string) => void;
  onCancel: () => void;
  existingExercises: string[];
}

export function ExerciseSearch({ onSelect, onCancel, existingExercises }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const userExercises = useMemo(() => getUserExerciseNames(), []);

  const existingNormalized = useMemo(
    () => new Set(existingExercises.map(n => n.toLowerCase())),
    [existingExercises],
  );

  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return DEFAULT_EXERCISES.map(cat => ({
        ...cat,
        exercises: cat.exercises.filter(e => !existingNormalized.has(e.toLowerCase())),
      })).filter(cat => cat.exercises.length > 0);
    }

    return DEFAULT_EXERCISES.map(cat => ({
      ...cat,
      exercises: cat.exercises.filter(
        e => e.toLowerCase().includes(q) && !existingNormalized.has(e.toLowerCase()),
      ),
    })).filter(cat => cat.exercises.length > 0);
  }, [query, existingNormalized]);

  const filteredUserExercises = useMemo(() => {
    const q = query.toLowerCase().trim();
    const defaultNames = new Set(
      DEFAULT_EXERCISES.flatMap(c => c.exercises.map(e => e.toLowerCase())),
    );
    return userExercises.filter(
      e =>
        !defaultNames.has(e.toLowerCase()) &&
        !existingNormalized.has(e.toLowerCase()) &&
        (!q || e.toLowerCase().includes(q)),
    );
  }, [query, userExercises, existingNormalized]);

  const showCustomAdd =
    query.trim().length > 0 &&
    ![...DEFAULT_EXERCISES.flatMap(c => c.exercises), ...userExercises].some(
      e => e.toLowerCase() === query.trim().toLowerCase(),
    );

  const handleSelect = (name: string) => {
    onSelect(name);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button
          onClick={onCancel}
          className="text-text-secondary text-sm min-w-[44px] min-h-[44px] flex items-center"
        >
          Cancel
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search or add exercise..."
          className="flex-1 bg-surface rounded-lg px-4 py-3 text-white placeholder-text-secondary
                     outline-none text-base min-h-[44px]"
        />
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {showCustomAdd && (
          <button
            onClick={() => handleSelect(query.trim())}
            className="w-full text-left bg-surface-2 rounded-lg px-4 py-4 mb-4 min-h-[48px]
                       active:bg-border transition-colors"
          >
            <span className="text-accent">+ Add &quot;{query.trim()}&quot;</span>
          </button>
        )}

        {filteredUserExercises.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 px-1">
              Your Exercises
            </h3>
            {filteredUserExercises.map(name => (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className="w-full text-left px-4 py-3 text-white rounded-lg
                           active:bg-surface transition-colors min-h-[48px]"
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {filteredCategories.map(cat => (
          <div key={cat.name} className="mb-4">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 px-1">
              {cat.name}
            </h3>
            {cat.exercises.map(name => (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className="w-full text-left px-4 py-3 text-white rounded-lg
                           active:bg-surface transition-colors min-h-[48px]"
              >
                {name}
              </button>
            ))}
          </div>
        ))}

        {filteredCategories.length === 0 &&
          filteredUserExercises.length === 0 &&
          !showCustomAdd && (
            <p className="text-text-secondary text-center mt-8">No exercises found</p>
          )}
      </div>
    </div>
  );
}
