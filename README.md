# Boba Tracker

A web application for tracking and reviewing boba tea stores.

## Features

-   Discover new stores
-   Review store and take private notes
-   See trending locations based on community activity.

## Tech Stack

-   **Backend**: Node.js + Express
-   **Database**: MongoDB
-   **Frontend**: Handlebars + JS
-   **Authentication**: Session-based with bcrypt

## Prerequisites

-   Node.js (v18 or higher to use `--watch` flag in `npm run dev`)
-   MongoDB - Update in `config/settings.js`

## Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/chaeanthony/boba-tracker.git
    cd boba-tracker
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure config/settings.js**

4. **Seed the database** (optional)
    ```bash
    npm run seed
    ```

## Running the Application

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:3000`
