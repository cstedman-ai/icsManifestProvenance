# DC Supreme - Datacenter Management System

A modern web application for managing datacenter infrastructure, including cabinet layouts, equipment tracking, cable connections, and inventory management.

## Features

- **Visual Datacenter Layout**: Interactive visual representation of your datacenter with 80 cabinets organized in 8 rows (4 pods)
- **Equipment Management**: Add and track equipment in each cabinet with rack unit positions
- **Connection Tracking**: Manage cable connections between equipment with automatic length calculation
- **Cable Inventory**: View and export detailed cable requirements (Fiber and Ethernet)
- **Intelligent Cable Length Calculation**: Automatically calculates cable lengths based on cabinet positions and rack unit heights

## Technology Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
npm run preview
```

## Application Structure

### Datacenter Specifications

- **Total Area**: 20,000 square feet
- **Cabinets**: 80 total (10 cabinets per row × 8 rows)
- **Pods**: 4 pods (2 rows per pod)
- **Cabinet Dimensions**: 2ft wide × 3ft deep × 7ft tall (42U)
- **Aisle Width**: 4 feet between rows

### Views

1. **Datacenter View** (`/datacenter`)
   - Visual layout of all cabinets organized by rows and pods
   - Color-coded cabinets (green = has equipment, gray = empty)
   - Click on any cabinet to view/manage equipment
   - Zoom controls for better visibility

2. **Connections View** (`/connections`)
   - Table view of all cable connections
   - Filter by connection type (All, Fiber, Ethernet)
   - Statistics dashboard showing total connections and cable length
   - Add/remove connections with automatic cable length calculation

3. **Inventory View** (`/inventory`)
   - Detailed breakdown of cable requirements by type and length
   - Summary statistics (total cables, total length, average length)
   - Export functionality to CSV
   - Purchasing recommendations with contingency planning

## Usage Guide

### Adding Equipment

1. Navigate to the Datacenter View
2. Click on any cabinet to open the details modal
3. Click "Add Equipment"
4. Fill in equipment details:
   - Name (e.g., "Switch 1", "Server A")
   - Rack Unit position (1-42)
   - Connection type (Fiber or Ethernet)
   - Optional: What it connects to

### Creating Connections

1. Navigate to the Connections View
2. Click "Add Connection"
3. Select source cabinet and equipment
4. Select destination cabinet and equipment
5. Review the automatically calculated cable length
6. Click "Add Connection"

### Viewing Inventory

1. Navigate to the Inventory View
2. Review cable requirements grouped by type
3. Export to CSV for purchasing or planning
4. Check recommendations for ordering extra cable

## Cable Length Calculation

The application automatically calculates cable lengths based on:

- **Horizontal Distance**: Manhattan distance between cabinets (accounts for proper cable routing)
- **Vertical Distance**: Height difference between rack units
- **Vertical Routing**: Additional cable for routing up and down within cabinets
- **Slack**: 20% extra length for proper cable management

Formula: `(horizontalDistance + verticalDistance + cabinetRouting) × 1.2`

## Project Structure

```
dcSupreme/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Layout.tsx           # Main layout with navigation
│   │   ├── CabinetCard.tsx      # Cabinet visual representation
│   │   ├── CabinetDetailsModal.tsx
│   │   ├── AddEquipmentModal.tsx
│   │   └── AddConnectionModal.tsx
│   ├── pages/             # Route pages
│   │   ├── DatacenterView.tsx   # Visual datacenter layout
│   │   ├── ConnectionsView.tsx  # Connections table
│   │   └── InventoryView.tsx    # Cable inventory
│   ├── store/             # State management
│   │   └── useDatacenterStore.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Features in Detail

### Smart Cabinet Layout

- Cabinets are automatically positioned with realistic spacing
- Organized into rows and pods for easy navigation
- Visual indicators show equipment status at a glance

### Equipment Tracking

- Support for both Fiber and Ethernet connections
- Rack unit tracking (1-42U standard rack)
- Connection mapping between equipment

### Intelligent Cable Management

- Automatic length calculation based on physical layout
- Separate tracking for Fiber and Ethernet cables
- Grouped inventory by cable length for easier ordering

## Future Enhancements

Potential features for future development:

- Cable path visualization on datacenter view
- Support for different cabinet sizes
- Power consumption tracking
- Network topology visualization
- Import/export datacenter configurations
- 3D visualization mode
- Support for different datacenter layouts
- Cable color/label tracking
- Maintenance scheduling

## License

This project is created for datacenter management purposes.

## Support

For issues, questions, or contributions, please refer to the project documentation.

