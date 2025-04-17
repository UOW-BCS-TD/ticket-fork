import React from 'react';
import Header from './Components/Header';
import Introduction from './Home Page/Introduction';
import ResourcesAndGuides from './Home Page/ResourcesAndGuides';
import Footer from './Components/Footer';

const App = () => {
  return (
    <div>
      <Header />
      <Introduction />
      <ResourcesAndGuides />
      <Footer />
    </div>
  );
};

export default App;