# IslamicZone - Islamic Knowledge Hub

<div align="center">

![IslamicZone Logo](assets/image/logo.png)

**Your comprehensive Islamic knowledge hub. Learn, explore, and grow in your faith.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

</div>

## 📖 About

IslamicZone is a modern, comprehensive web platform designed to provide Muslims worldwide with easy access to essential Islamic resources. The platform combines traditional Islamic scholarship with modern web technology to create an accessible, user-friendly experience.

Our mission is to make authentic Islamic knowledge available to every Muslim, everywhere, fostering spiritual growth and connection with faith through technology.

## ✨ Features

### 🕌 Core Features

- **📿 Prayer Times**
  - Accurate prayer times based on your location
  - Multiple calculation methods (Muslim World League, Egyptian, Karachi, etc.)
  - Support for Hanafi and Shafi madhabs
  - Monthly prayer schedule
  - Countdown to next prayer
  - Real-time updates

- **🧭 Qibla Compass**
  - Interactive compass pointing to Kaaba
  - Works with device orientation
  - Accurate direction calculation

- **📖 Quran Reading**
  - Complete Quran text in Arabic
  - Translations in multiple languages (English, Bengali)
  - Search functionality
  - Filter by surah type (Meccan/Medinan)
  - Beautiful Arabic calligraphy display

- **🤲 Duas (Supplications)**
  - Collection of authentic duas
  - Categorized by time and occasion
  - Morning, evening, and after-salah duas
  - Arabic text with translations

- **⭐ Special Highlights**
  - **Ramadan Countdown**: Track time until the blessed month
  - **Hajj & Umrah Guide**: Complete guide for pilgrimage
  - **Zakat Calculator**: Calculate your Zakat easily

- **📚 Additional Resources**
  - Hadith collections (coming soon)
  - Islamic knowledge base
  - Educational content

- **📱 User Experience**
  - Fully responsive design (mobile, tablet, desktop)
  - Modern, beautiful UI with gradient designs
  - Smooth animations and transitions
  - Fast loading times
  - Accessible and user-friendly

## 🛠️ Technologies Used

- **Frontend Framework**: Bootstrap 5.3.0
- **Icons**: Font Awesome 6.4.0
- **Fonts**: 
  - Poppins (Body text)
  - Amiri (Arabic text)
  - Noto Sans Arabic (Arabic support)
- **APIs**:
  - [Aladhan API](https://aladhan.com/) - Prayer times calculation
- **Languages**: HTML5, CSS3, JavaScript (ES6+)

## 📁 Project Structure

```
IslamicZone/
│
├── index.html              # Homepage
├── prayer-times.html       # Prayer times page
├── qibla.html             # Qibla compass page
├── duas.html              # Duas collection page
├── surah.html             # Individual surah page
├── highlights.html        # Special highlights (Ramadan, Hajj, Zakat)
├── about.html             # About us page
├── contact.html           # Contact page with form
│
├── styles.css             # Main stylesheet
│
├── script.js              # Main JavaScript (homepage functionality)
├── prayer-times.js        # Prayer times functionality
├── qibla.js              # Qibla compass functionality
├── duas.js               # Duas functionality
├── surah.js              # Surah page functionality
├── highlights.js         # Highlights functionality
├── contact.js            # Contact form handling
│
└── assets/
    ├── image/
    │   └── logo.png      # Website logo
    └── json/
        ├── quran.json    # Quran Arabic text
        ├── quran_en.json # Quran English translation
        ├── quran_bn.json # Quran Bengali translation
        ├── dua_en.json   # Duas in English
        ├── morning_dua_en.json
        ├── evening_dua_en.json
        └── after_salah_dua_en.json
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/IslamicZone.git
   cd IslamicZone
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local web server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Access the website**
   - Open your browser and navigate to `http://localhost:8000`

### Development

No build process is required! The project uses vanilla HTML, CSS, and JavaScript. Simply edit the files and refresh your browser to see changes.

## 📱 Usage

### Prayer Times

1. Navigate to the Prayer Times page
2. Allow location access when prompted (or use default location)
3. Select your preferred calculation method and madhab
4. View accurate prayer times for your location

### Qibla Compass

1. Go to the Qibla page
2. Allow device orientation access
3. The compass will point towards the Kaaba in Mecca

### Reading Quran

1. Scroll to the Quran section on the homepage
2. Browse through surahs (chapters)
3. Filter by name or type (Meccan/Medinan)
4. Click on a surah to read it with translations

### Duas

1. Visit the Duas page
2. Browse duas by category (Morning, Evening, After Salah)
3. Read Arabic text with English translations

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 🔧 Configuration

### Prayer Times API

The website uses the Aladhan API for prayer times. No API key is required for basic usage. The API supports multiple calculation methods and madhabs.

### Location Services

Prayer times and Qibla direction require location access. Users can:
- Allow browser geolocation
- Use saved location from previous visits
- Fall back to default location (Mecca)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **IslamicZone Team** - *Initial work*

## 🙏 Acknowledgments

- **Aladhan API** - For prayer times calculation
- **Bootstrap** - For responsive framework
- **Font Awesome** - For beautiful icons
- **Google Fonts** - For typography
- The Muslim community for inspiration and support

## 📧 Contact

- **Email**: info@islamiczone.com
- **Website**: [IslamicZone](https://islamiczone.com)
- **GitHub**: [@yourusername](https://github.com/yourusername)

## 🎯 Future Enhancements

- [ ] Audio recitation for Quran
- [ ] Hadith collections with search
- [ ] Islamic calendar (Hijri)
- [ ] Tasbih counter
- [ ] Daily reminders
- [ ] Multi-language support (UI)
- [ ] Dark mode
- [ ] PWA (Progressive Web App) support
- [ ] User accounts and bookmarks
- [ ] Sharing features

## ⚠️ Notes

- This is a client-side application. All data processing happens in the browser.
- Prayer times are calculated based on your location. Ensure location services are enabled for accurate times.
- The website respects user privacy and doesn't store personal information without consent.

## 📊 Statistics

- **Languages Supported**: 3 (Arabic, English, Bengali)
- **Surahs**: 114
- **Prayer Calculation Methods**: 10+
- **Duas Categories**: Multiple
- **Responsive**: Yes ✓
- **Accessible**: Yes ✓

---

<div align="center">

**Made with ❤️ for the Muslim community**

*"And I did not create the jinn and mankind except to worship Me." - Quran 51:56*

</div>

