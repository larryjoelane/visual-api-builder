import React, { useState } from 'react';
import questions from './questions.json';

function IntakeForm() {
  const initialValues = {};
  questions.forEach((q) => {
    initialValues[q.id] = '';
  });

  const [formData, setFormData] = useState(initialValues);
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    // Simulate submission — replace with actual API endpoint
    console.log('Intake form submitted:', JSON.stringify(formData, null, 2));

    setTimeout(() => {
      setStatus('success');
    }, 1000);
  }

  function handleReset() {
    setFormData(initialValues);
    setStatus(null);
  }

  if (status === 'success') {
    return (
      <div className="success-message">
        <h2>Request Submitted</h2>
        <p>Your request has been submitted successfully. A work item will be created in Azure DevOps.</p>
        <button onClick={handleReset} className="btn btn-primary">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="intake-form">
      {questions.map((q) => (
        <div key={q.id} className="form-group">
          <label htmlFor={q.id}>
            {q.label}
            {q.required && <span className="required">*</span>}
          </label>

          {q.type === 'textarea' ? (
            <textarea
              id={q.id}
              name={q.id}
              value={formData[q.id]}
              onChange={handleChange}
              placeholder={q.placeholder || ''}
              required={q.required}
              rows={4}
            />
          ) : q.type === 'select' ? (
            <select
              id={q.id}
              name={q.id}
              value={formData[q.id]}
              onChange={handleChange}
              required={q.required}
            >
              {q.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '-- Select --'}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={q.id}
              name={q.id}
              type={q.type}
              value={formData[q.id]}
              onChange={handleChange}
              placeholder={q.placeholder || ''}
              required={q.required}
            />
          )}
        </div>
      ))}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default IntakeForm;
