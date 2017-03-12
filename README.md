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
- `styles/`
  - `style.css`: The main CSS stylesheet for the Concept Map Visualizer
    interface
  - `d3-content.css`: Styles specific to rendering the D3 concept graph

## Example

The latest code in this repository can be seen at: https://jhartz.github.io/conceptmapviz/

## License

Concept Map Visualizer is licensed under the MIT License.

For details, see the [LICENSE](LICENSE) file.
