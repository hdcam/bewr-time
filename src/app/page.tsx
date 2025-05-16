'use client';

import React, { useState } from 'react';

function calculateEndTime(startTime: string): string {
  if (!startTime) return '';
  const [hour, minute] = startTime.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return '';

  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  // 8h31m work + 30m lunch = 9h 1m total
  d.setMinutes(d.getMinutes() + 9 * 60 + 1);

  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// function ThemeToggle() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   return (
//     <button
//       onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
//       className="
//         absolute top-4 right-4 w-8 h-8 flex items-center justify-center 
//         rounded-full bg-gray-100 dark:bg-gray-700 text-xl shadow 
//         hover:scale-105 transition
//       "
//       aria-label="Toggle theme"
//     >
//       {theme === 'light' ? '🌙' : '☀️'}
//     </button>
//   );
// }

export default function Home() {
  const [start, setStart] = useState('');
  const end = calculateEndTime(start);

  return (
    <main
      className="
        min-h-[100dvh] flex flex-col items-center justify-center 
        bg-gradient-to-br from-yellow-50 to-indigo-100 
        dark:from-gray-900 dark:to-indigo-950 
        px-4 py-6 transition-colors duration-300 relative
      "
    >
      {/* <ThemeToggle /> */}

      <div
        className="
          w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl 
          shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 
          transition-all
        "
      >
        <img
          src="/assets/bear-cat-scrubs.png"
          alt="Bear and cat in scrubs"
          className="w-full max-h-56 object-contain rounded-2xl mb-6 shadow-md"
        />

        <h1
          className="
            text-2xl sm:text-3xl font-extrabold mb-3 text-center 
            text-indigo-700 dark:text-indigo-300
          "
        >
          Overtime Calculator
        </h1>

        <p
          className="
            text-center text-gray-600 dark:text-gray-300 italic 
            mb-6 text-sm sm:text-base
          "
        >
          Your bear and fluffy assistant are here to help!
        </p>

        <div
          className="
            flex flex-col sm:flex-row items-center sm:justify-between
            bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl mb-5 gap-2
          "
        >
          <span className="text-gray-800 dark:text-gray-100 font-semibold">
            Enter Start Time
          </span>
          <input
            type="time"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="
              flex-shrink-0 w-full sm:w-40 px-4 py-3 rounded-xl 
              bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-900 
              text-lg text-gray-900 dark:text-gray-100 shadow-sm 
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            "
          />
        </div>

        {start ? (
          <div
            className="
              text-center mt-4 text-gray-800 dark:text-gray-200 
              bg-pink-50 dark:bg-pink-950/20 p-4 rounded-2xl
            "
          >
            <div className="font-medium">Minimum Time For Overtime:</div>
            <div
              className="
                mt-1 text-2xl sm:text-3xl font-bold text-pink-600 
                dark:text-pink-400 animate-pulse py-2
              "
            >
              {end}
            </div>
            <div className="text-xs text-pink-500/70 dark:text-pink-300/70 mt-1">
              8h work + 30m lunch + 31m overtime
            </div>
          </div>
        ) : (
          <div
            className="
              text-center text-xs text-gray-400 dark:text-gray-500 
              mt-4 p-3 border border-dashed border-gray-200 dark:border-gray-700 
              rounded-xl
            "
          >
            Set a start time to see when you hit overtime
            <div className="mt-1">E.g., 8:00 AM → 5:31 PM</div>
          </div>
        )}
      </div>
    </main>
  );
}
