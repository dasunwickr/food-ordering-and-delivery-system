'use client';

import React, { useEffect, useState } from 'react';

export default function TranscriptPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:4242/user-restaurant-payments')
      .then(res => res.text())
      .then(text => {
        setMessage(`Response: ${text}`);
      })
      .catch(err => {
        console.error(err);
        setMessage('Fetch failed.');
      });
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
      <p>{message}</p>
    </div>
  );
}
