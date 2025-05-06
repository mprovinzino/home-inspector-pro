import React, { useState, useEffect } from "react";
import PropertyDetails from "./PropertyDetails";
import RehabEstimator from "./RehabEstimator";
import ComparableProperties from "./ComparableProperties";
import { formatCurrency } from "../utils/formatters";
import { calculateMaxOffer } from "../utils/calculations";
import { fetchComparableProperties } from "../services/api";

const OfferCalculator = () => {
  // Property data state
  const [property, setProperty] = useState({
    address: "14080 Cemetery Rd, Fort Myers, FL 33905",
    state: "FL",
    beds: 3,
    baths: 3,
    yearBuilt: 1979,
    market: "TAMPA",
    sqft: 2817,
    monthlyRent: 4000,
    damages: 53000,
    estARV: 675000,
  });

  // Rehab state
  const [totalRehabCost, setTotalRehabCost] = useState(196049);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [estimateMode, setEstimateMode] = useState("detailed"); // "quick" or "detailed"
  const [rehabLevel, setRehabLevel] = useState("mid"); // "light", "mid", "full"

  // Offer calculation settings
  const [feePercentage, setFeePercentage] = useState(4);
  const [arvRanges, setArvRanges] = useState({
    low: 65,
    top: 80,
    fairCash: 75
  });

  // Comparable properties state
  const [activeTab, setActiveTab] = useState("calculator"); // "calculator", "comps", or "analysis"
  const [comparables, setComparables] = useState([]);
  const [isLoadingComps, setIsLoadingComps] = useState(false);
  const [compError, setCompError] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  // Calculated values
  const [calculatedOffers, setCalculatedOffers] = useState({
    lowRange: 0,
    topRange: 0,
    fairCashOffer: 0
  });
  const [maxSuggestedOffer, setMaxSuggestedOffer] = useState(0);

  // Calculate offers when ARV or fee percentage changes
  useEffect(() => {
    const lowRangeOffer = Math.round(property.estARV * (arvRanges.low / 100));
    const topRangeOffer = Math.round(property.estARV * (arvRanges.top / 100));
    const fairCashOffer = Math.round(property.estARV * (arvRanges.fairCash / 100));
    
    setCalculatedOffers({
      lowRange: lowRangeOffer,
      topRange: topRangeOffer,
      fairCashOffer: fairCashOffer
    });

    // Calculate max suggested offer at 70% of ARV minus repairs
    const maxOffer = calculateMaxOffer(property.estARV, totalRehabCost);
    setMaxSuggestedOffer(maxOffer);
  }, [property.estARV, arvRanges, feePercentage, totalRehabCost]);

  // Handle property data changes
  const handlePropertyChange = (field, value) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch comparables
  const fetchComparables = async () => {
    if (!propertyAddress && !property.address) {
      setCompError("Please enter a property address");
      return;
    }
    
    setIsLoadingComps(true);
    setCompError("");
    
    try {
      const address = propertyAddress || property.address;
      const comparableProperties = await fetchComparableProperties(address, {
        radius: 1,
        minBeds: Math.max(1, property.beds - 1),
        maxBeds: property.beds + 1,
        minBaths: Math.max(1, property.baths - 1),
        maxBaths: property.baths + 1,
        minSqft: property.sqft * 0.8,
        maxSqft: property.sqft * 1.2,
        soldWithinDays: 365,
        includeActive: true
      });
      
      setComparables(comparableProperties);
      
      // Update ARV based on comps if needed
      if (comparableProperties.length > 0 && property.estARV === 0) {
        const soldComps = comparableProperties.filter(comp => comp.status === 'sold');
        if (soldComps.length > 0) {
          const avgCompPrice = Math.round(
            soldComps.reduce((sum, comp) => sum + comp.salePrice, 0) / soldComps.length
          );
          
          setProperty(prev => ({
            ...prev,
            estARV: avgCompPrice
          }));
        }
      }
      
    } catch (error) {
      console.error("Error fetching comps:", error);
      setCompError("Failed to fetch comparable properties. Please try again.");
    } finally {
      setIsLoadingComps(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Tabs for Calculator/Comps */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'calculator' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('calculator')}
          >
            Offer Calculator
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'comps' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('comps')}
          >
            Comparable Properties
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'analysis' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('analysis')}
          >
            Market Analysis
          </button>
        </div>
      </div>
      
      {/* Main Content Area based on active tab */}
      {activeTab === 'calculator' ? (
        // Calculator tab content
        <>
          <PropertyDetails 
            property={property} 
            onPropertyChange={handlePropertyChange} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {/* Repair Cost Summary and Max Offer */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="bg-teal-700 text-white p-2 text-center font-medium border border-gray-300">Total Repair Cost</td>
                      <td className="bg-gray-200 p-2 text-right border border-gray-300">{formatCurrency(totalRehabCost)}</td>
                    </tr>
                    <tr>
                      <td className="bg-teal-700 text-white p-2 text-center font-medium border border-gray-300">
                        Max Suggested offer at 70% (PA Purchase Price)
                      </td>
                      <td className="bg-gray-200 p-2 text-right border border-gray-300">{formatCurrency(maxSuggestedOffer)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Offer Price Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th colSpan={3} className="bg-teal-700 text-white p-2 text-center border border-gray-300">
                        Suggested offer including {feePercentage}% Fees
                      </th>
                      <th className="bg-teal-700 text-white p-2 text-center border border-gray-300">% of ARV</th>
                      <th className="bg-teal-700 text-white p-2 text-center border border-gray-300">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="bg-gray-100 p-2 border border-gray-300">Low Range</td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">{arvRanges.low}%</td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">{formatCurrency(calculatedOffers.lowRange)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="bg-gray-100 p-2 border border-gray-300">Top Range</td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">{arvRanges.top}%</td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">{formatCurrency(calculatedOffers.topRange)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="bg-gray-100 p-2 border border-gray-300">Fair Cash Offer (Seller Net)</td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">{arvRanges.fairCash}%</td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">{formatCurrency(calculatedOffers.fairCashOffer)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <RehabEstimator 
            property={property}
            estimateMode={estimateMode}
            setEstimateMode={setEstimateMode}
            rehabLevel={rehabLevel}
            setRehabLevel={setRehabLevel}
            totalRehabCost={totalRehabCost}
            setTotalRehabCost={setTotalRehabCost}
            categoryTotals={categoryTotals}
            setCategoryTotals={setCategoryTotals}
          />
        </>
      ) : activeTab === 'comps' ? (
        <ComparableProperties 
          property={property}
          comparables={comparables}
          propertyAddress={propertyAddress}
          setPropertyAddress={setPropertyAddress}
          fetchComparables={fetchComparables}
          isLoadingComps={isLoadingComps}
          compError={compError}
          totalRehabCost={totalRehabCost}
          maxSuggestedOffer={maxSuggestedOffer}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ) : (
        // Market Analysis tab content
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-teal-700 text-white p-3 text-center font-bold text-lg">
            Market Analysis
          </div>
          <div className="p-4">
            <div className="text-center py-8">
              <p className="text-lg font-medium">Market Analysis coming soon!</p>
              <p className="text-gray-600 mt-2">
                Future release will include neighborhood stats, rental trends, 
                appreciation data, and investment metrics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCalculator;