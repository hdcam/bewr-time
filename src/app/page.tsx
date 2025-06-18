'use client';

import React, { useState } from 'react';

function calculateTimes(startTime: string, endTime?: string) {
  if (!startTime) return null;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMinute)) return null;

  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  // Regular shift: 8h work + 30m lunch = 8h 30m total
  const regularEnd = new Date(start);
  regularEnd.setMinutes(regularEnd.getMinutes() + 8 * 60 + 30);

  // Overtime shift: 8h 31m work + 30m lunch = 9h 1m total
  const minOtThreshold = new Date(start);
  minOtThreshold.setMinutes(minOtThreshold.getMinutes() + 9 * 60 + 1);

  const formatTime = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const calculateActualHours = (start: Date, end: Date, lunchBreakMinutes: number = 30) => {
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    
    // Subtract lunch break minutes from total time
    const workMinutes = totalMinutes - lunchBreakMinutes;
    
    const diffHours = Math.floor(workMinutes / 60);
    const diffMinutes = workMinutes % 60;
    return `${diffHours}h ${diffMinutes}m`;
  };

  let actualWorked = null;
  let actualEnd = null;
  let overtimeWorked = null;
  let workedOvertime = false;
  if (endTime) {
    const [endHour, endMinute] = endTime.split(':').map(Number);
    if (!isNaN(endHour) && !isNaN(endMinute)) {
      actualEnd = new Date();
      actualEnd.setHours(endHour, endMinute, 0, 0);
      if (actualEnd < start) {
        actualEnd.setDate(actualEnd.getDate() + 1);
      }
      actualWorked = calculateActualHours(start, actualEnd);
      
      // Check if they worked overtime (past the overtime threshold)
      workedOvertime = actualEnd >= minOtThreshold;
      if (workedOvertime) {
        overtimeWorked = calculateActualHours(regularEnd, actualEnd, 0);
      }
    }
  }

  return {
    start: formatTime(start),
    regularEnd: formatTime(regularEnd),
    minOtThreshold: formatTime(minOtThreshold),
    regularHours: '8h 30m',
    overtimeHours: '9h 1m',
    workHours: '8h',
    overtimeWorkHours: '31m',
    lunchBreak: '30m',
    actualWorked,
    actualEnd: actualEnd ? formatTime(actualEnd) : null,
    overtimeWorked,
    workedOvertime
  };
}

