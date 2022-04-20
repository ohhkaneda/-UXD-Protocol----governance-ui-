import React from 'react';
import AssetsList from './AssetsList';

const AssetsCompactWrapper = () => {
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Assets</h3>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        <AssetsList panelView />
      </div>
    </div>
  );
};

export default AssetsCompactWrapper;
