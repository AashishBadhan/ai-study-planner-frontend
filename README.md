# AI Study Planner - Frontend

A modern, responsive web application for AI-powered study planning and exam preparation.

## Features

- 📤 **File Upload**: Drag & drop interface for PDF, images, and text files
- 📊 **Dashboard**: Interactive visualizations with charts and analytics
- 📅 **Schedule Generator**: AI-powered personalized study plans
- ⏱️ **Study Timer**: Pomodoro technique with real-time WebSocket updates
- 📈 **Analytics**: Topic importance heatmaps and question predictions
- 📄 **PDF Export**: Download your study schedule as PDF

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Navigate to frontend directory**
```powershell
cd "c:\Users\qq\Music\ne pro\ai-study-planner\frontend"
```

2. **Install dependencies**
```powershell
npm install
```

3. **Configure environment**
```powershell
# Create .env.local file (already created)
# Update NEXT_PUBLIC_API_URL if backend is not on localhost:8000
```

## Running the Application

### Development Mode
```powershell
npm run dev
```

The application will be available at http://localhost:3000

### Production Build
```powershell
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page with tabs
│   ├── components/
│   │   ├── FileUpload.tsx    # File upload with drag & drop
│   │   ├── Dashboard.tsx     # Analytics dashboard
│   │   ├── ScheduleGenerator.tsx  # Schedule creation
│   │   └── StudyTimer.tsx    # Pomodoro timer
│   ├── lib/
│   │   └── api.ts            # API client
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── styles/
│       └── globals.css       # Global styles
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Features in Detail

### 1. File Upload
- Drag and drop interface
- Supports PDF, PNG, JPG, TXT
- Real-time upload progress
- Automatic question extraction
- Year and subject tagging

### 2. Dashboard
- Total questions count
- Topic distribution bar chart
- Topic importance pie chart
- Top predicted questions
- Repeated questions detection

### 3. Schedule Generator
- Configurable study hours
- Custom session durations
- Smart time allocation
- PDF export functionality
- Day-by-day breakdown

### 4. Study Timer
- Pomodoro technique (25-5 min)
- Real-time WebSocket updates
- Circular progress indicator
- Session statistics
- Break notifications
- Configurable durations

## API Integration

The frontend connects to the backend API:

```typescript
// Example API calls
import { apiClient } from '@/lib/api';

// Upload file
await apiClient.uploadPaper(file, year, subject);

// Get analysis
const analysis = await apiClient.getAnalysis();

// Generate schedule
const schedule = await apiClient.generateSchedule({
  available_hours: 40,
  study_duration: 25,
  break_duration: 5,
});

// Timer operations
await apiClient.startTimer(userId, topic);
await apiClient.pauseTimer(userId);
```

## WebSocket Connection

Real-time timer updates via WebSocket:

```typescript
const ws = new WebSocket('ws://localhost:8000/api/timer/ws/user_id');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update timer state
  setTimerState(data.state);
  
  // Show notifications
  if (data.notification) {
    toast.success(data.notification);
  }
};
```

## Customization

### Update API URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Modify Timer Defaults
Edit `StudyTimer.tsx`:
```typescript
await apiClient.createTimer(
  userId,
  25,  // study duration
  5,   // break duration
  15,  // long break duration
  4    // sessions until long break
);
```

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ...
      },
    },
  },
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- Automatic code splitting
- Image optimization
- Static page generation where possible
- Lazy loading of components
- Efficient re-rendering with React keys

## Troubleshooting

### API Connection Issues
```powershell
# Check if backend is running
curl http://localhost:8000/health

# Update API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### WebSocket Connection Failed
- Ensure backend supports WebSocket connections
- Check firewall settings
- Verify WebSocket URL (ws:// not http://)

### Build Errors
```powershell
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License
