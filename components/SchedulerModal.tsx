import React, { useState } from 'react';
import { X, Clock, BellRing, Check } from 'lucide-react';
import { ScheduleConfig } from '../types';

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ScheduleConfig) => void;
  currentConfig: ScheduleConfig;
}

export const SchedulerModal: React.FC<SchedulerModalProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [time, setTime] = useState(currentConfig.time);
  const [selectedDays, setSelectedDays] = useState<string[]>(currentConfig.days);

  if (!isOpen) return null;

  const days = [
    { id: 'Mon', label: '월' },
    { id: 'Tue', label: '화' },
    { id: 'Wed', label: '수' },
    { id: 'Thu', label: '목' },
    { id: 'Fri', label: '금' },
  ];

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = () => {
    onSave({
      isEnabled: true,
      time,
      days: selectedDays
    });
    onClose();
  };

  const handleDisable = () => {
    onSave({
      ...currentConfig,
      isEnabled: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <BellRing className="h-10 w-10 mx-auto mb-3 text-blue-100" />
          <h3 className="text-xl font-bold">국내 증시 모닝 브리핑</h3>
          <p className="text-blue-100 text-sm mt-1">개장 전 글로벌 이슈와 투자 전략을 확인하세요.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              수신 시간 설정
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-3 text-lg font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              * 정규장 시작 전(08:30) 브리핑을 권장합니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">요일 선택</label>
            <div className="flex justify-between gap-2">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedDays.includes(day.id)
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={handleDisable}
            className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
          >
            알림 끄기
          </button>
          <button
            onClick={handleSave}
            className="flex-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            스케줄 저장
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};