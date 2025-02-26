/*
File: reportWebVitals.js
Path: services/login-consent-app-react/src/reportWebVitals.js
Purpose: Measures and reports web vitals metrics for the application
Last change: Initial creation of the web vitals reporting
*/

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals; 