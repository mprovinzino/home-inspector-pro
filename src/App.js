import React from 'react';
import OfferCalculator from './components/OfferCalculator';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Home Inspector Pro</h1>
          <p className="text-sm">Real Estate Investment Analysis Tool</p>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <OfferCalculator />
      </main>
      <footer className="bg-gray-200 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Home Inspector Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;