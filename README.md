# Concept Map Visualizer

Concept Map Visualizer is a simple tool to visualize relationships between
concepts and geographic locations on a map. It pulls data from a remote data
source (such as a Google spreadsheet).

## Project Structure

- `index.html`: The main HTML file
- `scripts/`
  - `common.js`
    - Global utility functions
    - Page load handler that starts the interface
  - `data.js`
    - Constants for column labels in the data source
    - Functions to handle parsing the data
  - `graph.js`
    - Node and Graph classes
  - `arcgis-content.js`
    - Constants for *data* column labels in the data source
    - Rendering the map and the info windows on the map
  - `d3-content.js`:
    - Rendering the concept graph
