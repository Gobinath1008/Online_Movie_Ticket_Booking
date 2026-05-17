'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_SLOTS = [
  { id: 'slot-1', start: '08:00', end: '10:00', label: '8 AM - 10 AM', duration: 2 },
  { id: 'slot-2', start: '10:00', end: '12:00', label: '10 AM - 12 PM', duration: 2 },
  { id: 'slot-3', start: '12:00', end: '14:00', label: '12 PM - 2 PM', duration: 2 },
  { id: 'slot-4', start: '14:00', end: '16:00', label: '2 PM - 4 PM', duration: 2 },
  { id: 'slot-5', start: '16:00', end: '18:00', label: '4 PM - 6 PM', duration: 2 },
  { id: 'slot-6', start: '18:00', end: '20:00', label: '6 PM - 8 PM', duration: 2 },
  { id: 'slot-7', start: '20:00', end: '22:00', label: '8 PM - 10 PM', duration: 2 },
];

export default function TimeSlotPicker({
  slots = DEFAULT_SLOTS,
  selectedSlots = [],
  onChange,
  maxSlots = 3,
  disabled = false,
  showCustomTime = true,
  pricePerHour = 0,
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState('08:00');
  const [customEnd, setCustomEnd] = useState('10:00');
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    setSelection(selectedSlots);
  }, [selectedSlots]);

  const handleSlotToggle = (slot) => {
    if (disabled) return;

    const isSelected = selection.some(s => s.id === slot.id);
    let newSelection;

    if (isSelected) {
      newSelection = selection.filter(s => s.id !== slot.id);
    } else {
      if (selection.length >= maxSlots) {
        alert(`You can select maximum ${maxSlots} slots`);
        return;
      }
      newSelection = [...selection, slot];
    }

    setSelection(newSelection);
    if (onChange) onChange(newSelection);
  };

  const handleCustomTime = () => {
    if (disabled) return;

    // Validate custom time
    const startMins = parseInt(customStart.split(':')[0]) * 60 + parseInt(customStart.split(':')[1]);
    const endMins = parseInt(customEnd.split(':')[0]) * 60 + parseInt(customEnd.split(':')[1]);

    if (endMins <= startMins) {
      alert('End time must be after start time');
      return;
    }

    const duration = (endMins - startMins) / 60;
    const customSlot = {
      id: 'custom',
      start: customStart,
      end: customEnd,
      label: `${formatTime(customStart)} - ${formatTime(customEnd)}`,
      duration,
      isCustom: true,
    };

    setSelection([customSlot]);
    if (onChange) onChange([customSlot]);
    setCustomMode(false);
  };

  const formatTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m || '00'} ${ampm}`;
  };

  const calculateTotal = () => {
    const totalHours = selection.reduce((sum, slot) => sum + (slot.duration || 0), 0);
    return totalHours * pricePerHour;
  };

  const isSlotAvailable = (slot) => {
    return slot.available !== false;
  };

  // Generate time options
  const timeOptions = [];
  for (let h = 6; h <= 22; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🕐</span> Select Time Slots
          </h3>
          <div className="text-indigo-100 text-sm">
            {selection.length} / {maxSlots} slots selected
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Predefined Slots */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-3">Available Slots</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selection.some(s => s.id === slot.id);
              const available = isSlotAvailable(slot);

              return (
                <motion.button
                  key={slot.id}
                  onClick={() => handleSlotToggle(slot)}
                  disabled={disabled || !available}
                  whileHover={{ scale: available ? 1.02 : 1 }}
                  whileTap={{ scale: available ? 0.98 : 1 }}
                  className={`p-3 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : available
                      ? 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                      : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                    {slot.label}
                  </div>
                  <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : available ? 'text-green-600' : 'text-red-500'}`}>
                    {isSelected ? '✓ Selected' : available ? `₹${pricePerHour * slot.duration}` : '✕ Unavailable'}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Time Toggle */}
        {showCustomTime && !disabled && (
          <div className="mb-4">
            {!customMode ? (
              <button
                onClick={() => setCustomMode(true)}
                className="w-full py-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <span>➕</span> Select Custom Time Range
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-indigo-50 rounded-xl p-4"
              >
                <h4 className="font-semibold text-indigo-800 mb-3">Custom Time Range</h4>
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                    <select
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {timeOptions.map(t => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Time</label>
                    <select
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {timeOptions.filter(t => t > customStart).map(t => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomTime}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setCustomMode(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Selected Slots Summary */}
        <AnimatePresence>
          {selection.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 rounded-xl p-4 mt-4"
            >
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span> Selected Time Slots
              </h4>
              <div className="space-y-2">
                {selection.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                    <span className="text-gray-700 font-medium">{slot.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{slot.duration} hours</span>
                      {pricePerHour > 0 && (
                        <span className="text-green-600 font-semibold">₹{pricePerHour * slot.duration}</span>
                      )}
                      <button
                        onClick={() => handleSlotToggle(slot)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={disabled}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {pricePerHour > 0 && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-green-200">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">₹{calculateTotal()}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {selection.length === 0 && !disabled && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">🕐</span>
            <p>Select a time slot to continue</p>
          </div>
        )}
      </div>

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <p className="text-gray-500 font-semibold">Time slots unavailable</p>
        </div>
      )}
    </motion.div>
  );
}