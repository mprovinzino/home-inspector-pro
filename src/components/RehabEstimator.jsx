import React, { useState, useEffect } from "react";
import { rehabItemsData } from "../data/rehabItems";
import { calculateQuickEstimate } from "../utils/calculations";
import { formatCurrency } from "../utils/formatters";

const RehabEstimator = ({ 
  property, 
  estimateMode, 
  setEstimateMode, 
  rehabLevel, 
  setRehabLevel,
  totalRehabCost,
  setTotalRehabCost,
  categoryTotals,
  setCategoryTotals
}) => {
  // Create an initial state for the rehab items with quantities and selection status
  const initialRehabItems = rehabItemsData.map(item => ({
    ...item,
    quantity: 0,
    isSelected: false
  }));

  // Group items by category for easier access
  const groupedItems = {};
  rehabItemsData.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });
  
  // Set initial state for rehab items
  const [rehabItems, setRehabItems] = useState(initialRehabItems);
  const [activeCategory, setActiveCategory] = useState("General");
  
  // Function to update selected status of an item
  const toggleItemSelection = (id) => {
    setRehabItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };
  
  // Function to update quantity of an item
  const updateItemQuantity = (id, quantity) => {
    setRehabItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };
  
  // Calculate total rehab cost
  const calculateTotalRehabCost = () => {
    return rehabItems
      .filter(item => item.isSelected)
      .reduce((total, item) => {
        let itemCost = 0;
        if (item.perSqft) {
          itemCost = item.unitCost * (item.quantity > 0 ? item.quantity : property.sqft);
        } else {
          itemCost = item.unitCost * (item.quantity > 0 ? item.quantity : 1);
        }
        return total + itemCost;
      }, 0);
  };
  
  // Calculate category totals
  const calculateCategoryTotals = () => {
    const totals = {};
    rehabItems
      .filter(item => item.isSelected)
      .forEach(item => {
        if (!totals[item.category]) {
          totals[item.category] = 0;
        }
        let itemCost = 0;
        if (item.perSqft) {
          itemCost = item.unitCost * (item.quantity > 0 ? item.quantity : property.sqft);
        } else {
          itemCost = item.unitCost * (item.quantity > 0 ? item.quantity : 1);
        }
        totals[item.category] += itemCost;
      });
    return totals;
  };
  
  // Update total rehab cost when rehab items or property sqft changes
  useEffect(() => {
    if (estimateMode === "detailed") {
      const total = calculateTotalRehabCost();
      setTotalRehabCost(total);
      setCategoryTotals(calculateCategoryTotals());
    } else {
      const quickEstimateResult = calculateQuickEstimate(property, rehabLevel);
      setTotalRehabCost(quickEstimateResult.cost);
    }
  }, [rehabItems, property.sqft, estimateMode, rehabLevel, property.baths, property.yearBuilt]);

  // Get categories from grouped items
  const categories = Object.keys(groupedItems);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-teal-700 text-white p-3 text-center font-bold text-lg">
        Rehab Cost Estimator
      </div>
      
      {/* Estimate Mode Toggle */}
      <div className="flex justify-center p-4 border-b border-gray-300">
        <div className="flex p-1 bg-gray-200 rounded-lg">
          <button
            className={`px-4 py-2 rounded-lg ${estimateMode === "quick" ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setEstimateMode("quick")}
          >
            Quick Estimate
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${estimateMode === "detailed" ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setEstimateMode("detailed")}
          >
            Detailed Estimate
          </button>
        </div>
      </div>
      
      {estimateMode === "quick" ? (
        // Quick Estimate Section
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Rehab Level:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                className={`border p-4 rounded-lg cursor-pointer ${rehabLevel === "light" ? 'border-teal-700 bg-teal-50' : 'border-gray-300'}`}
                onClick={() => setRehabLevel("light")}
              >
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    checked={rehabLevel === "light"} 
                    onChange={() => setRehabLevel("light")} 
                    className="mr-2"
                  />
                  <h4 className="font-bold text-lg">Light Rehab</h4>
                </div>
                <p className="text-sm text-gray-600">Basic cosmetic updates including paint, flooring, light fixtures, and minor repairs.</p>
                <p className="mt-2 text-sm font-medium">Base rate: $15/sqft</p>
              </div>
              
              <div 
                className={`border p-4 rounded-lg cursor-pointer ${rehabLevel === "mid" ? 'border-teal-700 bg-teal-50' : 'border-gray-300'}`}
                onClick={() => setRehabLevel("mid")}
              >
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    checked={rehabLevel === "mid"} 
                    onChange={() => setRehabLevel("mid")} 
                    className="mr-2"
                  />
                  <h4 className="font-bold text-lg">Medium Rehab</h4>
                </div>
                <p className="text-sm text-gray-600">Kitchen refresh, bathroom updates, partial system repairs/updates, and cosmetic improvements.</p>
                <p className="mt-2 text-sm font-medium">Base rate: $30/sqft</p>
              </div>
              
              <div 
                className={`border p-4 rounded-lg cursor-pointer ${rehabLevel === "full" ? 'border-teal-700 bg-teal-50' : 'border-gray-300'}`}
                onClick={() => setRehabLevel("full")}
              >
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    checked={rehabLevel === "full"} 
                    onChange={() => setRehabLevel("full")} 
                    className="mr-2"
                  />
                  <h4 className="font-bold text-lg">Full Rehab</h4>
                </div>
                <p className="text-sm text-gray-600">Complete renovation including kitchen, bathrooms, all systems (electrical, plumbing, HVAC), and full cosmetic renovation.</p>
                <p className="mt-2 text-sm font-medium">Base rate: $50/sqft</p>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Estimated Rehab Cost:</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Based on {property.sqft} sqft, {property.beds} beds, {property.baths} baths, built in {property.yearBuilt}</p>
                  <p className="mt-1 text-gray-600">
                    <strong>Finish Quality:</strong> {calculateQuickEstimate(property, rehabLevel).arvTier} 
                    (based on ARV of {formatCurrency(property.estARV)})
                  </p>
                  <p className="mt-1 text-gray-600">
                    <strong>Adjusted Rate:</strong> ${calculateQuickEstimate(property, rehabLevel).adjustedRate}/sqft
                  </p>
                  <p className="mt-2 text-sm">Notes: 
                    <ul className="list-disc pl-5 text-sm">
                      <li>Older homes (pre-1980) include a 10% premium for potential system updates</li>
                      <li>Additional bathrooms beyond the first add $4,000 each</li>
                      <li>Finish quality is automatically adjusted based on property ARV</li>
                    </ul>
                  </p>
                </div>
                <div className="text-3xl font-bold text-teal-700">{formatCurrency(totalRehabCost)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Detailed Estimate Section
        <div>
          {/* Category Selection Tabs */}
          <div className="flex flex-wrap bg-gray-100 border-b border-gray-300">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 ${activeCategory === category ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="p-4">
            {/* Active Category Items */}
            <div className="mb-6">
              <h3 className="bg-teal-700 text-white text-center py-2 mb-2">{activeCategory}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-gray-300" width="5%"></th>
                    <th className="p-2 border