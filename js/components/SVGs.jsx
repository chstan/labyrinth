import React from 'react';

const svgs = {
  check: (
    <svg viewBox="0 0 220 220">
      <path d="M 20,130 60,170, 200,30"
        style={{
          stroke: 'black',
          strokeWidth: 12,
          fill: 'none',
        }}
      />
    </svg>
  ),
  blank: (
    <svg viewBox="0 0 220 220"></svg>
  ),
  lock: (
    <svg viewBox="0 0 48 48">
      <g>
        <rect width="48" height="48" x="0" y="0"
          style={{
            fill: 'none',
            fillOpacity: 0.75,
            fillRule: 'evenodd',
            stroke: 'none',
            strokeWidth: 1,
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
          }}
        />
        <path d="M 24,4 C 17,4 12,8.1739046 12,15 L 12,21 L 10,21 C 8,21 7,22
          7,24 L 7,41 C 7,41.980326 8,44 10,44 L 39.384016,44 C 41,43.990546
          42,41.980324 42,41 L 42,24 C 42,22 41,20.990546 39,20.990546 L 37,21
          L 37,15 C 37,8 32,4 25.000000,4 L 24.000000,4 z M 24.000000,9 L
          25.000000,9 C 32.000000,9 32.000000,15.000000 32.000000,17.000000 L
          32.000000,21.000000 L 17.000000,21.000000 L 17.000000,17.000000 C
          17.000000,15.000000 17.000000,9 24.000000,9 z"
          style={{
            opacity: 1,
            color: '#000000',
            fill: '#eeeeee',
            fillOpacity: 1,
            fillRule: 'nonzero',
            stroke: '#ffffff',
            strokeWidth: 1,
            strokeLinecape: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            display: 'block',
            overflow: 'visible',
          }}
        />
      </g>
    </svg>
  ),
  rightArrow: (
    <svg height="24" viewBox="0 0 24 24" width="24">
      <path d="M22 12l-4-4v3H3v2h15v3z"/>
    </svg>
  ),
  plus: (
    <svg height="24" viewBox="0 0 24 24" width="24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  ),
};

export default svgs;
