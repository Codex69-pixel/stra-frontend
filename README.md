# STRA-System - Healthcare Innovation Platform

A comprehensive React.js application for hospital management, patient triage, resource allocation, and inventory management.

## Features

✅ **Nurse Triage Module** - 5-step comprehensive patient registration with MEWS scoring
✅ **Queue Management** - Real-time patient queue across departments  
✅ **Doctor Portal** - Patient management with orders, prescriptions, and clinical notes
✅ **Resource Dashboard** - Bed, staff, and equipment utilization monitoring
✅ **Inventory Management** - Pharmaceutical stock tracking with alerts
✅ **Analytics Dashboard** - Hospital performance metrics and statistics
✅ **Role-based Navigation** - Different menus for Nurse, Doctor, Pharmacy, and Admin roles
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Login
- **Username**: Any text (e.g., "John", "Admin", etc.)
- **Password**: Any text (demo mode)
- **Role**: Select one of:
  - 👨‍⚕️ **Nurse** - Access to Triage module
  - 👩‍⚕️ **Doctor** - Access to Queue Management and Doctor Portal
  - 💊 **Pharmacy** - Access to Inventory Management
  - 🔧 **Admin** - Access to all modules

## Project Structure

```
src/
├── App.js                          # Main application component
├── index.js                        # React entry point
├── index.css                       # Global Tailwind CSS styles
├── components/
│   ├── LoginScreen.js             # Authentication screen
│   ├── NurseTriage.js             # 5-step patient registration
│   ├── QueueManagement.js         # Department queues
│   ├── DoctorPortal.js            # Patient management
│   ├── ResourceDashboard.js       # Resource monitoring
│   ├── InventoryManagement.js     # Stock management
│   ├── AnalyticsDashboard.js      # Performance metrics
│   └── Navigation.js              # Navigation bar
└── public/
    └── index.html                 # HTML entry point
```

## Component Features

### Nurse Triage Module
- Step 1: Demographics (name, DOB, contact)
- Step 2: Vital Signs (temperature, HR, BP, SpO2)
- Step 3: Symptoms (chief complaint, symptom selection)
- Step 4: Medical History (allergies, medications)
- Step 5: Review & MEWS Scoring
- Auto-calculates triage level (RED/YELLOW/GREEN)

### Queue Management
- Real-time patient queue by department
- Urgency color coding
- Wait time tracking
- Department-specific statistics

### Doctor Portal
- Patient queue selection
- Three tabs: Overview, Orders, Prescriptions
- Clinical notes
- Laboratory test orders
- Imaging requests
- Prescription generation

### Resource Dashboard
- Bed capacity and utilization
- Staff availability by role
- Equipment status tracking
- Capacity forecasting

### Inventory Management
- Stock level monitoring
- Automatic alerts for critical/low stock
- Cost tracking
- Supplier information
- Reorder recommendations

### Analytics Dashboard
- Patient volume metrics
- Wait time statistics
- Department performance
- Resource utilization charts

## Technology Stack

- **React 18.2.0** - UI framework
- **CSS Tailwind** - Styling (custom CSS included)
- **Lucide React** - Icons
- **JavaScript ES6+** - All components in .js format

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mock Data

All components use mock data for demonstration:
- Patient lists with realistic data
- Department queues
- Resource utilization rates
- Inventory items with stock levels
- Analytics metrics

No backend required - fully functional demo.

## Features Demo

1. **Login**: Try different roles to see role-based menu changes
2. **Nurse Triage**: Complete a full 5-step patient registration
3. **Queue**: View patient queues organized by department
4. **Doctor**: Select patients and manage care (clinical notes, orders, prescriptions)
5. **Resources**: Monitor bed, staff, and equipment utilization
6. **Inventory**: Track medications with low/critical stock alerts
7. **Analytics**: View hospital performance metrics

## Future Enhancements

- Backend API integration
- Real database (MongoDB, PostgreSQL)
- User authentication (JWT)
- Real-time notifications
- Print/Export functionality
- Multi-language support
- Dark mode theme
- Advanced charting (charts.js)

## License

MIT License - 2025

## Support

For issues or questions, please contact the development team.

---

**STRA-System** © 2025 - Smart Triage & Resource Allocation
