# Square Icon Creation Instructions

The expo-doctor reported that your app icons are not square (they're 512x1024). You need square icons for a proper app build.

## Required Icons:
1. `icon.png` - Square (1:1 ratio), minimum 1024x1024px
2. `adaptive-icon.png` - Square (1:1 ratio), minimum 1024x1024px
3. `splash.png` - Can be any ratio, but typically 2:1 for best display

## Options to Create Square Icons:

1. **Use an image editor** (Photoshop, GIMP, Paint.net) to resize the existing icons to square dimensions.

2. **Use an online icon generator** like:
   - [Expo App Icon Generator](https://expo.github.io/icons/)
   - [AppIcon.co](https://appicon.co/)

3. **Create simple placeholder icons** temporarily:
   ```bash
   # Windows PowerShell approach:
   # Install ImageMagick if not already installed, then:
   magick -size 1024x1024 xc:#005EB8 icon.png
   magick -size 1024x1024 xc:#005EB8 adaptive-icon.png
   ```

Once you have square icons, replace the ones in the `assets` folder.
