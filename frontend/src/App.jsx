import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Introduction from './Pages/Home Page/Introduction';
import ResourcesAndGuides from './Pages/Home Page/ResourcesAndGuides';
import AboutUs from './Pages/About Us Page/AboutUs';
import Chatbot from './Pages/Customer Chatbot Page/Chatbot';
import CreateTicket from './Pages/Ticket Support Page/CreateTicket';
import TicketInformation from './Pages/Ticket View Page/TicketInformation';
import Login from './Pages/Login Page/Login';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Introduction />
              <ResourcesAndGuides />
              <Footer />
            </>
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/view-tickets" element={<TicketInformation />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;