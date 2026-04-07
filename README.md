# Strava Wrapped

A personalized year-in-review dashboard for your Strava activities. View your top sports, longest activities, and total active hours for any given year. 

Built with React and Vite, and fully deployable to AWS using Terraform.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Authentication**: Strava OAuth 2.0
- **Infrastructure**: AWS (S3, API Gateway, Lambda) provisioned via Terraform
- **Deployment**: Shell scripts using AWS CLI

## Features

- **Secure OAuth Login**: Uses an AWS Lambda backend to securely exchange Strava authorization codes for access tokens, returning them to the frontend via URL fragments.
- **Yearly Stats**: Filters and processes your Strava activities by year.
- **Top Sports**: Calculates your most frequent sports, displaying them with dynamic progress bars.
- **Activity Deep Dive**: Highlights your longest activity and provides a breakdown of your #1 sport.

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Strava API Application](https://www.strava.com/settings/api)

### Setup Instructions

1. **Configure Strava API:**
   - Go to your [Strava API Settings](https://www.strava.com/settings/api).
   - Create an application (or use an existing one).
   - Set the **Authorization Callback Domain** to `localhost`.

2. **Run the Setup Script:**
   We have provided a script to install dependencies and scaffold your `.env` files.
   ```bash
   ./scripts/setup-local.sh
   ```

3. **Configure Environment Variables:**
   Fill in the created `.env` files with your Strava credentials:
   
   *In `backend/.env`:*
   ```env
   STRAVA_CLIENT_ID=your_client_id
   STRAVA_CLIENT_SECRET=your_client_secret
   ```
   
   *In `frontend/.env`:*
   ```env
   VITE_STRAVA_CLIENT_ID=your_client_id
   ```

4. **Start the Development Servers:**
   You will need to run both the frontend and the local auth proxy backend.
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

## Deployment

This project uses Terraform to provision an AWS S3 bucket for static hosting, an API Gateway, and a Lambda function for the OAuth callback.

1. **Deploy Infrastructure:** Navigate to `infra/`, run `terraform init` (if it's your first time), and then `terraform apply`.
2. **Deploy Application:** Run `./scripts/deploy.sh` from the root directory. This script reads the Terraform outputs, builds the Vite frontend, injects the live AWS callback URL, and syncs the static files to S3.

*Made with ♥ using the Strava API.*
