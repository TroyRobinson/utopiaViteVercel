import React from 'react'
import { FlexCol } from './utils.jsx'

export var App2 = ({ onNavigate }) => {
  return (
    <FlexCol
      style={{
        width: '100%',
        height: '100%',
        background: 'lightblue',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Welcome to App2!</h1>
      <p>This is the second page of our application.</p>
      <button 
        onClick={() => onNavigate('/')}
        style={{ 
          marginTop: '20px', 
          padding: '8px 16px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go back to home
      </button>
    </FlexCol>
  )
} 