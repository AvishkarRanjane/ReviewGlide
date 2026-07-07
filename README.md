# Business-QR (Google Review Web App)

A complete solution for businesses to easily collect Google Reviews from their customers. It provides a beautiful, dynamic, and mobile-friendly landing page that guides users through the process of leaving a review, along with a Python script to automatically generate QR codes for each business.

## Features

- **Dynamic Landing Page**: A responsive, animated frontend (`index.html`) that simulates the Google review experience.
- **URL Parameter Routing**: Automatically loads the correct business profile by passing the `?id=business_id` in the URL.
- **One-Click Review**: Users can select a star rating, generate/write a review, and copy it to their clipboard before being redirected to the actual Google Review page.
- **Automated QR Generation**: A Python background script (`generate_qrs.py`) that monitors the `businesses.json` file and automatically generates QR codes for new businesses.
- **Bi-directional Sync**: If you delete a QR code image from the folder, the script automatically removes the business from the JSON file, and vice-versa.

## Project Structure

```text
├── data/
│   └── businesses.json   # Stores business data (IDs, names, review links, etc.)
├── js/
│   └── script.js         # Frontend logic for URL parsing, UI updates, and clipboard
├── QR Code/              # Auto-generated QR codes are saved here
├── index.html            # The main landing page UI
├── Style.CSS             # Styling and animations for the landing page
├── generate_qrs.py       # Python script for background QR code generation
└── sync_state.json       # Auto-generated state tracking file for the Python script
```

## How to Add a New Business

1. **Update Data**: Open `data/businesses.json` and add a new entry for your business:
   ```json
   {
     "id": "my_shop",
     "name": "My Awesome Shop",
     "googleReviewLink": "https://g.page/r/YOUR_LINK/review"
   }
   ```
2. **Run the Script**: Ensure the Python script is running in the background:
   ```bash
   python generate_qrs.py
   ```
3. **Get the QR Code**: The script will detect the new entry and automatically generate a QR code image (e.g., `my_shop_qr.png`) in the `QR Code/` directory.

## Deployment

1. The frontend (`index.html`, `Style.CSS`, `js/script.js`, `data/businesses.json`) is designed to be hosted statically (e.g., via GitHub Pages).
2. If deploying to GitHub pages, ensure that the `BASE_URL` in `generate_qrs.py` points to your live URL so the generated QR codes link to the correct destination.

```python
# generate_qrs.py
BASE_URL = "https://YourUsername.github.io/Business-QR/?id="
```

## Requirements for QR Generator

The Python script uses standard libraries and calls the `api.qrserver.com` API. No external Python packages are strictly required, but you need an active internet connection to generate the QR codes.
