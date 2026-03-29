import React from 'react';
import IntakeForm from './IntakeForm.jsx';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Request Intake</h1>
        <p>Submit a new request to create an Azure DevOps work item</p>
      </header>
      <main>
        <IntakeForm />
      </main>
    </div>
  );
}

export default App;
