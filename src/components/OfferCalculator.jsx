import React, { useState, useEffect } from "react";
import PropertyDetails from "./PropertyDetails";
import RehabEstimator from "./RehabEstimator";
import ComparableProperties from "./ComparableProperties";
import { formatCurrency } from "../utils/formatters";
import { calculateMaxOffer } from "../utils/calculations";
import { fetchAddressSuggestions, fetchRealiePropertyDetails } from "../services/api";

const OfferCalculator = () => {
  // Property data state - address is for input, other details will come from subjectPropertyDetails
  const [propertyInputAddress, setPropertyInputAddress] = useState(""); // For the input field
  
  // NEW: State for fetched subject property details from /v1/properties
  const [subjectPropertyDetails, setSubjectPropertyDetails] = useState(null);
  const [userEstimatedARV, setUserEstimatedARV] = useState(''); // User's manual ARV input

  // Rehab state
  const [totalRehabCost, setTotalRehabCost] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [estimateMode, setEstimateMode] = useState("detailed"); // "quick" or "detailed"
  const [rehabLevel, setRehabLevel] = useState("mid"); // "light", "mid", "full"

  // Offer calculation settings
  const [feePercentage, setFeePercentage] = useState(4);
  const [arvRanges, setArvRanges] = useState({
    low: 65,
    top: 80,
    fairCash: 75,
  });

  // Active Tab state
  const [activeTab, setActiveTab] = useState("calculator");
  
  // States for Autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  // Calculated values
  const [calculatedOffers, setCalculatedOffers] = useState({
    lowRange: 0,
    topRange: 0,
    fairCashOffer: 0,
  });
  const [maxSuggestedOffer, setMaxSuggestedOffer] = useState(0);

  // Realie test result and error state
  const [realieResult, setRealieResult] = useState(null);
  const [realieError, setRealieError] = useState('');

  // Calculate offers when ARV or fee percentage changes
  useEffect(() => {
    const arvForCalc = parseFloat(userEstimatedARV); // Use user-entered ARV
    if (arvForCalc && arvForCalc > 0) {
      const lowRangeOffer = Math.round(arvForCalc * (arvRanges.low / 100));
      const topRangeOffer = Math.round(arvForCalc * (arvRanges.top / 100));
      const fairCashOffer = Math.round(
        arvForCalc * (arvRanges.fairCash / 100)
      );
      setCalculatedOffers({
        lowRange: lowRangeOffer,
        topRange: topRangeOffer,
        fairCashOffer: fairCashOffer,
      });
      const maxOffer = calculateMaxOffer(arvForCalc, totalRehabCost);
      setMaxSuggestedOffer(maxOffer);
    } else {
      setCalculatedOffers({ lowRange: 0, topRange: 0, fairCashOffer: 0 });
      setMaxSuggestedOffer(0);
    }
  }, [userEstimatedARV, arvRanges, feePercentage, totalRehabCost]); // Depend on userEstimatedARV

  // NEW: Fetches core property data for Tab 1
  const handleAddressSelectedForDetails = async (selectedAddress) => {
    console.log('[OC] Fetching core property details for Tab 1 for address:', selectedAddress);
    if (!selectedAddress) {
      console.log('[OC] No address provided to handleAddressSelectedForDetails');
      return;
    }
    setSubjectPropertyDetails(null); // Clear previous details
    setUserEstimatedARV(''); // Clear manual ARV
    try {
      const data = await fetchRealiePropertyDetails(selectedAddress);
      console.log('[OC] Core Property Data received:', JSON.stringify(data, null, 2));
      if (data) {
        setSubjectPropertyDetails(data);
        setPropertyInputAddress(data.formattedAddress || selectedAddress); // Update input with formatted address
      } else {
        console.log('[OC] Property data not found for this address.');
        setPropertyInputAddress(selectedAddress); // Keep user's input if data not found
      }
    } catch (err) {
      console.error('[OC] Error in handleAddressSelectedForDetails:', err);
      setRealieError(err.message || "Failed to fetch property data.");
      setPropertyInputAddress(selectedAddress); // Keep user's input on error
    }
  };

  const handleAddressInputChange = async (value) => {
    setPropertyInputAddress(value); // Update the address in the input field
    if (value.length < 3) {
      setAddressSuggestions([]);
      setIsSuggestionsOpen(prev => {
        console.log('[OC] Setting isSuggestionsOpen to false (input < 3 chars)');
        return false;
      });
      return;
    }
    try {
      console.log('[OC] Fetching suggestions for:', value);
      const suggestions = await fetchAddressSuggestions(value);
      console.log('[OC] Suggestions received:', JSON.stringify(suggestions, null, 2));
      setAddressSuggestions(suggestions);
      setIsSuggestionsOpen(prev => {
        const shouldBeOpen = suggestions.length > 0;
        console.log('[OC] Setting isSuggestionsOpen to:', shouldBeOpen, 'based on suggestions count:', suggestions.length);
        return shouldBeOpen;
      }); 
    } catch (err) {
      console.error('[OC] Error fetching suggestions:', err);
      setAddressSuggestions([]);
      setIsSuggestionsOpen(prev => {
        console.log('[OC] Setting isSuggestionsOpen to false (error fetching)');
        return false;
      });
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    console.log('[OC] Suggestion selected:', suggestion);
    setPropertyInputAddress(suggestion); // Set input field to selected suggestion
    setIsSuggestionsOpen(prev => {
      console.log('[OC] Setting isSuggestionsOpen to false (suggestion selected)');
      return false;
    });
    setAddressSuggestions([]);
    handleAddressSelectedForDetails(suggestion); // Fetch details for Tab 1
  };

  const handleAddressBlurOrEnter = () => {
    // Only fetch if there's an address, suggestions are closed, and no details are currently loading
    if (propertyInputAddress && propertyInputAddress.length > 4 && !isSuggestionsOpen) {
      console.log('[OC] Address blur/enter, fetching details for:', propertyInputAddress);
      handleAddressSelectedForDetails(propertyInputAddress); // Fetch details for Tab 1
    }
    console.log('[OC] handleAddressBlurOrEnter called. isSuggestionsOpen:', isSuggestionsOpen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Tabs for Calculator/Comps */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "calculator"
                ? "bg-teal-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("calculator")}
          >
            Offer Calculator
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "comps"
                ? "bg-teal-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("comps")}
          >
            Comparable Properties
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "analysis"
                ? "bg-teal-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("analysis")}
          >
            Market Analysis
          </button>
        </div>
      </div>

      {/* Main Content Area based on active tab */}
      {activeTab === "calculator" ? (
        // Calculator tab content
        <>
          {/* Address input and autocomplete */}
          <div className="mb-6 relative max-w-xl">
            <label htmlFor="propertyAddressInput" className="block text-gray-700 font-medium mb-1">Property Address</label>
            <input
              id="propertyAddressInput"
              type="text"
              value={propertyInputAddress}
              onChange={(e) => handleAddressInputChange(e.target.value)}
              onBlur={handleAddressBlurOrEnter}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddressBlurOrEnter();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Start typing address..."
              autoComplete="off"
            />
            {isSuggestionsOpen && addressSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10 max-h-56 overflow-y-auto">
                {console.log('[OC] Rendering suggestions dropdown. Count:', addressSuggestions.length)}
                {addressSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 cursor-pointer hover:bg-teal-100 text-gray-800"
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          {realieError && <p className="text-red-600 my-2">Error: {realieError}</p>}
          
          {/* Display Subject Property Details */}
          {subjectPropertyDetails && (
            <div className="bg-white shadow rounded-lg p-6 my-4 max-w-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subject Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                <p><span className="font-medium">Address:</span> {subjectPropertyDetails.formattedAddress}</p>
                <p><span className="font-medium">Type:</span> {subjectPropertyDetails.propertyType || 'N/A'}</p>
                <p><span className="font-medium">Beds:</span> {subjectPropertyDetails.bedrooms ?? 'N/A'}</p>
                <p><span className="font-medium">Baths:</span> {subjectPropertyDetails.bathrooms ?? 'N/A'}</p>
                <p><span className="font-medium">SqFt:</span> {subjectPropertyDetails.squareFootage ? subjectPropertyDetails.squareFootage.toLocaleString() : 'N/A'}</p>
                <p><span className="font-medium">Year Built:</span> {subjectPropertyDetails.yearBuilt || 'N/A'}</p>
                <p><span className="font-medium">Lot Size (SqFt):</span> {subjectPropertyDetails.lotSquareFootage ? subjectPropertyDetails.lotSquareFootage.toLocaleString() : 'N/A'}</p>
                {/* Add more fields like garage, style as needed later */}
              </div>
            </div>
          )}

          {/* Manual ARV Input - Appears after property details are loaded or if address is entered */}
          {(subjectPropertyDetails || propertyInputAddress.length > 5) && (
             <div className="my-4 max-w-xl">
                <label htmlFor="userEstimatedARV" className="block text-gray-700 font-medium mb-1">
                  Your Estimated After Repair Value (ARV)
                </label>
                <input
                  id="userEstimatedARV"
                  type="number"
                  value={userEstimatedARV}
                  onChange={(e) => setUserEstimatedARV(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter your estimated ARV (optional)"
                />
              </div>
          )}
          
          {/* PropertyDetails component is removed from here as its inputs are replaced */}
          {/* <PropertyDetails
            property={property} // This would need to be subjectPropertyDetails now
            onPropertyChange={handlePropertyChange} // This would be for manual edits, not needed for auto-populated
          /> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {/* Repair Cost Summary and Max Offer */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="bg-teal-700 text-white p-2 text-center font-medium border border-gray-300">
                        Total Repair Cost
                      </td>
                      <td className="bg-gray-200 p-2 text-right border border-gray-300">
                        {formatCurrency(totalRehabCost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-teal-700 text-white p-2 text-center font-medium border border-gray-300">
                        Max Suggested offer at 70% (PA Purchase Price)
                      </td>
                      <td className="bg-gray-200 p-2 text-right border border-gray-300">
                        {maxSuggestedOffer ? formatCurrency(maxSuggestedOffer) : 'N/A'}
                      </td>
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
                      <th
                        colSpan={3}
                        className="bg-teal-700 text-white p-2 text-center border border-gray-300"
                      >
                        Suggested offer including {feePercentage}% Fees
                      </th>
                      <th className="bg-teal-700 text-white p-2 text-center border border-gray-300">
                        % of ARV
                      </th>
                      <th className="bg-teal-700 text-white p-2 text-center border border-gray-300">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={3}
                        className="bg-gray-100 p-2 border border-gray-300"
                      >
                        Low Range
                      </td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">
                        {arvRanges.low}%
                      </td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">
                        {calculatedOffers.lowRange ? formatCurrency(calculatedOffers.lowRange) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="bg-gray-100 p-2 border border-gray-300"
                      >
                        Top Range
                      </td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">
                        {arvRanges.top}%
                      </td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">
                        {calculatedOffers.topRange ? formatCurrency(calculatedOffers.topRange) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="bg-gray-100 p-2 border border-gray-300"
                      >
                        Fair Cash Offer (Seller Net)
                      </td>
                      <td className="bg-gray-100 p-2 text-center border border-gray-300">
                        {arvRanges.fairCash}%
                      </td>
                      <td className="bg-gray-100 p-2 text-right border border-gray-300">
                        {calculatedOffers.fairCashOffer ? formatCurrency(calculatedOffers.fairCashOffer) : 'N/A' }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <RehabEstimator
            property={subjectPropertyDetails}
            userARV={userEstimatedARV}
            estimateMode={estimateMode}
            setEstimateMode={setEstimateMode}
            rehabLevel={rehabLevel}
            setRehabLevel={setRehabLevel}
            totalRehabCost={totalRehabCost}
            setTotalRehabCost={setTotalRehabCost}
            categoryTotals={categoryTotals}
            setCategoryTotals={setCategoryTotals}
          />

          {/* Realie Test Button and Result */}
          <div className="my-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={async () => {
                setRealieError('');
                setRealieResult(null);
                try {
                  const result = await fetchRealiePropertyDetails(propertyInputAddress);
                  setRealieResult(result);
                  console.log('Realie API result:', result);
                } catch (err) {
                  setRealieError(err.message);
                }
              }}
              disabled={!propertyInputAddress}
            >
              Test with Realie
            </button>
            {realieResult && (
              <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(realieResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      ) : activeTab === "comps" ? (
        <ComparableProperties
          property={subjectPropertyDetails}
          isLoadingPropertyDetails={false}
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
              <p className="text-lg font-medium">
                Market Analysis coming soon!
              </p>
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