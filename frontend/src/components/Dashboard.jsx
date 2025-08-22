import { useState, useEffect } from 'react';
import TrialTable from './TrialTable.jsx';
import { connectWebSocket } from '../lib/ws.js';
import { PlusCircleIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const Dashboard = ({ champion, telemetry, setTelemetry }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [runBudget, setRunBudget] = useState(10);
  const [datasetId, setDatasetId] = useState(null);
  const [runStatus, setRunStatus] = useState('idle');
  const [currentRunId, setCurrentRunId] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket when the component mounts.
    const ws = connectWebSocket(message => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'trial_update') {
        setTelemetry(prev => [...prev, parsedMessage.data]);
      } else {
        // Handle global run status updates
        setRunStatus(parsedMessage.status);
        setCurrentRunId(parsedMessage.run_id);
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  // Handler for file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handler for target column input
  const handleTargetChange = (event) => {
    setTargetColumn(event.target.value);
  };

  // Handler for run budget input
  const handleBudgetChange = (event) => {
    setRunBudget(Number(event.target.value));
  };

  const handleUploadAndRun = async () => {
    if (!selectedFile || !targetColumn) {
      alert('Please select a file and enter a target column.');
      return;
    }

    setRunStatus('uploading');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Step 1: Upload the dataset
      const uploadResponse = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed.');
      }
      const uploadData = await uploadResponse.json();
      setDatasetId(uploadData.dataset_id);

      // Step 2: Start the model evolution run
      setRunStatus('starting_run');
      const runResponse = await fetch('/api/runs/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: uploadData.dataset_id,
          target: targetColumn,
          run_budget: runBudget,
        }),
      });

      if (!runResponse.ok) {
        throw new Error('Failed to start run.');
      }

      setRunStatus('running');
      // The WebSocket connection will now provide real-time updates
    } catch (error) {
      console.error('An error occurred:', error);
      alert(`Error: ${error.message}`);
      setRunStatus('failed');
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'idle': return 'Ready to evolve.';
      case 'uploading': return 'Uploading dataset...';
      case 'starting_run': return 'Initializing evolutionary run...';
      case 'running': return 'Evolving models...';
      case 'completed': return 'Run completed successfully!';
      case 'failed': return 'Run failed. Check the console for errors.';
      default: return 'Waiting for status...';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Control Panel */}
      <div className="lg:col-span-1 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-white">
          <BoltIcon className="h-6 w-6 text-yellow-400" />
          Control Panel
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400">
            1. Upload CSV Dataset
          </label>
          <div className="mt-2 flex items-center">
            <label className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer transition-colors shadow-lg text-sm font-semibold">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {selectedFile ? selectedFile.name : 'Choose File'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv"
              />
            </label>
            {selectedFile && (
              <span className="ml-3 text-sm text-gray-400 truncate">
                {selectedFile.name}
              </span>
            )}
          </div>
        </div>

        {/* Target Column */}
        <div className="mb-6">
          <label htmlFor="targetColumn" className="block text-sm font-medium text-gray-400">
            2. Enter Target Column
          </label>
          <input
            type="text"
            id="targetColumn"
            value={targetColumn}
            onChange={handleTargetChange}
            placeholder="e.g., target_label"
            className="mt-2 block w-full rounded-xl border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
          />
        </div>

        {/* Run Budget */}
        <div className="mb-6">
          <label htmlFor="runBudget" className="block text-sm font-medium text-gray-400">
            3. Evolutionary Budget (Trials)
          </label>
          <input
            type="number"
            id="runBudget"
            value={runBudget}
            onChange={handleBudgetChange}
            min="1"
            className="mt-2 block w-full rounded-xl border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500 shadow-sm"
          />
        </div>

        {/* Start Run Button */}
        <button
          onClick={handleUploadAndRun}
          disabled={!selectedFile || !targetColumn || runStatus === 'running'}
          className={`w-full flex justify-center py-3 px-4 rounded-xl font-semibold transition-all ${
            runStatus === 'running'
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          }`}
        >
          {runStatus === 'running' ? 'Running...' : 'Start Evolution'}
        </button>

        {/* Status Display */}
        <div className="mt-6 text-center text-sm font-medium text-gray-400">
          Status: <span className="font-semibold text-white">{getStatusMessage(runStatus)}</span>
          {currentRunId && (
            <p className="mt-2 text-xs text-gray-500 truncate">Run ID: {currentRunId}</p>
          )}
        </div>
      </div>

      {/* Live Telemetry and Champion Model */}
      <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-white">
          <ChartBarIcon className="h-6 w-6 text-green-400" />
          Live Telemetry
        </h2>
        
        {runStatus === 'running' ? (
          <TrialTable trials={telemetry} />
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>Evolving models... Please wait.</p>
          </div>
        )}
        
        {/* Champion Model Display */}
        {champion && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Current Champion Model
            </h3>
            <div className="bg-gray-700 p-6 rounded-xl">
              <p className="text-lg font-bold text-green-400 mb-2">
                Model: <span className="font-normal text-white">{champion.genome.model}</span>
              </p>
              <p className="text-lg font-bold text-green-400 mb-2">
                Best Score (AUC): <span className="font-normal text-white">{champion.metrics.roc_auc.toFixed(4)}</span>
              </p>
              <div className="text-sm text-gray-400 mt-4">
                <h4 className="font-semibold">Parameters:</h4>
                <pre className="mt-2 p-2 bg-gray-800 rounded-lg overflow-x-auto text-xs text-gray-300">
                  {JSON.stringify(champion.genome.params, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
