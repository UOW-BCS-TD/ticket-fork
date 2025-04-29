import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Introduction from './Pages/Home Page/Introduction';
import ResourcesAndGuides from './Pages/Home Page/ResourcesAndGuides';
import Chatbot from './Pages/Customer Chatbot Page/Chatbot';
import Login from './Pages/Login Page/Login';
import CreateTicket from './Pages/Ticket Support Page/CreateTicket';
import TicketInformation from './Pages/Ticket View Page/TicketInformation';

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