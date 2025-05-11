import React from "react";
import { fetchRealieComps } from '../services/api';

const ComparableProperties = ({ property }) => {
  const [realieComps, setRealieComps] = React.useState(null);
  const [realieCompsError, setRealieCompsError] = React.useState('');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-teal-700 text-white p-3 text-center font-bold text-lg">
        Comparative Market Analysis
      </div>
      <div className="p-4">
        {/* Realie Comps Test Button and Result */}
        <div className="my-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={async () => {
              setRealieCompsError('');
              setRealieComps(null);
              try {
                const result = await fetchRealieComps(property?.formattedAddress || '');
                setRealieComps(result);
                console.log('Realie Comps result:', result);
              } catch (err) {
                setRealieCompsError(err.message);
              }
            }}
            disabled={!property?.formattedAddress}
          >
            Test Realie Comps
          </button>
          {realieCompsError && <div className="text-red-600 mt-2">{realieCompsError}</div>}
          {realieComps && (
            <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(realieComps, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparableProperties;

