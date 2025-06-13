# WayGo Freight

A modern freight management application built with Expo, React Native, and Firebase.

## Features

- Real-time shipment tracking
- Driver assignment and management
- Document management
- Push notifications
- Offline support
- Cross-platform (iOS, Android, Web)

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/waygo-freight.git
   cd waygo-freight
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration
   - Add any other required environment variables

4. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add a web app to your Firebase project
   - Copy the Firebase configuration to your `.env` file
   - Enable Email/Password authentication in Firebase Console
   - Set up Firestore Database with the rules from `firestore.rules`
   - Set up Cloud Storage with the rules from `storage.rules`

5. **Run the app**
   ```bash
   # Start the development server
   npm start
   
   # Or run on a specific platform
   npm run android
   npm run ios
   npm run web
   ```

## Project Structure

```
waygo-freight/
├── app/                    # Expo Router app (client-side)
│   ├── (tabs)/             # Tab navigation
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Home screen
├── assets/                 # Static assets (images, fonts, etc.)
├── functions/             # Firebase Functions (server-side)
│   ├── src/
│   │   ├── auth/         # Authentication triggers
│   │   ├── firestore/     # Firestore triggers
│   │   └── api/           # HTTP endpoints
│   └── index.ts           # Function exports
├── src/
│   ├── types/           # TypeScript type definitions
│   └── utils/            # Utility functions
├── .env.example          # Example environment variables
├── app.config.js         # Expo configuration
├── firebase.json         # Firebase configuration
└── package.json          # Project dependencies
```

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run lint` - Lint the code
- `npm run build` - Build the app for production
- `npm run deploy` - Deploy to Firebase

## Deployment

### Web
```bash
# Build the web app
npx expo export:web

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Mobile
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit -p all
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
