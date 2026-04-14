# Efficient Page Replacement Algorithm Simulator

A modern, interactive web application for simulating and visualizing page replacement algorithms used in operating systems. This tool helps students and developers understand how different algorithms (FIFO, LRU, Optimal) manage memory pages and handle page faults.

## 🚀 Features

- **Interactive Simulation**: Step-by-step visualization of page replacement algorithms
- **Multiple Algorithms**: Support for FIFO, LRU, and Optimal page replacement
- **Real-time Visualization**: Frame state tracking and page fault highlighting
- **Performance Metrics**: Hit ratio, fault ratio, and page fault counts
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation

### Development
- **pnpm** - Package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites
- Node.js 24+
- pnpm

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ankitkumaryadav548/Efficient-Page-Replacement-Algorithm-Simulator.git
   cd Efficient-Page-Replacement-Algorithm-Simulator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   # Frontend (in one terminal)
   pnpm --filter @workspace/page-replacement-simulator run dev

   # API Server (in another terminal)
   cd artifacts/api-server
   pnpm run build
   pnpm run start
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000

## 🎯 Usage

1. **Enter Reference String**: Input a sequence of page numbers (e.g., "7 0 1 2 0 3 0 4")
2. **Set Frame Count**: Specify the number of memory frames (e.g., 3)
3. **Select Algorithm**: Choose from FIFO, LRU, Optimal, or run all algorithms
4. **Simulate**: Click the simulate button to see the step-by-step execution
5. **View Results**: Analyze the visualization, page faults, and performance metrics

## 📡 API Documentation

### Health Check
```http
GET /api/healthz
```

Response:
```json
{
  "status": "ok"
}
```

### Simulate Page Replacement
```http
POST /api/simulate
```

Request Body:
```json
{
  "referenceString": "7 0 1 2 0 3 0 4",
  "frames": 3,
  "algorithm": "FIFO" | "LRU" | "Optimal" | "ALL"
}
```

Response:
```json
{
  "results": [
    {
      "algorithm": "FIFO",
      "steps": [
        {
          "page": 7,
          "frames": [7, null, null],
          "isFault": true,
          "replacedPage": null
        }
      ],
      "pageFaults": 5,
      "pageHits": 2,
      "hitRatio": 0.2857,
      "faultRatio": 0.7143
    }
  ],
  "referenceString": [7, 0, 1, 2, 0, 3, 0, 4],
  "frames": 3
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Import your GitHub repo to Vercel
2. **Configure Settings**:
   - Root Directory: `artifacts/page-replacement-simulator`
   - Build Command: `pnpm run build`
   - Output Directory: `dist/public`
   - Install Command: `pnpm install`
3. **Deploy**: Vercel will automatically build and deploy your app

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm --filter @workspace/page-replacement-simulator run build
   ```

2. **Deploy the `dist/public` directory** to your hosting provider

## 🏗️ Project Structure

```
├── artifacts/
│   ├── page-replacement-simulator/     # React frontend
│   │   ├── api/                        # Vercel serverless functions
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api-server/                     # Node.js API server
│       ├── src/
│       └── package.json
├── lib/                                # Shared libraries
│   ├── api-client-react/               # Generated API client
│   ├── api-spec/                       # OpenAPI specification
│   └── api-zod/                        # Zod schemas
├── scripts/                            # Utility scripts
├── java-backend/                       # Alternative Java implementation
├── package.json                        # Workspace configuration
└── pnpm-workspace.yaml                 # pnpm workspace config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by operating systems education
- Thanks to the open-source community

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Happy Learning! 🎓**