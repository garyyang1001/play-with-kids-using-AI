/**
 * Progress Visualization
 * 進度可視化組件
 */

'use client';

import React, { useState } from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface ProgressVisualizationProps {
  visualProgress: LearningReport['visualProgress'];
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  visualProgress
}) => {
  const [activeChart, setActiveChart] = useState<'quality' | 'skills' | 'activity'>('quality');

  const charts = [
    { id: 'quality', label: '品質趨勢', icon: '📈' },
    { id: 'skills', label: '技能雷達', icon: '🎯' },
    { id: 'activity', label: '學習活躍度', icon: '📅' }
  ];

  // 生成品質趨勢圖
  const renderQualityTrend = () => {
    const data = visualProgress.qualityTrendData;
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <div>開始創作後將顯示品質趨勢</div>
        </div>
      );
    }

    const maxScore = Math.max(...data.map(d => d.score));
    const minScore = Math.min(...data.map(d => d.score));
    const range = maxScore - minScore || 1;

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>品質分數趨勢</span>
          <span>最高: {maxScore}分</span>
        </div>
        
        <div className="relative h-64 bg-gray-50 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* 網格線 */}
            {[0, 25, 50, 75, 100].map((value) => (
              <g key={value}>
                <line
                  x1="40"
                  y1={160 - (value * 1.2)}
                  x2="380"
                  y2={160 - (value * 1.2)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y={165 - (value * 1.2)}
                  className="text-xs fill-gray-500"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            ))}
            
            {/* 趨勢線 */}
            <polyline
              points={data.map((point, index) => {
                const x = 40 + (index * (340 / (data.length - 1 || 1)));
                const y = 160 - (point.score * 1.2);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              className="drop-shadow-sm"
            />
            
            {/* 數據點 */}
            {data.map((point, index) => {
              const x = 40 + (index * (340 / (data.length - 1 || 1)));
              const y = 160 - (point.score * 1.2);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="drop-shadow-sm"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    className="text-xs fill-gray-700 font-medium"
                    textAnchor="middle"
                  >
                    {point.score}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  // 生成技能雷達圖
  const renderSkillRadar = () => {
    const data = visualProgress.skillRadarData;
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🎯</div>
          <div>學習過程中將顯示技能發展</div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-80 h-80">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {/* 背景網格 */}
            {[20, 40, 60, 80, 100].map((radius) => (
              <circle
                key={radius}
                cx="150"
                cy="150"
                r={radius * 1.2}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* 軸線 */}
            {data.map((_, index) => {
              const angle = (index * (360 / data.length) - 90) * (Math.PI / 180);
              const x2 = 150 + Math.cos(angle) * 120;
              const y2 = 150 + Math.sin(angle) * 120;
              return (
                <line
                  key={index}
                  x1="150"
                  y1="150"
                  x2={x2}
                  y2={y2}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* 技能數據多邊形 */}
            <polygon
              points={data.map((skill, index) => {
                const angle = (index * (360 / data.length) - 90) * (Math.PI / 180);
                const distance = (skill.value / 100) * 120;
                const x = 150 + Math.cos(angle) * distance;
                const y = 150 + Math.sin(angle) * distance;
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* 技能點 */}
            {data.map((skill, index) => {
              const angle = (index * (360 / data.length) - 90) * (Math.PI / 180);
              const distance = (skill.value / 100) * 120;
              const x = 150 + Math.cos(angle) * distance;
              const y = 150 + Math.sin(angle) * distance;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
          
          {/* 技能標籤 */}
          {data.map((skill, index) => {
            const angle = (index * (360 / data.length) - 90) * (Math.PI / 180);
            const labelDistance = 140;
            const x = 150 + Math.cos(angle) * labelDistance;
            const y = 150 + Math.sin(angle) * labelDistance;
            
            const skillNames: Record<string, string> = {
              clarity: '清晰表達',
              detail: '豐富細節',
              emotion: '情感描述',
              visual: '視覺想像',
              structure: '結構組織'
            };
            
            return (
              <div
                key={index}
                className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(x / 300) * 100}%`,
                  top: `${(y / 300) * 100}%`
                }}
              >
                <div className="text-center bg-white rounded px-2 py-1 shadow-sm">
                  <div>{skillNames[skill.skill] || skill.skill}</div>
                  <div className="text-blue-600 font-bold">{skill.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 生成活躍度圖
  const renderActivityChart = () => {
    const data = visualProgress.sessionActivityData;
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <div>開始學習後將顯示活躍度</div>
        </div>
      );
    }

    const maxSessions = Math.max(...data.map(d => d.sessions));

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>每日學習次數</span>
          <span>最高: {maxSessions}次/日</span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {data.slice(-21).map((day, index) => { // 顯示最近21天
            const height = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
            const intensity = Math.min(day.sessions / 3, 1); // 最大3次為滿強度
            
            return (
              <div key={index} className="text-center">
                <div className="h-24 flex items-end justify-center mb-1">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      day.sessions === 0 
                        ? 'bg-gray-200' 
                        : `bg-blue-${Math.floor(intensity * 5) + 1}00`
                    }`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.sessions}次學習`}
                  >
                    {day.sessions > 0 && (
                      <div className="text-xs text-white font-bold pt-1">
                        {day.sessions}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(day.date).getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-xs text-gray-500">
          最近三週的學習活躍度
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
        📊 學習進度可視化
      </h4>

      {/* 圖表選擇器 */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          {charts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id as any)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeChart === chart.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{chart.icon}</span>
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      {/* 圖表內容 */}
      <div className="min-h-[300px]">
        {activeChart === 'quality' && renderQualityTrend()}
        {activeChart === 'skills' && renderSkillRadar()}
        {activeChart === 'activity' && renderActivityChart()}
      </div>

      {/* 圖表說明 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          {activeChart === 'quality' && (
            <div>
              <strong>品質趨勢：</strong>追蹤每次創作的Prompt品質分數變化，
              上升趨勢表示AI溝通技能在持續進步。
            </div>
          )}
          {activeChart === 'skills' && (
            <div>
              <strong>技能雷達：</strong>顯示五個核心AI溝通技能的發展水平，
              越向外表示該技能越熟練。
            </div>
          )}
          {activeChart === 'activity' && (
            <div>
              <strong>學習活躍度：</strong>記錄每日的學習頻率，
              規律的學習習慣有助於技能的穩定提升。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};