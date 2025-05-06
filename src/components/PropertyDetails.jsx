import React from "react";

const MARKETS = ["TAMPA", "ORLANDO", "MIAMI", "JACKSONVILLE", "FT MYERS"];

const PropertyDetails = ({ property, onPropertyChange }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-teal-700 text-white p-3 text-center font-bold text-lg">
        Property Details
      </div>
      <div className="p-4">
        {/* Address Row */}
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3 bg-teal-700 text-white p-2 text-center font-medium rounded-l">
              Address
            </div>
            <div className="col-span-9">
              <input 
                type="text"
                value={property.address}
                onChange={(e) => onPropertyChange("address", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* State, Beds, Baths, Year Row */}
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 bg-teal-700 text-white p-2 text-center font-medium rounded-l">
              State
            </div>
            <div className="col-span-1">
              <input 
                type="text"
                value={property.state}
                onChange={(e) => onPropertyChange("state", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            
            <div className="col-span-1 bg-teal-700 text-white p-2 text-center font-medium">
              Beds
            </div>
            <div className="col-span-1">
              <input 
                type="number"
                value={property.beds}
                onChange={(e) => onPropertyChange("beds", parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            
            <div className="col-span-1 bg-teal-700 text-white p-2 text-center font-medium">
              Baths
            </div>
            <div className="col-span-1">
              <input 
                type="number"
                value={property.baths}
                onChange={(e) => onPropertyChange("baths", parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            
            <div className="col-span-1 bg-teal-700 text-white p-2 text-center font-medium">
              Year
            </div>
            <div className="col-span-2">
              <input 
                type="number"
                value={property.yearBuilt}
                onChange={(e) => onPropertyChange("yearBuilt", parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            <div className="col-span-2 text-red-500 text-right">← INPUT</div>
          </div>
        </div>
        
        {/* Market Row */}
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3 bg-teal-700 text-white p-2 text-center font-medium rounded-l">
              Market
            </div>
            <div className="col-span-7">
              <select 
                value={property.market}
                onChange={(e) => onPropertyChange("market", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              >
                {MARKETS.map(market => (
                  <option key={market} value={market}>{market}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 text-red-500 text-right">← INPUT</div>
          </div>
        </div>
        
        {/* House sqft Row */}
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3 bg-teal-700 text-white p-2 text-center font-medium rounded-l">
              House sqft
            </div>
            <div className="col-span-7">
              <input 
                type="number"
                value={property.sqft}
                onChange={(e) => onPropertyChange("sqft", parseInt(e.target.value))}
                className="w-full p-2 bo