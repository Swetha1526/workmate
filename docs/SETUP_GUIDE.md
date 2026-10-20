# WorkMate — Setup & MongoDB Atlas Guide

## 1. MongoDB Atlas Configuration (Free Tier - M0)

Follow these steps to configure your cloud database:

1. **Sign Up / Log In**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - Sign up or log into your account.

2. **Create a Free Cluster**:
   - Select **Deploy a database** -> Choose the **M0 Free** tier.
   - Select your preferred cloud provider (AWS/Google Cloud) and region closest to your location (e.g., `Mumbai / ap-south-1`).
   - Click **Create Deployment**.

3. **Database Security (User & Network Access)**:
   - **Database User**: Create a user (e.g. `workmate_admin`) and generate a secure password. Save these credentials.
   - **Network Access**: Add `0.0.0.0/0` (Allow Access from Anywhere) for development, or your current IP address.

4. **Retrieve Connection String**:
   - Click **Connect** -> Choose **Drivers** (Node.js).
   - Copy the connection URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/workmate?retryWrites=true&w=majority
     ```
   - In `server/.env`, replace `<username>` and `<password>` with your database user credentials.

---

## 2. GitHub Repository Initialization

To push this repository to GitHub:

1. Go to [GitHub](https://github.com/new) and create a new repository named `workmate` (Do not initialize with README or .gitignore since we already configured them).
2. Connect your local repository:
   ```powershell
   git remote add origin https://github.com/<your-username>/workmate.git
   git branch -M main
   git push -u origin main
   ```
