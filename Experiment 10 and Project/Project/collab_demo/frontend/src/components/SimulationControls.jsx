import React, { useContext, useState } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/controls.css';

export default function SimulationControls() {
  const { state, dispatch, sendMessage } = useContext(CollabContext);
  const { simulationStatus } = state;
  const [speed, setSpeed] = useState(1.0);
  const [mode, setMode] = useState('v2');

  const handleStart = () => {
    dispatch({ type: 'SET_SIMULATION_STATUS', payload: mode });
    sendMessage({ command: `start_${mode}`, speed });
  };

  const handleStop = () => {
    dispatch({ type: 'SET_SIMULATION_STATUS', payload: 'stopped' });
    sendMessage({ command: 'stop' });
  };

  const handleReset = () => {
    dispatch({ type: 'SET_SIMULATION_STATUS', payload: 'idle' });
    sendMessage({ command: 'reset' });
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (simulationStatus === 'v2') {
      sendMessage({ command: 'set_speed', speed: newSpeed });
    }
  };

  return (
    <div className="panel controls-panel">
      <div className="panel-content controls-content">
        <div className="control-group">
          <select 
            className="mode-select" 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            disabled={simulationStatus === 'v1' || simulationStatus === 'v2'}
          >
            <option value="v1">V1: Static Demo</option>
            <option value="v2">V2: Continuous Sim</option>
          </select>
          
          {(simulationStatus === 'v1' || simulationStatus === 'v2') ? (
            <button className="btn btn-stop" onClick={handleStop}>⏸ Stop</button>
          ) : (
            <button className="btn btn-start" onClick={handleStart}>▶️ Start</button>
          )}
          
          <button className="btn btn-reset" onClick={handleReset}>🔄 Reset</button>
        </div>
        
        <div className="control-group speed-group">
          <label>Speed: {speed}x</label>
          <input 
            type="range" 
            min="0.5" max="3.0" step="0.1" 
            value={speed} 
            onChange={handleSpeedChange} 
            disabled={simulationStatus === 'v1'}
          />
        </div>
      </div>
    </div>
  );
}
