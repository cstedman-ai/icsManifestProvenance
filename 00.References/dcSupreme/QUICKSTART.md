# Quick Start Guide - DC Supreme

## 🚀 Getting Started

The application is ready to use! The dev server is already running in the background.

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📋 Quick Tutorial

### Step 1: Explore the Datacenter Layout
1. You'll start on the **Datacenter View** showing 80 cabinets organized in 8 rows and 4 pods
2. Cabinets are numbered 1-80
3. Gray cabinets are empty, green cabinets have equipment

### Step 2: Add Equipment to a Cabinet
1. Click on any cabinet (e.g., Cabinet #1)
2. Click the "Add Equipment" button
3. Fill in the form:
   - **Name**: e.g., "Core Switch"
   - **Rack Unit**: 20 (position in the rack, 1-42)
   - **Connection Type**: Choose Fiber or Ethernet
   - **Connects To**: Optional description
4. Click "Add Equipment"

### Step 3: Add More Equipment
- Add equipment to multiple cabinets
- Try adding different types:
  - Switches (typically use Fiber)
  - Servers (can use Ethernet or Fiber)
  - Storage devices
  - Network equipment

### Step 4: Create Connections
1. Navigate to the **Connections** tab (left sidebar)
2. Click "Add Connection"
3. Select:
   - **Source Cabinet** and **Equipment**
   - **Destination Cabinet** and **Equipment**
4. The system automatically calculates the cable length needed!
5. Click "Add Connection"

### Step 5: View Cable Inventory
1. Navigate to the **Inventory** tab
2. See all cable requirements grouped by:
   - Fiber Optic cables
   - Ethernet cables
   - Each with specific lengths and quantities
3. Click "Export CSV" to download for purchasing

## 🎨 Visual Features

### Cabinet Color Coding
- **Gray**: Empty cabinet
- **Green**: Has equipment installed
- **Blue badge (F:#)**: Number of Fiber connections
- **Orange badge (E:#)**: Number of Ethernet connections

### Connection Types
- **Fiber Optic**: Long-distance, high-speed connections (shown in blue)
- **Ethernet**: Standard copper connections (shown in orange)

## 💡 Example Workflow

Here's a complete example to try:

1. **Add a Core Switch**
   - Cabinet #1, Rack Unit 20, Fiber
   
2. **Add Access Switches**
   - Cabinet #5, Rack Unit 15, Fiber
   - Cabinet #10, Rack Unit 15, Fiber
   
3. **Add Servers**
   - Cabinet #2, Rack Unit 10, Ethernet
   - Cabinet #3, Rack Unit 10, Ethernet

4. **Create Connections**
   - Core Switch (Cabinet #1) → Access Switch (Cabinet #5)
   - Core Switch (Cabinet #1) → Access Switch (Cabinet #10)
   - Access Switch (Cabinet #5) → Server (Cabinet #2)
   - Access Switch (Cabinet #5) → Server (Cabinet #3)

5. **View Results**
   - Check Connections view for table of all links
   - Check Inventory view for cable requirements

## 📊 Understanding Cable Length Calculations

The system calculates cable lengths automatically based on:
- **Physical distance** between cabinets (Manhattan routing)
- **Vertical distance** between rack units
- **Cable management** overhead (+20% slack)
- **Routing allowance** for proper cable paths

Example: A connection from Cabinet #1 (position 0,0) to Cabinet #10 (position 9,0) at different rack units will calculate:
- Horizontal distance: ~25 feet (9 cabinets × ~2.5 feet spacing)
- Vertical routing: ~14 feet (cabinet height × 2)
- Slack: +20%
- **Total**: ~47 feet

## 🎯 Tips

1. **Plan your layout**: Group connected equipment in nearby cabinets to minimize cable length
2. **Use the zoom controls**: Zoom in/out on the Datacenter view for better visibility
3. **Export regularly**: Download your inventory CSV for records
4. **Check statistics**: Use the dashboard stats to understand your datacenter's connectivity

## 🔧 Development Commands

If you need to restart the server:

```bash
# Stop the current dev server (Ctrl+C if in foreground)
# Then restart:
npm run dev

# Build for production:
npm run build

# Preview production build:
npm run preview
```

## 📦 Key Features

✅ Visual datacenter layout with 80 cabinets
✅ Equipment management with rack unit tracking  
✅ Automatic cable length calculation
✅ Connection tracking (Fiber & Ethernet)
✅ Cable inventory with export functionality
✅ Real-time statistics and dashboards
✅ Intuitive, modern UI with smooth interactions

Enjoy managing your datacenter! 🎉

