import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const TrialTable = ({ trials }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-700">
            <TableHead className="w-[100px]">Trial ID</TableHead>
            <TableHead>Model Type</TableHead>
            <TableHead>Score (AUC)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Parameters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trials.map((trial) => (
            <TableRow key={trial.trial_id} className="border-gray-700">
              <TableCell className="font-medium">{trial.trial_id}</TableCell>
              <TableCell>{trial.model_type}</TableCell>
              <TableCell className={trial.score > 0.8 ? "text-green-400 font-semibold" : ""}>
                {trial.score.toFixed(4)}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  trial.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trial.status}
                </span>
              </TableCell>
              <TableCell className="text-xs">
                {JSON.stringify(trial.params, null, 2).replace(/[{}"\s]/g, '')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TrialTable;
