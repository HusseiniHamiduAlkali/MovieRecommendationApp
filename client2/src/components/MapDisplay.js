// src/components/MapDisplay.js

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px', // Adjust height as needed
  borderRadius: '8px',
  marginBottom: '10px'
};

const center = { // Default center for Adamawa State, Nigeria if no specific location is available
  lat: 9.2743,
  lng: 12.4764
};

const MapDisplay = ({ origin, destination }) => {
  const [response, setResponse] = useState(null);
  const [map, setMap] = useState(null);

  // Get the Google Maps API Key from environment variable
  // During local development using `netlify dev`, `REACT_APP_Maps_API_KEY` is preferred.
  // During Netlify deployment, `Maps_API_KEY` is used.
  const googleMapsApiKey = process.env.REACT_APP_Maps_API_KEY || process.env.Maps_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey, // Use the API Key here
  });

  // Callback when map loads
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // Callback when map unmounts
  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Directions service callback
  const directionsCallback = useCallback((res) => {
    if (res !== null && res.status === 'OK') {
      setResponse(res);
    } else {
      console.error('Directions request failed:', res);
      // Optional: Display a user-friendly message if directions fail
      // For instance, you could update a state in App.js to show an error message in chat
      setResponse(null); // Clear previous response on failure
    }
  }, []);

  // Effect to fit map bounds to the route once directions are loaded
  useEffect(() => {
    if (response && map) {
      const bounds = new window.google.maps.LatLngBounds();
      response.routes[0].legs.forEach(leg => {
        leg.steps.forEach(step => {
          step.lat_lngs.forEach(latLng => {
            bounds.extend(latLng);
          });
        });
      });
      map.fitBounds(bounds);
    }
  }, [response, map]);


  if (loadError) return <div>Error loading maps. Please check your console and API key.</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center} // Default center, will be overridden by directions if successful
      zoom={12} // Default zoom level
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {origin && destination && (
        <DirectionsService
          options={{
            destination: destination,
            origin: origin,
            travelMode: window.google.maps.TravelMode.DRIVING, // You can change to WALKING, BICYCLING
          }}
          callback={directionsCallback}
        />
      )}

      {response !== null && (
        <DirectionsRenderer
          options={{
            directions: response,
            // You can customize options here, e.g., hide markers, hide polyline
            // suppressMarkers: true,
            // polylineOptions: { strokeColor: "#FF0000" }
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(MapDisplay); // Memoize for performance

