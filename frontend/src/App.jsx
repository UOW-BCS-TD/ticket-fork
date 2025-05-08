import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';

import Introduction from './Pages/Home/Introduction';
import SearchResources from './Pages/Home/SearchResources';
import AboutUs from './Pages/About/AboutUs';
import Chatbot from './Pages/Chatbot/Chatbot';
import CreateTicket from './Pages/Tickets/CreateTicket';
import TicketInformation from './Pages/Tickets/TicketInformation';
import ResourcesAndGuides from './Pages/Resources/ResourcesAndGuides';
import Login from './Pages/Auth/Login';
import Profile from './Pages/Profile/Profile';
import UserManagement from './Pages/Admin/UserManagement';
import SystemSettings from './Pages/Admin/SystemSettings';
import ViewLogs from './Pages/Admin/ViewLogs';
import AssignedTickets from './Pages/Engineer/AssignedTickets';
import CreateSupportTicket from './Pages/Engineer/CreateSupportTicket';
import KnowledgeBase from './Pages/Engineer/KnowledgeBase';
import AllTickets from './Pages/Manager/AllTickets';
import ManageEngineers from './Pages/Manager/ManageEngineers';
import ViewCustomers from './Pages/Manager/ViewCustomers';
import ActiveSessions from './Pages/Manager/ActiveSessions';

import { AdminRoute, ProtectedRoute, EngineerRoute, ManagerRoute } from './Pages/Tickets/Auth';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <Introduction />
                <SearchResources />
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <AboutUs />
                <Footer />
              </>
            } />
            <Route path="/chatbot" element={<Chatbot />} />
            
            {/* Protected routes that require authentication */}
            <Route path="/view-tickets" element={
              <ProtectedRoute>
                <TicketInformation />
              </ProtectedRoute>
            } />
            
            <Route path="/create-ticket" element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            
            <Route path="/admin/settings" element={
              <AdminRoute>
                <SystemSettings />
              </AdminRoute>
            } />
            
            <Route path="/admin/logs" element={
              <AdminRoute>
                <ViewLogs />
              </AdminRoute>
            } />
            
            {/* Engineer routes (if you have any) */}
            <Route path="/tickets/assigned" element={
              <EngineerRoute>
                <AssignedTickets />
              </EngineerRoute>
            } />

            <Route path="/tickets/create" element={
              <EngineerRoute>
                <CreateSupportTicket />
              </EngineerRoute>
            } />

            <Route path="/knowledge-base" element={
              <EngineerRoute>
                <KnowledgeBase />
              </EngineerRoute>
            } />
            
            {/* Manager routes (if you have any) */}
            <Route path="/tickets" element={
              <ManagerRoute>
                <AllTickets />
              </ManagerRoute>
            } />

            <Route path="/engineers" element={
              <ManagerRoute>
                <ManageEngineers />
              </ManagerRoute>
            } />

            <Route path="/customers" element={
              <ManagerRoute>
                <ViewCustomers />
              </ManagerRoute>
            } />

            <Route path="/sessions" element={
              <ManagerRoute>
                <ActiveSessions />
              </ManagerRoute>
            } />
            
            <Route path="/resources" element={
              <>
                <ResourcesAndGuides />
                <Footer />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={
              <div className="not-found">
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/" className="auth-button">Go Home</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