function TimeDisplay({ title, startTime, endTime, totalTime, workTime, lunchTime, bgColor, textColor }: {
  title: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  workTime: string;
  lunchTime: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className={`${bgColor} p-4 rounded-2xl mb-4`}>
      <h3 className={`font-semibold ${textColor} mb-3`}>{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Start:</span>
          <span className={`font-bold ${textColor}`}>{startTime}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">End:</span>
          <span className={`font-bold ${textColor}`}>{endTime}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Hours Worked:</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{workTime}</span>
          </div>
          <div className="flex justify-between items-center font-bold">
            <span className="text-gray-700 dark:text-gray-200">Total:</span>
            <span className={textColor}>{totalTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const timeInfo = calculateTimes(start, end);
  console.log('Time Info:', timeInfo);
  return (
    <main
      className="
        min-h-[100dvh] flex flex-col items-center justify-center 
        bg-gradient-to-br from-yellow-50 to-indigo-100 
        dark:from-gray-900 dark:to-indigo-950 
        px-4 py-6 transition-colors duration-300 relative
      "
    >
      <div
        className="
          w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl 
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

        <div className="space-y-4 mb-6">
          <div
            className="
              flex flex-col sm:flex-row items-center sm:justify-between
              bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl gap-2
            "
          >
            <span className="text-gray-800 dark:text-gray-100 font-semibold">
              Start Time
            </span>
            <div className="flex items-center gap-2">
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
              {start && (
                <button
                  onClick={() => setStart('')}
                  className="
                    w-8 h-8 flex items-center justify-center rounded-full 
                    bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors
                  "
                  aria-label="Clear start time"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div
            className="
              flex flex-col sm:flex-row items-center sm:justify-between
              bg-purple-50 dark:bg-purple-950/30 p-4 rounded-2xl gap-2
            "
          >
            <span className="text-gray-800 dark:text-gray-100 font-semibold">
              End Time (Optional)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={end}
                onChange={e => setEnd(e.target.value)}
                placeholder="Optional"
                className="
                  flex-shrink-0 w-full sm:w-40 px-4 py-3 rounded-xl 
                  bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-900 
                  text-lg text-gray-900 dark:text-gray-100 shadow-sm 
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent
                "
              />
              {end && (
                <button
                  onClick={() => setEnd('')}
                  className="
                    w-8 h-8 flex items-center justify-center rounded-full 
                    bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors
                  "
                  aria-label="Clear end time"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {timeInfo ? (
          <div className="space-y-4">
            <div
              className="
                text-center text-gray-800 dark:text-gray-200 
                bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-2xl
              "
            >
              <div className="font-medium">Minimum Time For Overtime:</div>
              <div
                className="
                  mt-1 text-2xl sm:text-3xl font-bold text-yellow-600 
                  dark:text-yellow-400 py-2
                "
              >
                {timeInfo.minOtThreshold}
              </div>
              <div className="text-xs text-yellow-500/70 dark:text-yellow-300/70 mt-1">
                8h work + 30m lunch + 31m overtime
              </div>
            </div>

            {timeInfo.actualWorked && (
              <div
                className="
                  text-center text-gray-800 dark:text-gray-200 
                  bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl
                "
              >
                <div className="font-medium">Actual Time Worked:</div>
                <div
                  className="
                    mt-1 text-2xl sm:text-3xl font-bold text-blue-600 
                    dark:text-blue-400 py-2
                  "
                >
                  {timeInfo.actualWorked}
                </div>
                <div className="text-xs text-blue-500/70 dark:text-blue-300/70 mt-1">
                  From {timeInfo.start} to {timeInfo.actualEnd}
                </div>
              </div>
            )}

            <div className={`grid ${timeInfo.actualWorked && !timeInfo.workedOvertime ? 'grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
              <TimeDisplay
                title={timeInfo.actualWorked && !timeInfo.workedOvertime ? "Actual Shift" : "Regular Shift"}
                startTime={timeInfo.start}
                endTime={timeInfo.actualWorked && !timeInfo.workedOvertime ? (timeInfo.actualEnd ?? '') : timeInfo.regularEnd}
                totalTime={timeInfo.actualWorked && !timeInfo.workedOvertime ? timeInfo.actualWorked : timeInfo.regularHours}
                workTime={timeInfo.actualWorked && !timeInfo.workedOvertime ? timeInfo.actualWorked : timeInfo.workHours}
                lunchTime={timeInfo.lunchBreak}
                bgColor="bg-green-50 dark:bg-green-950/20"
                textColor="text-green-600 dark:text-green-400"
              />

              {(!timeInfo.actualWorked || timeInfo.workedOvertime) && (
                <TimeDisplay
                  title="Overtime Shift"
                  startTime={timeInfo.regularEnd}
                  endTime={timeInfo.actualEnd || timeInfo.minOtThreshold}
                  totalTime={timeInfo.actualWorked || timeInfo.overtimeHours}
                  workTime={timeInfo.overtimeWorked || timeInfo.overtimeWorkHours}
                  lunchTime={timeInfo.lunchBreak}
                  bgColor="bg-pink-50 dark:bg-pink-950/20"
                  textColor="text-pink-600 dark:text-pink-400"
                />
              )}
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
            Set a start time to see your shift schedule
            <div className="mt-1">Regular shift: 8h work + 30m lunch</div>
            <div>Overtime shift: 8h 31m work + 30m lunch</div>
          </div>
        )}
      </div>
    </main>
  );
}
