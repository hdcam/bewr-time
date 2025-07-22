'use client';

import React, { useState } from 'react';

type BakingStage = 'not-started' | 'mix1' | 'wait1' | 'mix2' | 'wait2' | 'mix3' | 'wait3' | 'mix4-shape' | 'fermentation-choice' | 'cold-fermentation' | 'room-fermentation' | 'completed';

type FermentationType = 'cold' | 'room' | null;

interface BakingState {
  stage: BakingStage;
  fermentationType: FermentationType;
  startTime: Date | null;
}

interface BakingSchedule {
  stage: BakingStage;
  title: string;
  estimatedTime: string;
  duration: string;
}

function calculateBakingSchedule(startTime: string, fermentationType: FermentationType): BakingSchedule[] {
  if (!startTime) return [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMinute)) return [];

  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);
  
  const schedule: BakingSchedule[] = [];
  let currentTime = new Date(start);

  const addStage = (stage: BakingStage, title: string, durationMinutes: number, isDuration: boolean = false) => {
    const formatTime = (date: Date) => {
      const today = new Date(start);
      const isNextDay = date.getDate() !== today.getDate();
      
      let h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      
      const timeStr = `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
      
      if (isNextDay) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];
        return `${timeStr} (${dayName})`;
      }
      
      return timeStr;
    };

    schedule.push({
      stage,
      title,
      estimatedTime: formatTime(currentTime),
      duration: isDuration ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : 'Active step'
    });

    currentTime = new Date(currentTime.getTime() + durationMinutes * 60000);
  };

  // Mix stages with minimal time estimates - always show these
  addStage('mix1', '🥄 Start Baking / First Dough Mix', 5);
  addStage('wait1', '⏰ First Rest', 30, true);
  addStage('mix2', '🥄 Second Dough Mix', 5);
  addStage('wait2', '⏰ Second Rest', 30, true);
  addStage('mix3', '🥄 Third Dough Mix', 5);
  addStage('wait3', '⏰ Third Rest', 30, true);
  addStage('mix4-shape', '✋ Final Mix & Shape', 10);

  // Fermentation choice stage - always show this
  addStage('fermentation-choice', '🤔 Choose Fermentation Method', 0);

  // Fermentation based on choice - only add if method is selected
  if (fermentationType === 'cold') {
    addStage('cold-fermentation', '❄️ Cold Fermentation', 16 * 60, true);
    addStage('completed', '🎉 Ready to Bake!', 0);
  } else if (fermentationType === 'room') {
    addStage('room-fermentation', '🌡️ Room Temperature Rise', 11 * 60, true);
    addStage('completed', '🎉 Ready to Bake!', 0);
  }

  return schedule;
}


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

function TimeDisplay({ title, startTime, endTime, totalTime, workTime, bgColor, textColor }: {
  title: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  workTime: string;
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
  const [activeTab, setActiveTab] = useState<'overtime' | 'bakery'>('overtime');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [bakingState, setBakingState] = useState<BakingState>({
    stage: 'not-started',
    fermentationType: null,
    startTime: null
  });
  const [bakingStartTime, setBakingStartTime] = useState('');
  
  const timeInfo = calculateTimes(start, end);
  const bakingSchedule = calculateBakingSchedule(bakingStartTime, bakingState.fermentationType);

  const getStageTitle = (stage: BakingStage): string => {

    if (stage === 'fermentation-choice' && bakingState.fermentationType) {
      return bakingState.fermentationType === 'cold' ? '❄️ Cold Fermentation' : '🌡️ Room Temperature Rise';
    }
    
    switch (stage) {
      case 'not-started': return '🚀 Ready to Start';
      case 'mix1': return '🥄 First Dough Mix';
      case 'wait1': return '⏰ First Rest';
      case 'mix2': return '🥄 Second Dough Mix';
      case 'wait2': return '⏰ Second Rest';
      case 'mix3': return '🥄 Third Dough Mix';
      case 'wait3': return '⏰ Third Rest';
      case 'mix4-shape': return '✋ Final Mix & Shape';
      case 'fermentation-choice': return '🤔 Choose Fermentation';
      case 'cold-fermentation': return '❄️ Cold Fermentation';
      case 'room-fermentation': return '🌡️ Room Temperature Rise';
      case 'completed': return '🎉 Ready to Bake!';
      default: return 'Unknown Stage';
    }
  };

  const handleNextStage = () => {
    const nextStageMap: Record<BakingStage, BakingStage> = {
      'not-started': 'mix1',
      'mix1': 'wait1',
      'wait1': 'mix2',
      'mix2': 'wait2',
      'wait2': 'mix3',
      'mix3': 'wait3',
      'wait3': 'mix4-shape',
      'mix4-shape': 'fermentation-choice',
      'fermentation-choice': bakingState.fermentationType === 'cold' ? 'cold-fermentation' : 'room-fermentation',
      'cold-fermentation': 'completed',
      'room-fermentation': 'completed',
      'completed': 'completed'
    };

    if (bakingState.stage === 'fermentation-choice' && !bakingState.fermentationType) {
      return;
    }

    const nextStage = nextStageMap[bakingState.stage];
    setBakingState({
      ...bakingState,
      stage: nextStage,
      startTime: bakingState.startTime || (nextStage === 'mix1' ? new Date() : null)
    });
  };

  const handleResetBaking = () => {
    setBakingState({
      stage: 'not-started',
      fermentationType: null,
      startTime: null
    });
  };

  const handleFermentationChoice = (type: FermentationType) => {
    const nextStage = type === 'cold' ? 'cold-fermentation' : 'room-fermentation';
    setBakingState({
      ...bakingState,
      fermentationType: type,
      stage: bakingState.stage === 'fermentation-choice' ? nextStage : bakingState.stage
    });
  };

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
          src={activeTab === 'overtime' ? "/assets/bear-cat-scrubs.png" : "/assets/bear-cat-bakery.png"}
          alt={activeTab === 'overtime' ? "Bear and cat in scrubs" : "Bear and cat baking"}
          className="w-full max-h-56 object-contain rounded-2xl mb-6 shadow-md"
        />

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('overtime')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'overtime'
                ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Overtime Clock
          </button>
          <button
            onClick={() => setActiveTab('bakery')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'bakery'
                ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Bakery Clock
          </button>
        </div>

        <h1
          className="
            text-2xl sm:text-3xl font-extrabold mb-3 text-center 
            text-indigo-700 dark:text-indigo-300
          "
        >
          {activeTab === 'overtime' ? 'Overtime Calculator' : 'Bakery Timer'}
        </h1>

        <p
          className="
            text-center text-gray-600 dark:text-gray-300 italic 
            mb-6 text-sm sm:text-base
          "
        >
          {activeTab === 'overtime' 
            ? 'Your bear and fluffy assistant are here to help!' 
            : 'Track your bread baking times with precision!'
          }
        </p>

        {activeTab === 'overtime' ? (
          <>
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
                  bg-blue-50 dark:bg-purple-950/30 p-4 rounded-2xl gap-2
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
          </>
        ) : (
            <div className="space-y-6">
            {/* Start Time Input */}
            <div className="bg-green-50 dark:bg-green-500/30 p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <span className="text-gray-800 dark:text-gray-100 font-semibold">
                  Baking Start Time
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={bakingStartTime}
                    onChange={e => setBakingStartTime(e.target.value)}
                    className="
                      flex-shrink-0 w-full sm:w-40 px-4 py-3 rounded-xl 
                      bg-white dark:bg-gray-700 border border-green-200 dark:border-green-900 
                      text-lg text-gray-900 dark:text-gray-100 shadow-sm 
                      focus:ring-2 focus:ring-green-500 focus:border-transparent
                    "
                  />
                  {bakingStartTime && (
                    <button
                      onClick={() => setBakingStartTime('')}
                      className="
                        w-8 h-8 flex items-center justify-center rounded-full 
                        bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                        hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors
                      "
                      aria-label="Clear baking start time"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fermentation Choice */}
            <div className="bg-blue-50 dark:bg-blue-700/20 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 text-center">
                Choose Fermentation Method
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleFermentationChoice('cold')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bakingState.fermentationType === 'cold'
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    Cold Fermentation
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    16 hours in refrigerator
                  </div>
                </button>
                <button
                  onClick={() => handleFermentationChoice('room')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bakingState.fermentationType === 'room'
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    Room Temperature
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    10-12 hours at room temp
                  </div>
                </button>
              </div>
            </div>

            {/* Baking Schedule */}
            {bakingStartTime && bakingSchedule.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 text-center">
                  Baking Schedule
                </h3>
                <div className="space-y-3">
                  {(() => {
                    // Filter and number visible steps
                    const visibleSteps = bakingSchedule.filter((step) => {
                      const isAfterFermentationChoice = ['cold-fermentation', 'room-fermentation', 'completed'].includes(step.stage);
                      const showStep = !isAfterFermentationChoice || bakingState.fermentationType !== null;
                      const isSelectedFermentationChoice = step.stage === 'fermentation-choice' && bakingState.fermentationType !== null;
                      return showStep && !isSelectedFermentationChoice;
                    });
                    
                    return visibleSteps.map((step, visibleIndex) => {
                      const isPendingFermentation = step.stage === 'fermentation-choice' && !bakingState.fermentationType;
                      
                      return (
                        <div
                          key={step.stage}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                            bakingState.stage === step.stage
                              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                              : isPendingFermentation
                              ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              bakingState.stage === step.stage
                                ? 'bg-blue-500 text-white'
                                : isPendingFermentation
                                ? 'bg-orange-400 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                              {isPendingFermentation ? '?' : visibleIndex + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">
                                {step.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {isPendingFermentation ? 'Select method above' : step.duration}
                              </div>
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            isPendingFermentation
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {isPendingFermentation ? 'TBD' : step.estimatedTime}
                          </div>
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Show remaining steps hint when fermentation method is not selected */}
                  {!bakingState.fermentationType && (
                    <div className="text-center p-4 border border-dashed border-orange-300 dark:border-orange-600 rounded-xl bg-orange-50 dark:bg-orange-950/10">
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        Select a fermentation method above to see remaining steps
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage Controls */}
            {bakingStartTime ? (
              <div className="space-y-4">
                {bakingState.stage !== 'not-started' && (
                  <div className="text-center bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl">
                    <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">
                      Current Stage: {getStageTitle(bakingState.stage)}
                    </h3>
                  </div>
                )}
                
                <div className="flex gap-3 justify-center">
                  {bakingState.stage === 'fermentation-choice' && bakingState.fermentationType === null && (
                    <div className="text-center text-orange-600 dark:text-orange-400 font-medium">
                      Please select a fermentation method above to continue
                    </div>
                  )}
                  
                  {bakingState.stage === 'fermentation-choice' && bakingState.fermentationType !== null && (
                    <button
                      onClick={handleNextStage}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Start {bakingState.fermentationType === 'cold' ? 'Cold Fermentation' : 'Room Temperature Rise'}
                    </button>
                  )}
                  
                  {bakingState.stage !== 'not-started' && bakingState.stage !== 'completed' && bakingState.stage !== 'fermentation-choice' && (
                    <button
                      onClick={handleNextStage}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Next Stage
                    </button>
                  )}
                  
                  {bakingState.stage === 'not-started' && (
                    <button
                      onClick={handleNextStage}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Start First Mix
                    </button>
                  )}

                  <button
                    onClick={handleResetBaking}
                    className="px-4 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 mt-8 p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="text-lg font-medium mb-2">Set Your Baking Schedule</div>
                <div className="text-sm">Choose a start time to begin your baking timeline.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
